import { expect, test } from 'vitest';
import { SEEDS } from '../fixtures/seeds';
import { replay } from '../fixtures/replay';
import { digest } from '../fixtures/canonical-state';
import { captureState } from '../../src/simulation';
for(const seed of SEEDS)test(`three-day replay is segmentation/reconstruction invariant: ${seed}`,()=>{
  const uninterrupted=replay(seed,[259200],false);
  const segmented=replay(seed,[0,1,21599,64800,172800],true);
  expect(digest(segmented)).toBe(digest(uninterrupted));
  expect(captureState(segmented)).toEqual(captureState(uninterrupted));
});
