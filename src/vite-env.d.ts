/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
/// <reference types="vite-plugin-pwa/client" />

declare const __BUILD_ID__: string;

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_MEDIA_CDN_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
