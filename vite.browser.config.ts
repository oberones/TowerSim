import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vite';
import release from './vite.config.ts';
export default defineConfig(mergeConfig(release, {
  root: fileURLToPath(new URL('tests/browser', import.meta.url)),
  build: { outDir: fileURLToPath(new URL('dist-browser-test', import.meta.url)) },
}));
