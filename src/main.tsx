import { Capacitor } from '@capacitor/core';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './app/App.tsx';
import { initNativeBridge } from './app/lib/initNativeBridge';
import { prefetchTabRoutes } from './app/lib/prefetchRoutes';

void initNativeBridge();

if (!Capacitor.isNativePlatform()) {
  prefetchTabRoutes();
  if (import.meta.env.DEV) {
    // dev: 남은 SW 캐시 간섭 방지 — 해제
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => void reg.unregister());
      });
    }
  } else {
    // SW 등록은 load 이후 (초기 로드 경쟁 방지)
    window.addEventListener('load', () => registerSW({ immediate: true }));
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
