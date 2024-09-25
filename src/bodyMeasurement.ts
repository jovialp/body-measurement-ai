import * as posenet from "@tensorflow-models/posenet";
import * as tf from "@tensorflow/tfjs";

// Type definition for measurement results
// This defines the structure of the object that will store the measurements.
export interface Measurements {
  shoulderWidth: number;
  hipWidth: number;
  height: number;
}

// Type definition for handling errors
export interface ErrorResult {
  success: false;
  message: string;
}

// Union type for returning either measurements or an error
export type PoseResult = Measurements | ErrorResult;

// Function to initialize camera
// This function accesses the user's webcam and returns the video element with the live stream.
// It uses the browser's `navigator.mediaDevices.getUserMedia` to capture video input.
export async function setupCamera(
  video: HTMLVideoElement
): Promise<HTMLVideoElement | ErrorResult> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 }, // Sets the resolution for the video stream.
    });
    video.srcObject = stream; // Sets the source of the video element to the webcam stream.
    return new Promise((resolve) => {
      video.onloadedmetadata = () => resolve(video); // Resolves the promise once the video is loaded.
    });
  } catch (error) {
    // Return an error object with a message if camera setup fails
    return {
      success: false,
      message: "Failed to access the camera. Please check camera permissions.",
    };
  }
}

// Function to load PoseNet model
// This function loads the PoseNet model, which will be used for detecting human body key points.
// PoseNet is a pre-trained model that can estimate the pose (key points) of a human body from a video or image.
export async function loadPosenet(): Promise<posenet.PoseNet | ErrorResult> {
  try {
    const net = await posenet.load(); // Loads the default version of the PoseNet model.
    return net;
  } catch (error) {
    // Return an error object with a message if model loading fails
    return {
      success: false,
      message:
        "Failed to load the PoseNet model. Please check your internet connection.",
    };
  }
}

// Utility function to calculate distance between two points
// This function computes the Euclidean distance between two points in a 2D space.
// It is used to calculate the physical distances between key points on the body (e.g., shoulders, hips).
function calculateDistance(
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): number {
  const dx = point1.x - point2.x; // Difference in x-coordinates
  const dy = point1.y - point2.y; // Difference in y-coordinates
  return Math.sqrt(dx * dx + dy * dy); // Returns the Euclidean distance using the Pythagorean theorem.
}

// Main function to capture measurements
// This function uses the PoseNet model to estimate the position of key points on the human body from a video feed.
// It returns an object containing the shoulder width, hip width, and height based on detected key points.
export async function detectPose(
  video: HTMLVideoElement,
  net: posenet.PoseNet
): Promise<PoseResult> {
  try {
    // Pose estimation - estimating the position of key points on the human body in a single frame from the video.
    const pose = await net.estimateSinglePose(video, {
      flipHorizontal: false, // Determines whether to flip the input horizontally (used for webcam video).
    });

    if (pose) {
      const keypoints = pose.keypoints; // Extracts the detected key points from the pose.

      // Finds the left and right shoulder key points.
      const leftShoulder = keypoints.find((k) => k.part === "leftShoulder");
      const rightShoulder = keypoints.find((k) => k.part === "rightShoulder");

      // If both shoulders are found, calculate the shoulder width (distance between them).
      const shoulderWidth =
        leftShoulder && rightShoulder
          ? calculateDistance(leftShoulder.position, rightShoulder.position)
          : 0;

      // Finds the left and right hip key points.
      const leftHip = keypoints.find((k) => k.part === "leftHip");
      const rightHip = keypoints.find((k) => k.part === "rightHip");

      // If both hips are found, calculate the hip width (distance between them).
      const hipWidth =
        leftHip && rightHip
          ? calculateDistance(leftHip.position, rightHip.position)
          : 0;

      // Finds the head (nose) and left ankle key points.
      const head = keypoints.find((k) => k.part === "nose");
      const leftAnkle = keypoints.find((k) => k.part === "leftAnkle");

      // If both the head and left ankle are found, calculate the height (distance between them).
      const height =
        head && leftAnkle
          ? calculateDistance(head.position, leftAnkle.position)
          : 0;

      // Returns an object with the calculated shoulder width, hip width, and height.
      return { shoulderWidth, hipWidth, height };
    } else {
      // Return an error if pose estimation fails
      return {
        success: false,
        message: "Pose estimation failed. Could not detect key points.",
      };
    }
  } catch (error) {
    // Catch any runtime errors and return a meaningful error message
    return {
      success: false,
      message: "An error occurred during pose detection. Please try again.",
    };
  }
}
