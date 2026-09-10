import { expect, test } from 'vitest';
import { prorate } from '../../src/simulation/economy/money';
import { post, reconcile } from '../../src/simulation/economy/ledger';
import { createKernelState } from '../../src/simulation/state/game-state';
const create=()=>createKernelState({scenarioId:'kernel-test',scenarioVersion:1,tickSeconds:1,dayTicks:86400,initialTick:21600,startingFundsMinor:1000,capabilities:[]},'00000001000000020000000300000004');
test('prorates with exact products and symmetric half-away-from-zero rounding', () => {
  expect(prorate(1,1,2)).toBe(1);expect(prorate(-1,1,2)).toBe(-1);
  expect(prorate(-1,1,3)).toBe(0);expect(prorate(10,2,3)).toBe(7);
  expect(prorate(Number.MAX_SAFE_INTEGER,2,2)).toBe(Number.MAX_SAFE_INTEGER);
  expect(()=>prorate(Number.MAX_SAFE_INTEGER,2,1)).toThrow();expect(()=>prorate(1,1,0)).toThrow();
});
test('posts unique transactions once, permits liabilities, and reconciles', () => {
  const state=create();expect(post(state,{source:'test:credit',amountMinor:25})).toEqual({ok:true,id:'transaction:1',replayed:false});
  expect(post(state,{source:'test:credit',amountMinor:25})).toEqual({ok:true,id:'transaction:1',replayed:true});
  expect(post(state,{source:'test:credit',amountMinor:26}).ok).toBe(false);
  post(state,{source:'test:liability',amountMinor:-1100});expect(state.economy.balanceMinor).toBe(-75);expect(reconcile(state.economy)).toBe(true);
  expect(state.ids.transaction.next).toBe(3);
});
test('overflow of money or identities changes neither ledger nor counter', () => {
  const state=create();const before=JSON.stringify(state);
  expect(post(state,{source:'overflow',amountMinor:Number.MAX_SAFE_INTEGER}).ok).toBe(false);expect(JSON.stringify(state)).toBe(before);
  state.ids.transaction.next=Number.MAX_SAFE_INTEGER;const exhausted=JSON.stringify(state);
  expect(post(state,{source:'id-overflow',amountMinor:1}).ok).toBe(false);expect(JSON.stringify(state)).toBe(exhausted);
});
