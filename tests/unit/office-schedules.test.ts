import {test,expect} from 'vitest';
import {leasedWorker,until,place} from '../fixtures/one-worker';
import {scheduleWorker} from '../../src/simulation/demand/office-schedules';
import {encodeState,decodeState} from '../../src/simulation';
test('seeded times remain inside published windows, future only and stable across retry, edit and restore',()=>{const a=leasedWorker(),b=leasedWorker();expect(a.s.occupants).toEqual(b.s.occupants);const p=a.s.occupants[a.id]!,q=p.schedule!;expect(q.arrivalTick).toBeGreaterThanOrEqual(28800);expect(q.arrivalTick).toBeLessThan(36000);expect(q.departureTick).toBeGreaterThanOrEqual(61200);expect(q.departureTick).toBeLessThan(68400);const before=encodeState(a.s);scheduleWorker(a.s,p);expect(encodeState(a.s)).toBe(before);place(a.s,48);expect(a.s.occupants[a.id]!.schedule).toEqual(q);expect(decodeState(encodeState(a.s)).rng).toEqual(a.s.rng);expect(a.s.scheduledEvents.every(e=>e.dueTick>a.s.clock.tick)).toBe(true);});
