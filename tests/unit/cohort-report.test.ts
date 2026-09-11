import { test,expect } from 'vitest';
import { nineAtBoarding } from '../fixtures/nine-passengers';
import { until,oneWorker } from '../fixtures/one-worker';
import { cohortReport } from '../../src/simulation/metrics/cohort-report';
test('morning scope retains complete membership, transition queue peak, cumulative waits and the prior rush',()=>{
 const s=nineAtBoarding();expect(cohortReport(s)).toMatchObject({samples:9,completed:0,unresolved:9,peakQueue:9,currentQueued:9});
 until(s,43200);const done=cohortReport(s)!;expect(done).toMatchObject({samples:9,completed:9,unresolved:0,failed:0,completeBeforeDeadline:true,peakQueue:9,currentQueued:0});expect(done.meanWaitingTicks).toBeGreaterThan(0);
 until(s,108001);expect(cohortReport(s,0)).toMatchObject({samples:9,completed:9,peakQueue:9});expect(cohortReport(s,1)).toMatchObject({samples:9,completed:0});
});
test('walking-only members keep their zero wait in the denominator and a late finish never passes the cohort',()=>{
 const s=oneWorker();until(s,40000);expect(cohortReport(s)).toMatchObject({samples:1,completed:1,meanWaitingTicks:0,peakQueue:0,completeBeforeDeadline:true});
 const member=s.workforceDays[0]!.members[0]!,trip=s.trips[member.tripId!]!;trip.endTick=member.departureTick;
 expect(cohortReport(s)).toMatchObject({completeBeforeDeadline:false,failed:1});
});
