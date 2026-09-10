import { expect, test } from 'vitest';
import { createKernelState, captureState, encodeState, decodeState, validateState, rebuildDerived } from '../../src/simulation';
import { advance } from '../../src/simulation/core/clock/advance';
import { post } from '../../src/simulation/economy/ledger';
import { Xoshiro128 } from '../../src/simulation/core/random/xoshiro128';
const create=()=>createKernelState({scenarioId:'kernel-test',scenarioVersion:1,tickSeconds:1,dayTicks:86400,initialTick:21600,startingFundsMinor:1000,capabilities:[]},'00000001000000020000000300000004');
test('captures pending bootstrap and current RNG, counters, money, events; rebuild is detached', () => {
  const state=create();expect(decodeState(encodeState(state)).clock.initialReviewPending).toBe(true);
  advance(state,1);post(state,{source:'test:credit',amountMinor:35});
  const rng=Xoshiro128.restore(state.rng);rng.nextUint32();state.rng=rng.export();state.lastCommandSequence=8;
  const captured=captureState(state);const rebuilt=decodeState(encodeState(state));
  expect(rebuilt).toEqual(captured);expect(rebuildDerived(rebuilt).scheduler.exportSorted()).toEqual(captured.scheduledEvents);
  captured.clock.tick++;expect(state.clock.tick).toBe(21601);
  expect(Object.isFrozen(rebuilt.scenario)).toBe(true);
});
test('canonical encoding ignores event and object insertion order', () => {
  const state=create();advance(state,1);const shuffled={...state,scheduledEvents:[...state.scheduledEvents].reverse()};
  expect(encodeState(shuffled)).toBe(encodeState(state));
});
test('strictly rejects unsupported, inconsistent and non-JSON states without touching source', () => {
  const state=create();advance(state,1);const before=encodeState(state);
  const edits:Array<(s:any)=>void>=[s=>s.stateVersion=0,s=>s.rulesetId='future',s=>s.extra=1,s=>delete s.clock,s=>s.rng.words=[0,0,0,0],s=>s.rng.seed=s.rng.seed.toUpperCase().replace('1','A'),s=>s.ids.event.next=1,s=>s.ids.eventSequence.next=1,s=>s.scheduledEvents.push(s.scheduledEvents[0]),s=>s.scheduledEvents[0].dueTick=s.clock.tick,s=>s.scheduledEvents[0].targetGeneration=1,s=>s.scheduledEvents[0].payload={extra:true},s=>s.scheduledEvents[0].kind='unsupported',s=>s.scheduledEvents=s.scheduledEvents.filter((e:any)=>e.kind!=='dayBoundary'),s=>s.economy.balanceMinor++,s=>s.clock.initialReviewPending=true,s=>s.clock.tick=NaN];
  for(const edit of edits) {const invalid=JSON.parse(before);edit(invalid);expect(validateState(invalid).ok).toBe(false);}
  expect(encodeState(state)).toBe(before);expect(()=>decodeState('{')).toThrow();
});

// Each story extends the existing pure save contract before native storage is introduced.
import { createGame, applyCommand } from '../../src/simulation';
import { MVP_DEFAULT } from '../../src/content/scenarios/mvp-default';
import { SEEDS } from '../fixtures/seeds';
test('playable content, lobby, edited floor identities and topology resume at the same boundary',()=>{
  const state=createGame(MVP_DEFAULT,SEEDS[2]);
  applyCommand(state,{kind:'constructFloorRange',payload:{floor:1,startX:0,endXExclusive:20},sequence:1,atTick:state.clock.tick});
  applyCommand(state,{kind:'demolishFloorRange',payload:{floor:1,startX:5,endXExclusive:10},sequence:2,atTick:state.clock.tick});
  const restored=decodeState(encodeState(state));expect(restored).toEqual(state);expect(rebuildDerived(restored).walking!.topologyVersion).toBe(2);
  expect(Object.isFrozen(restored.scenario.content!.definitions[0])).toBe(true);
  for(const edit of [(s:any)=>s.tower.lobby.x=1,(s:any)=>s.tower.floors[1].constructedRanges[0].endXExclusive=130,(s:any)=>s.tower.floors[1].id=s.tower.floors[0].id,(s:any)=>s.tower.floors[0].constructedRanges[0].endXExclusive=8,(s:any)=>s.navigation.topologyVersion=-1,(s:any)=>s.progression.level=2,(s:any)=>s.scenario.content.definitions[0].capabilities=['unknown']]){
    const bad=JSON.parse(encodeState(state));edit(bad);expect(validateState(bad).ok).toBe(false);
  }
  advance(state,86400);advance(restored,40000);advance(restored,46400);expect(encodeState(restored)).toBe(encodeState(state));
});

import {leasedWorker,until,command} from '../fixtures/one-worker';
test.each(['scheduled','halfWalk','inside','invalidated'] as const)('office continuation preserves %s state with cold indices and zero random draws',phase=>{
 const {s,id}=leasedWorker(),q=s.occupants[id]!.schedule!;
 if(phase!=='scheduled')until(s,q.arrivalTick+(phase==='inside'?28:10));
 if(phase==='invalidated')command(s,{kind:'demolishEntity',payload:{entityId:Object.keys(s.offices)[0]!}});
 const before=encodeState(s),restored=decodeState(before);rebuildDerived(restored);expect(encodeState(restored)).toBe(before);
 until(s,86400+70000);until(restored,86400);until(restored,86400+70000);expect(encodeState(restored)).toBe(encodeState(s));
});
test('office codec rejects missing wakeups, duplicated workforce, impossible locations and accrual tampering',()=>{const {s,id}=leasedWorker();until(s,s.occupants[id]!.schedule!.arrivalTick+5);for(const edit of [(x:any)=>x.scheduledEvents=x.scheduledEvents.filter((e:any)=>e.kind!=='walkComplete'),(x:any)=>x.occupants[id].location.to.x2=500,(x:any)=>x.occupants[id].state='insideFacility',(x:any)=>x.offices[Object.keys(x.offices)[0]!].accrual.eligibleTicks=999999,(x:any)=>x.occupants[id].goal.facilityId='facility:999']){const bad=JSON.parse(encodeState(s));edit(bad);expect(validateState(bad).ok).toBe(false);}});
