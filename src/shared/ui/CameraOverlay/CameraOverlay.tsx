import { type CapturedPhoto, useCamera } from '@/shared/hooks/useCamera';
import { CameraReview } from './CameraReview';
import { CameraView } from './CameraView';

interface CameraOverlayProps {
  open: boolean;
  onCapture: (photo: CapturedPhoto) => void;
  onClose: () => void;
  onExitComplete?: () => void;
}

export const CameraOverlay = ({ open, onCapture, onClose, onExitComplete }: CameraOverlayProps) => {
  const {
    videoRef,
    pendingPreview,
    error,
    isReady,
    isConfirming,
    handleCapture,
    handleRetake,
    handleAddSticker,
    handleMoveSticker,
    handleScaleSticker,
    handleRemoveSticker,
    handleConfirm,
    handleClose,
  } = useCamera({
    onCapture: (photo) => {
      onCapture(photo);
      onClose();
    },
    onClose: () => {
      onClose();
      onExitComplete?.();
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-stretch justify-center">
      <div className="relative h-full w-full max-w-[393px]">
        {pendingPreview ? (
          <CameraReview
            imageUrl={pendingPreview.previewUrl}
            stickers={pendingPreview.stickers}
            isConfirming={isConfirming}
            onAddSticker={handleAddSticker}
            onMoveSticker={handleMoveSticker}
            onScaleSticker={handleScaleSticker}
            onRemoveSticker={handleRemoveSticker}
            onRetake={handleRetake}
            onConfirm={handleConfirm}
          />
        ) : (
          <CameraView
            videoRef={videoRef}
            error={error}
            isReady={isReady}
            onCapture={handleCapture}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
};
