import { expect, test } from 'vitest';
test('shared composition module imports without a browser or auto-mount', async () => {
  const module = await import('../../src/main');
  expect(module.mountGame).toBeTypeOf('function');
});
