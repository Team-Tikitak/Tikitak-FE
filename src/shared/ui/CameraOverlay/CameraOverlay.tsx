import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { type CapturedPhoto, useCamera } from '@/shared/hooks/camera/useCamera';
import { setAndroidCameraSystemBars } from '@/shared/lib/native/cameraSystemBars';
import { promptOpenAppSettings } from '@/shared/lib/native/openAppSettings';
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
    onCapture,
    onClose: () => {
      onClose();
      onExitComplete?.();
    },
  });

  // 합성 완료를 기다리지 않고 바로 닫아 작성 화면으로 돌아간다. 완성된 사진은 onCapture로 뒤따라 전달된다.
  const handleConfirmAndClose = () => {
    handleConfirm();
    onClose();
  };

  useEffect(() => {
    if (!open) return;

    void setAndroidCameraSystemBars(true);

    return () => {
      void setAndroidCameraSystemBars(false);
    };
  }, [open]);

  useEffect(() => {
    if (!open || error !== 'permission') return;

    void promptOpenAppSettings('카메라 권한이 거부되어 있어요. 설정에서 직접 허용할 수 있어요.');
  }, [open, error]);

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
            onConfirm={handleConfirmAndClose}
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
