import { test,expect } from 'vitest';
import { officeWorkday } from '../fixtures/office-workday';
import { until } from '../fixtures/one-worker';
import { encodeState } from '../../src/simulation';
test('recurring requests retain stable identities, distributed rush traces and replayable generation guards',()=>{
 const s=officeWorkday();until(s,21601);const ids=Object.keys(s.occupants);
 until(s,108001);expect(Object.keys(s.occupants)).toEqual(ids);expect(s.workforceDays).toHaveLength(2);
 for(const day of s.workforceDays){expect(day.members).toHaveLength(32);for(const field of ['arrivalTick','departureTick'] as const){expect(new Set(day.members.map(m=>m[field])).size).toBeGreaterThanOrEqual(3);expect(day.members.filter(m=>m[field]%86400>=43200&&m[field]%86400<50400)).toHaveLength(0);}}
 const other=officeWorkday();until(other,108001);expect(encodeState(other)).toBe(encodeState(s));
});
