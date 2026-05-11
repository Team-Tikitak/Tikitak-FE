import { CameraReview } from './CameraReview';
import { CameraView } from './CameraView';
import { useCamera } from '../hooks/useCamera';

export const CameraPage = () => {
  const { capturedImage, handleCapture, handleRetake, handleClose } = useCamera();

  if (capturedImage !== null) {
    return <CameraReview capturedImage={capturedImage} onRetake={handleRetake} />;
  }

  return <CameraView onCapture={handleCapture} onClose={handleClose} />;
};
