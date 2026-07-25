const ANDROID_KEYBOARD_BOTTOM_INSET_FALLBACK = 24;
const KEYBOARD_VISUAL_OVERLAP_MIN_HEIGHT = 120;
const KEYBOARD_VISUAL_OVERLAP_FALLBACK_THRESHOLD = 24;

const setKeyboardHeight = (height: number) => {
  document.documentElement.style.setProperty('--keyboard-height', `${Math.max(0, height)}px`);
};

const getCssPixelValue = (name: string) => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const numericValue = Number.parseFloat(value);

  return Number.isFinite(numericValue) ? numericValue : 0;
};

const getVisualViewportKeyboardOverlap = () => {
  const viewport = window.visualViewport;
  if (!viewport) return 0;

  const overlap = window.innerHeight - viewport.height - viewport.offsetTop;

  return overlap > KEYBOARD_VISUAL_OVERLAP_MIN_HEIGHT ? overlap : 0;
};

const getAndroidKeyboardOffset = (reportedHeight: number) => {
  const bottomInset =
    getCssPixelValue('--safe-area-inset-bottom') || ANDROID_KEYBOARD_BOTTOM_INSET_FALLBACK;
  const visualOverlap = getVisualViewportKeyboardOverlap();
  const keyboardOffset =
    reportedHeight > 0 &&
    visualOverlap <= reportedHeight + KEYBOARD_VISUAL_OVERLAP_FALLBACK_THRESHOLD
      ? reportedHeight
      : Math.max(reportedHeight, visualOverlap);

  return Math.max(0, keyboardOffset - bottomInset);
};

const getKeyboardOffset = (platform: string, reportedHeight: number) => {
  if (platform === 'android') return getAndroidKeyboardOffset(reportedHeight);

  const visualOverlap = getVisualViewportKeyboardOverlap();

  // iOS WebView가 키보드에 맞춰 이미 축소된 경우 fixed 바텀시트도 함께 이동한다.
  // 이때 CSS bottom 보정까지 더하면 시트가 키보드 높이만큼 한 번 더 위로 올라간다.
  return visualOverlap > 0 ? 0 : reportedHeight;
};

const isEditableElement = (element: Element | null) => {
  if (!(element instanceof HTMLElement)) return false;

  return Boolean(element.closest('input, textarea, [contenteditable="true"]'));
};

export const setupKeyboardInsets = async (platform: string): Promise<void> => {
  const { Keyboard } = await import('@capacitor/keyboard');

  let lastReportedHeight = 0;
  let keyboardVisible = false;

  const syncFromViewport = () => {
    if (!keyboardVisible && !isEditableElement(document.activeElement)) return;

    const keyboardOffset = getKeyboardOffset(platform, lastReportedHeight);
    setKeyboardHeight(keyboardOffset);
  };

  const onShow = ({ keyboardHeight }: { keyboardHeight: number }) => {
    lastReportedHeight = keyboardHeight;
    keyboardVisible = true;
    setKeyboardHeight(getKeyboardOffset(platform, keyboardHeight));
    window.requestAnimationFrame(syncFromViewport);
  };
  const onHide = () => {
    lastReportedHeight = 0;
    keyboardVisible = false;
    setKeyboardHeight(0);
  };
  const onFocusOut = () => {
    window.setTimeout(() => {
      if (isEditableElement(document.activeElement) || getVisualViewportKeyboardOverlap() > 0) {
        return;
      }

      onHide();
    }, 0);
  };

  Keyboard.addListener('keyboardWillShow', onShow);
  Keyboard.addListener('keyboardDidShow', onShow);
  Keyboard.addListener('keyboardWillHide', onHide);
  Keyboard.addListener('keyboardDidHide', onHide);

  window.visualViewport?.addEventListener('resize', syncFromViewport);
  window.visualViewport?.addEventListener('scroll', syncFromViewport);
  document.addEventListener('focusin', syncFromViewport);
  document.addEventListener('focusout', onFocusOut);
};
