import { test,expect } from 'vitest';
import { officeWorkday } from '../fixtures/office-workday';
import { until,command } from '../fixtures/one-worker';
import { workforceQuery } from '../../src/app/game/workforce-queries';
test('retained demand distinguishes canceled requests from trips and never creates physical presence',()=>{
 const s=officeWorkday();until(s,21601);const before=JSON.stringify(s),q=workforceQuery(s);
 expect(q).toMatchObject({assigned:32,present:0,scheduled:32,canceled:0,completedArrivals:0});expect(JSON.stringify(s)).toBe(before);
 command(s,{kind:'demolishEntity',payload:{entityId:Object.keys(s.offices)[0]!}});
 expect(workforceQuery(s)).toMatchObject({assigned:0,present:0,scheduled:0,canceled:32,completedArrivals:0});expect(Object.isFrozen(q)).toBe(true);
});
