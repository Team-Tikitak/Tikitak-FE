import { Capacitor, registerPlugin } from '@capacitor/core';

type CameraFacingMode = 'user' | 'environment';
type CameraZoomLevel = 1 | 2;

interface StartPreviewOptions {
  facingMode: CameraFacingMode;
  zoomLevel: CameraZoomLevel;
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

export const isNativeCameraPlatform = (): boolean =>
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

export const startNativeCameraPreview = (options: StartPreviewOptions): Promise<void> =>
  NativeCamera.startPreview(options);

export const setNativeCameraZoom = (zoomLevel: CameraZoomLevel): Promise<void> =>
  NativeCamera.setZoom({ zoomLevel });

export const captureNativeCameraPhoto = (): Promise<CaptureResult> => NativeCamera.capture();

export const stopNativeCameraPreview = (): Promise<void> => NativeCamera.stopPreview();
