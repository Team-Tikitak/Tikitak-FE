import { useCallback, useEffect, useRef, useState } from 'react';
import { FEED_IMAGE_HEIGHT, FEED_IMAGE_WIDTH } from '@/shared/constants';
import { createId } from '@/shared/lib/createId';
import { composePhotoWithStickers } from '@/shared/lib/image/composePhoto';
import { cropImageBlobToAspectRatio } from '@/shared/lib/image/cropImageBlob';
import { applyFilterToBlob } from '@/shared/lib/image/photoFilter';
import {
  captureNativeCameraPhoto,
  setNativeCameraZoom,
  startNativeCameraPreview,
  stopNativeCameraPreview,
} from '@/shared/lib/native/nativeCamera';
import type { CapturedPhoto } from '@/shared/types/photo';
import type { PendingState } from '@/shared/types/sticker';
import type { CameraError, CameraFacingMode, CameraZoomLevel } from './useCameraStream';

const base64ToBlob = (data: string, mimeType = 'image/jpeg') => {
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mimeType });
};

interface UseNativeCameraOptions {
  paused: boolean;
  pending: PendingState | null;
  setPending: (pending: PendingState | null) => void;
  onCapture: (photo: CapturedPhoto) => void;
  facingMode: CameraFacingMode;
  zoomLevel: CameraZoomLevel;
  filterCss: string;
}

export const useNativeCamera = ({
  paused,
  pending,
  setPending,
  onCapture,
  facingMode,
  zoomLevel,
  filterCss,
}: UseNativeCameraOptions) => {
  const pendingRef = useRef<PendingState | null>(null);
  const zoomLevelRef = useRef(zoomLevel);
  const isMountedRef = useRef(true);
  const [error, setError] = useState<CameraError | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const stopPreview = useCallback(() => {
    setIsReady(false);
    void stopNativeCameraPreview().catch(() => {});
  }, []);

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  useEffect(() => {
    zoomLevelRef.current = zoomLevel;
  }, [zoomLevel]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pendingRef.current) URL.revokeObjectURL(pendingRef.current.previewUrl);
      void stopNativeCameraPreview().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (paused) {
      stopPreview();
      return;
    }

    let cancelled = false;
    document.documentElement.classList.add('native-camera-active');
    document.body.classList.add('native-camera-active');
    setIsReady(false);
    setError(null);

    void startNativeCameraPreview({ facingMode, zoomLevel: zoomLevelRef.current })
      .then(() => {
        if (!cancelled && isMountedRef.current) setIsReady(true);
      })
      .catch((cause) => {
        if (cancelled || !isMountedRef.current) return;
        const message = cause instanceof Error ? cause.message : '';
        setError(message.toLowerCase().includes('permission') ? 'permission' : 'unknown');
      });

    return () => {
      cancelled = true;
      document.documentElement.classList.remove('native-camera-active');
      document.body.classList.remove('native-camera-active');
      stopPreview();
    };
  }, [facingMode, paused, stopPreview]);

  useEffect(() => {
    if (paused || !isReady) return;
    void setNativeCameraZoom(zoomLevel).catch(() => {});
  }, [isReady, paused, zoomLevel]);

  const handleCapture = useCallback(async () => {
    if (!isReady || isCapturing) return;
    setIsCapturing(true);
    try {
      const photo = await captureNativeCameraPhoto();
      if (!isMountedRef.current) return;
      const rawBlob = base64ToBlob(photo.data, photo.mimeType);
      const previewBlob = await cropImageBlobToAspectRatio(
        rawBlob,
        FEED_IMAGE_WIDTH,
        FEED_IMAGE_HEIGHT,
      ).catch(() => rawBlob);
      if (!isMountedRef.current) return;
      setPending({
        rawBlob: previewBlob,
        previewUrl: URL.createObjectURL(previewBlob),
        stickers: [],
      });
      stopPreview();
    } catch (cause) {
      if (isMountedRef.current) {
        const message = cause instanceof Error ? cause.message : '';
        setError(message.toLowerCase().includes('permission') ? 'permission' : 'unknown');
      }
    } finally {
      if (isMountedRef.current) setIsCapturing(false);
    }
  }, [isCapturing, isReady, setPending, stopPreview]);

  const handleRetake = useCallback(() => {
    if (pending) URL.revokeObjectURL(pending.previewUrl);
    setPending(null);
  }, [pending, setPending]);

  const handleConfirm = useCallback(async () => {
    if (!pending || isConfirming) return;
    setIsConfirming(true);
    try {
      const filteredBlob = await applyFilterToBlob(pending.rawBlob, filterCss);
      const composedBlob =
        pending.stickers.length > 0
          ? await composePhotoWithStickers(filteredBlob, pending.stickers)
          : filteredBlob;
      const uploadBlob = await cropImageBlobToAspectRatio(
        composedBlob,
        FEED_IMAGE_WIDTH,
        FEED_IMAGE_HEIGHT,
      );
      if (!isMountedRef.current) {
        URL.revokeObjectURL(pending.previewUrl);
        return;
      }
      const capturedPhoto: CapturedPhoto = {
        id: createId(),
        url: URL.createObjectURL(uploadBlob),
        blob: uploadBlob,
      };
      URL.revokeObjectURL(pending.previewUrl);
      setPending(null);
      onCapture(capturedPhoto);
    } catch (cause) {
      console.error('사진 합성 실패', cause);
    } finally {
      if (isMountedRef.current) setIsConfirming(false);
    }
  }, [filterCss, isConfirming, onCapture, pending, setPending]);

  return {
    error,
    isReady,
    isZoomSupported: facingMode === 'environment',
    isConfirming,
    handleCapture,
    handleRetake,
    handleConfirm,
    stopPreview,
  };
};
