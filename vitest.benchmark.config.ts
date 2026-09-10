import { defineConfig } from 'vitest/config';
export default defineConfig({ test: {
  environment: 'node', include: ['tests/benchmarks/**/*.bench.ts'],
  isolate: true, fileParallelism: false, maxWorkers: 1,
  sequence: { concurrent: false }, coverage: { enabled: false },
} });
