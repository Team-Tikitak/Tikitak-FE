import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';

// 네이티브 키보드 표시 여부. Capacitor 이벤트 기반이라 네이티브 다이얼로그 키보드도 감지 (DOM 기반 useKeyboardVisible과 별개, 통일 금지)
export const useNativeKeyboardVisible = (): boolean => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let cancelled = false;
    let removeShow: (() => void) | undefined;
    let removeHide: (() => void) | undefined;

    void (async () => {
      const { Keyboard } = await import('@capacitor/keyboard');
      const show = await Keyboard.addListener('keyboardWillShow', () => setVisible(true));
      const hide = await Keyboard.addListener('keyboardWillHide', () => setVisible(false));
      removeShow = () => void show.remove();
      removeHide = () => void hide.remove();
      // 등록 완료 전에 unmount됐다면 cleanup이 이미 지나갔으므로 여기서 바로 해제
      if (cancelled) {
        removeShow();
        removeHide();
      }
    })();

    return () => {
      cancelled = true;
      removeShow?.();
      removeHide?.();
    };
  }, []);

  return visible;
};
