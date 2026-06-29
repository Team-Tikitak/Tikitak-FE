import { useCallback, useState } from 'react';
import { getFilterCss, type PhotoFilterId } from '@/shared/lib/image/photoFilter';
import type { CapturedPhoto } from '@/shared/types/photo';
import type { PendingState, PlacedSticker } from '@/shared/types/sticker';
import { useCameraCapture } from './useCameraCapture';
import { useCameraStream, type CameraError, type CameraFacingMode } from './useCameraStream';
import { usePendingSticker } from './usePendingSticker';

export type { CameraError };
export type { CapturedPhoto };

interface UseCameraOptions {
  open: boolean;
  onCapture: (photo: CapturedPhoto) => void;
  onClose: () => void;
}

export const useCamera = ({ open, onCapture, onClose }: UseCameraOptions) => {
  const [pending, setPending] = useState<PendingState | null>(null);
  const [facingMode, setFacingMode] = useState<CameraFacingMode>('environment');
  const [activeFilterId, setActiveFilterId] = useState<PhotoFilterId>('none');
  const stream = useCameraStream(!open || pending !== null, facingMode);

  const handleToggleFacingMode = useCallback(
    () => setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user')),
    [],
  );

  const capture = useCameraCapture({
    videoRef: stream.videoRef,
    streamRef: stream.streamRef,
    stopStream: stream.stopStream,
    mirror: facingMode === 'user',
    pending,
    setPending,
    onCapture,
    filterCss: getFilterCss(activeFilterId),
  });

  const stickers = usePendingSticker(
    useCallback(
      (updater: (prev: PlacedSticker[]) => PlacedSticker[]) =>
        setPending((prev) => (prev ? { ...prev, stickers: updater(prev.stickers) } : prev)),
      [],
    ),
  );

  const handleClose = useCallback(() => {
    if (pending) {
      URL.revokeObjectURL(pending.previewUrl);
    }
    stream.stopStream();
    onClose();
  }, [pending, stream, onClose]);

  return {
    videoRef: stream.videoRef,
    pendingPreview: pending,
    error: stream.error,
    isReady: stream.isReady,
    isConfirming: capture.isConfirming,
    handleCapture: capture.handleCapture,
    handleRetake: () => {
      setActiveFilterId('none');
      capture.handleRetake();
    },
    handleAddSticker: stickers.handleAddSticker,
    handleMoveSticker: stickers.handleMoveSticker,
    handleScaleSticker: stickers.handleScaleSticker,
    handleRotateSticker: stickers.handleRotateSticker,
    handleRemoveSticker: stickers.handleRemoveSticker,
    handleConfirm: capture.handleConfirm,
    handleClose,
    handleToggleFacingMode,
    facingMode,
    activeFilterId,
    handleSelectFilter: setActiveFilterId,
  };
};
