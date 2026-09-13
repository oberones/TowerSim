import { expect,test } from 'vitest';
import { oneCustomer } from '../fixtures/restaurant';
import { until } from '../fixtures/one-worker';
import { admitRestaurant } from '../../src/simulation/facilities/restaurant-admission';
import { reconcile } from '../../src/simulation/economy/ledger';
test('rejects nonphysical admission and repeated sleeping admission without another payment',()=>{const s=oneCustomer(),id=Object.keys(s.occupants)[0]!;expect(admitRestaurant(s,s.occupants[id]!)).toBe(false);until(s,36900);const before=s.economy.balanceMinor;expect(admitRestaurant(s,s.occupants[id]!)).toBe(false);expect(s.economy.balanceMinor).toBe(before);expect(s.restaurants[Object.keys(s.restaurants)[0]!]!.visits).toBe(1);expect(reconcile(s.economy)).toBe(true);});
