import { post } from '../../src/simulation/economy/ledger';
import { createGame,validateScenario } from '../../src/simulation';
import { MVP_DEFAULT } from '../../src/content/scenarios/mvp-default';
import { command,until,WALKER_SEED } from './one-worker';
import { elevator } from './transport';
import { allocateRestaurantVisits } from '../../src/simulation/demand/restaurant-allocation';
/** Build a validated room with a finite customer allowance and an optional real vertical route. */
export function restaurantTower(floor=0,customers=1){
 const s=createGame(validateScenario({...MVP_DEFAULT,scenarioId:'restaurant-visit',content:{...MVP_DEFAULT.content,restaurantDailyCustomers:customers,officeMarketWorkers:0}}),WALKER_SEED);
 for(let f=1;f<=floor;f++)command(s,{kind:'constructFloorRange',payload:{floor:f,startX:0,endXExclusive:64}});
 if(floor>0)elevator(s,floor);
 const r=command(s,{kind:'placeFacility',payload:{definitionId:'restaurant.small',floor,x:24}});if(!r.ok)throw Error(r.code);
 return s;
}
/** Allocate one ordinary bounded visit before bootstrap; no production command can spawn customers. */
export function oneCustomer(floor=0){const s=restaurantTower(floor);allocateRestaurantVisits(s,[{facilityId:Object.keys(s.restaurants)[0]!,arrivalTick:36000,durationTicks:1200}]);return s;}

/** Stop shortly before the finite prepared customer's request for ordinary-browser observation. */
export function restaurantObservation(){const s=oneCustomer();until(s,35880);return s;}
/** Expose an ordinary two-room forty-customer day shortly before its meal requests begin. */
export function mealObservation(){const s=restaurantTower(0,40);command(s,{kind:'placeFacility',payload:{definitionId:'restaurant.small',floor:0,x:48}});until(s,41400);return s;}
/** Prepare an isolated low-cash finance checkpoint with a real accrued vacant-room liability. */
export function financeObservation(){const s=restaurantTower(0,0);post(s,{source:'test:prepared-liability',amountMinor:-s.economy.balanceMinor});until(s,43200);return s;}
