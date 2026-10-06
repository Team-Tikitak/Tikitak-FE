import { Capacitor } from '@capacitor/core';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './app/App.tsx';
import { AppUpdateRequired } from './app/AppUpdateRequired';
import { checkRequiredAppUpdate, showRequiredAppUpdateDialog } from './app/lib/appVersionPolicy';
import { clearLegacyPwaRuntimeCaches } from './app/lib/clearLegacyPwaCaches';
import { initNativeBridge } from './app/lib/initNativeBridge';
import { prefetchTabRoutes } from './app/lib/prefetchRoutes';
import { queryClient } from './app/providers/queryClient';
import { restoreQueryCache, startQueryCachePersist } from './shared/api/queryCachePersist';

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

  const requiredAppUpdate = await checkRequiredAppUpdate();
  const root = createRoot(document.getElementById('root')!);

  if (requiredAppUpdate) {
    const openUpdate = () => {
      void showRequiredAppUpdateDialog(requiredAppUpdate);
    };

    root.render(
      <StrictMode>
        <AppUpdateRequired message={requiredAppUpdate.message} onUpdate={openUpdate} />
      </StrictMode>,
    );
    await showRequiredAppUpdateDialog(requiredAppUpdate);
    return;
  }

  // loader가 돌기 전에 캐시 복원을 끝내야 첫 진입에서 /me 등을 기다리지 않는다
  await restoreQueryCache(queryClient);
  startQueryCachePersist(queryClient);

  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

void bootstrap();
