import { App } from '@capacitor/app';
import { focusManager } from '@tanstack/react-query';
import type { PluginListenerHandle } from '@capacitor/core';

// 웹뷰 visibilitychange가 불안정해, 앱 포그라운드 복귀를 React Query focusManager에 연결(refetchOnWindowFocus 쿼리 갱신)
// 필요 시 해제할 수 있도록 리스너 핸들을 반환한다.
export const setupAppFocus = (): Promise<PluginListenerHandle> =>
  App.addListener('appStateChange', ({ isActive }) => {
    focusManager.setFocused(isActive);
  });
