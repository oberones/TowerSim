import { test,expect } from 'vitest';
import { nineAtBoarding } from '../fixtures/nine-passengers';
import { until,oneWorker } from '../fixtures/one-worker';
import { transportQuery } from '../../src/app/game/transport-queries';
import { tripQuality } from '../../src/simulation/metrics/quality';
import { startTrip,openSegment,finishTrip } from '../../src/simulation/metrics/trips';
import { finalizeTransportDay } from '../../src/simulation/metrics/daily-report';
import { liveReport } from '../../src/simulation/metrics/live-report';
import { captureState,decodeState,encodeState } from '../../src/simulation';
test('thirty-five ordinary days keep summary and trip history bounded without losing retained worker identity',()=>{
 const s=oneWorker();until(s,21601);const id=Object.keys(s.occupants)[0]!;until(s,35*86400+21601);
 expect(s.transportReports.daily).toHaveLength(30);expect(s.workforceDays).toHaveLength(30);expect(Object.keys(s.trips).length).toBeLessThanOrEqual(64);expect(Object.keys(s.occupants)).toEqual([id]);captureState(s);
 const restored=decodeState(encodeState(s));until(s,s.clock.tick+86400);until(restored,restored.clock.tick+86400);expect(encodeState(restored)).toBe(encodeState(s));
});
test('independently summed individual experience reconciles live, full morning and completed-day reports',()=>{
 const s=nineAtBoarding();until(s,s.clock.tick+1500);const trips=Object.values(s.trips),q=transportQuery(s);
 const sumWait=trips.reduce((n,t)=>n+t.totals.waiting,0),sumScore=trips.reduce((n,t)=>n+tripQuality(t,s.clock.tick,s.scenario.content!.metrics).units,0);
 expect(q.live.samples).toBe(9);expect(q.live.totals.waiting).toBe(sumWait);expect(q.morning?.qualityUnits).toBe(sumScore);expect(q.morning?.meanWaitingTicks).toBe(sumWait/9);
 until(s,86400);const day=transportQuery(s).previousDay!;expect(day.samples).toBe(18);expect(day.completed).toBe(18);expect(day.totals.waiting).toBe(Object.values(s.trips).reduce((n,t)=>n+t.totals.waiting,0));
});
test('multiple measured waits, rides, transfers and a failed exit reconcile without favorable duplicate samples',()=>{
 const s=oneWorker(),t=startTrip(s,'occupant:999','abandonedExit');openSegment(t,'waiting',s.clock.tick);s.clock.tick+=60;openSegment(t,'riding',s.clock.tick);s.clock.tick+=30;openSegment(t,'walking',s.clock.tick);s.clock.tick+=20;openSegment(t,'waiting',s.clock.tick);s.clock.tick+=120;openSegment(t,'riding',s.clock.tick);t.transferCount=1;t.deniedBoardingCount=2;s.clock.tick+=30;finishTrip(s,t,'abandoned',s.clock.tick);
 const report=liveReport(s);expect(report).toMatchObject({samples:1,abandoned:1,denials:2,transfers:1,totals:{waiting:180,riding:60,walking:20}});
 s.clock.tick=86400;finalizeTransportDay(s);expect(s.transportReports.daily[0]!.qualityUnits).toBe(report.qualityUnits);expect(s.transportReports.daily[0]!.samples).toBe(1);
});
