import { expect, test } from 'vitest';
import { runBenchmark } from './harness';
import { Scheduler } from '../../src/simulation/core/events/scheduler';
import type { EventRecord } from '../../src/simulation/core/events/event';
import { createKernelState, advance, captureState } from '../../src/simulation';
import { KERNEL_SCENARIO, SEEDS } from '../fixtures/seeds';
import { digest, sha256 } from '../fixtures/canonical-state';
import { CONTENT_VERSION, RULESET_ID } from '../../src/simulation/state/game-state';
const metadata={seed:SEEDS[0],contentId:CONTENT_VERSION,rulesId:RULESET_ID};
const event=(n:number):EventRecord=>({id:`event:${n}`,dueTick:10+(n%5),phasePriority:20,sequence:n,kind:'benchmark',targetId:`owner:${1+n%8}`,targetGeneration:0,payload:{}});
test('5000-event insertion/drain burst maintains deterministic total order',()=>{
  const snapshot=Array.from({length:5000},(_,i)=>event(i+1));
  runBenchmark({...metadata,name:'kernel-event-burst',fixtureHash:sha256(JSON.stringify(snapshot)),ticks:0,
    restore:()=>({heap:new Scheduler<EventRecord>([],0),events:JSON.parse(JSON.stringify(snapshot)) as EventRecord[],finished:[] as string[]}),
    run:s=>{for(const e of s.events)s.heap.insert(e,0);while(s.heap.size)s.finished.push(s.heap.pop()!.id);s.heap.assertConsistent();},
    digest:s=>sha256(JSON.stringify(s.finished)),counters:s=>({...s.heap.storageCounts(),insertions:5000,pops:5000,peakHeap:5000}),
  });
});
test('20000 repeated schedules/cancels physically bound storage',()=>{
  runBenchmark({...metadata,name:'kernel-cancellation',fixtureHash:sha256('20000 inserts, cancel each group of 64 by owner, drain final group'),ticks:0,
    restore:()=>({heap:new Scheduler<EventRecord>([],0),peak:0}),
    run:s=>{for(let i=1;i<=20000;i++){s.heap.insert(event(i),0);s.peak=Math.max(s.peak,s.heap.size);if(i%64===0)for(let owner=1;owner<=8;owner++)s.heap.cancelOwner(`owner:${owner}`);}for(let owner=1;owner<=8;owner++)s.heap.cancelOwner(`owner:${owner}`);s.heap.assertConsistent();expect(s.heap.storageCounts()).toEqual({heap:0,ids:0,sequences:0,owners:0});expect(s.peak).toBe(64);},
    digest:s=>sha256(JSON.stringify([s.heap.exportSorted(),s.heap.storageCounts(),s.peak])),counters:s=>({...s.heap.storageCounts(),peakHeap:s.peak,insertions:20000,cancellations:20000}),
  });
});
test('three-day completed-boundary advancement restores the same initial snapshot',()=>{
  const snapshot=createKernelState(KERNEL_SCENARIO,SEEDS[0]);
  runBenchmark({...metadata,name:'kernel-boundaries',fixtureHash:digest(snapshot),ticks:259200,
    restore:()=>captureState(snapshot),run:s=>{expect(advance(s,259200).ok).toBe(true);},digest,
    counters:s=>({pendingEvents:s.scheduledEvents.length,finalTick:s.clock.tick,heapUsedBytes:process.memoryUsage().heapUsed}),
  });
});
