import type { StorybookConfig } from '@storybook/react-vite';
import type { Plugin, PluginOption } from 'vite';

const isVitePlugin = (plugin: PluginOption): plugin is Plugin =>
  Boolean(plugin) && typeof plugin === 'object' && 'name' in plugin;

const removePwaPlugins = (plugins: PluginOption[] = []): PluginOption[] =>
  plugins
    .map((plugin) => (Array.isArray(plugin) ? removePwaPlugins(plugin) : plugin))
    .filter((plugin) => !isVitePlugin(plugin) || !plugin.name.startsWith('vite-plugin-pwa'));

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
    plugins: removePwaPlugins(config.plugins),
  }),
};
export default config;
