import { expect,test } from 'vitest';
import { oneCustomer } from '../fixtures/restaurant';
import { command,until } from '../fixtures/one-worker';
import { encodeState,decodeState } from '../../src/simulation';
import { activeIndex } from '../../src/simulation/occupants/active-index';
test.each([0,1,3])('customer traverses real floor %i routes and sleeps for the full admission-relative duration',floor=>{
 // Keep the stair entrance closer than the elevator so this case still exercises physical stair travel.
 const s=oneCustomer(floor);if(floor===1)expect(command(s,{kind:'buildStair',payload:{definitionId:'stairs.basic',lowerFloor:0,x:10}}).ok).toBe(true);
 const id=Object.keys(s.occupants)[0]!;until(s,36000);expect(s.occupants[id]!.state).toBe('walking');const copy=decodeState(encodeState(s));
 for(const state of [s,copy]){until(state,39000);until(state,43000);expect(state.occupants[id]).toBeUndefined();expect(Object.values(state.trips).map(t=>t.purpose)).toEqual(['restaurantArrival','restaurantExit']);}
 const trip=Object.values(s.trips)[0]!;expect(trip.totals.walking).toBeGreaterThan(0);if(floor===1){expect(trip.totals.stair).toBeGreaterThan(0);expect(trip.totals.riding).toBe(0);}if(floor===3)expect(trip.totals.riding).toBeGreaterThan(0);expect(encodeState(copy)).toBe(encodeState(s));expect(activeIndex(s)).toBeDefined();
});
