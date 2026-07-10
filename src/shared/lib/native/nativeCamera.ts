import { Capacitor, registerPlugin } from '@capacitor/core';

type CameraFacingMode = 'user' | 'environment';
type CameraZoomLevel = 1 | 2;

interface NativeCameraPreviewFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface StartPreviewOptions {
  facingMode: CameraFacingMode;
  zoomLevel: CameraZoomLevel;
  previewFrame?: NativeCameraPreviewFrame;
}

interface SetZoomOptions {
  zoomLevel: CameraZoomLevel;
}

interface CaptureResult {
  data: string;
  mimeType?: string;
}

interface NativeCameraPlugin {
  startPreview(options: StartPreviewOptions): Promise<void>;
  setZoom(options: SetZoomOptions): Promise<void>;
  capture(): Promise<CaptureResult>;
  stopPreview(): Promise<void>;
}

const NativeCamera = registerPlugin<NativeCameraPlugin>('NativeCamera');
const CAMERA_PREVIEW_MAX_WIDTH = 393;
const CAMERA_PREVIEW_CENTERED_BREAKPOINT = 640;
const CAMERA_PREVIEW_TOP_OFFSET = 85;
const CAMERA_PREVIEW_HEIGHT_RATIO = 4 / 3;

const getCssPixelValue = (name: string) => {
  if (typeof getComputedStyle === 'undefined') return 0;

  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const numericValue = Number.parseFloat(value);

  return Number.isFinite(numericValue) ? numericValue : 0;
};

export const isNativeCameraPlatform = (): boolean =>
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

export const getNativeCameraPreviewFrame = (): NativeCameraPreviewFrame => {
  const viewportWidth = window.innerWidth;
  const previewWidth =
    viewportWidth >= CAMERA_PREVIEW_CENTERED_BREAKPOINT ? CAMERA_PREVIEW_MAX_WIDTH : viewportWidth;
  const previewTop = getCssPixelValue('--safe-top') + CAMERA_PREVIEW_TOP_OFFSET;

  return {
    x: (viewportWidth - previewWidth) / 2,
    y: previewTop,
    width: previewWidth,
    height: previewWidth * CAMERA_PREVIEW_HEIGHT_RATIO,
  };
};

export const startNativeCameraPreview = (options: StartPreviewOptions): Promise<void> =>
  NativeCamera.startPreview(options);

export const setNativeCameraZoom = (zoomLevel: CameraZoomLevel): Promise<void> =>
  NativeCamera.setZoom({ zoomLevel });

export const captureNativeCameraPhoto = (): Promise<CaptureResult> => NativeCamera.capture();

export const stopNativeCameraPreview = (): Promise<void> => NativeCamera.stopPreview();
