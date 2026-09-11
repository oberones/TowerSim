import { test,expect } from 'vitest';
import { tripQuality } from '../../src/simulation/metrics/quality';
import { TRANSPORT_METRICS } from '../../src/content/scenarios/transport-metrics';
import { startTrip } from '../../src/simulation/metrics/trips';
import { oneWorker } from '../fixtures/one-worker';
test('integer score precision preserves waiting, denial, transfer and stranding penalties with explicit clamps',()=>{
 const s=oneWorker(),trip=startTrip(s,'occupant:999','officeArrival');
 const base=tripQuality(trip,s.clock.tick,TRANSPORT_METRICS);expect(base.score).toBe(100);
 const ride={...trip,totals:{...trip.totals,riding:60}},wait={...trip,totals:{...trip.totals,waiting:60}};
 expect(tripQuality(wait,s.clock.tick+60,TRANSPORT_METRICS).score).toBeLessThan(tripQuality(ride,s.clock.tick+60,TRANSPORT_METRICS).score);
 expect(tripQuality({...ride,deniedBoardingCount:1},s.clock.tick+60,TRANSPORT_METRICS).score).toBeLessThan(tripQuality(ride,s.clock.tick+60,TRANSPORT_METRICS).score);
 expect(tripQuality({...ride,transferCount:1},s.clock.tick+60,TRANSPORT_METRICS).score).toBe(97.75);
 expect(tripQuality({...trip,totals:{...trip.totals,stranded:60}},s.clock.tick+60,TRANSPORT_METRICS).score).toBe(97);
 const clamped=tripQuality({...trip,deniedBoardingCount:100},s.clock.tick,TRANSPORT_METRICS);expect(clamped.score).toBe(0);expect(clamped.unclampedUnits).toBeLessThan(0);
 expect(tripQuality({...trip,totals:{...trip.totals,waiting:1}},s.clock.tick+1,TRANSPORT_METRICS).score).toBe(99.95);
});
