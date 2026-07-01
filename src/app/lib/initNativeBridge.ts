import { Capacitor } from '@capacitor/core';
import { setupAppFocus } from './native/appFocus';
import { setupBackButton } from './native/backButton';
import { disablePinchZoom } from './native/disablePinchZoom';
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
  disablePinchZoom();
  setupBackButton();
  setupAppFocus();
  await setupKeyboardInsets(platform);
};
