import { expect, test } from 'vitest';
import { createKernelState } from '../../src/simulation/state/game-state';
import { validateScenario } from '../../src/simulation/state/scenario';
import { assertPlain } from '../../src/simulation/state/plain';
export const scenario = {scenarioId:'kernel-test',scenarioVersion:1,tickSeconds:1,dayTicks:86400,initialTick:21600,startingFundsMinor:1000,capabilities:[]};
export const seed = '00000001000000020000000300000004';
test('copies and freezes scenario identity while isolating state instances', () => {
  const input={...scenario,capabilities:[]};const a=createKernelState(input,seed);const b=createKernelState(input,seed);
  input.startingFundsMinor=50;a.clock.tick++;
  expect(b.clock.tick).toBe(21600);expect(a.scenario.startingFundsMinor).toBe(1000);
  expect(Object.isFrozen(a.scenario)).toBe(true);
  expect(() => validateScenario({...scenario,capabilities:['elevatorUpgrade']})).toThrow();
});
test('rejects non-JSON values, prototypes, accessors, holes and cycles before encoding', () => {
  const cycle:unknown[]=[];cycle.push(cycle);
  for(const value of [undefined,NaN,Infinity,1n,()=>0,new Map(),new Date(),{a:undefined},cycle,Array(2),{get a(){throw Error('must not invoke');}}]) expect(() => assertPlain(value)).toThrow();
  expect(() => assertPlain({a:[null,true,'text',1]})).not.toThrow();
});
test('rejects arrays that hide holes behind extra named properties', () => {
  const array:unknown[]=[];array.length=2;Object.assign(array,{a:1,b:2});
  expect(()=>assertPlain(array)).toThrow();
});
