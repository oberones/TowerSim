import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { projects: ['unit', 'integration'].map(name => ({
  test: { name, environment: 'node', isolate: true, include: [`tests/${name}/**/*.test.ts`] },
})) } });
