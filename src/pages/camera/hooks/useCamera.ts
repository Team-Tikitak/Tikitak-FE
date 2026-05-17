import { useCallback, useEffect, useRef, useState } from 'react';
import { type StickerId } from '@/shared/assets/Sticker/catalog';
import { composePhotoWithStickers } from '../lib/composePhoto';
import { computeCaptureRect } from '../lib/computeCaptureRect';
import { type PlacedSticker } from '../model/types';

export type CameraError = 'permission' | 'unsupported' | 'unknown';

export interface CapturedPhoto {
  id: string;
  url: string;
  blob: Blob;
}

const STREAM_CONSTRAINTS: MediaStreamConstraints = {
  video: { facingMode: 'environment' },
  audio: false,
};

const CAPTURED_IMAGE_QUALITY = 0.9;

const isCameraSupported = () =>
  typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);

interface UseCameraOptions {
  onCapture: (photo: CapturedPhoto) => void;
  onClose: () => void;
}

interface PendingState {
  rawBlob: Blob;
  previewUrl: string;
  stickers: PlacedSticker[];
}

export const useCamera = ({ onCapture, onClose }: UseCameraOptions) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);
  const pendingRef = useRef<PendingState | null>(null);
  const [pending, setPending] = useState<PendingState | null>(null);
  const [error, setError] = useState<CameraError | null>(() =>
    isCameraSupported() ? null : 'unsupported',
  );
  const [isReady, setIsReady] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  useEffect(
    () => () => {
      isMountedRef.current = false;
      if (pendingRef.current) URL.revokeObjectURL(pendingRef.current.previewUrl);
    },
    [],
  );

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsReady(false);
  }, []);

  useEffect(() => {
    if (pending !== null) return;
    if (!isCameraSupported()) return;

    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia(STREAM_CONSTRAINTS)
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          void video.play().catch(() => {});
        }
        setIsReady(true);
        setError(null);
      })
      .catch((cause) => {
        if (cancelled) return;
        const isPermissionError =
          cause instanceof DOMException &&
          (cause.name === 'NotAllowedError' || cause.name === 'PermissionDeniedError');
        setError(isPermissionError ? 'permission' : 'unknown');
      });

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [pending, stopStream]);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !streamRef.current) return;

    const displayRect = video.getBoundingClientRect();
    const rect = computeCaptureRect(
      video.videoWidth,
      video.videoHeight,
      displayRect.width,
      displayRect.height,
    );
    if (!rect) return;

    const canvas = document.createElement('canvas');
    canvas.width = rect.sourceWidth;
    canvas.height = rect.sourceHeight;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(
      video,
      rect.sourceX,
      rect.sourceY,
      rect.sourceWidth,
      rect.sourceHeight,
      0,
      0,
      rect.sourceWidth,
      rect.sourceHeight,
    );

    canvas.toBlob(
      (blob) => {
        if (!blob || !isMountedRef.current) return;
        setPending({
          rawBlob: blob,
          previewUrl: URL.createObjectURL(blob),
          stickers: [],
        });
        stopStream();
      },
      'image/jpeg',
      CAPTURED_IMAGE_QUALITY,
    );
  }, [stopStream]);

  const handleRetake = useCallback(() => {
    if (pending) {
      URL.revokeObjectURL(pending.previewUrl);
    }
    setPending(null);
  }, [pending]);

  const updateStickers = useCallback((updater: (stickers: PlacedSticker[]) => PlacedSticker[]) => {
    setPending((prev) => (prev ? { ...prev, stickers: updater(prev.stickers) } : prev));
  }, []);

  const handleAddSticker = useCallback(
    (stickerId: StickerId) => {
      updateStickers((stickers) => [
        ...stickers,
        { id: crypto.randomUUID(), stickerId, xRatio: 0.5, yRatio: 0.5, scale: 1 },
      ]);
    },
    [updateStickers],
  );

  const handleMoveSticker = useCallback(
    (id: string, xRatio: number, yRatio: number) => {
      updateStickers((stickers) =>
        stickers.map((sticker) => (sticker.id === id ? { ...sticker, xRatio, yRatio } : sticker)),
      );
    },
    [updateStickers],
  );

  const handleScaleSticker = useCallback(
    (id: string, scale: number) => {
      updateStickers((stickers) =>
        stickers.map((sticker) => (sticker.id === id ? { ...sticker, scale } : sticker)),
      );
    },
    [updateStickers],
  );

  const handleRemoveSticker = useCallback(
    (id: string) => {
      updateStickers((stickers) => stickers.filter((sticker) => sticker.id !== id));
    },
    [updateStickers],
  );

  const handleConfirm = useCallback(async () => {
    if (!pending || isConfirming) return;
    setIsConfirming(true);
    try {
      const composedBlob =
        pending.stickers.length > 0
          ? await composePhotoWithStickers(pending.rawBlob, pending.stickers)
          : pending.rawBlob;
      if (!isMountedRef.current) {
        URL.revokeObjectURL(pending.previewUrl);
        return;
      }
      const photo: CapturedPhoto = {
        id: crypto.randomUUID(),
        url: URL.createObjectURL(composedBlob),
        blob: composedBlob,
      };
      URL.revokeObjectURL(pending.previewUrl);
      setPending(null);
      onCapture(photo);
    } catch (cause) {
      console.error('사진 합성 실패', cause);
    } finally {
      if (isMountedRef.current) setIsConfirming(false);
    }
  }, [isConfirming, onCapture, pending]);

  const handleClose = useCallback(() => {
    if (pending) {
      URL.revokeObjectURL(pending.previewUrl);
      setPending(null);
    }
    stopStream();
    onClose();
  }, [onClose, pending, stopStream]);

  return {
    videoRef,
    pendingPreview: pending,
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
  };
};
