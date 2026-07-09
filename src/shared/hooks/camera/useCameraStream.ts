import { useCallback, useEffect, useRef, useState } from 'react';
import {
  buildVideoConstraints,
  isCameraSupported,
  selectPreferredDeviceId,
  type CameraFacingMode,
} from '@/shared/lib/camera/cameraDeviceSelection';
import {
  applyTrackZoom,
  easeOutCubic,
  getStreamCurrentZoom,
  getStreamZoom,
  getZoomSupport,
} from '@/shared/lib/camera/cameraZoom';

export type { CameraFacingMode };
export type CameraError = 'permission' | 'unsupported' | 'unknown';
export type CameraZoomLevel = 1 | 2;

const CAMERA_ZOOM_ANIMATION_MS = 220;
const CAMERA_ZOOM_CONSTRAINT_INTERVAL_MS = 80;

export const useCameraStream = (
  paused: boolean,
  facingMode: CameraFacingMode = 'environment',
  zoomLevel: CameraZoomLevel = 1,
) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readyFrameRef = useRef<number | null>(null);
  const zoomFrameRef = useRef<number | null>(null);
  const currentZoomRef = useRef<number>(zoomLevel);
  const baseZoomRef = useRef(1);
  const zoomLevelRef = useRef(zoomLevel);
  const [error, setError] = useState<CameraError | null>(() =>
    isCameraSupported() ? null : 'unsupported',
  );
  const [isReady, setIsReady] = useState(false);
  const [isZoomSupported, setIsZoomSupported] = useState(false);

  const stopStream = useCallback(() => {
    if (readyFrameRef.current !== null) {
      cancelAnimationFrame(readyFrameRef.current);
      readyFrameRef.current = null;
    }
    if (zoomFrameRef.current !== null) {
      cancelAnimationFrame(zoomFrameRef.current);
      zoomFrameRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.srcObject = null;
    }
    setIsZoomSupported(false);
    setIsReady(false);
  }, []);

  useEffect(() => {
    zoomLevelRef.current = zoomLevel;
  }, [zoomLevel]);

  useEffect(() => {
    if (paused || !isCameraSupported()) return;

    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({
        video: buildVideoConstraints(facingMode),
        audio: false,
      })
      .then(async (stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        let activeStream = stream;
        try {
          const preferredDeviceId = await selectPreferredDeviceId(activeStream, facingMode);
          if (preferredDeviceId) {
            const nextStream = await navigator.mediaDevices.getUserMedia({
              video: buildVideoConstraints(facingMode, preferredDeviceId),
              audio: false,
            });
            activeStream.getTracks().forEach((track) => track.stop());
            activeStream = nextStream;
          }
        } catch {
          activeStream = stream;
        }
        if (cancelled) {
          activeStream.getTracks().forEach((track) => track.stop());
          return;
        }
        const zoomSupported = facingMode === 'environment' && getZoomSupport(activeStream);
        setIsZoomSupported(zoomSupported);
        const baseZoom = getStreamCurrentZoom(activeStream);
        if (zoomSupported) {
          const initialDisplayZoom = zoomLevelRef.current;
          const initialTrackZoom = getStreamZoom(activeStream, initialDisplayZoom);
          const shouldApplyInitialZoom =
            initialTrackZoom !== null && Math.abs(initialTrackZoom - baseZoom) >= 0.01;
          const appliedZoom = shouldApplyInitialZoom
            ? await applyTrackZoom(activeStream, initialDisplayZoom)
            : baseZoom;
          const normalizedZoom = appliedZoom ?? baseZoom;
          currentZoomRef.current = normalizedZoom;
          baseZoomRef.current = zoomLevelRef.current === 1 ? normalizedZoom : baseZoom;
        } else {
          currentZoomRef.current = baseZoom;
          baseZoomRef.current = baseZoom;
        }
        if (cancelled) {
          activeStream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = activeStream;
        setError(null);
        const video = videoRef.current;
        if (!video) return;

        video.srcObject = activeStream;

        let readyMarked = false;
        const markReady = () => {
          if (cancelled || readyMarked) return;
          readyMarked = true;
          readyFrameRef.current = requestAnimationFrame(() => {
            readyFrameRef.current = null;
            if (!cancelled && streamRef.current === activeStream) setIsReady(true);
          });
        };

        void video
          .play()
          .then(markReady)
          .catch(() => {});

        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          markReady();
          return;
        }
        video.addEventListener('loadeddata', markReady, { once: true });
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

  useEffect(() => {
    const stream = streamRef.current;
    if (paused || !stream) return;

    const targetZoom =
      isZoomSupported && zoomLevel === 1 ? baseZoomRef.current : getStreamZoom(stream, zoomLevel);
    if (targetZoom === null) return;

    if (zoomFrameRef.current !== null) {
      cancelAnimationFrame(zoomFrameRef.current);
      zoomFrameRef.current = null;
    }

    const startZoom = currentZoomRef.current;
    const delta = targetZoom - startZoom;
    if (Math.abs(delta) < 0.01) {
      currentZoomRef.current = targetZoom;
      return;
    }

    let startTime: number | null = null;
    let lastConstraintTime = Number.NEGATIVE_INFINITY;

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / CAMERA_ZOOM_ANIMATION_MS, 1);
      const easedProgress = easeOutCubic(progress);
      const nextZoom = startZoom + delta * easedProgress;
      currentZoomRef.current = nextZoom;
      const shouldApplyConstraint =
        progress === 1 || timestamp - lastConstraintTime >= CAMERA_ZOOM_CONSTRAINT_INTERVAL_MS;
      if (shouldApplyConstraint) {
        lastConstraintTime = timestamp;
        void applyTrackZoom(stream, nextZoom);
      }

      if (progress < 1) {
        zoomFrameRef.current = requestAnimationFrame(step);
        return;
      }
      currentZoomRef.current = targetZoom;
      void applyTrackZoom(stream, targetZoom);
      zoomFrameRef.current = null;
    };

    zoomFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (zoomFrameRef.current === null) return;
      cancelAnimationFrame(zoomFrameRef.current);
      zoomFrameRef.current = null;
    };
  }, [isZoomSupported, paused, zoomLevel]);

  return { videoRef, streamRef, error, isReady, isZoomSupported, stopStream };
};
