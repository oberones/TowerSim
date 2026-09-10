import { expect, test } from 'vitest';
import { runBenchmark } from './harness';
// Runner self-check only; this is not a simulation performance measurement.
test('benchmark runner restores each trial and records matching digests', () => {
  let restores = 0;
  const result = runBenchmark({ name: 'setup-harness-only', seed: 'not-applicable', contentId: 'none', rulesId: 'none', fixtureHash: 'counter-zero', ticks: 1000,
    restore: () => { restores++; return {value: 0}; },
    run: state => { for (let i = 0; i < 1000; i++) state.value++; },
    digest: state => String(state.value),
  });
  expect(restores).toBe(13);
  expect(result.samplesMs).toHaveLength(10);
});
