import { expect,test } from 'vitest';
import { diagnosticQuery } from '../../src/app/game/diagnostic-queries';
import { nineAtBoarding } from '../fixtures/nine-passengers';
import { encodeState } from '../../src/simulation';
import { PerformanceCounters } from '../../src/platform/performance-counters';

test('diagnostics report physical activity and detached RNG without mutating a boundary',()=>{
 const s=nineAtBoarding(),before=encodeState(s),q=diagnosticQuery(s);
 expect(q.active+q.dormant).toBe(9);expect(q.waiting).toBeGreaterThan(0);
 expect(q.events).toBe(s.scheduledEvents.length);expect(q.graph.nodes).toBeGreaterThan(0);
 expect(q.cars).toHaveLength(1);expect(Object.isFrozen(q.rng.words)).toBe(true);
 expect(()=>{(q.rng.words as number[])[0]=0;}).toThrow();expect(encodeState(s)).toBe(before);
});
test('rate counters isolate speed, visibility and replacement windows and retain no history',()=>{
 const c=new PerformanceCounters();
 expect(c.sample(0,100,1,1)).toBeNull();
 for(let i=1;i<60;i++)expect(c.sample(i*1000/60,100+i*2,1,1)).toBeNull();
 expect(c.sample(1000,220,1,1)).toMatchObject({fps:60,ticksPerSecond:120});
 expect(c.sample(1100,220,0,1)).toBeNull();
 expect(c.sample(2100,220,0,1)).toMatchObject({ticksPerSecond:0});
 expect(c.sample(2200,50,1,2)).toBeNull();
 c.reset();expect(c.sample(10000,50,1,2)).toBeNull();
});
