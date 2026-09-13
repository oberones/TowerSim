import { test,expect } from 'vitest';
import { officeWorkday } from '../fixtures/office-workday';
import { until } from '../fixtures/one-worker';
import { inspectOffice } from '../../src/app/game/facility-queries';
import { captureState } from '../../src/simulation';
test('default full workforce has physical attendance, sleeps inside and returns through the real lobby',()=>{
 const s=officeWorkday(),id=Object.keys(s.offices)[0]!;until(s,21601);expect(inspectOffice(s,id)).toMatchObject({assigned:32,present:0});
 until(s,43200);expect(inspectOffice(s,id)).toMatchObject({assigned:32,present:32});expect(Object.values(s.occupants).every(p=>p.state==='insideFacility')).toBe(true);expect(s.scheduledEvents.filter(e=>e.kind==='workerDeparture')).toHaveLength(32);
 until(s,72000);expect(inspectOffice(s,id)).toMatchObject({assigned:32,present:0});expect(Object.values(s.occupants).every(p=>p.state==='outside')).toBe(true);expect(Object.values(s.trips).filter(t=>t.outcome==='completed')).toHaveLength(64);captureState(s);
});
