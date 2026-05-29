import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { composePhotoWithStickers } from '@/shared/lib/composePhoto';
import { computeCaptureRect } from '@/shared/lib/computeCaptureRect';
import { createId } from '@/shared/lib/createId';
import type { CapturedPhoto } from '@/shared/types/photo';
import { type PendingState } from '@/shared/types/sticker';

const CAPTURED_IMAGE_QUALITY = 0.9;

interface UseCameraCaptureOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  streamRef: RefObject<MediaStream | null>;
  stopStream: () => void;
  pending: PendingState | null;
  setPending: Dispatch<SetStateAction<PendingState | null>>;
  onCapture: (photo: CapturedPhoto) => void;
}

export const useCameraCapture = ({
  videoRef,
  streamRef,
  stopStream,
  pending,
  setPending,
  onCapture,
}: UseCameraCaptureOptions) => {
  const pendingRef = useRef<PendingState | null>(null);
  const isMountedRef = useRef(true);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pendingRef.current) URL.revokeObjectURL(pendingRef.current.previewUrl);
    };
  }, []);

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
  }, [stopStream, videoRef, streamRef, setPending]);

  const handleRetake = useCallback(() => {
    if (pending) {
      URL.revokeObjectURL(pending.previewUrl);
    }
    setPending(null);
  }, [pending, setPending]);

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
        id: createId(),
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
  }, [isConfirming, onCapture, pending, setPending]);

  return {
    isConfirming,
    handleCapture,
    handleRetake,
    handleConfirm,
  };
};
