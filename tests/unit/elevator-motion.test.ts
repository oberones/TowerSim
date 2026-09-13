import { test,expect } from 'vitest';
import { passengerAtPhase } from '../fixtures/one-elevator-passenger';
import { until } from '../fixtures/one-worker';
import { carPosition } from '../../src/simulation/transportation/elevators/car';
import { captureState } from '../../src/simulation';
test('a three-floor flight pays start once, crosses in four ticks each, then levels at its destination',()=>{const {s,carId}=passengerAtPhase('starting'),start=s.clock.tick;expect(s.cars[carId]!.phaseDurationTicks).toBe(2);until(s,start+2);expect(s.cars[carId]!.phase).toBe('moving');until(s,start+4);expect(carPosition(s.cars[carId]!,s.clock.tick)).toBe(0.5);until(s,start+6);expect(s.cars[carId]).toMatchObject({phase:'moving',currentFloor:1});until(s,start+10);expect(s.cars[carId]).toMatchObject({phase:'moving',currentFloor:2});until(s,start+14);expect(s.cars[carId]).toMatchObject({phase:'leveling',currentFloor:3});until(s,start+16);expect(s.cars[carId]!.phase).toBe('opening');captureState(s);});
test.each(['leveling','opening','dwell','closing'] as const)('%s consumes its configured two ticks',phase=>{const {s,carId}=passengerAtPhase(phase),start=s.clock.tick;expect(s.cars[carId]!.phaseDurationTicks).toBe(2);until(s,start+1);expect(s.cars[carId]!.phase).toBe(phase);until(s,start+2);expect(s.cars[carId]!.phase).not.toBe(phase);});
