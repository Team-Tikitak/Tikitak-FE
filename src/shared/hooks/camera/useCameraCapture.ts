import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  CAMERA_REVIEW_IMAGE_HEIGHT,
  CAMERA_REVIEW_IMAGE_WIDTH,
  FEED_IMAGE_HEIGHT,
  FEED_IMAGE_WIDTH,
} from '@/shared/constants';
import { createId } from '@/shared/lib/createId';
import { composePhotoWithStickers } from '@/shared/lib/image/composePhoto';
import { computeCaptureRect } from '@/shared/lib/image/computeCaptureRect';
import { cropImageBlobToAspectRatio } from '@/shared/lib/image/cropImageBlob';
import { applyFilterToBlob } from '@/shared/lib/image/photoFilter';
import type { CapturedPhoto } from '@/shared/types/photo';
import { type PendingState } from '@/shared/types/sticker';

const CAPTURED_IMAGE_QUALITY = 0.95;

interface UseCameraCaptureOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  streamRef: RefObject<MediaStream | null>;
  stopStream: () => void;
  mirror?: boolean;
  pending: PendingState | null;
  setPending: Dispatch<SetStateAction<PendingState | null>>;
  onCapture: (photo: CapturedPhoto) => void;
  filterCss?: string;
}

export const useCameraCapture = ({
  videoRef,
  streamRef,
  stopStream,
  mirror = false,
  pending,
  setPending,
  onCapture,
  filterCss = 'none',
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

    const rect = computeCaptureRect(
      video.videoWidth,
      video.videoHeight,
      CAMERA_REVIEW_IMAGE_WIDTH,
      CAMERA_REVIEW_IMAGE_HEIGHT,
    );
    if (!rect) return;

    const canvas = document.createElement('canvas');
    canvas.width = rect.sourceWidth;
    canvas.height = rect.sourceHeight;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.imageSmoothingQuality = 'high';

    if (mirror) {
      context.translate(rect.sourceWidth, 0);
      context.scale(-1, 1);
    }

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
  }, [mirror, stopStream, videoRef, streamRef, setPending]);

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
      const photo: CapturedPhoto = {
        id: createId(),
        url: URL.createObjectURL(uploadBlob),
        blob: uploadBlob,
      };
      URL.revokeObjectURL(pending.previewUrl);
      setPending(null);
      onCapture(photo);
    } catch (cause) {
      console.error('사진 합성 실패', cause);
    } finally {
      if (isMountedRef.current) setIsConfirming(false);
    }
  }, [filterCss, isConfirming, onCapture, pending, setPending]);

  return {
    isConfirming,
    handleCapture,
    handleRetake,
    handleConfirm,
  };
};
