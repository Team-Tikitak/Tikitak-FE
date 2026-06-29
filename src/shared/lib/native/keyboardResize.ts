import { Capacitor } from '@capacitor/core';

type KeyboardResizeMode = 'none' | 'native';

// iOS 전용: 웹뷰 리사이즈를 멈춰 fixed 시트가 키보드를 부드럽게 따라가게 함 (resize:native는 늦게 스냅됨)
export const setKeyboardResizeMode = async (mode: KeyboardResizeMode): Promise<void> => {
  if (Capacitor.getPlatform() !== 'ios') return;

  const { Keyboard, KeyboardResize } = await import('@capacitor/keyboard');
  await Keyboard.setResizeMode({
    mode: mode === 'none' ? KeyboardResize.None : KeyboardResize.Native,
  });
};
