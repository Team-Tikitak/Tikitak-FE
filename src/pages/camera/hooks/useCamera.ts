import { useState } from 'react';
import { useNavigate } from 'react-router';

export const useCamera = () => {
  const navigate = useNavigate();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // TODO: 실제 카메라 촬영 구현 후 setCapturedImage 호출
  const handleCapture = () => {
    setCapturedImage('');
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleClose = () => {
    navigate(-1);
  };

  return { capturedImage, handleCapture, handleRetake, handleClose };
};
