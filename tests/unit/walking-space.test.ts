import { expect, test } from 'vitest';
import { tower, floor } from '../fixtures/tower';
import { hasWalkingPath, accessAt } from '../../src/simulation/world/walking-space';
import { rebuildDerived, encodeState } from '../../src/simulation';

test('touching spans connect, gaps break paths, and upper construction alone creates no lobby route',()=>{
  const s=tower();floor(s,1,0,10);floor(s,1,15,20);
  expect(hasWalkingPath(s.tower!,1,2,38)).toBe(false);expect(accessAt(s,1,2)).toMatchObject({accessible:false,reason:'Build connected stairs or an elevator landing serving floor 1 and the lobby'});
  floor(s,1,10,15);expect(hasWalkingPath(s.tower!,1,2,38)).toBe(true);expect(accessAt(s,0,22).accessible).toBe(true);
  const before=encodeState(s);expect(rebuildDerived(s).walking!.topologyVersion).toBe(3);expect(encodeState(s)).toBe(before);
});
test('each accepted edit increments topology once; preview/rejection/rebuild never does',()=>{
  const s=tower();expect(s.navigation.topologyVersion).toBe(0);floor(s,1,0,20);floor(s,1,0,20);expect(s.navigation.topologyVersion).toBe(1);
  floor(s,1,5,10,true);expect(s.navigation.topologyVersion).toBe(2);rebuildDerived(s);expect(s.navigation.topologyVersion).toBe(2);
});
