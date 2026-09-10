import { expect, test } from 'vitest';
import { createKernelState } from '../../src/simulation';
import { advance } from '../../src/simulation/core/clock/advance';
import { runBoundary } from '../../src/simulation/core/events/phases';
const create=()=>createKernelState({scenarioId:'kernel-test',scenarioVersion:1,tickSeconds:1,dayTicks:86400,initialTick:21600,startingFundsMinor:1000,capabilities:[]},'00000001000000020000000300000004');
test('zero advance preserves bootstrap; positive advance reviews once at the old tick', () => {
  const state=create();const initial=JSON.stringify(state);
  expect(advance(state,0).ok).toBe(true);expect(JSON.stringify(state)).toBe(initial);
  expect(advance(state,1)).toEqual({ok:true,advanced:1,atTick:21601});
  expect(state.clock.initialReviewPending).toBe(false);
  expect(state.scheduledEvents.filter(e=>e.kind==='dailyReview').map(e=>e.dueTick)).toEqual([108000]);
  advance(state,10);expect(state.ids.event.next).toBe(3);
});
test('one midnight owner and future review recur without duplicate phase-0 handlers', () => {
  const state=create();expect(advance(state,86400).ok).toBe(true);
  expect(state.clock.lastDayBoundaryTick).toBe(86400);
  expect(state.scheduledEvents.map(e=>[e.kind,e.dueTick])).toEqual([['dayBoundary',172800],['dailyReview',194400]]);
});
test('phase driver captures active work before events, then completions and decisions', () => {
  const log:string[]=[];const active=['old'];
  runBoundary({integrate:()=>{for(const id of [...active])log.push(`integrate:${id}`);},boundary:()=>log.push('midnight'),events:()=>{log.push('departure');active.push('new');},completions:()=>log.push('completion'),decisions:()=>log.push('decision'),commit:()=>log.push('commit')});
  expect(log).toEqual(['integrate:old','midnight','departure','completion','decision','commit']);
});
test('invalid advancement does not mutate; event failure rolls back to prior committed boundary', () => {
  const state=create();const before=JSON.stringify(state);
  for(const n of [-1,1.1,Infinity,Number.MAX_SAFE_INTEGER])expect(advance(state,n).ok).toBe(false);
  expect(JSON.stringify(state)).toBe(before);
  advance(state,1);state.ids.event.next=Number.MAX_SAFE_INTEGER;
  const failed=advance(state,86400-21601);
  expect(failed).toEqual({ok:false,code:'overflow',advanced:86400-21602,atTick:86399});
  expect(state.scheduledEvents.some(e=>e.kind==='dayBoundary' && e.dueTick===86400)).toBe(true);
  expect(state.clock.lastDayBoundaryTick).toBe(0);
});
