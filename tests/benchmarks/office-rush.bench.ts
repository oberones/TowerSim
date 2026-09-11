import { test,expect } from 'vitest';
import { createHash } from 'node:crypto';
import { runBenchmark } from './harness';
import { officeWorkday } from '../fixtures/office-workday';
import { encodeState,decodeState } from '../../src/simulation';
import { createRunner } from '../../src/simulation/core/clock/advance';
import { buildGraph } from '../../src/simulation/navigation/graph';
import { findRoute } from '../../src/simulation/navigation/find-route';
/** Hash the full authoritative workday outside timed processing. */
function digest(s:ReturnType<typeof officeWorkday>){return createHash('sha256').update(encodeState(s)).digest('hex');}
test('default morning arrivals, dormant attendance and evening wakeups',()=>{
 const initial=officeWorkday(),encoded=encodeState(initial),ticks=72000-initial.clock.tick;
 runBenchmark({name:'office-rush',seed:initial.rng.seed,contentId:initial.contentVersion,rulesId:initial.rulesetId,fixtureHash:digest(initial),ticks,
  restore:()=>{const s=decodeState(encoded);return {s,runner:createRunner(s),maxActive:0,maxInside:0,maxEvents:0,maxQueued:0};},
  run:r=>{for(let n=0;n<ticks;n+=30){expect(r.runner.advance(Math.min(30,ticks-n)).ok).toBe(true);const people=Object.values(r.s.occupants);r.maxActive=Math.max(r.maxActive,people.filter(p=>p.tripId!==null).length);r.maxInside=Math.max(r.maxInside,people.filter(p=>p.state==='insideFacility').length);r.maxQueued=Math.max(r.maxQueued,Object.values(r.s.queues).reduce((n,q)=>n+q.entries.length,0));r.maxEvents=Math.max(r.maxEvents,r.s.scheduledEvents.length);}},digest:({s})=>digest(s),
  counters:r=>({maxActive:r.maxActive,maxInside:r.maxInside,maxEvents:r.maxEvents,maxQueued:r.maxQueued,morningPeakQueue:r.s.transportReports.cohorts[0]!.peakQueue,scheduledEvents:r.s.ids.event.next-2,completed:r.s.transportReports.dayFinished.completed,people:Object.keys(r.s.occupants).length})});
},30000);
test('isolated route work on the default office tower',()=>{
 const initial=officeWorkday(),encoded=encodeState(initial);
 runBenchmark({name:'office-rush-routes',seed:initial.rng.seed,contentId:initial.contentVersion,rulesId:initial.rulesetId,fixtureHash:digest(initial),ticks:0,
  restore:()=>decodeState(encoded),run:s=>{for(let n=0;n<100;n++){const graph=buildGraph(s),route=findRoute(graph,s.tower!.lobby.id,Object.keys(s.offices)[0]!,'elevator');expect(route?.legs.map(l=>l.kind)).toEqual(['walk','elevator','walk']);}},digest,
  counters:s=>{const graph=buildGraph(s);return {graphBuilds:100,routeSearches:100,nodes:graph.nodes.length,edges:[...graph.edges.values()].reduce((n,e)=>n+e.length,0)};}});
});
