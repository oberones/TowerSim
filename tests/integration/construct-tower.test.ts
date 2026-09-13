import { expect, test } from 'vitest';
import { MVP_DEFAULT } from '../../src/content/scenarios/mvp-default';
import { tower, floor } from '../fixtures/tower';
import { encodeState, decodeState, advance } from '../../src/simulation';

test('two upper floors, support-chain extension, guarded removals and continuation use public commands',()=>{
  const s=tower({...MVP_DEFAULT,world:{...MVP_DEFAULT.world,initialConstructedRanges:[{startX:0,endXExclusive:32}]}});
  expect(floor(s,1,0,24).ok).toBe(true);expect(floor(s,2,0,20).ok).toBe(true);
  expect(floor(s,1,24,40).ok).toBe(false);expect(floor(s,0,32,48).ok).toBe(true);expect(floor(s,1,24,40).ok).toBe(true);expect(floor(s,2,20,40).ok).toBe(true);
  expect(s.tower!.floors.find(f=>f.level===2)!.constructedRanges).toEqual([{startX:0,endXExclusive:40}]);
  expect(floor(s,1,20,40,true).ok).toBe(false);expect(floor(s,2,20,40,true).ok).toBe(true);expect(floor(s,1,20,40,true).ok).toBe(true);
  const restored=decodeState(encodeState(s));expect(restored).toEqual(s);advance(s,86400);advance(restored,3600);advance(restored,82800);expect(encodeState(restored)).toBe(encodeState(s));
});
