import { test,expect } from 'vitest';
import { nineAtBoarding } from '../fixtures/nine-passengers';
import { until } from '../fixtures/one-worker';
import { captureState,decodeState,encodeState } from '../../src/simulation';
import { servicePhase } from '../fixtures/service-phases';
test('arrival order is global FIFO and selected members retain one slot until their physical transfer',()=>{
 const s=nineAtBoarding(),c=Object.values(s.cars)[0]!,ids=c.visit!.boarding.map(r=>r.occupantId);
 expect(c.visit!.boarding.map(r=>r.admissionSequence)).toEqual([...c.visit!.boarding.map(r=>r.admissionSequence)].sort((a,b)=>a-b));
 for(let i=1;i<=8;i++){until(s,s.clock.tick+1);const car=Object.values(s.cars)[0]!;expect(car.onboard.map(p=>p.occupantId)).toEqual(ids.slice(0,i));expect(car.onboard.length+Object.values(s.queues).reduce((n,q)=>n+q.entries.length,0)).toBe(9);captureState(s);}
});
test.each(['boarding','unloading','denied'] as const)('continuation preserves %s cursors, historical IDs, queue order and next-day outcomes',kind=>{
 const s=servicePhase(kind),copy=decodeState(encodeState(s));until(s,110000);until(copy,110000);expect(encodeState(copy)).toBe(encodeState(s));
});
