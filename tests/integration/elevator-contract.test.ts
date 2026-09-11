import { test,expect } from 'vitest';
import { passengerAtPhase } from '../fixtures/one-elevator-passenger';
import { captureState } from '../../src/simulation';
import { until } from '../fixtures/one-worker';
test('car phases retain a single physical passenger location and finite capacity at every completed boundary',()=>{const {s,id,carId}=passengerAtPhase('idle');for(let i=0;i<200;i++){until(s,s.clock.tick+1);const queued=Object.values(s.queues).flatMap(q=>q.entries).filter(e=>e.occupantId===id).length,riding=s.cars[carId]!.onboard.filter(p=>p.occupantId===id).length;expect(queued+riding).toBeLessThanOrEqual(1);expect(s.cars[carId]!.onboard.length).toBeLessThanOrEqual(8);captureState(s);}});
