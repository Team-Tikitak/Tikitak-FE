const ANDROID_CAMERA_SYSTEM_BARS_CLASS = 'android-camera-system-bars-active';
const CAMERA_SYSTEM_BAR_COLOR = '#111111';
const DEFAULT_SYSTEM_BAR_COLOR = '#ffffff';

let requestId = 0;

const setAndroidCameraClass = (active: boolean) => {
  if (typeof document === 'undefined') return;

  document.documentElement.classList.toggle(ANDROID_CAMERA_SYSTEM_BARS_CLASS, active);
  document.body.classList.toggle(ANDROID_CAMERA_SYSTEM_BARS_CLASS, active);
};

export const setAndroidCameraSystemBars = async (active: boolean): Promise<void> => {
  const currentRequestId = ++requestId;
  const [{ Capacitor, SystemBars, SystemBarsStyle }, { StatusBar, Style }] = await Promise.all([
    import('@capacitor/core'),
    import('@capacitor/status-bar'),
  ]);

  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return;
  if (currentRequestId !== requestId) return;

  setAndroidCameraClass(active);

  await Promise.allSettled([
    StatusBar.setBackgroundColor({
      color: active ? CAMERA_SYSTEM_BAR_COLOR : DEFAULT_SYSTEM_BAR_COLOR,
    }),
    StatusBar.setStyle({ style: active ? Style.Dark : Style.Light }),
    SystemBars.setStyle({ style: active ? SystemBarsStyle.Dark : SystemBarsStyle.Light }),
  ]);
};
