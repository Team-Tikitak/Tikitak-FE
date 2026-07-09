import { CAMERA_STREAM_ASPECT_RATIO } from './cameraDeviceSelection';

export const getCoverPreviewZoomLevel = (zoomLevel: number) => {
  if (typeof window === 'undefined') return zoomLevel;

  const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  if (!viewportWidth || !viewportHeight) return zoomLevel;

  const viewportAspectRatio = viewportWidth / viewportHeight;
  if (viewportAspectRatio >= CAMERA_STREAM_ASPECT_RATIO) return zoomLevel;

  return zoomLevel * (viewportAspectRatio / CAMERA_STREAM_ASPECT_RATIO);
};

type ZoomableMediaTrackCapabilities = MediaTrackCapabilities & {
  zoom?: {
    min?: number;
    max?: number;
  };
};

type ZoomableMediaTrackConstraintSet = MediaTrackConstraintSet & {
  zoom?: number;
};

type ZoomableMediaTrackSettings = MediaTrackSettings & {
  zoom?: number;
};

export const getTrackZoom = (capabilities: ZoomableMediaTrackCapabilities, zoomLevel: number) => {
  const minZoom = capabilities.zoom?.min;
  const maxZoom = capabilities.zoom?.max;
  if (typeof minZoom !== 'number') return null;

  const targetZoom = Math.max(getCoverPreviewZoomLevel(zoomLevel), minZoom);
  return typeof maxZoom === 'number' ? Math.min(targetZoom, maxZoom) : targetZoom;
};

export const isTwoStepZoomSupported = (capabilities: ZoomableMediaTrackCapabilities) => {
  const maxZoom = capabilities.zoom?.max;
  return typeof maxZoom === 'number' && maxZoom >= 2;
};

export const getStreamZoom = (stream: MediaStream, zoomLevel: number) => {
  const [track] = stream.getVideoTracks();
  if (!track?.getCapabilities) return null;

  const capabilities = track.getCapabilities() as ZoomableMediaTrackCapabilities;
  return getTrackZoom(capabilities, zoomLevel);
};

export const getStreamCurrentZoom = (stream: MediaStream) => {
  const [track] = stream.getVideoTracks();
  const settings = track?.getSettings?.() as ZoomableMediaTrackSettings | undefined;
  return typeof settings?.zoom === 'number' ? settings.zoom : 1;
};

export const applyTrackZoom = async (stream: MediaStream, zoomLevel: number) => {
  const [track] = stream.getVideoTracks();
  if (!track?.getCapabilities || !track.applyConstraints) return null;

  const zoom = getStreamZoom(stream, zoomLevel);
  if (zoom === null) return null;

  try {
    await track.applyConstraints({
      advanced: [{ zoom } as ZoomableMediaTrackConstraintSet],
    });
    return zoom;
  } catch {
    // Some WebViews expose zoom capabilities but reject applying them.
    return null;
  }
};

export const getZoomSupport = (stream: MediaStream) => {
  const [track] = stream.getVideoTracks();
  if (!track?.getCapabilities) return false;

  return isTwoStepZoomSupported(track.getCapabilities() as ZoomableMediaTrackCapabilities);
};

export const easeOutCubic = (progress: number) => 1 - Math.pow(1 - progress, 3);
