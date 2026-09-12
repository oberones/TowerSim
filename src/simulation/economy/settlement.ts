import type { Restaurant } from '../facilities/restaurants';
import { restaurantDefinition } from '../facilities/restaurants';
import { prorate } from './money';
import type { GameState } from '../state/game-state';
import type { Office } from '../facilities/offices';
import { accruedAmounts } from './accrual';
import { post } from './ledger';
/** Post each source's prorated rent and cost once, then reset its interval at this boundary. */
export function settleOffice(state:GameState,office:Office):void {
 const amounts=accruedAmounts(state,office),a=office.accrual;
 for(const [kind,amount] of [['rent',amounts.incomeMinor],['cost',-amounts.costMinor]] as const)if(amount!==0){const result=post(state,{source:`office:${office.id}:${a.generation}:${kind}`,amountMinor:amount,operatingDay:Math.floor((state.clock.tick-1)/state.scenario.dayTicks)});if(!result.ok)throw Error('Settlement overflow');}
 a.sinceTick=state.clock.tick;a.lastTick=state.clock.tick;a.eligibleTicks=0;a.existenceTicks=0;a.generation++;
}
/** Let the single midnight owner settle all extant offices before daily reset. */
export function settleOffices(state:GameState):void {for(const office of Object.values(state.offices))settleOffice(state,office);for(const restaurant of Object.values(state.restaurants))settleRestaurant(state,restaurant);}

/** Quote restaurant existence costs independently of visits, access or current occupancy. */
export function restaurantAmounts(s:GameState,r:Restaurant){return {incomeMinor:0,costMinor:prorate(restaurantDefinition(s).operatingMinorPerDay,s.clock.tick-r.accrual.sinceTick,s.scenario.dayTicks)};}
/** Post the restaurant interval once and advance its durable settlement generation. */
export function settleRestaurant(s:GameState,r:Restaurant):void {const cost=restaurantAmounts(s,r).costMinor;if(cost&&!post(s,{source:`restaurant:${r.id}:${r.accrual.generation}:cost`,amountMinor:-cost,operatingDay:Math.floor((s.clock.tick-1)/s.scenario.dayTicks)}).ok)throw Error('Restaurant settlement overflow');r.accrual.sinceTick=s.clock.tick;r.accrual.lastTick=s.clock.tick;r.accrual.eligibleTicks=0;r.accrual.existenceTicks=0;r.accrual.generation++;}
