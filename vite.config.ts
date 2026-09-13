import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
export const repositoryRoot = fileURLToPath(new URL('.', import.meta.url));
export default defineConfig({
  root: repositoryRoot,
  base: './',
  envDir: repositoryRoot,
  publicDir: fileURLToPath(new URL('public', import.meta.url)),
  build: { target: ['chrome107', 'firefox104', 'safari16.4'], outDir: fileURLToPath(new URL('dist', import.meta.url)), emptyOutDir: true, manifest: true },
});
