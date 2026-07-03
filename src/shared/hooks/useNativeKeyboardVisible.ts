import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';

// 네이티브(iOS/Android) 키보드 표시 여부. Capacitor Keyboard 이벤트 기반이라
// 웹 input뿐 아니라 네이티브 다이얼로그(UIAlertController 등)의 키보드도 감지한다.
// (useKeyboardVisible은 DOM focus/visualViewport 기반이라 네이티브 다이얼로그는 못 잡음)
export const useNativeKeyboardVisible = (): boolean => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let removeShow: (() => void) | undefined;
    let removeHide: (() => void) | undefined;

    void (async () => {
      const { Keyboard } = await import('@capacitor/keyboard');
      const show = await Keyboard.addListener('keyboardWillShow', () => setVisible(true));
      const hide = await Keyboard.addListener('keyboardWillHide', () => setVisible(false));
      removeShow = () => void show.remove();
      removeHide = () => void hide.remove();
    })();

    return () => {
      removeShow?.();
      removeHide?.();
    };
  }, []);

  return visible;
};
