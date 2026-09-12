import type { GameState } from '../state/game-state';
import type { Trip } from './trips';
import { emptyAggregate } from './report-state';
import { addTrip,aggregateMeans } from './aggregate';
import { clonePlain } from '../state/plain';
/** Accumulate completed outcomes at their transition so later live-window expiration cannot lose daily samples. */
export function recordFinishedTrip(s:GameState,t:Trip):void {if(t.outcome==='completed'&&t.purpose==='officeArrival')s.progression.dayEvidence.completedOfficeArrivals++;if(s.scenario.content)addTrip(s.transportReports.dayFinished,t,t.endTick!,s.scenario.content.metrics);}
/** Finalize the elapsed day before same-tick completions and retain a bounded thirty-day summary ring. */
export function finalizeTransportDay(s:GameState):void {
 const day=s.clock.tick/s.scenario.dayTicks-1;if(!Number.isInteger(day))throw Error('Daily report requires midnight');
 if(s.transportReports.daily.at(-1)?.day===day)return;
 const startTick=Math.max(day*s.scenario.dayTicks,s.scenario.initialTick),endTick=s.clock.tick,a=clonePlain(s.transportReports.dayFinished);
 for(const t of Object.values(s.trips))if(t.endTick===null&&t.startTick<endTick)addTrip(a,t,endTick,s.scenario.content!.metrics);
 s.transportReports.daily.push({...a,...aggregateMeans(a),day,startTick,endTick,partial:startTick!==day*s.scenario.dayTicks});
 s.transportReports.daily=s.transportReports.daily.slice(-(s.scenario.content?.historyLimits.days??30));s.transportReports.dayFinished=emptyAggregate();
}
