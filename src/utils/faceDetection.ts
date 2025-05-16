import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

let model: blazeface.BlazeFaceModel | null = null;

// Load the BlazeFace model
export const loadBlazefaceModel = async (): Promise<void> => {
  if (!model) {
    // Load the model if it hasn't been loaded yet
    // Set backend to webgl for better performance
    await tf.setBackend('webgl');
    model = await blazeface.load();
  }
};

// Detect faces in an image or video element
export const detectFaces = async (
  input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<blazeface.NormalizedFace[]> => {
  if (!model) {
    // Make sure the model is loaded
    await loadBlazefaceModel();
  }
  
  try {
    // Use the model to detect faces
    const predictions = await model!.estimateFaces(input, false);
    return predictions;
  } catch (error) {
    console.error('Error during face detection:', error);
    throw error;
  }
};

// Utility function to get input dimensions
export const getInputDimensions = (
  input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): { width: number; height: number } => {
  if (input instanceof HTMLVideoElement) {
    return { 
      width: input.videoWidth, 
      height: input.videoHeight 
    };
  } else {
    return { 
      width: input.width, 
      height: input.height 
    };
  }
};