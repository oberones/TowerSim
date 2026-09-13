import { test,expect } from 'vitest';
import { upperOffice } from '../fixtures/transport';
import { command } from '../fixtures/one-worker';
import { captureState } from '../../src/simulation';
import { post } from '../../src/simulation/economy/ledger';
test('unaffordable stairs and shafts allocate no IDs, geometry, recurring source or construction charge',()=>{const s=upperOffice(3);expect(post(s,{source:'test:spent-budget',amountMinor:-s.economy.balanceMinor}).ok).toBe(true);const before=captureState(s);for(const c of [{kind:'buildStair',payload:{definitionId:'stairs.basic',lowerFloor:0,x:10}},{kind:'buildElevatorShaft',payload:{definitionId:'elevator.standard',x:18,minFloor:0,maxFloor:3,servedMinFloor:0,servedMaxFloor:3}}] as const){expect(command(s,c).code).toBe('insufficientFunds');expect({...s,lastCommandSequence:0}).toEqual({...before,lastCommandSequence:0});}});
