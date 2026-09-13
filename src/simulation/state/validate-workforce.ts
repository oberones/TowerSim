import type { GameState } from './game-state';
import { record } from './plain';
import { tick, positive } from '../core/values';
import { parseId } from '../core/ids/allocator';
/** Reject malformed retained request traces and mismatches with current live workforce schedules. */
export function assertWorkforce(s:GameState):void {
 if(!Array.isArray(s.workforceDays))throw Error('Missing workforce history');let previous=-1;
 for(const d of s.workforceDays){record(d,['day','seed','profileId','members']);tick(d.day);
  if(d.day<=previous||d.day>Math.floor(s.clock.tick/s.scenario.dayTicks)||d.seed!==s.rng.seed||d.profileId!==s.scenario.content?.schedules.office.id||!Array.isArray(d.members))throw Error('Invalid workforce day');previous=d.day;
  const people=new Set<string>();for(const m of d.members){record(m,['occupantId','facilityId','generation','arrivalTick','departureTick','status','tripId']);positive(m.generation);tick(m.arrivalTick);tick(m.departureTick);
   const profile=s.scenario.content!.schedules.office,base=d.day*s.scenario.dayTicks;
   if(people.has(m.occupantId)||parseId(m.occupantId).kind!=='occupant'||parseId(m.facilityId).kind!=='facility'||parseId(m.occupantId).ordinal>=s.ids.entity.next||parseId(m.facilityId).ordinal>=s.ids.entity.next||m.arrivalTick<base+profile.arrivalStart||m.arrivalTick>=base+profile.arrivalEnd||m.departureTick<base+profile.departureStart||m.departureTick>=base+profile.departureEnd||!['scheduled','traveling','admitted','departed','skipped','canceled'].includes(m.status))throw Error('Invalid workforce request');people.add(m.occupantId);
   if(m.tripId!==null&&(parseId(m.tripId).kind!=='trip'||parseId(m.tripId).ordinal>=s.ids.entity.next||s.trips[m.tripId]&&s.trips[m.tripId]!.occupantId!==m.occupantId))throw Error('Invalid workforce trip');
   const p=s.occupants[m.occupantId];if(p?.schedule?.day===d.day&&(p.generation!==m.generation||p.schedule.arrivalTick!==m.arrivalTick||p.schedule.departureTick!==m.departureTick||p.schedule.status!==m.status))throw Error('Workforce trace differs from schedule');
  }
 }
 for(const p of Object.values(s.occupants))if(p.kind==='worker'&&p.schedule&&!s.workforceDays.some(d=>d.day===p.schedule!.day&&d.members.some(m=>m.occupantId===p.id)))throw Error('Missing retained current schedule');
}
