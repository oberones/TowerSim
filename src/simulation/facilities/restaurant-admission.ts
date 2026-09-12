import type { GameState } from '../state/game-state';
import type { Occupant } from '../occupants/occupant';
import { customerVisit } from './restaurants';
import { accessAt } from '../world/walking-space';
import { postRestaurantRevenue } from '../economy/restaurant-revenue';
import { transition } from '../occupants/transitions';
import { scheduleEvent } from '../occupants/schedule-events';
import { finishTrip } from '../metrics/trips';
import { add } from '../core/values';
/** Admit and charge only an eligible customer physically at the room entrance, then schedule a full real visit. */
export function admitRestaurant(s:GameState,p:Occupant):boolean {
 const visit=customerVisit(s,p.id),room=p.goal.kind==='restaurant'?s.restaurants[p.goal.facilityId]:null;
 if(!visit||!room||p.kind!=='customer'||visit.status!=='traveling'||p.location.kind!=='anchor'||p.location.at.floor!==room.floor||p.location.at.x2!==room.entranceX2||!accessAt(s,room.floor,room.entranceX2).accessible)return false;
 const end=add(s.clock.tick,visit.durationTicks);postRestaurantRevenue(s,room,visit);s.progression.dayEvidence.admittedRestaurantVisits++;
 if(p.tripId){finishTrip(s,s.trips[p.tripId]!,'completed',s.clock.tick);p.tripId=null;}
 p.journey=null;p.replanAfterCurrentLeg=false;visit.status='inside';visit.endTick=end;p.schedule!.departureTick=end;p.schedule!.status='admitted';
 transition(p,{state:'insideFacility',location:{kind:'facility',facilityId:room.id}});scheduleEvent(s,'customerVisitEnd',p.id,p.generation,end);return true;
}
