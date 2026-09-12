import type { GameState } from '../state/game-state';
import type { Restaurant,RestaurantVisit } from '../facilities/restaurants';
import { restaurantDefinition } from '../facilities/restaurants';
import { post } from './ledger';
import { add } from '../core/values';
/** Post one physical admission under a durable visit identity, preflighting all cumulative counters. */
export function postRestaurantRevenue(s:GameState,room:Restaurant,visit:RestaurantVisit):void {
 if(visit.admittedTick!==null)return;
 const price=restaurantDefinition(s).visitPriceMinor,visits=add(room.visits,1),revenue=add(room.revenueMinor,price);
 const result=post(s,{source:`restaurantVisit:${visit.occupantId}:${visit.generation}`,amountMinor:price});if(!result.ok)throw Error('Restaurant revenue overflow');
 room.visits=visits;room.revenueMinor=revenue;visit.admittedTick=s.clock.tick;visit.paidMinor=price;
}
