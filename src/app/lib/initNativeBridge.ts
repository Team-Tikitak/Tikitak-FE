import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

const ANDROID_KEYBOARD_BOTTOM_INSET_FALLBACK = 24;

export const initNativeBridge = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;

  const platform = Capacitor.getPlatform();
  const setKeyboardHeight = (height: number) => {
    document.documentElement.style.setProperty('--keyboard-height', `${Math.max(0, height)}px`);
  };
  const getCssPixelValue = (name: string) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const numericValue = Number.parseFloat(value);

    return Number.isFinite(numericValue) ? numericValue : 0;
  };
  const getAndroidKeyboardOffset = (reportedHeight: number) => {
    const viewport = window.visualViewport;
    const bottomInset =
      getCssPixelValue('--safe-area-inset-bottom') || ANDROID_KEYBOARD_BOTTOM_INSET_FALLBACK;
    if (!viewport) return Math.max(0, reportedHeight - bottomInset);

    const visualOverlap = window.innerHeight - viewport.height - viewport.offsetTop;
    const keyboardOffset = visualOverlap > 0 ? visualOverlap : reportedHeight;

    return Math.max(0, keyboardOffset - bottomInset);
  };

  // Android는 edge-to-edge에서 env(safe-area-inset-top)가 상태바 높이를 보고하지 않음 → CSS 변수로 헤더 보정
  if (platform === 'android') {
    document.documentElement.classList.add('cap-android');
    const { StatusBar } = await import('@capacitor/status-bar');
    const statusBarInfo = await StatusBar.getInfo().catch(() => null);
    if (statusBarInfo?.height) {
      document.documentElement.style.setProperty(
        '--status-bar-height',
        `${statusBarInfo.height}px`,
      );
    }
  }

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

  const { Keyboard } = await import('@capacitor/keyboard');
  Keyboard.addListener('keyboardWillShow', ({ keyboardHeight }) =>
    setKeyboardHeight(platform === 'android' ? getAndroidKeyboardOffset(keyboardHeight) : 0),
  );
  Keyboard.addListener('keyboardDidShow', ({ keyboardHeight }) =>
    setKeyboardHeight(platform === 'android' ? getAndroidKeyboardOffset(keyboardHeight) : 0),
  );
  Keyboard.addListener('keyboardWillHide', () => setKeyboardHeight(0));
  Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
};
