import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { type CapturedPhoto, useCamera } from '@/shared/hooks/camera/useCamera';
import { setAndroidCameraSystemBars } from '@/shared/lib/native/cameraSystemBars';
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
    previewMode,
    handleRetake,
    handleAddSticker,
    handleMoveSticker,
    handleScaleSticker,
    handleRotateSticker,
    handleRemoveSticker,
    handleConfirm,
    handleClose,
    handleToggleFacingMode,
    facingMode,
    zoomLevel,
    isZoomSupported,
    handleSelectZoomLevel,
    activeFilterId,
    handleSelectFilter,
  } = useCamera({
    open,
    onCapture: (photo) => {
      onCapture(photo);
      onClose();
    },
    onClose: () => {
      onClose();
      onExitComplete?.();
    },
  });

  useEffect(() => {
    if (!open) return;

    void setAndroidCameraSystemBars(true);

    return () => {
      void setAndroidCameraSystemBars(false);
    };
  }, [open]);

  if (!open) return null;

  const overlay = (
    <div className="fixed inset-0 z-60 flex items-stretch justify-center" data-no-swipe-back>
      <div className="relative h-full w-full sm:max-w-[393px]">
        {pendingPreview ? (
          <CameraReview
            imageUrl={pendingPreview.previewUrl}
            stickers={pendingPreview.stickers}
            isConfirming={isConfirming}
            onAddSticker={handleAddSticker}
            onMoveSticker={handleMoveSticker}
            onScaleSticker={handleScaleSticker}
            onRotateSticker={handleRotateSticker}
            onRemoveSticker={handleRemoveSticker}
            onRetake={handleRetake}
            onConfirm={handleConfirm}
            activeFilterId={activeFilterId}
            onSelectFilter={handleSelectFilter}
          />
        ) : (
          <CameraView
            videoRef={videoRef}
            nativePreview={previewMode === 'native'}
            error={error}
            isReady={isReady}
            onCapture={handleCapture}
            onClose={handleClose}
            onToggleFacingMode={handleToggleFacingMode}
            mirrored={facingMode === 'user'}
            zoomLevel={zoomLevel}
            zoomSupported={isZoomSupported}
            onZoomChange={handleSelectZoomLevel}
          />
        )}
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
};
