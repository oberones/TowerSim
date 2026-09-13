import { expect, test } from 'vitest';
import { Scheduler } from '../../src/simulation/core/events/scheduler';
import type { EventRecord } from '../../src/simulation/core/events/event';
const event = (n: number, dueTick=10, phasePriority: 0|10|20|30|40=20): EventRecord => ({id:`event:${n}`,dueTick,phasePriority,sequence:n,kind:'fixture',targetId:'owner:1',targetGeneration:1,payload:{}});
test('orders by due tick, phase, sequence and rebuilds regardless of insertion order', () => {
  const records = [event(10),event(2),event(3,9),event(4,10,10)];
  for (const order of [records,[...records].reverse()]) {
    const heap = new Scheduler(order,0);
    expect(Array.from({length:4}, () => heap.pop()?.id)).toEqual(['event:3','event:4','event:2','event:10']);
    heap.assertConsistent(); expect(heap.size).toBe(0);
  }
});
test('cancels physically by ID and owner with bounded indices', () => {
  const heap = new Scheduler<EventRecord>([],0);
  for(let i=1;i<=500;i++) { heap.insert(event(i),0); if(i%2===0) heap.cancel(`event:${i-1}`); heap.assertConsistent(); }
  expect(heap.cancelOwner('owner:1')).toBe(250);
  expect(heap.storageCounts()).toEqual({heap:0,ids:0,sequences:0,owners:0});
});
test('fresh reschedule sequence, future-only insertion, duplicate rejection, detached views', () => {
  const heap = new Scheduler([event(1),event(2)],0);
  const counter = {next:3}; heap.reschedule('event:1',10,0,counter);
  expect(heap.pop()?.id).toBe('event:2'); expect(counter.next).toBe(4);
  const before=heap.exportSorted();
  expect(() => heap.insert(event(3,0),0)).toThrow();
  expect(() => heap.insert(event(1),0)).toThrow();
  expect(() => heap.reschedule('event:1',20,0,{next:Number.MAX_SAFE_INTEGER})).toThrow();
  expect(heap.exportSorted()).toEqual(before);
  const copy=heap.peek()!; copy.dueTick=99; expect(heap.peek()?.dueTick).toBe(10);
});
test('obsolete lifecycle generations are physically discarded', () => {
  const heap = new Scheduler([event(1),{...event(2),targetGeneration:2}],0);
  expect(heap.popCurrent(() => 2)?.id).toBe('event:2'); expect(heap.size).toBe(0);
});
test('reschedule rejects a sequence older than the scheduler allocation history', () => {
  const heap=new Scheduler([event(1),event(10)],0);heap.cancel('event:10');
  expect(()=>heap.reschedule('event:1',20,0,{next:2})).toThrow();
});

test('incremental snapshots preserve old records through remove, reinsert, typed cancellation and failed insertion',()=>{
 const heap=new Scheduler([event(1),event(2,20)],0),old=heap.ownedSnapshot(),text=JSON.stringify(old);
 heap.reschedule('event:1',30,0,{next:3});heap.insert({...event(4,15),kind:'other'},0);heap.cancelKind('owner:1','fixture');
 expect(heap.exportSorted().map(e=>e.id)).toEqual(['event:4']);expect(JSON.stringify(old)).toBe(text);
 expect(()=>heap.insert(event(5,0),0)).toThrow();expect(heap.exportSorted().map(e=>e.id)).toEqual(['event:4']);
 heap.cancel('event:4');expect(heap.ownedSnapshot()).toEqual([]);heap.assertConsistent();
});
