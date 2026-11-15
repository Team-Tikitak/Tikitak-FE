import { Capacitor } from '@capacitor/core';

const FADE_OUT_MS = 200;

// React가 첫 화면을 그린 다음 프레임까지 기다려, 흰 화면이 비치지 않게 한다
const waitForPaint = () =>
  new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
  });

/**
 * 네이티브 스플래시를 웹 첫 화면이 준비된 뒤에 닫는다.
 * capacitor.config의 launchShowDuration은 웹이 뜨지 않을 때의 안전장치다.
 */
export const hideNativeSplash = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;

  await waitForPaint();
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide({ fadeOutDuration: FADE_OUT_MS });
  } catch {
    // 이미 자동으로 닫혔거나 플러그인이 없으면 무시한다
  }
};
