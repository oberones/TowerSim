import { expect,it } from 'vitest';
import { dailyQuality } from '../fixtures/daily-quality';
import { progressionPredicates } from '../../src/simulation/progression/evaluate';
it('requires acceptable complete-day quality including office returns and customer legs',()=>{const a=dailyQuality(false),b=dailyQuality(true);expect(a.progression.lastEvaluation!.quality).toBeLessThan(60);expect(b.progression.lastEvaluation!.quality).toBeGreaterThanOrEqual(60);expect(progressionPredicates(a.progression.lastEvaluation!,a.scenario.content!.level2).filter(p=>!p.met).map(p=>p.label)).toEqual(['Completed-day transport quality']);expect(b.progression.level).toBe(2);expect(a.transportReports.daily.at(-1)!.samples).toBe(464);expect(b.transportReports.daily.at(-1)!.samples).toBe(464);},240000);
