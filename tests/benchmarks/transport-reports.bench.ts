import { test } from 'vitest';
import { createHash } from 'node:crypto';
import { runBenchmark } from './harness';
import { officeWorkday } from '../fixtures/office-workday';
import { until } from '../fixtures/one-worker';
import { encodeState,decodeState } from '../../src/simulation';
import { transportQuery } from '../../src/app/game/transport-queries';
/** Hash report and trip state to prove repeated projections are nonmutating. */
function digest(s:ReturnType<typeof officeWorkday>){return createHash('sha256').update(encodeState(s)).digest('hex');}
test('scoped report projection timing over a completed default workday',()=>{
 const s=officeWorkday();until(s,86400);const encoded=encodeState(s);
 runBenchmark({name:'transport-reports',seed:s.rng.seed,contentId:s.contentVersion,rulesId:s.rulesetId,fixtureHash:digest(s),ticks:0,restore:()=>decodeState(encoded),run:s=>{for(let n=0;n<1000;n++)transportQuery(s);},digest,counters:s=>({queries:1000,retainedTrips:Object.keys(s.trips).length,dailySummaries:s.transportReports.daily.length,cohorts:s.workforceDays.length,liveSamples:transportQuery(s).live.samples})});
});
