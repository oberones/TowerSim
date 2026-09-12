import { expect,test } from 'vitest';
import { oneWorker,until,command } from '../fixtures/one-worker';
import { encodeState,decodeState } from '../../src/simulation';
import { reconcile } from '../../src/simulation/economy/ledger';
test.each([86399,86400,35*86400])('continues exact finance at settlement/archive boundary %i',tick=>{
 const s=oneWorker();until(s,tick);const restored=decodeState(encodeState(s));
 for(const state of [s,restored]){command(state,{kind:'demolishEntity',payload:{entityId:Object.keys(state.offices)[0]!}});until(state,tick+86400);expect(reconcile(state.economy)).toBe(true);}
 expect(encodeState(restored)).toBe(encodeState(s));
});
