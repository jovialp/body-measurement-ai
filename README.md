
# Body Measurement AI

`body-measurement-ai` is a lightweight package that leverages TensorFlow.js and PoseNet to estimate body measurements (shoulder width, hip width, and height) from a live video feed. This package can be easily integrated into React and Next.js applications to provide accurate body measurements for various applications like clothing size recommendations.

## Features
- **Pose Detection**: Uses PoseNet to detect key points on the human body from a live video feed.
- **Real-Time Measurements**: Estimates shoulder width, hip width, and height in real-time.
- **Simple Integration**: Easily integrate with React or Next.js apps.

## Installation

To install the package, use NPM or Yarn:

```bash
npm install body-measurement-ai
```

or

```bash
yarn add body-measurement-ai
```

## Usage

### Basic Setup in React/Next.js

Here is an example of how to use `body-measurement-ai` in a React or Next.js application:

```tsx
import React, { useEffect, useRef, useState } from 'react';
import { setupCamera, loadPosenet, detectPose, PoseResult } from 'body-measurement-ai';

const BodyMeasurementComponent: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null); // Reference to the video element
  const [result, setResult] = useState<PoseResult | null>(null); // Store pose results or errors

  useEffect(() => {
    const setup = async () => {
      if (videoRef.current) {
        // Setup the camera
        const cameraResult = await setupCamera(videoRef.current);
        if ('success' in cameraResult && !cameraResult.success) {
          console.error(cameraResult.message); // Handle camera setup errors
          return;
        }

        // Load PoseNet model
        const netResult = await loadPosenet();
        if ('success' in netResult && !netResult.success) {
          console.error(netResult.message); // Handle PoseNet model load errors
          return;
        }

        // Start pose detection and updating measurements every second
        setInterval(async () => {
          const poseResult = await detectPose(videoRef.current!, netResult);
          if ('success' in poseResult && !poseResult.success) {
            console.error(poseResult.message); // Handle pose detection errors
          } else {
            setResult(poseResult); // Update the measurement result
          }
        }, 1000); // Run every 1 second
      }
    };

    setup(); // Initialize the camera and model when the component mounts
  }, []);

  return (
    <div>
      <h1>AI Body Measurement Tool</h1>
      <video ref={videoRef} width="640" height="480" autoPlay muted></video> {/* Video element for webcam */}
      {result && 'success' in result && !result.success ? (
        <p>Error: {result.message}</p> // Display error messages if any
      ) : result ? (
        <div>
          <p>Shoulder Width: {result.shoulderWidth}px</p> {/* Display shoulder width */}
          <p>Hip Width: {result.hipWidth}px</p> {/* Display hip width */}
          <p>Height: {result.height}px</p> {/* Display height */}
        </div>
      ) : null}
    </div>
  );
};

export default BodyMeasurementComponent;
```

### Functions

1. **`setupCamera(video: HTMLVideoElement): Promise<HTMLVideoElement | ErrorResult>`**
   - Sets up the user's webcam and returns the video element with the live stream.
   - Handles potential errors, such as permission denial or device issues.

2. **`loadPosenet(): Promise<posenet.PoseNet | ErrorResult>`**
   - Loads the PoseNet model used for pose detection.
   - Returns either the loaded model or an error if something goes wrong.

3. **`detectPose(video: HTMLVideoElement, net: posenet.PoseNet): Promise<PoseResult>`**
   - Detects key points from the video stream and calculates shoulder width, hip width, and height.
   - Returns an object with the measurements or an error if detection fails.

### Example Error Handling

All functions return either a success result or an error result. Here’s how to handle errors effectively:

```ts
const cameraResult = await setupCamera(videoRef.current);
if ('success' in cameraResult && !cameraResult.success) {
  console.error(cameraResult.message); // Log or display the error message
  return;
}
```

### Types

- **`Measurements`**: Object containing the body measurements.
  ```ts
  interface Measurements {
    shoulderWidth: number;
    hipWidth: number;
    height: number;
  }
  ```

- **`ErrorResult`**: Object returned when an error occurs during camera setup, model loading, or pose detection.
  ```ts
  interface ErrorResult {
    success: false;
    message: string;
  }
  ```

- **`PoseResult`**: Union type that either contains `Measurements` or `ErrorResult` to ensure robust error handling.
  ```ts
  type PoseResult = Measurements | ErrorResult;
  ```

### Example PoseResult Object

If the pose detection is successful:

```ts
{
  shoulderWidth: 300,
  hipWidth: 250,
  height: 600
}
```

If an error occurs:

```ts
{
  success: false,
  message: "Pose estimation failed. Could not detect key points."
}
```

## Running Locally

You can run the project locally using a simple local server such as `http-server`.

1. Build the project:
   ```bash
   npm run build
   ```

2. Start a local server:
   ```bash
   npx http-server
   ```

3. Navigate to `http://localhost:8080` in your browser to see the body measurement tool in action.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
