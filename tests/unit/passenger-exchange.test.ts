import { createRunner } from '../../src/simulation/core/clock/advance';
import { test,expect } from 'vitest';
import { nineAtBoarding } from '../fixtures/nine-passengers';
import { until,command } from '../fixtures/one-worker';
import { captureState } from '../../src/simulation';
test('a shrinking onboard list unloads every frozen passenger exactly once at one second each',()=>{
 const s=nineAtBoarding(),runner=createRunner(s);while(Object.values(s.cars)[0]!.phase!=='unloading')expect(runner.advance(1).ok).toBe(true);
 const id=Object.keys(s.cars)[0]!,cohort=s.cars[id]!.visit!.unloading.map(p=>p.occupantId);expect(cohort).toHaveLength(8);
 for(let i=1;i<=8;i++){expect(runner.advance(1).ok).toBe(true);expect(s.cars[id]!.visit!.unloadCursor).toBe(i);expect(s.cars[id]!.onboard).toHaveLength(8-i);captureState(s);}
 expect(new Set(cohort).size).toBe(8);
});
test('canceling selected goals keeps the original cutoff and never fills released slots with late demand',()=>{
 const s=nineAtBoarding(),id=Object.keys(s.cars)[0]!,cutoff=s.cars[id]!.visit!.cutoffTick;
 expect(command(s,{kind:'demolishEntity',payload:{entityId:Object.keys(s.offices)[0]!}}).ok).toBe(true);
 expect(s.cars[id]!.visit!.boarding.filter(r=>r.status==='pending')).toHaveLength(0);until(s,s.clock.tick+1);
 expect(s.cars[id]!.onboard).toHaveLength(0);expect(s.cars[id]!.visit!.cutoffTick).toBe(cutoff);captureState(s);
});
