import { useCallback, useEffect, useRef, useState } from 'react';
export type CameraError = 'permission' | 'unsupported' | 'unknown';
export type CameraFacingMode = 'user' | 'environment';
export type CameraZoomLevel = 1 | 2;

const CAMERA_STREAM_WIDTH = 1920;
const CAMERA_STREAM_HEIGHT = 1080;
const CAMERA_STREAM_ASPECT_RATIO = 16 / 9;

const isCameraSupported = () =>
  typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);

type ZoomableMediaTrackCapabilities = MediaTrackCapabilities & {
  zoom?: {
    min?: number;
    max?: number;
  };
};

type ZoomableMediaTrackConstraintSet = MediaTrackConstraintSet & {
  zoom?: number;
};

type CameraMediaTrackConstraintSet = MediaTrackConstraintSet & {
  resizeMode?: 'none';
  zoom?: number;
};

type CameraVideoConstraints = MediaTrackConstraints & {
  resizeMode?: 'none';
};

const buildVideoConstraints = (
  facingMode: CameraFacingMode,
  deviceId?: string,
): CameraVideoConstraints => ({
  ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: facingMode } }),
  width: { ideal: CAMERA_STREAM_WIDTH },
  height: { ideal: CAMERA_STREAM_HEIGHT },
  aspectRatio: { ideal: CAMERA_STREAM_ASPECT_RATIO },
  resizeMode: 'none',
  advanced: [{ zoom: 1 } as CameraMediaTrackConstraintSet],
});

const includesAny = (value: string, keywords: string[]) =>
  keywords.some((keyword) => value.includes(keyword));

const getDeviceScore = (device: MediaDeviceInfo, facingMode: CameraFacingMode) => {
  const label = device.label.toLowerCase();
  const isFront = includesAny(label, ['front', 'user', '전면']);
  const isBack = includesAny(label, ['back', 'rear', 'environment', '후면']);
  const isTelephoto = includesAny(label, ['tele', 'telephoto', '망원']);
  const isUltraWide = includesAny(label, ['ultra', 'ultrawide', 'ultra-wide', '초광각']);
  const isWide = includesAny(label, ['wide', '광각']);

  if (facingMode === 'user') {
    if (isFront) return 40;
    if (isBack) return -10;
    return 0;
  }

  if (isFront) return -20;
  if (isTelephoto) return -10;
  if (isBack && isWide && !isUltraWide) return 50;
  if (isBack && !isUltraWide) return 40;
  if (isBack) return 20;
  if (isWide && !isUltraWide) return 10;
  return 0;
};

const selectPreferredDeviceId = async (stream: MediaStream, facingMode: CameraFacingMode) => {
  if (!navigator.mediaDevices?.enumerateDevices) return null;

  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter((device) => device.kind === 'videoinput' && device.deviceId);
  if (videoDevices.length === 0) return null;

  const currentDeviceId = stream.getVideoTracks()[0]?.getSettings?.().deviceId;
  const [preferred] = videoDevices
    .map((device, index) => ({ device, index, score: getDeviceScore(device, facingMode) }))
    .sort((a, b) => b.score - a.score || a.index - b.index);

  if (!preferred || preferred.score <= 0 || preferred.device.deviceId === currentDeviceId) {
    return null;
  }
  return preferred.device.deviceId;
};

const getTrackZoom = (capabilities: ZoomableMediaTrackCapabilities, zoomLevel: CameraZoomLevel) => {
  const minZoom = capabilities.zoom?.min;
  const maxZoom = capabilities.zoom?.max;
  if (typeof minZoom !== 'number') return null;

  const targetZoom = Math.max(zoomLevel, minZoom);
  return typeof maxZoom === 'number' ? Math.min(targetZoom, maxZoom) : targetZoom;
};

const isTwoStepZoomSupported = (capabilities: ZoomableMediaTrackCapabilities) => {
  const maxZoom = capabilities.zoom?.max;
  return typeof maxZoom === 'number' && maxZoom >= 2;
};

const applyTrackZoom = async (stream: MediaStream, zoomLevel: CameraZoomLevel) => {
  const [track] = stream.getVideoTracks();
  if (!track?.getCapabilities || !track.applyConstraints) return;

  const capabilities = track.getCapabilities() as ZoomableMediaTrackCapabilities;
  const zoom = getTrackZoom(capabilities, zoomLevel);
  if (zoom === null) return;

  try {
    await track.applyConstraints({
      advanced: [{ zoom } as ZoomableMediaTrackConstraintSet],
    });
  } catch {
    // Some WebViews expose zoom capabilities but reject applying them.
  }
};

const getZoomSupport = (stream: MediaStream) => {
  const [track] = stream.getVideoTracks();
  if (!track?.getCapabilities) return false;

  return isTwoStepZoomSupported(track.getCapabilities() as ZoomableMediaTrackCapabilities);
};

export const useCameraStream = (
  paused: boolean,
  facingMode: CameraFacingMode = 'environment',
  zoomLevel: CameraZoomLevel = 1,
) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readyFrameRef = useRef<number | null>(null);
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
        await applyTrackZoom(activeStream, zoomSupported ? zoomLevelRef.current : 1);
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

    void applyTrackZoom(stream, isZoomSupported ? zoomLevel : 1);
  }, [isZoomSupported, paused, zoomLevel]);

  return { videoRef, streamRef, error, isReady, isZoomSupported, stopStream };
};
