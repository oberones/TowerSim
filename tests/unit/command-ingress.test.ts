import { expect, test } from 'vitest';
import { createKernelState, applyCommand, validateCommand, query } from '../../src/simulation';
const input={scenarioId:'kernel-test',scenarioVersion:1,tickSeconds:1,dayTicks:86400,initialTick:21600,startingFundsMinor:1000,capabilities:[]};
test('consumes valid new sequences on rejection, prevents replay, rejects stale tick', () => {
  const state=createKernelState(input,'00000001000000020000000300000004');
  const before=JSON.stringify(state);
  const command={sequence:1,atTick:21600,kind:'constructFloorRange',payload:{floor:1,startX:0,endXExclusive:10}};
  expect(validateCommand(state,command).code).toBe('notImplemented');
  const view=query(state);expect(view.tick).toBe(21600);expect(Object.isFrozen(view)).toBe(true);
  expect(JSON.stringify(state)).toBe(before);
  expect(applyCommand(state,command).code).toBe('notImplemented');expect(state.lastCommandSequence).toBe(1);
  expect({...state,lastCommandSequence:0}).toEqual(JSON.parse(before));
  expect(applyCommand(state,command).code).toBe('duplicateCommand');
  expect(applyCommand(state,{...command,sequence:2,atTick:21601}).code).toBe('staleTick');expect(state.lastCommandSequence).toBe(2);
  expect(applyCommand(state,{...command,sequence:NaN}).code).toBe('invalidCommand');expect(state.lastCommandSequence).toBe(2);
});
test('malformed proposals are rejected without evaluating or mutating gameplay', () => {
  const state=createKernelState(input,'00000001000000020000000300000004');
  for(const value of [null,{}, {sequence:1,atTick:21600,kind:'constructFloorRange',payload:{floor:1.2,startX:0,endXExclusive:1}}])expect(applyCommand(state,value).ok).toBe(false);
});
