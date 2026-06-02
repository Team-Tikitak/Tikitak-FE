import { Capacitor } from '@capacitor/core';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './app/App.tsx';
import { clearLegacyPwaRuntimeCaches } from './app/lib/clearLegacyPwaCaches';
import { initNativeBridge } from './app/lib/initNativeBridge';
import { prefetchTabRoutes } from './app/lib/prefetchRoutes';

void initNativeBridge();

const bootstrap = async () => {
  if (!Capacitor.isNativePlatform()) {
    await clearLegacyPwaRuntimeCaches();
    prefetchTabRoutes();

    if (import.meta.env.DEV) {
      // dev: 남은 SW 캐시 간섭 방지
      if ('serviceWorker' in navigator) {
        void navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((reg) => void reg.unregister());
        });
      }
    } else if (document.readyState === 'complete') {
      // 이미 load 완료(async bootstrap 도중) → 바로 등록
      registerSW({ immediate: true });
    } else {
      // load 이후로 미뤄 초기 로드 경합을 줄인다.
      window.addEventListener('load', () => registerSW({ immediate: true }), { once: true });
    }
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

void bootstrap();
