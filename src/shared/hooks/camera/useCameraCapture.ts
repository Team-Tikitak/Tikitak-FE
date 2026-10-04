import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { FEED_IMAGE_HEIGHT, FEED_IMAGE_WIDTH } from '@/shared/constants';
import { cropImageBlobToAspectRatio } from '@/shared/lib/image/cropImageBlob';
import { confirmCapturedPhoto } from '@/shared/lib/image/finalizeCapturedPhoto';
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
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.imageSmoothingQuality = 'high';

    if (mirror) {
      context.translate(video.videoWidth, 0);
      context.scale(-1, 1);
    }

    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    canvas.toBlob(
      async (blob) => {
        if (!blob || !isMountedRef.current) return;
        const previewBlob = await cropImageBlobToAspectRatio(
          blob,
          FEED_IMAGE_WIDTH,
          FEED_IMAGE_HEIGHT,
        ).catch(() => blob);
        if (!isMountedRef.current) return;

        setPending({
          rawBlob: previewBlob,
          previewUrl: URL.createObjectURL(previewBlob),
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

  const confirmedRef = useRef(false);
  const handleConfirm = useCallback(() => {
    if (!pending || confirmedRef.current) return;
    confirmedRef.current = true;
    setIsConfirming(true);
    confirmCapturedPhoto(pending, filterCss, onCapture);
  }, [filterCss, onCapture, pending]);

  return {
    isConfirming,
    handleCapture,
    handleRetake,
    handleConfirm,
  };
};
