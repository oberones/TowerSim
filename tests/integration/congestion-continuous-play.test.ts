import {expect,it} from 'vitest';
import {congestion,observeRush} from '../fixtures/congestion';
import {until} from '../fixtures/one-worker';
import {elevator} from '../fixtures/transport';
import {cohortReport} from '../../src/simulation/metrics/cohort-report';
it('improves a later comparable morning in the same continuing tower and retains prior reports',()=>{const s=congestion(),first=observeRush(s);until(s,86400);elevator(s,5,14);until(s,86400+28200);const second=observeRush(s);expect(second.report.memberIds).toEqual(first.report.memberIds);expect(second.report.samples).toBe(96);expect(second.report.meanWaitingTicks!).toBeLessThan(first.report.meanWaitingTicks!);expect(second.report.peakQueue).toBeLessThan(first.report.peakQueue);expect(second.report.quality!).toBeGreaterThan(first.report.quality!);expect(cohortReport(s,0)).toEqual(first.report);expect(s.transportReports.daily).toHaveLength(1);},30000);
