import { App } from '@capacitor/app';
import { focusManager } from '@tanstack/react-query';

// 웹뷰 visibilitychange가 불안정해, 앱 포그라운드 복귀를 React Query focusManager에 연결(refetchOnWindowFocus 쿼리 갱신)
export const setupAppFocus = (): void => {
  App.addListener('appStateChange', ({ isActive }) => {
    focusManager.setFocused(isActive);
  });
};
