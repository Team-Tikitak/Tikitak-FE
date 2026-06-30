import type { StorybookConfig } from '@storybook/react-vite';
import type { Plugin, PluginOption } from 'vite';

const isVitePlugin = (plugin: PluginOption): plugin is Plugin =>
  Boolean(plugin) && typeof plugin === 'object' && 'name' in plugin;

const removePwaPlugins = (plugins: PluginOption[] = []): PluginOption[] =>
  plugins
    .map((plugin) => (Array.isArray(plugin) ? removePwaPlugins(plugin) : plugin))
    .filter((plugin) => !isVitePlugin(plugin) || !plugin.name.startsWith('vite-plugin-pwa'));

// @capacitor-firebase/messaging 웹 진입점이 미설치된 firebase/messaging을 import → 스토리북 빌드 실패.
// 푸시알림 스토리는 없으므로 빈 스텁으로 치환한다.
const FIREBASE_MESSAGING_STUB = '\0firebase-messaging-stub';
const stubFirebaseMessaging = (): Plugin => ({
  name: 'stub-firebase-messaging',
  enforce: 'pre',
  resolveId: (id) =>
    id === 'firebase/messaging' || id.includes('optional-peer-dep:firebase/messaging')
      ? FIREBASE_MESSAGING_STUB
      : undefined,
  load: (id) =>
    id === FIREBASE_MESSAGING_STUB
      ? 'export const deleteToken=()=>{};export const getMessaging=()=>{};export const getToken=()=>{};export const isSupported=()=>false;export const onMessage=()=>{};'
      : undefined,
});

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
  ],
  framework: '@storybook/react-vite',
  viteFinal: (config) => ({
    ...config,
    plugins: [...removePwaPlugins(config.plugins), stubFirebaseMessaging()],
  }),
};
export default config;
