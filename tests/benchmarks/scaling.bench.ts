import { measureWork } from '../../src/simulation/core/work-counters';
import type { WorkCounts } from '../../src/simulation/core/work-counters';
import { expect,test } from 'vitest';
import { createHash } from 'node:crypto';
import { runBenchmark } from './harness';
import { performanceTower,performancePopulation } from '../fixtures/performance';
import { referenceTower } from '../fixtures/reference-tower';
import { encodeState,decodeState } from '../../src/simulation';
import type { GameState } from '../../src/simulation';
import { createRunner } from '../../src/simulation/core/clock/advance';
import { command } from '../fixtures/one-worker';
/** Hash canonical authoritative state outside timed work, including RNG, pending events and all trip accounting. */
function digest(s:GameState){return createHash('sha256').update(encodeState(s)).digest('hex');}
/** Measure restored traffic with actual per-tick active samples and separately reported retained memory. */
function measure(initial:GameState,name:string,ticks:number,minimum:number,edit=false){
 const encoded=encodeState(initial);
 // Population sampling is a separate untimed replay; scans must not masquerade as simulation cost.
 const trace=decodeState(encoded),traceRunner=createRunner(trace),counts=[performancePopulation(trace).active];
 for(let n=0;n<ticks;n++){expect(traceRunner.advance(1).ok).toBe(true);counts.push(performancePopulation(trace).active);}
 expect(Math.min(...counts)).toBeGreaterThanOrEqual(minimum);
 return runBenchmark({name,seed:initial.rng.seed,contentId:initial.contentVersion,rulesId:initial.rulesetId,fixtureHash:digest(initial),ticks,
  restore:()=>{const state=decodeState(encoded);return {state,runner:createRunner(state),counts,work:null as WorkCounts|null,heapStart:process.memoryUsage().heapUsed};},
  run:r=>{r.work=measureWork(()=>{if(edit){const result=command(r.state,{kind:'buildElevatorShaft',payload:{definitionId:'elevator.standard',x:22,minFloor:0,maxFloor:r.state.tower!.floors.length-1,servedMinFloor:0,servedMaxFloor:r.state.tower!.floors.length-1}});if(!result.ok)throw Error(result.code);}else {const result=r.runner.advance(ticks);if(!result.ok)throw Error(result.code);}}).counts;},
  digest:r=>digest(r.state),counters:r=>{expect(Math.min(...r.counts)).toBeGreaterThanOrEqual(minimum);return {...r.work,activeMin:Math.min(...r.counts),activeMean:r.counts.reduce((a,b)=>a+b,0)/r.counts.length,activeMax:Math.max(...r.counts),...performancePopulation(r.state),eventsAllocated:r.state.ids.event.next-initial.ids.event.next,eventsConsumed:initial.scheduledEvents.length+r.state.ids.event.next-initial.ids.event.next-r.state.scheduledEvents.length,topologyChanges:r.state.navigation.topologyVersion-initial.navigation.topologyVersion,heapDeltaBytes:process.memoryUsage().heapUsed-r.heapStart};}});
}
for(const count of [100,1000,5000])for(const workload of ['walking','rush'] as const)test(`final ${workload} ${count} active`,()=>{measure(performanceTower(count,workload),`scaling-${workload}-${count}`,workload==='walking'?100:30,count);},600000);
for(const dormant of [0,5000])test(`final equal active work with ${dormant} dormant`,()=>{measure(performanceTower(100,'walking',dormant),`scaling-dormant-${dormant}`,100,100);},600000);
test('reference rush and topology edit',()=>{const s=referenceTower();measure(s,'scaling-reference-rush',30,500);measure(s,'scaling-reference-edit',0,500,true);},600000);
