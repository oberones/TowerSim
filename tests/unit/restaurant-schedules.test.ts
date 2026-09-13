import { expect,test } from 'vitest';
import { restaurantSchedules } from '../../src/simulation/demand/restaurant-schedules';
import { Xoshiro128 } from '../../src/simulation/core/random/xoshiro128';
import { MVP_DEFAULT } from '../../src/content/scenarios/mvp-default';
import { WALKER_SEED,until } from '../fixtures/one-worker';
import { restaurantTower } from '../fixtures/restaurant';
test.each([0,1,2,3,5,40,101])('finite %i request schedule has exact count, bounded duration and repeatable seeded times',count=>{const rng=new Xoshiro128(WALKER_SEED),before=rng.export(),plans=restaurantSchedules('facility:1',count,0,MVP_DEFAULT.content.schedules.restaurant,rng);expect(plans).toHaveLength(count);expect(plans).toEqual(restaurantSchedules('facility:1',count,0,MVP_DEFAULT.content.schedules.restaurant,new Xoshiro128(WALKER_SEED)));if(count===0)expect(rng.export()).toEqual(before);else expect(plans.filter(v=>v.arrivalTick>=41400&&v.arrivalTick<48600).length).toBeGreaterThanOrEqual(Math.ceil(count*.7));expect(plans.every(v=>v.durationTicks>=1200&&v.durationTicks<=2400)).toBe(true);});
test('zero demand remains a valid reviewed room without customers or RNG consumption',()=>{const s=restaurantTower(0,0),rng=s.rng;until(s,21601);expect(s.rng).toEqual(rng);expect(s.restaurantDays[0]!.visits).toEqual([]);until(s,86400);expect(Object.keys(s.occupants)).toHaveLength(0);});
