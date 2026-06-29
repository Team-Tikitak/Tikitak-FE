const ANDROID_KEYBOARD_BOTTOM_INSET_FALLBACK = 24;

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

export const setupKeyboardInsets = async (platform: string): Promise<void> => {
  const { Keyboard } = await import('@capacitor/keyboard');

  const onShow = ({ keyboardHeight }: { keyboardHeight: number }) =>
    setKeyboardHeight(
      platform === 'android' ? getAndroidKeyboardOffset(keyboardHeight) : keyboardHeight,
    );
  const onHide = () => setKeyboardHeight(0);

  Keyboard.addListener('keyboardWillShow', onShow);
  Keyboard.addListener('keyboardDidShow', onShow);
  Keyboard.addListener('keyboardWillHide', onHide);
  Keyboard.addListener('keyboardDidHide', onHide);
};
