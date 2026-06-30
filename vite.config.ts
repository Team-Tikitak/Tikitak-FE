/// <reference types="vitest/config" />
import path from 'path';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';

const reactCompiler = reactCompilerPreset();
reactCompiler.rolldown.filter = {
  ...reactCompiler.rolldown.filter,
  id: { exclude: [/\/src\/shared\/(api|lib|constants|types|assets)\//] },
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const mediaCdnBaseUrl = env.VITE_MEDIA_CDN_BASE_URL;

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompiler] }),
      tailwindcss(),
      svgr(),
      VitePWA({
        disable: env.VITE_PWA_DISABLE === 'true',
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'favicon-16x16.png',
          'favicon-32x32.png',
          'apple-touch-icon.png',
          'og-image.png',
          'robots.txt',
        ],
        manifest: {
          name: 'Tikitak',
          short_name: 'Tikitak',
          description: '우리의 순간을 함께 남기는 공간',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          lang: 'ko',
          icons: [
            { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
            {
              src: '/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.hostname === 'dapi.kakao.com',
              handler: 'CacheFirst',
              options: {
                cacheName: 'kakao-sdk',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 },
              },
            },
            {
              urlPattern: ({ url }) => url.hostname === 'dev-media.kusitms.xyz',
              handler: 'CacheFirst',
              options: {
                cacheName: 'tikitak-media',
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: mediaCdnBaseUrl
      ? {
          proxy: {
            '/__media-proxy': {
              target: mediaCdnBaseUrl,
              changeOrigin: true,
              rewrite: (proxyPath) => proxyPath.replace(/^\/__media-proxy/, ''),
            },
          },
        }
      : undefined,
    preview: {
      port: 5173,
    },
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 600,
      rolldownOptions: {
        external: ['firebase/messaging'],
        output: {
          manualChunks: (id) => {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('node_modules/@capacitor-firebase')) return undefined;
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/'))
              return 'react';
            if (id.includes('node_modules/react-router')) return 'react-router';
            if (id.includes('node_modules/@tanstack')) return 'tanstack';
            if (id.includes('node_modules/@ssgoi')) return 'transitions';
            if (id.includes('node_modules/@capacitor')) return 'capacitor';
            if (id.includes('node_modules/vaul')) return 'vaul';
            if (id.includes('node_modules/overlay-kit')) return 'overlay';
            if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/zod'))
              return 'forms';
            if (id.includes('node_modules/zustand') || id.includes('node_modules/axios'))
              return 'state-network';
            return 'vendor';
          },
        },
      },
    },
  };
});
