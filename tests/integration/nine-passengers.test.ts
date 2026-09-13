import { test,expect } from 'vitest';
import { nineAtBoarding } from '../fixtures/nine-passengers';
import { until } from '../fixtures/one-worker';
import { captureState } from '../../src/simulation';
test('nine real workers reserve eight places, retain the ninth denial and eventually all arrive',()=>{
 const s=nineAtBoarding(),carId=Object.keys(s.cars)[0]!,v=s.cars[carId]!.visit!;
 expect(v.boarding.map(b=>b.status)).toEqual([...Array(8).fill('pending'),'denied']);
 const ninth=v.boarding[8]!.occupantId,tripId=s.occupants[ninth]!.tripId!,start=s.clock.tick;
 until(s,start+8);expect(s.cars[carId]!.onboard).toHaveLength(8);expect(s.occupants[ninth]!.state).toBe('waitingForElevator');expect(s.trips[tripId]!.deniedBoardingCount).toBe(1);captureState(s);
 until(s,start+2000);expect(Object.values(s.occupants).every(p=>p.state==='insideFacility')).toBe(true);expect(s.trips[tripId]!.totals.waiting).toBeGreaterThan(8);expect(s.trips[tripId]!.transferCount).toBe(0);captureState(s);
});

import { mixedNineAtBoarding } from '../fixtures/nine-passengers';
test('four actual workers and five customers use exactly eight equal slots and preserve the ninth denial',()=>{const s=mixedNineAtBoarding(),carId=Object.keys(s.cars)[0]!,v=s.cars[carId]!.visit!;expect(new Set(v.boarding.map(b=>s.occupants[b.occupantId]!.kind)).size).toBe(2);expect(v.boarding.map(b=>b.status)).toEqual([...Array(8).fill('pending'),'denied']);const ninth=v.boarding[8]!.occupantId,trip=s.occupants[ninth]!.tripId!;until(s,s.clock.tick+8);expect(s.cars[carId]!.onboard).toHaveLength(8);expect(s.occupants[ninth]!.state).toBe('waitingForElevator');expect(s.trips[trip]!.deniedBoardingCount).toBe(1);captureState(s);});
