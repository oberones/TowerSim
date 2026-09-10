import assert from 'node:assert/strict';
import { createKernelState, advance, applyCommand, captureState, rebuildDerived } from '../../src/simulation';
import { Xoshiro128 } from '../../src/simulation/core/random/xoshiro128';
import { post } from '../../src/simulation/economy/ledger';
import { KERNEL_SCENARIO } from './seeds';
/** Explicit fixture operations; financial posting is internal, not a player money command. */
export function replay(seed:string,segments:readonly number[],restore:boolean) {
  let state=createKernelState(KERNEL_SCENARIO,seed);
  const actions=[0,3600,86400,172800];
  let boundary=0;const cuts=new Set(segments.map(count=>(boundary+=count)));
  const end=boundary;let cursor=0;
  for(const at of [...new Set([...cuts,...actions.filter(at=>at<=end)])].sort((a,b)=>a-b)) {
    const result=advance(state,at-cursor);assert.equal(result.ok,true);cursor=at;
    if(actions.includes(at)) {
      const ordinal=actions.indexOf(at)+1;
      const rng=Xoshiro128.restore(state.rng);const amountMinor=rng.bounded(100)-50;state.rng=rng.export();
      assert.equal(post(state,{source:`fixture:${ordinal}`,amountMinor}).ok,true);
      const command={sequence:ordinal,atTick:state.clock.tick,kind:'constructFloorRange',payload:{floor:1,startX:0,endXExclusive:10}};
      assert.equal(applyCommand(state,command).code,'notImplemented');assert.equal(applyCommand(state,command).code,'duplicateCommand');
    }
    if(restore && cuts.has(at)) {
      state=captureState(state);state.scheduledEvents.reverse();
      assert.deepEqual(rebuildDerived(state).scheduler.exportSorted(),captureState(state).scheduledEvents);
    }
  }
  return state;
}
