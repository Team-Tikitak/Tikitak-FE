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
  registerSW({ immediate: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
