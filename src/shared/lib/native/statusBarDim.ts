const DIM_COLOR = '#808080'; // bg-black/50 over #ffffff
const DEFAULT_COLOR = '#ffffff';
const ANDROID_DIM_CLASS = 'android-status-bar-dimmed';

let openCount = 0;
let androidRequestId = 0;

const applyThemeColor = (color: string) => {
  if (typeof document === 'undefined') return;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
};

const setAndroidDimClass = (active: boolean) => {
  if (typeof document === 'undefined') return;
  if (!document.documentElement.classList.contains('cap-android')) return;

  document.documentElement.classList.toggle(ANDROID_DIM_CLASS, active);
  document.body.classList.toggle(ANDROID_DIM_CLASS, active);
};

const applyAndroidSystemBarDim = async (active: boolean) => {
  const currentRequestId = ++androidRequestId;
  setAndroidDimClass(active);

  const [{ Capacitor, SystemBars, SystemBarsStyle }, { StatusBar, Style }] = await Promise.all([
    import('@capacitor/core'),
    import('@capacitor/status-bar'),
  ]);

  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return;
  if (currentRequestId !== androidRequestId) return;

  await Promise.allSettled([
    StatusBar.setBackgroundColor({ color: active ? DIM_COLOR : DEFAULT_COLOR }),
    StatusBar.setStyle({ style: Style.Light }),
    SystemBars.setStyle({ style: SystemBarsStyle.Light }),
  ]);
};

export const pushStatusBarDim = (): void => {
  openCount += 1;
  if (openCount === 1) {
    applyThemeColor(DIM_COLOR);
    void applyAndroidSystemBarDim(true);
  }
};

export const popStatusBarDim = (): void => {
  openCount = Math.max(0, openCount - 1);
  if (openCount === 0) {
    applyThemeColor(DEFAULT_COLOR);
    void applyAndroidSystemBarDim(false);
  }
};
