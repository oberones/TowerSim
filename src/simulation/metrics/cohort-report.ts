import type { GameState } from '../state/game-state';
import type { QueueEntry } from '../transportation/elevators/types';
import { emptyAggregate } from './report-state';
import { addTrip,aggregateMeans } from './aggregate';
/** Track simultaneous unique queue membership at admission/removal, including reserved boarders until transfer. */
export function changeCohortQueue(s:GameState,e:QueueEntry,delta:1|-1):void {
 if(s.trips[e.tripId]?.purpose!=='officeArrival')return;
 const day=s.workforceDays.find(d=>d.members.some(m=>m.tripId===e.tripId));if(!day)return;
 const counter=s.transportReports.cohorts.find(c=>c.day===day.day)!;counter.currentQueued+=delta;if(counter.currentQueued<0)throw Error('Negative cohort queue');counter.peakQueue=Math.max(counter.peakQueue,counter.currentQueued);
}
/** Report the complete scheduled population, retaining zero waits and explicitly labeling failed or unresolved members. */
export function cohortReport(s:GameState,dayNumber=s.workforceDays.at(-1)?.day) {
 const day=s.workforceDays.find(d=>d.day===dayNumber);if(!day)return null;
 const a=emptyAggregate();let failed=0,unresolved=0,completeBeforeDeadline=day.members.length>0;
 for(const m of day.members){const t=m.tripId?s.trips[m.tripId]:null;
  if(t){addTrip(a,t,s.clock.tick,s.scenario.content!.metrics);if(t.outcome!=='completed'||t.endTick===null||t.endTick>=m.departureTick)completeBeforeDeadline=false;
   if(t.endTick===null)unresolved++;else if(t.outcome!=='completed'||t.endTick>=m.departureTick)failed++;
  }else{a.samples++;if(m.status==='skipped'||m.status==='canceled')failed++;else unresolved++;completeBeforeDeadline=false;}
 }
 a.unresolved=unresolved;const counter=s.transportReports.cohorts.find(c=>c.day===day.day)!;
 return {...a,...aggregateMeans(a),quality:a.completed+a.abandoned+a.stranded===0&&a.totals.walking+a.totals.waiting+a.totals.stair+a.totals.riding+a.totals.stranded===0?null:aggregateMeans(a).quality,seed:day.seed,profileId:day.profileId,memberIds:day.members.map(m=>m.occupantId),failed,completeBeforeDeadline,...counter,label:`Morning cohort · day ${day.day+1}`};
}
