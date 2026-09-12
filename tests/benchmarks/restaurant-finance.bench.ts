import { test,expect } from 'vitest';
import { createHash } from 'node:crypto';
import { runBenchmark } from './harness';
import { restaurantTower } from '../fixtures/restaurant';
import { until,command } from '../fixtures/one-worker';
import { encodeState,decodeState } from '../../src/simulation';
import { createRunner } from '../../src/simulation/core/clock/advance';
import { financeQuery } from '../../src/app/game/finance-queries';
/** Digest every authoritative field while leaving machine timing out of the comparison. */
function digest(s:ReturnType<typeof restaurantTower>){return createHash('sha256').update(encodeState(s)).digest('hex');}
test('bounded finance queries after 35 operating days',()=>{
 const s=restaurantTower(0,40);until(s,35*86400);const encoded=encodeState(s);
 runBenchmark({name:'finance-history',seed:s.rng.seed,contentId:s.contentVersion,rulesId:s.rulesetId,fixtureHash:digest(s),ticks:0,restore:()=>decodeState(encoded),run:s=>{for(let n=0;n<1000;n++)financeQuery(s);},digest,counters:s=>({queries:1000,retainedTransactions:s.economy.transactions.length,archivedTransactions:s.economy.archive.count,operatingDays:s.economy.operatingDays.length,restaurantDays:s.restaurantDays.length,livePeople:Object.keys(s.occupants).length,retainedTrips:Object.keys(s.trips).length})});
},120000);
test('finite two-room meal wave and a dormant interval',()=>{
 const s=restaurantTower(0,40);command(s,{kind:'placeFacility',payload:{definitionId:'restaurant.small',floor:0,x:48}});until(s,21601);const encoded=encodeState(s),ticks=86400-s.clock.tick;
 runBenchmark({name:'restaurant-demand',seed:s.rng.seed,contentId:s.contentVersion,rulesId:s.rulesetId,fixtureHash:digest(s),ticks,restore:()=>{const state=decodeState(encoded);return {state,runner:createRunner(state)};},run:r=>{expect(r.runner.advance(ticks).ok).toBe(true);},digest:r=>digest(r.state),counters:({state:s})=>({scheduledRequests:s.restaurantDays[0]!.visits.length,completedVisits:s.restaurantDays[0]!.visits.filter(v=>v.status==='departed').length,remainingPeople:Object.keys(s.occupants).length,retainedEvents:s.scheduledEvents.length,admissionRevenueMinor:s.restaurantDays[0]!.visits.reduce((n,v)=>n+v.paidMinor,0)})});
 runBenchmark({name:'restaurant-dormant',seed:s.rng.seed,contentId:s.contentVersion,rulesId:s.rulesetId,fixtureHash:digest(s),ticks:1000,restore:()=>{const state=decodeState(encoded);return {state,runner:createRunner(state)};},run:r=>{expect(r.runner.advance(1000).ok).toBe(true);},digest:r=>digest(r.state),counters:({state:s})=>({dormantPeople:Object.values(s.occupants).filter(p=>p.state==='outside').length,activePeople:Object.values(s.occupants).filter(p=>p.state!=='outside').length,pendingEvents:s.scheduledEvents.length})});
},120000);
