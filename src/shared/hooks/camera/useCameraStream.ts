import { useCallback, useEffect, useRef, useState } from 'react';

export type CameraError = 'permission' | 'unsupported' | 'unknown';
export type CameraFacingMode = 'user' | 'environment';

const isCameraSupported = () =>
  typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);

export const useCameraStream = (paused: boolean, facingMode: CameraFacingMode = 'environment') => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<CameraError | null>(() =>
    isCameraSupported() ? null : 'unsupported',
  );
  const [isReady, setIsReady] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.srcObject = null;
    }
    setIsReady(false);
  }, []);

  useEffect(() => {
    if (paused || !isCameraSupported()) return;

    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        setError(null);
        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;
        void video.play().catch(() => {});

        if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
          setIsReady(true);
          return;
        }
        const handleLoaded = () => {
          if (cancelled) return;
          setIsReady(true);
        };
        video.addEventListener('loadedmetadata', handleLoaded, { once: true });
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
  }, [paused, facingMode, stopStream]);

  return { videoRef, streamRef, error, isReady, stopStream };
};
