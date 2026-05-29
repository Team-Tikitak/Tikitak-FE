import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export const initNativeBridge = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;

  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      App.exitApp();
    }
  });
};
