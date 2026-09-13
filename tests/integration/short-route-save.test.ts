import { test,expect } from 'vitest';
import { captureState,encodeState,decodeState } from '../../src/simulation';
import { stairs,upperOffice,elevator,arrival } from '../fixtures/transport';
import { until } from '../fixtures/one-worker';

test.each(['nearest','stairs'] as const)('saved short journey with %s preference continues identically after load',preference=>{
 const s=elevator(stairs(upperOffice(2),2),2),id=arrival(s);
 expect(s.occupants[id]!.journey!.preference).toBe('nearest');
 // Older v1 saves recorded stairs here; keep their committed route and preference valid.
 s.occupants[id]!.journey!.preference=preference;
 const restored=decodeState(encodeState(captureState(s))),end=s.clock.tick+5000;
 until(s,end);until(restored,end);
 expect(encodeState(restored)).toBe(encodeState(s));
 expect(s.occupants[id]!.state).toBe('insideFacility');
});
