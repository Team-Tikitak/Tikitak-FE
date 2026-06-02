import { Capacitor } from '@capacitor/core';

const DIM_COLOR = '#808080'; // bg-black/50 over #ffffff
const DEFAULT_COLOR = '#ffffff';

let openCount = 0;

const applyThemeColor = (color: string) => {
  if (typeof document === 'undefined') return;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
};

const applyNativeStatusBar = (color: string) => {
  if (!Capacitor.isNativePlatform()) return;
  // setBackgroundColor는 Android 전용 (iOS 네이티브는 별도 한계 — decisions 참조)
  void import('@capacitor/status-bar').then(({ StatusBar }) =>
    StatusBar.setBackgroundColor({ color }).catch(() => undefined),
  );
};

const apply = (color: string) => {
  applyThemeColor(color);
  applyNativeStatusBar(color);
};

// 바텀시트 dim과 동기화되는 status bar 색 (중첩 대비 ref-count)
export const pushStatusBarDim = (): void => {
  openCount += 1;
  if (openCount === 1) apply(DIM_COLOR);
};

export const popStatusBarDim = (): void => {
  openCount = Math.max(0, openCount - 1);
  if (openCount === 0) apply(DEFAULT_COLOR);
};
