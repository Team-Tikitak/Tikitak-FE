import { useCallback, useState } from 'react';
import { useCameraCapture } from '@/shared/hooks/useCameraCapture';
import { useCameraStream, type CameraError } from '@/shared/hooks/useCameraStream';
import { usePendingSticker } from '@/shared/hooks/usePendingSticker';
import type { CapturedPhoto } from '@/shared/types/photo';
import type { PendingState, PlacedSticker } from '@/shared/types/sticker';

export type { CameraError };
export type { CapturedPhoto };

interface UseCameraOptions {
  onCapture: (photo: CapturedPhoto) => void;
  onClose: () => void;
}

export const useCamera = ({ onCapture, onClose }: UseCameraOptions) => {
  const [pending, setPending] = useState<PendingState | null>(null);
  const stream = useCameraStream(pending !== null);

  const capture = useCameraCapture({
    videoRef: stream.videoRef,
    streamRef: stream.streamRef,
    stopStream: stream.stopStream,
    pending,
    setPending,
    onCapture,
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
    handleRetake: capture.handleRetake,
    handleAddSticker: stickers.handleAddSticker,
    handleMoveSticker: stickers.handleMoveSticker,
    handleScaleSticker: stickers.handleScaleSticker,
    handleRemoveSticker: stickers.handleRemoveSticker,
    handleConfirm: capture.handleConfirm,
    handleClose,
  };
};
