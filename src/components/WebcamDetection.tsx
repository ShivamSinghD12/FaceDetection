import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Camera, AlertCircle } from 'lucide-react';
import { loadBlazefaceModel, detectFaces } from '../utils/faceDetection';
import StatsDisplay from './StatsDisplay';

const WebcamDetection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
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
  
  // Setup webcam
  useEffect(() => {
    const setupWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Unable to access webcam. Please ensure you have granted camera permissions.');
      }
    };
    
    setupWebcam();
    
    return () => {
      // Clean up video stream on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Detection loop
  useEffect(() => {
    let animationId: number;
    let lastDetectionTime = 0;
    let frameCount = 0;
    let lastFpsUpdateTime = 0;
    
    const detectInVideo = async (time: number) => {
      if (!videoRef.current || !canvasRef.current || !isDetecting) return;
      
      // Calculate FPS
      frameCount++;
      if (time - lastFpsUpdateTime >= 1000) {
        setDetectionStats(prev => ({
          ...prev,
          fps: Math.round(frameCount * 1000 / (time - lastFpsUpdateTime))
        }));
        frameCount = 0;
        lastFpsUpdateTime = time;
      }
      
      // Only run detection every 100ms for performance
      if (time - lastDetectionTime >= 100) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        if (ctx && video.readyState === 4) {
          // Set canvas dimensions to match video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Draw the current video frame
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Detect faces
          try {
            const faces = await detectFaces(video);
            setDetectionStats(prev => ({ ...prev, faces: faces.length }));
            
            // Draw bounding boxes
            faces.forEach(face => {
              const start = face.topLeft as [number, number];
              const end = face.bottomRight as [number, number];
              const size = [end[0] - start[0], end[1] - start[1]];
              
              ctx.strokeStyle = '#00FFFF';
              ctx.lineWidth = 2;
              ctx.strokeRect(start[0], start[1], size[0], size[1]);
              
              // Draw probability
              const score = face.probability[0];
              ctx.fillStyle = '#00FFFF';
              ctx.font = '12px Arial';
              ctx.fillText(`${Math.round(score * 100)}%`, start[0], start[1] > 15 ? start[1] - 5 : start[1] + 15);
            });
          } catch (err) {
            console.error('Detection error:', err);
          }
        }
        
        lastDetectionTime = time;
      }
      
      animationId = requestAnimationFrame(detectInVideo);
    };
    
    if (isDetecting) {
      animationId = requestAnimationFrame(detectInVideo);
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isDetecting]);
  
  const toggleDetection = () => {
    setIsDetecting(prev => !prev);
  };
  
  const captureScreenshot = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'face-detection-screenshot.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };
  
  return (
    <div className="flex flex-col">
      <div className="relative mb-4 bg-black rounded-lg overflow-hidden">
        {isModelLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/75 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-blue-400">Loading face detection model...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 z-10">
            <div className="bg-gray-800 p-4 rounded-lg border border-red-500 max-w-md text-center">
              <AlertCircle className="text-red-500 mx-auto mb-2" size={32} />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}
        
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full aspect-video ${isDetecting ? 'hidden' : 'block'}`}
        />
        
        <canvas 
          ref={canvasRef}
          className={`w-full aspect-video ${isDetecting ? 'block' : 'hidden'}`}
        />
      </div>
      
      <StatsDisplay stats={detectionStats} isActive={isDetecting} />
      
      <div className="flex gap-3 mt-4">
        <button
          onClick={toggleDetection}
          disabled={isModelLoading || !!error}
          className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors ${
            isDetecting
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          } ${(isModelLoading || !!error) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isDetecting ? (
            <>
              <Pause size={18} />
              <span>Pause Detection</span>
            </>
          ) : (
            <>
              <Play size={18} />
              <span>Start Detection</span>
            </>
          )}
        </button>
        
        <button
          onClick={captureScreenshot}
          disabled={!isDetecting || isModelLoading || !!error}
          className={`py-2 px-4 rounded-md flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 transition-colors ${
            (!isDetecting || isModelLoading || !!error) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Camera size={18} />
          <span className="hidden sm:inline">Capture</span>
        </button>
      </div>
    </div>
  );
};

export default WebcamDetection;