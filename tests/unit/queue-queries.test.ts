import { test,expect } from 'vitest';
import { nineAtBoarding } from '../fixtures/nine-passengers';
import { until } from '../fixtures/one-worker';
import { queueQueries } from '../../src/app/game/queue-queries';
test('queries include zero/opposite stops, reserved passengers and exact completed-transfer changes',()=>{
 const s=nineAtBoarding(),before=JSON.stringify(s),rows=queueQueries(s);
 expect(rows).toHaveLength(8);expect(rows.reduce((n,q)=>n+q.count,0)).toBe(9);expect(rows.filter(q=>q.direction==='down').every(q=>q.count===0)).toBe(true);
 expect(Object.isFrozen(rows[0])).toBe(true);expect(JSON.stringify(s)).toBe(before);
 until(s,s.clock.tick+1);expect(queueQueries(s).reduce((n,q)=>n+q.count,0)).toBe(8);expect(rows.reduce((n,q)=>n+q.count,0)).toBe(9);
});
