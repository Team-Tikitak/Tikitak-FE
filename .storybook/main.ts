import type { StorybookConfig } from '@storybook/react-vite';
import type { Plugin, PluginOption } from 'vite';

const isVitePlugin = (plugin: PluginOption): plugin is Plugin =>
  Boolean(plugin) && typeof plugin === 'object' && 'name' in plugin;

const removePwaPlugins = (plugins: PluginOption[] = []): PluginOption[] =>
  plugins
    .map((plugin) => (Array.isArray(plugin) ? removePwaPlugins(plugin) : plugin))
    .filter((plugin) => !isVitePlugin(plugin) || !plugin.name.startsWith('vite-plugin-pwa'));

// @capacitor-firebase/* 웹 진입점이 미설치된 firebase/* 를 import → 스토리북 빌드 실패.
// 관련 스토리는 없으므로 빈 스텁으로 치환한다.
const FIREBASE_STUBS: Record<string, string> = {
  'firebase/messaging':
    'export const deleteToken=()=>{};export const getMessaging=()=>{};export const getToken=()=>{};export const isSupported=()=>false;export const onMessage=()=>{};',
  'firebase/analytics':
    'export const getAnalytics=()=>{};export const logEvent=()=>{};export const setAnalyticsCollectionEnabled=()=>{};export const setConsent=()=>{};export const setUserId=()=>{};export const setUserProperties=()=>{};',
};
const STUB_PREFIX = '\0firebase-stub:';
const stubFirebase = (): Plugin => ({
  name: 'stub-firebase',
  enforce: 'pre',
  resolveId: (id) => {
    const target = Object.keys(FIREBASE_STUBS).find(
      (name) => id === name || id.includes(`optional-peer-dep:${name}`),
    );
    return target ? `${STUB_PREFIX}${target}` : undefined;
  },
  load: (id) =>
    id.startsWith(STUB_PREFIX) ? FIREBASE_STUBS[id.slice(STUB_PREFIX.length)] : undefined,
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
    plugins: [...removePwaPlugins(config.plugins), stubFirebase()],
  }),
};
export default config;
