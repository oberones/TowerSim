import type { GameState } from '../state/game-state';
import { settleRestaurant } from '../economy/settlement';
import { departCustomer } from '../occupants/customer-lifecycle';
/** Settle the room once and evacuate all live visits before dropping its physical destination. */
export function removeRestaurant(s:GameState,id:string):void {
 const room=s.restaurants[id]!;settleRestaurant(s,room);
 for(const day of s.restaurantDays)for(const visit of day.visits)if(visit.facilityId===id){const p=s.occupants[visit.occupantId];if(p)departCustomer(s,p);}
 delete s.restaurants[id];
}
