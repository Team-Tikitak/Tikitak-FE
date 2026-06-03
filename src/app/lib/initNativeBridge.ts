import { Capacitor } from '@capacitor/core';
import { setupBackButton } from './native/backButton';
import { setupKeyboardInsets } from './native/keyboardInsets';
import { setupAndroidStatusBar } from './native/statusBar';
import { applyNativeViewportMeta } from './native/viewport';

export const initNativeBridge = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;

  const platform = Capacitor.getPlatform();

  if (platform === 'android') {
    await setupAndroidStatusBar();
  }

  applyNativeViewportMeta();
  setupBackButton();
  await setupKeyboardInsets(platform);
};
