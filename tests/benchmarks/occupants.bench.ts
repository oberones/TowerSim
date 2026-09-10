import {createRunner} from '../../src/simulation/core/clock/advance';
import {test,expect} from 'vitest';
import {createHash} from 'node:crypto';
import {runBenchmark} from './harness';
import {createGame,encodeState,decodeState,advance} from '../../src/simulation';
import {oneWorkerScenario,place,until,WALKER_SEED} from '../fixtures/one-worker';
import {activeIndex} from '../../src/simulation/occupants/active-index';
import {compareEvents} from '../../src/simulation/core/events/event';

/** Prepare equal walking work with extra valid scheduled sleepers; no wake falls in the timed interval. */
function fixture(dormant:number,inside=false){
 const sc=oneWorkerScenario(),s=createGame({...sc,scenarioId:'walking-benchmark',content:{...sc.content!,officeMarketWorkers:dormant+1,walkingTicksPerCell:1000,definitions:sc.content!.definitions.map(d=>d.typeId==='office.small'?{...d,capacity:dormant+1}:d)}},WALKER_SEED);
 place(s);until(s,21601);const ids=Object.keys(s.occupants);
 // Performance-only DTO arrangement: retain domain-created identities; freeze nonmeasured wakeups in their valid window.
 for(const [i,id] of ids.entries()){const p=s.occupants[id]!;p.schedule!.arrivalTick=i===0?28800:33000;if(inside)p.schedule!.departureTick=i===0?61200:68300;for(const e of s.scheduledEvents)if(e.targetId===id){if(e.kind==='workerArrival')e.dueTick=p.schedule!.arrivalTick;if(e.kind==='workerDeparture')e.dueTick=p.schedule!.departureTick;}}
 s.scheduledEvents.sort(compareEvents);until(s,inside?61200:28800);return s;
}
/** Hash the canonical boundary outside timing for reproducible restored-trial comparisons. */
function digest(s:ReturnType<typeof fixture>){return createHash('sha256').update(encodeState(s)).digest('hex');}
for(const inside of [false,true])for(const dormant of [0,1000,5000])test(`one active walker with ${dormant} ${inside?'inside':'scheduled'} workers`,()=>{
 const initial=fixture(dormant,inside),encoded=encodeState(initial);expect(activeIndex(initial).active.size).toBe(1);
 const report=runBenchmark({name:`occupants-${inside?'inside':'scheduled'}-${dormant}`,seed:WALKER_SEED,contentId:initial.contentVersion,rulesId:initial.rulesetId,fixtureHash:digest(initial),ticks:100,restore:()=>{const state=decodeState(encoded);return {state,runner:createRunner(state)};},run:runtime=>{const r=runtime.runner.advance(100);expect(r.ok).toBe(true);},digest:runtime=>digest(runtime.state),counters:({state:s})=>({activeMin:1,activeMean:1,activeMax:activeIndex(s).active.size,dormant:activeIndex(s).dormant.size,events:s.scheduledEvents.length,routeRequestsDuringInterval:0,wakeupsDuringInterval:0})});expect(new Set(report.digests).size).toBe(1);
},120000);
