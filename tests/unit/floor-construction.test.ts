import { expect, test } from 'vitest';
import { normalizeRanges, subtractRange } from '../../src/simulation/world/ranges';
import { quoteFloor } from '../../src/simulation/construction/floors';
import { tower, floor } from '../fixtures/tower';
import { MVP_DEFAULT } from '../../src/content/scenarios/mvp-default';

test('normalizes adjacency and splits removable spans using half-open boundaries',()=>{
  expect(normalizeRanges([{startX:4,endXExclusive:8},{startX:0,endXExclusive:4}])).toEqual([{startX:0,endXExclusive:8}]);
  expect(subtractRange([{startX:0,endXExclusive:12}],{startX:4,endXExclusive:8})).toEqual([{startX:0,endXExclusive:4},{startX:8,endXExclusive:12}]);
});
test('quotes overlap, gaps, full support, bounds and protected upper dependencies precisely',()=>{
  const s=tower();expect(floor(s,1,0,20).ok).toBe(true);
  expect(quoteFloor(s,'constructFloorRange',{floor:1,startX:10,endXExclusive:30})).toMatchObject({ok:false,code:'overlap'});
  expect(quoteFloor(s,'constructFloorRange',{floor:2,startX:0,endXExclusive:21})).toMatchObject({ok:false,code:'missingSupport'});
  expect(floor(s,2,0,10).ok).toBe(true);
  expect(floor(s,1,5,15,true)).toMatchObject({ok:false,code:'upperSupport'});
  expect(floor(s,0,0,5,true)).toMatchObject({ok:false,code:'protectedBase'});
  for(const args of [[41,0,10],[1,-1,3],[1,120,121]] as const)expect(floor(s,args[0],args[1],args[2])).toMatchObject({ok:false,code:'outOfBounds'});
  for(const args of [[1,4,4],[1,8,4],[1,0,2.5]] as const)expect(floor(s,args[0],args[1],args[2]).ok).toBe(false);
});
test('configured narrow/negative worlds allow only fully supported upper widening',()=>{
  const s=tower({...MVP_DEFAULT,world:{...MVP_DEFAULT.world,widthCells:48,groundFloor:-2,minFloor:-3,maxFloor:2,initialConstructedRanges:[{startX:0,endXExclusive:24}]}});
  expect(floor(s,-1,0,24).ok).toBe(true);expect(floor(s,0,0,30).ok).toBe(false);
  expect(floor(s,-2,24,40).ok).toBe(true);expect(floor(s,-1,24,40).ok).toBe(true);expect(floor(s,0,0,40).ok).toBe(true);
  expect(floor(s,-2,30,40,true)).toMatchObject({ok:false,code:'upperSupport'});
});
