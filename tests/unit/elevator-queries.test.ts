import { test,expect } from 'vitest';
import { passengerAtPhase } from '../fixtures/one-elevator-passenger';
import { inspectElevator } from '../../src/app/game/elevator-queries';
import { captureState } from '../../src/simulation';
import { until } from '../fixtures/one-worker';
test('elevator inspection freezes detached nested counts, logical interpolation, range and capacity',()=>{const {s,carId}=passengerAtPhase('moving'),before=captureState(s),shaftId=s.cars[carId]!.shaftId,view=inspectElevator(s,shaftId)!;expect(view).toMatchObject({carId,phase:'moving',capacity:8,load:1,servedMinFloor:0,servedMaxFloor:3});expect(view.stops).toHaveLength(4);expect(view.stops.every(q=>q.up===0&&q.down===0)).toBe(true);expect(Object.isFrozen(view.stops[0])).toBe(true);expect(()=>{(view.stops[0] as any).up=100;}).toThrow();expect(s).toEqual(before);until(s,s.clock.tick+2);expect(inspectElevator(s,shaftId)!.position).toBe(view.position+0.5);expect(view.position).toBe(0);});
