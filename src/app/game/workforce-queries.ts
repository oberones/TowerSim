import type { GameState } from '../../simulation';
import { freezeDeep } from '../../simulation/state/plain';
/** Separate scheduled demand, failed requests, real attendance and completed arrivals in a detached view. */
export function workforceQuery(s:GameState,facilityId?:string) {
 const workers=Object.values(s.occupants).filter(p=>p.leaseFacilityId&&(!facilityId||p.leaseFacilityId===facilityId));
 const day=s.workforceDays.at(-1),members=(day?.members??[]).filter(m=>!facilityId||m.facilityId===facilityId);
 return freezeDeep({day:day?.day??null,assigned:workers.length,present:workers.filter(p=>p.location.kind==='facility').length,
  scheduled:members.filter(m=>m.status==='scheduled').length,skipped:members.filter(m=>m.status==='skipped').length,canceled:members.filter(m=>m.status==='canceled').length,
  completedArrivals:members.filter(m=>m.tripId&&s.trips[m.tripId]?.outcome==='completed').length,
  windows:s.scenario.content?{...s.scenario.content.schedules.office}:null});
}
