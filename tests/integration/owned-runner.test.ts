import { expect,test } from 'vitest';
import { createRunner,advance } from '../../src/simulation/core/clock/advance';
import { encodeState,decodeState } from '../../src/simulation';
import { nineAtBoarding } from '../fixtures/nine-passengers';
import { oneWorker } from '../fixtures/one-worker';

test('owned event drafts preserve exact public advancement and never alias the preceding boundary',()=>{
 const s=nineAtBoarding(),copy=decodeState(encodeState(s)),oldCars=s.cars,oldPeople=s.occupants,before=JSON.stringify({oldCars,oldPeople});
 expect(createRunner(s).advance(100).ok).toBe(true);expect(advance(copy,100).ok).toBe(true);
 expect(encodeState(s)).toBe(encodeState(copy));expect(JSON.stringify({oldCars,oldPeople})).toBe(before);
});
test('owned runner rejects corrupt input before ownership and keeps an overflowing event unpublished',()=>{
 const corrupt=oneWorker();Object.defineProperty(corrupt.clock,'hidden',{value:1});expect(()=>createRunner(corrupt)).toThrow();
 const s=oneWorker();s.ids.entity.next=Number.MAX_SAFE_INTEGER;const before=encodeState(s),result=createRunner(s).advance(1);
 expect(result.ok).toBe(false);expect(encodeState(s)).toBe(before);
});

test('opted-in work counters preserve exact outcomes and do not stay enabled after failure',async()=>{
 const {measureWork}=await import('../../src/simulation/core/work-counters');
 const s=nineAtBoarding(),copy=decodeState(encodeState(s));const r=measureWork(()=>createRunner(s).advance(100));
 expect(r.counts.boundaryCopies).toBeGreaterThan(0);expect(r.counts.eventsProcessed).toBeGreaterThan(0);
 expect(createRunner(copy).advance(100).ok).toBe(true);expect(encodeState(s)).toBe(encodeState(copy));
 expect(()=>measureWork(()=>{throw Error('probe');})).toThrow('probe');expect(measureWork(()=>42).value).toBe(42);
});
