import { test,expect } from 'vitest';
import { createHash } from 'node:crypto';
import { runBenchmark } from './harness';
import { nineAtBoarding } from '../fixtures/nine-passengers';
import { encodeState,decodeState } from '../../src/simulation';
import { createRunner } from '../../src/simulation/core/clock/advance';
import { queueIndex } from '../../src/simulation/transportation/elevators/queue-index';
/** Hash authoritative state outside the queue measurement interval. */
function digest(s:ReturnType<typeof nineAtBoarding>){return createHash('sha256').update(encodeState(s)).digest('hex');}
test('queue lookup, aggregate reads and finite passenger exchange',()=>{
 const initial=nineAtBoarding(32),encoded=encodeState(initial);
 runBenchmark({name:'queues',seed:initial.rng.seed,contentId:initial.contentVersion,rulesId:initial.rulesetId,fixtureHash:digest(initial),ticks:2000,
  restore:()=>{const s=decodeState(encoded);return {s,runner:createRunner(s)};},
  run:({s,runner})=>{const index=queueIndex(s),q=Object.values(s.queues).find(q=>q.entries.length)!,before=index.entriesVisited;for(let i=0;i<10000;i++)index.total(q.id,s.clock.tick+i);expect(index.entriesVisited).toBe(before);expect(runner.advance(2000).ok).toBe(true);},digest:({s})=>digest(s),
  counters:({s})=>({people:Object.keys(s.occupants).length,peakQueue:s.transportReports.cohorts[0]!.peakQueue,denials:Object.values(s.trips).reduce((n,t)=>n+t.deniedBoardingCount,0),completed:s.transportReports.dayFinished.completed,aggregateReads:10000})});
});
