import type { GameState } from '../state/game-state';
import type { Occupant } from './occupant';
import { customerVisit } from '../facilities/restaurants';
import { accessAt } from '../world/walking-space';
import { transition } from './transitions';
import { startTrip } from '../metrics/trips';
import { pursueGoal,departWorker } from './facility-transitions';
import { retireOccupant } from './retirement';
import { cancelEvents } from './schedule-events';
/** Start a scheduled customer's actual lobby journey, skipping inaccessible requests without replay after repair. */
export function arriveCustomer(s:GameState,p:Occupant):void {
 const v=customerVisit(s,p.id);if(!v||v.status!=='scheduled'||p.state!=='outside')return;
 const room=s.restaurants[v.facilityId];if(!room||!accessAt(s,room.floor,room.entranceX2).accessible){v.status='skipped';p.schedule!.status='skipped';retireOccupant(s,p);return;}
 v.status='traveling';p.schedule!.status='traveling';p.goal={kind:'restaurant',facilityId:room.id};p.tripId=startTrip(s,p.id,'restaurantArrival').id;
 const lobby=s.tower!.lobby;transition(p,{state:'entering',location:{kind:'anchor',at:{floor:lobby.floor,x2:lobby.entranceX2}}});pursueGoal(s,p);
}
/** Cancel the visit wakeup and start a supported physical exit, retaining payment already earned. */
export function departCustomer(s:GameState,p:Occupant):void {
 const v=customerVisit(s,p.id);if(!v)return;cancelEvents(s,p.id,'customerArrival');cancelEvents(s,p.id,'customerVisitEnd');
 if(p.state==='outside'){v.status='canceled';p.schedule!.status='canceled';retireOccupant(s,p);return;}
 v.status='exiting';if(p.schedule)p.schedule.status='canceled';departWorker(s,p);
}
