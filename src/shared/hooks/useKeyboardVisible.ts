import { useEffect, useState } from 'react';

const KEYBOARD_MIN_HEIGHT = 120;
const KEYBOARD_HIDE_SETTLE_MS = 280;

const isEditableElement = (element: Element | null): boolean => {
  if (!(element instanceof HTMLElement)) return false;
  if (element.isContentEditable) return true;

  const tagName = element.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select';
};

const hasVisualKeyboardOverlap = (): boolean => {
  const viewport = window.visualViewport;
  if (!viewport) return false;

  return window.innerHeight - viewport.height - viewport.offsetTop > KEYBOARD_MIN_HEIGHT;
};

export const useKeyboardVisible = (): boolean => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let hideTimer: ReturnType<typeof window.setTimeout> | null = null;

    const clearHideTimer = () => {
      if (hideTimer === null) return;
      window.clearTimeout(hideTimer);
      hideTimer = null;
    };

    const updateVisible = (nextVisible: boolean) => {
      clearHideTimer();

      if (nextVisible) {
        setVisible(true);
        return;
      }

      hideTimer = window.setTimeout(() => {
        setVisible(false);
        hideTimer = null;
      }, KEYBOARD_HIDE_SETTLE_MS);
    };

    const syncFromViewport = () => {
      updateVisible(isEditableElement(document.activeElement) || hasVisualKeyboardOverlap());
    };

    const handleFocusIn = (event: FocusEvent) => {
      updateVisible(isEditableElement(event.target instanceof Element ? event.target : null));
    };

    const handleFocusOut = () => {
      window.setTimeout(syncFromViewport, 0);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    window.visualViewport?.addEventListener('resize', syncFromViewport);
    window.visualViewport?.addEventListener('scroll', syncFromViewport);
    syncFromViewport();

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      window.visualViewport?.removeEventListener('resize', syncFromViewport);
      window.visualViewport?.removeEventListener('scroll', syncFromViewport);
      clearHideTimer();
    };
  }, []);

  return visible;
};
