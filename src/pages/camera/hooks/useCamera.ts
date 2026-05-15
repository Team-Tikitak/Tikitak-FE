import { useCallback, useEffect, useRef, useState } from 'react';
import { type StickerId } from '@/shared/assets/Sticker/catalog';
import { composePhotoWithStickers } from '../lib/composePhoto';
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
  const [pending, setPending] = useState<PendingState | null>(null);
  const [error, setError] = useState<CameraError | null>(() =>
    isCameraSupported() ? null : 'unsupported',
  );
  const [isReady, setIsReady] = useState(false);

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
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
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

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
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

  const handleAddSticker = useCallback((stickerId: StickerId) => {
    setPending((prev) =>
      prev
        ? {
            ...prev,
            stickers: [
              ...prev.stickers,
              {
                id: crypto.randomUUID(),
                stickerId,
                xRatio: 0.5,
                yRatio: 0.5,
                scale: 1,
              },
            ],
          }
        : prev,
    );
  }, []);

  const handleMoveSticker = useCallback((id: string, xRatio: number, yRatio: number) => {
    setPending((prev) =>
      prev
        ? {
            ...prev,
            stickers: prev.stickers.map((sticker) =>
              sticker.id === id ? { ...sticker, xRatio, yRatio } : sticker,
            ),
          }
        : prev,
    );
  }, []);

  const handleScaleSticker = useCallback((id: string, scale: number) => {
    setPending((prev) =>
      prev
        ? {
            ...prev,
            stickers: prev.stickers.map((sticker) =>
              sticker.id === id ? { ...sticker, scale } : sticker,
            ),
          }
        : prev,
    );
  }, []);

  const handleRemoveSticker = useCallback((id: string) => {
    setPending((prev) =>
      prev ? { ...prev, stickers: prev.stickers.filter((sticker) => sticker.id !== id) } : prev,
    );
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!pending) return;
    const composedBlob =
      pending.stickers.length > 0
        ? await composePhotoWithStickers(pending.rawBlob, pending.stickers)
        : pending.rawBlob;
    const photo: CapturedPhoto = {
      id: crypto.randomUUID(),
      url: URL.createObjectURL(composedBlob),
      blob: composedBlob,
    };
    URL.revokeObjectURL(pending.previewUrl);
    setPending(null);
    onCapture(photo);
  }, [onCapture, pending]);

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
