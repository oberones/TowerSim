import { expect,test } from 'vitest';
import { performanceTower,performancePopulation } from '../fixtures/performance';
import { referenceTower } from '../fixtures/reference-tower';
import { captureState,encodeState,decodeState } from '../../src/simulation';
import { createRunner } from '../../src/simulation/core/clock/advance';

for(const count of [100,1000,5000])test(`valid ${count} sustained walkers and mixed rush workload`,()=>{
 for(const workload of ['walking','rush'] as const){
  const s=performanceTower(count,workload);expect(()=>captureState(s)).not.toThrow();
  expect(performancePopulation(s).active).toBeGreaterThanOrEqual(count);
  const runtime=createRunner(s);for(let i=0;i<30;i++){expect(runtime.advance(1).ok).toBe(true);expect(performancePopulation(s).active).toBeGreaterThanOrEqual(count);}
  expect(Object.values(s.cars).every(c=>c.capacity===8)).toBe(true);
  expect(encodeState(decodeState(encodeState(s)))).toBe(encodeState(s));
 }
},120000);
test('dormant control retains the same hundred walkers while wakeups stay outside measurement',()=>{
 const s=performanceTower(100,'walking',5000);expect(performancePopulation(s)).toMatchObject({active:100,dormant:5000});
 expect(createRunner(s).advance(100).ok).toBe(true);expect(performancePopulation(s)).toMatchObject({active:100,dormant:5000});
},120000);
test('SC-012 reference is valid finite mixed demand with all required geometry and live traffic',()=>{
 const s=referenceTower();expect(()=>captureState(s)).not.toThrow();
 expect(s.tower!.floors).toHaveLength(13);expect(Object.keys(s.offices)).toHaveLength(24);expect(Object.keys(s.restaurants)).toHaveLength(2);
 expect(Object.keys(s.shafts)).toHaveLength(3);expect(Object.keys(s.stairs)).toHaveLength(12);
 expect(Object.values(s.cars).every(c=>c.capacity===8)).toBe(true);
 expect(Object.keys(s.occupants)).toHaveLength(2000);expect(performancePopulation(s).active).toBeGreaterThanOrEqual(500);
 expect(s.scenario.content!.officeMarketWorkers+s.scenario.content!.restaurantDailyCustomers).toBe(2000);
},120000);
