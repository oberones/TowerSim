import { expect,test } from 'vitest';
import { oneCustomer } from '../fixtures/restaurant';
import { until,command } from '../fixtures/one-worker';
import { inspectRestaurant } from '../../src/app/game/facility-queries';
import { encodeState,decodeState } from '../../src/simulation';
test('constructs a priced room and pays once only after actual arrival, then sleeps and physically exits',()=>{
 const s=oneCustomer();encodeState(s);const id=Object.keys(s.restaurants)[0]!;expect(inspectRestaurant(s,id)).toMatchObject({expected:1,incoming:0,inside:0,visits:0});
 expect(s.economy.balanceMinor).toBe(s.scenario.startingFundsMinor-80000);until(s,36000);expect(inspectRestaurant(s,id)).toMatchObject({incoming:1,inside:0,visits:0});
 until(s,36900);const p=Object.values(s.occupants)[0]!;expect(p.state).toBe('insideFacility');expect(inspectRestaurant(s,id)).toMatchObject({incoming:0,inside:1,visits:1,revenueMinor:500});
 expect(decodeState(encodeState(s))).toEqual(s);until(s,38100);expect(Object.values(s.occupants)[0]!.state).toBe('walking');until(s,40000);expect(Object.values(s.occupants)).toHaveLength(0);expect(inspectRestaurant(s,id)!.revenueMinor).toBe(500);
 expect(command(s,{kind:'demolishEntity',payload:{entityId:id}}).ok).toBe(true);until(s,86400);expect(s.economy.transactions.filter(t=>t.source.startsWith('restaurantVisit:'))).toHaveLength(1);
});
