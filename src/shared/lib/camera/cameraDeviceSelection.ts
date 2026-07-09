export type CameraFacingMode = 'user' | 'environment';

export const CAMERA_STREAM_WIDTH = 1440;
export const CAMERA_STREAM_HEIGHT = 1920;
export const CAMERA_STREAM_ASPECT_RATIO = 3 / 4;

export const isCameraSupported = () =>
  typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);

type CameraVideoConstraints = MediaTrackConstraints & {
  resizeMode?: 'none';
};

export const buildVideoConstraints = (
  facingMode: CameraFacingMode,
  deviceId?: string,
): CameraVideoConstraints => ({
  ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: facingMode } }),
  width: { ideal: CAMERA_STREAM_WIDTH },
  height: { ideal: CAMERA_STREAM_HEIGHT },
  aspectRatio: { ideal: CAMERA_STREAM_ASPECT_RATIO },
  resizeMode: 'none',
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

export const selectPreferredDeviceId = async (
  stream: MediaStream,
  facingMode: CameraFacingMode,
) => {
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
