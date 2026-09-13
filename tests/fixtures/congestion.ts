import { createRunner } from '../../src/simulation/core/clock/advance';
import { createGame, captureState } from '../../src/simulation';
import type { GameState } from '../../src/simulation';
import { MVP_DEFAULT } from '../../src/content/scenarios/mvp-default';
import { command, place, until, WALKER_SEED } from './one-worker';
import { elevator } from './transport';
import { cohortReport } from '../../src/simulation/metrics/cohort-report';
import { liveReport } from '../../src/simulation/metrics/live-report';
/** Freeze the complete domain-generated 96-worker morning before any arrivals or intervention. */
export function congestion() {const s=createGame(MVP_DEFAULT,WALKER_SEED);for(let floor=1;floor<=5;floor++){const r=command(s,{kind:'constructFloorRange',payload:{floor,startX:0,endXExclusive:48}});if(!r.ok)throw Error(r.code);}for(const floor of [3,4,5])place(s,24,floor);elevator(s,5,10);until(s,28200);return captureState(s);}
/** Observe completed tick boundaries and identical boarding cutoffs without modifying demand or service. */
export function observeRush(s:GameState) {const runner=createRunner(s);const visits:{tick:number;queued:number}[]=[],seen=new Set<string>(),cars=new Set<string>(),quality:{tick:number;quality:number|null;unfinished:number}[]=[];let peak=0;
 while(s.clock.tick%86400<61200){const step=runner.advance(1);if(!step.ok)throw Error(step.code);const queued=Object.values(s.queues).reduce((n,q)=>n+q.entries.length,0);peak=Math.max(peak,queued);for(const c of Object.values(s.cars)){if(c.onboard.length)cars.add(c.id);if(c.visit?.cutoffTick===s.clock.tick&&s.stops[c.visit.stopId]!.floor===0&&!seen.has(c.visit.id)){seen.add(c.visit.id);visits.push({tick:s.clock.tick,queued});const r=liveReport(s);quality.push({tick:s.clock.tick,quality:r.quality,unfinished:r.unresolved});}}if(Object.values(s.occupants).every(p=>p.state==='insideFacility')){const report=cohortReport(s)!;return {report,visits,quality,peak,cars:[...cars],lastArrivalTick:s.clock.tick,maxWait:Math.max(...Object.values(s.trips).map(t=>t.totals.waiting)),maxDenials:Math.max(...Object.values(s.trips).map(t=>t.deniedBoardingCount))};}}
 throw Error('The full cohort did not arrive before 17:00');}
