import { useCallback, useState } from 'react';
import { getFilterCss, type PhotoFilterId } from '@/shared/lib/image/photoFilter';
import { isNativeCameraPlatform } from '@/shared/lib/native/nativeCamera';
import type { CapturedPhoto } from '@/shared/types/photo';
import type { PendingState, PlacedSticker } from '@/shared/types/sticker';
import { useCameraCapture } from './useCameraCapture';
import {
  useCameraStream,
  type CameraError,
  type CameraFacingMode,
  type CameraZoomLevel,
} from './useCameraStream';
import { useNativeCamera } from './useNativeCamera';
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
  const [zoomLevel, setZoomLevel] = useState<CameraZoomLevel>(1);
  const [activeFilterId, setActiveFilterId] = useState<PhotoFilterId>('none');
  const useNativePreview = isNativeCameraPlatform();
  const filterCss = getFilterCss(activeFilterId);
  const stream = useCameraStream(
    useNativePreview || !open || pending !== null,
    facingMode,
    zoomLevel,
  );
  const nativeCamera = useNativeCamera({
    paused: !useNativePreview || !open || pending !== null,
    pending,
    setPending,
    onCapture,
    facingMode,
    zoomLevel,
    filterCss,
  });

  const handleToggleFacingMode = useCallback(() => {
    setZoomLevel(1);
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  }, []);

  const capture = useCameraCapture({
    videoRef: stream.videoRef,
    streamRef: stream.streamRef,
    stopStream: stream.stopStream,
    mirror: facingMode === 'user',
    pending,
    setPending,
    onCapture,
    filterCss,
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
    nativeCamera.stopPreview();
    onClose();
  }, [nativeCamera, pending, stream, onClose]);

  return {
    videoRef: stream.videoRef,
    previewMode: useNativePreview ? 'native' : 'web',
    pendingPreview: pending,
    error: useNativePreview ? nativeCamera.error : stream.error,
    isReady: useNativePreview ? nativeCamera.isReady : stream.isReady,
    isConfirming: useNativePreview ? nativeCamera.isConfirming : capture.isConfirming,
    handleCapture: useNativePreview ? nativeCamera.handleCapture : capture.handleCapture,
    handleRetake: () => {
      setActiveFilterId('none');
      if (useNativePreview) {
        nativeCamera.handleRetake();
        return;
      }
      capture.handleRetake();
    },
    handleAddSticker: stickers.handleAddSticker,
    handleMoveSticker: stickers.handleMoveSticker,
    handleScaleSticker: stickers.handleScaleSticker,
    handleRotateSticker: stickers.handleRotateSticker,
    handleRemoveSticker: stickers.handleRemoveSticker,
    handleConfirm: useNativePreview ? nativeCamera.handleConfirm : capture.handleConfirm,
    handleClose,
    handleToggleFacingMode,
    facingMode,
    zoomLevel,
    isZoomSupported: useNativePreview ? nativeCamera.isZoomSupported : stream.isZoomSupported,
    handleSelectZoomLevel: setZoomLevel,
    activeFilterId,
    handleSelectFilter: setActiveFilterId,
  };
};
