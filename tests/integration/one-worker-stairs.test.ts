import { test,expect } from 'vitest';
import { stairs,upperOffice,arrival } from '../fixtures/transport';
import { until } from '../fixtures/one-worker';
import { inspectOffice } from '../../src/app/game/facility-queries';
import { captureState } from '../../src/simulation';
test('two-floor stair trips reconcile real office attendance and measured segments',()=>{const s=stairs(upperOffice(2),2),id=arrival(s),officeId=Object.keys(s.offices)[0]!,q=s.occupants[id]!.schedule!;expect(inspectOffice(s,officeId)).toMatchObject({assigned:1,present:0});until(s,q.arrivalTick+2000);expect(inspectOffice(s,officeId)).toMatchObject({assigned:1,present:1});const trip=Object.values(s.trips)[0]!;expect(trip.totals.stair).toBe(2*s.scenario.content!.stairTicksPerFloor);expect(Object.values(trip.totals).reduce((n,v)=>n+v,0)).toBe(trip.endTick!-trip.startTick);until(s,q.departureTick+2000);expect(inspectOffice(s,officeId)?.present).toBe(0);captureState(s);});
