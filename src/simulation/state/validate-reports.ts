import type { GameState } from './game-state';
import type { TripAggregate } from '../metrics/report-state';
import { emptyAggregate } from '../metrics/report-state';
import { addTrip,aggregateMeans } from '../metrics/aggregate';
import { record } from './plain';
import { tick } from '../core/values';
const aggregateKeys=['samples','completed','abandoned','stranded','unresolved','totals','denials','transfers','qualityUnits'];
/** Reject counters that cannot describe one nonduplicated population of measured trip outcomes. */
function aggregate(a:TripAggregate,extra:string[]=[]):void {
 record(a,[...aggregateKeys,...extra]);for(const key of aggregateKeys)if(key!=='totals')tick(a[key as Exclude<keyof TripAggregate,'totals'>]);record(a.totals,['walking','waiting','stair','riding','stranded']);for(const n of Object.values(a.totals))tick(n);
 if(a.completed+a.abandoned+a.unresolved!==a.samples||a.stranded>a.unresolved||a.qualityUnits>a.samples*600000)throw Error('Invalid report population');
}
/** Validate report identities, bounded daily summaries, maintained queue counts and current-day reconciliation. */
export function assertReports(s:GameState):void {
 const r=s.transportReports;record(r,['dayFinished','daily','cohorts']);aggregate(r.dayFinished);
 if(!Array.isArray(r.daily)||!Array.isArray(r.cohorts)||r.daily.length>(s.scenario.content?.historyLimits.days??30))throw Error('Invalid report retention');
 let previous=-1;for(const d of r.daily){aggregate(d,['day','startTick','endTick','partial','quality','meanWaitingTicks']);tick(d.day);tick(d.startTick);tick(d.endTick);const means=aggregateMeans(d);
  if(d.day<=previous||d.endTick!==(d.day+1)*s.scenario.dayTicks||d.endTick>s.clock.tick||d.startTick!==Math.max(s.scenario.initialTick,d.day*s.scenario.dayTicks)||d.partial!==(d.startTick!==d.day*s.scenario.dayTicks)||d.quality!==means.quality||d.meanWaitingTicks!==means.meanWaitingTicks)throw Error('Invalid completed day');previous=d.day;
 }
 const currentDay=Math.floor(s.clock.tick/s.scenario.dayTicks);if(currentDay>0&&(r.daily.length===0||r.daily.at(-1)!.day!==currentDay-1))throw Error('Missing completed day');
 const expected=emptyAggregate();for(const t of Object.values(s.trips))if(t.endTick!==null&&t.endTick>=currentDay*s.scenario.dayTicks)addTrip(expected,t,t.endTick,s.scenario.content!.metrics);
 for(const key of aggregateKeys)if(key==='totals'){for(const mode of Object.keys(expected.totals) as (keyof typeof expected.totals)[])if(expected.totals[mode]!==r.dayFinished.totals[mode])throw Error('Unreconciled current-day components');}else if(expected[key as Exclude<keyof TripAggregate,'totals'>]!==r.dayFinished[key as Exclude<keyof TripAggregate,'totals'>])throw Error('Unreconciled current-day report');
 if(r.cohorts.length!==s.workforceDays.length)throw Error('Missing cohort counters');
 for(const [i,c] of r.cohorts.entries()){record(c,['day','currentQueued','peakQueue']);tick(c.day);tick(c.currentQueued);tick(c.peakQueue);const d=s.workforceDays[i]!;
  const tripIds=new Set(d.members.flatMap(m=>m.tripId?[m.tripId]:[])),queued=Object.values(s.queues).reduce((n,q)=>n+q.entries.filter(e=>tripIds.has(e.tripId)).length,0);
  if(c.day!==d.day||c.currentQueued!==queued||c.peakQueue<c.currentQueued||c.peakQueue>d.members.length)throw Error('Invalid cohort queue counters');
 }
}
