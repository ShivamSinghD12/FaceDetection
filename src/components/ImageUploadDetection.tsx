import React, { useRef, useState, useEffect } from 'react';
import { Upload, Trash2, Loader, AlertCircle } from 'lucide-react';
import { loadBlazefaceModel, detectFaces } from '../utils/faceDetection';
import StatsDisplay from './StatsDisplay';

const ImageUploadDetection: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [detectionStats, setDetectionStats] = useState({ faces: 0, fps: 0 });

  // Load model on component mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        await loadBlazefaceModel();
        setIsModelLoading(false);
      } catch (err) {
        setError('Failed to load face detection model');
        setIsModelLoading(false);
      }
    };
    
    loadModel();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Reset previous results
    setError(null);
    setDetectionStats({ faces: 0, fps: 0 });
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
      setError('Please upload an image file (jpg, png, etc.)');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size exceeds 5MB limit');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageUrl(result);
      processImage(result);
    };
    
    reader.onerror = () => {
      setError('Failed to read the image file');
    };
    
    reader.readAsDataURL(file);
  };

  const processImage = async (url: string) => {
    if (!canvasRef.current) return;
    
    setIsProcessing(true);
    
    try {
      const image = new Image();
      image.src = url;
      
      image.onload = async () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          setError('Failed to get canvas context');
          setIsProcessing(false);
          return;
        }
        
        // Set canvas dimensions to match image
        canvas.width = image.width;
        canvas.height = image.height;
        
        // Draw image to canvas
        ctx.drawImage(image, 0, 0);
        
        // Detect faces
        try {
          const startTime = performance.now();
          const faces = await detectFaces(image);
          const endTime = performance.now();
          
          setDetectionStats({ 
            faces: faces.length, 
            fps: Math.round(1000 / (endTime - startTime)) 
          });
          
          // Draw bounding boxes
          faces.forEach(face => {
            const start = face.topLeft as [number, number];
            const end = face.bottomRight as [number, number];
            const size = [end[0] - start[0], end[1] - start[1]];
            
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 4;
            ctx.strokeRect(start[0], start[1], size[0], size[1]);
            
            // Draw probability
            const score = face.probability[0];
            ctx.fillStyle = '#00FFFF';
            ctx.font = '16px Arial';
            ctx.fillText(`${Math.round(score * 100)}%`, start[0], start[1] > 20 ? start[1] - 10 : start[1] + 20);
          });
          
          if (faces.length === 0) {
            setError('No faces detected in the image');
          }
        } catch (err) {
          console.error('Detection error:', err);
          setError('Error during face detection');
        }
        
        setIsProcessing(false);
      };
      
      image.onerror = () => {
        setError('Failed to load image');
        setIsProcessing(false);
      };
    } catch (err) {
      console.error('Processing error:', err);
      setError('Failed to process the image');
      setIsProcessing(false);
    }
  };

  const resetImage = () => {
    setImageUrl(null);
    setDetectionStats({ faces: 0, fps: 0 });
    setError(null);
    
    // Clear the canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const downloadResult = () => {
    if (!canvasRef.current || !imageUrl) return;
    
    const link = document.createElement('a');
    link.download = 'face-detection-result.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col">
      <div className="relative bg-black rounded-lg overflow-hidden mb-4">
        {isModelLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/75 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-blue-400">Loading face detection model...</p>
            </div>
          </div>
        )}
        
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/75 z-10">
            <div className="text-center">
              <Loader className="animate-spin text-blue-500 mx-auto mb-2" size={32} />
              <p className="text-blue-400">Processing image...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute top-4 left-0 right-0 mx-auto max-w-md z-10">
            <div className="bg-gray-800 p-3 rounded-lg border border-red-500 flex items-center gap-2">
              <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}
        
        {!imageUrl ? (
          <div className="aspect-video flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700 bg-gray-900">
            <Upload className="text-gray-400 mb-3" size={48} />
            <p className="text-gray-400 text-center mb-4">
              Upload an image to detect faces
            </p>
            <label className="bg-blue-600 hover:bg-blue-700 transition-colors py-2 px-4 rounded-md cursor-pointer">
              Select Image
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="hidden" 
                disabled={isModelLoading}
              />
            </label>
          </div>
        ) : (
          <canvas 
            ref={canvasRef} 
            className="w-full object-contain"
          />
        )}
      </div>
      
      {imageUrl && (
        <>
          <StatsDisplay stats={detectionStats} isActive={true} />
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={resetImage}
              className="flex-1 py-2 px-4 rounded-md flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 transition-colors"
              disabled={isProcessing}
            >
              <Trash2 size={18} />
              <span>Clear Image</span>
            </button>
            
            <button
              onClick={downloadResult}
              className="flex-1 py-2 px-4 rounded-md flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 transition-colors"
              disabled={isProcessing || detectionStats.faces === 0}
            >
              <Upload size={18} />
              <span>Download Result</span>
            </button>
          </div>
        </>
      )}
      
      {!imageUrl && (
        <div className="mt-4 p-4 bg-gray-900 rounded-lg text-sm text-gray-400">
          <p className="mb-2">
            <strong className="text-gray-300">Supported image formats:</strong> JPG, PNG, WebP, GIF
          </p>
          <p>
            <strong className="text-gray-300">Max file size:</strong> 5MB
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploadDetection;