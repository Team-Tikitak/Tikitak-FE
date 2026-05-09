import path from 'path';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

const reactCompiler = reactCompilerPreset();
reactCompiler.rolldown.filter = {
  ...reactCompiler.rolldown.filter,
  id: { exclude: [/\/src\/shared\/(api|lib|constants|types|assets)\//] },
};

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompiler] }), tailwindcss(), svgr()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
