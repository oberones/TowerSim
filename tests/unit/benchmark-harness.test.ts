import { expect, test } from 'vitest';
import { runBenchmark } from '../benchmarks/harness';
test('rejects divergent trial outcomes', () => {
  let outcome = 0;
  expect(() => runBenchmark({ name: 'divergent', seed: 'none', contentId: 'none', rulesId: 'none', fixtureHash: 'none', ticks: 1,
    restore: () => ({ value: 0 }), run: state => { state.value = outcome++; }, digest: state => String(state.value),
  })).toThrow('authoritative digest differs');
});
