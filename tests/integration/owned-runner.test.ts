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
 expect(r.counts.boundaryTransactions).toBeGreaterThan(0);expect(r.counts.eventsProcessed).toBeGreaterThan(0);
 expect(createRunner(copy).advance(100).ok).toBe(true);expect(encodeState(s)).toBe(encodeState(copy));
 expect(()=>measureWork(()=>{throw Error('probe');})).toThrow('probe');expect(measureWork(()=>42).value).toBe(42);
});

test('a failed passenger event rolls back its heap removals, and the same runner can retry exactly',()=>{
 const s=nineAtBoarding(),expected=decodeState(encodeState(s)),next=s.ids.eventSequence.next;
 s.ids.eventSequence.next=Number.MAX_SAFE_INTEGER;
 const runner=createRunner(s),before=encodeState(s);
 expect(runner.advance(1).ok).toBe(false);expect(encodeState(s)).toBe(before);
 s.ids.eventSequence.next=next;
 expect(runner.advance(50).ok).toBe(true);expect(createRunner(expected).advance(50).ok).toBe(true);
 expect(encodeState(s)).toBe(encodeState(expected));
});

test('application batches retain the last completed tick after failure and detach collections between frames',()=>{
 const s=nineAtBoarding(),runner=createRunner(s),initial=s.occupants,initialText=JSON.stringify(initial);
 runner.beginBatch();expect(runner.advance(1).ok).toBe(true);
 const next=s.ids.eventSequence.next;s.ids.eventSequence.next=Number.MAX_SAFE_INTEGER;const before=encodeState(s);
 expect(runner.advance(1).ok).toBe(false);expect(encodeState(s)).toBe(before);s.ids.eventSequence.next=next;runner.endBatch();
 expect(JSON.stringify(initial)).toBe(initialText);
 const previous=s.occupants,previousText=JSON.stringify(previous);runner.beginBatch();expect(runner.advance(20).ok).toBe(true);runner.endBatch();
 expect(JSON.stringify(previous)).toBe(previousText);expect(()=>encodeState(s)).not.toThrow();
});


test('new ownership rebuilds queue metadata after valid external state replacement preserves map identity',async()=>{
 const {queueIndex}=await import('../../src/simulation/transportation/elevators/queue-index');
 for(const owned of [false,true]){
  const state=nineAtBoarding(),queues=state.queues;queueIndex(state);
  const replacement=decodeState(encodeState(state));expect(createRunner(replacement).advance(20).ok).toBe(true);
  Object.assign(queues,replacement.queues);Object.assign(state,replacement,{queues});
  const expected=decodeState(encodeState(state));
  expect((owned?createRunner(state).advance(100):advance(state,100)).ok).toBe(true);
  expect(advance(expected,100).ok).toBe(true);expect(encodeState(state)).toBe(encodeState(expected));
 }
});
