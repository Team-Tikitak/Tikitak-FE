import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export const initNativeBridge = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;

  // 네이티브 앱에서는 확대 접근성 복구 (입력창 확대 방지용 maximum-scale은 웹/PWA에서만 유지)
  document
    .querySelector('meta[name="viewport"]')
    ?.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0, interactive-widget=resizes-content, viewport-fit=cover',
    );

  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      App.exitApp();
    }
  });
};
