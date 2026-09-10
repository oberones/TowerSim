import { expect, test } from 'vitest';
import { runBenchmark } from './harness';
import { tower, floor } from '../fixtures/tower';
import { captureState, validateCommand } from '../../src/simulation';
import { MVP_DEFAULT } from '../../src/content/scenarios/mvp-default';
import { digest, sha256 } from '../fixtures/canonical-state';
import { SEEDS } from '../fixtures/seeds';
import { buildWalkingSpace } from '../../src/simulation/world/walking-space';
const snapshot=tower({...MVP_DEFAULT,startingFundsMinor:10000000});
const metadata={seed:SEEDS[0],contentId:snapshot.contentVersion,rulesId:snapshot.rulesetId,ticks:0};

test('40-floor construction, 2000 previews and 40 safe removals restore identical snapshots',()=>{
  runBenchmark({...metadata,name:'construction-edit-and-preview',fixtureHash:digest(snapshot),restore:()=>captureState(snapshot),
    run:s=>{for(let level=1;level<=40;level++)expect(floor(s,level,0,120).ok).toBe(true);
      for(let i=0;i<2000;i++)expect(validateCommand(s,{kind:'constructFloorRange',payload:{floor:1+i%40,startX:0,endXExclusive:120},sequence:s.lastCommandSequence+1,atTick:s.clock.tick}).ok).toBe(false);
      for(let level=40;level>=1;level--)expect(floor(s,level,0,120,true).ok).toBe(true);},digest,
    counters:s=>({acceptedEdits:s.navigation.topologyVersion,retainedFloors:s.tower!.floors.length,transactions:s.economy.transactions.length,previews:2000}),
  });
});
test('sparse walking-index reconstruction preserves topology and authoritative digest',()=>{
  const prepared=captureState(snapshot);for(let level=1;level<=40;level++)expect(floor(prepared,level,0,120).ok).toBe(true);
  runBenchmark({...metadata,name:'construction-walking-cache',fixtureHash:sha256(digest(prepared)+':1000'),restore:()=>captureState(prepared),
    run:s=>{for(let i=0;i<1000;i++){const cache=buildWalkingSpace(s)!;expect(cache.floors.size).toBe(41);expect(cache.topologyVersion).toBe(40);}},digest,
    counters:s=>({rebuilds:1000,retainedFloors:s.tower!.floors.length,topologyVersion:s.navigation.topologyVersion}),
  });
});
