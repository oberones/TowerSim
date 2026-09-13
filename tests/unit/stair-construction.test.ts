import { test,expect } from 'vitest';
import { command } from '../fixtures/one-worker';
import { upperOffice,stairs } from '../fixtures/transport';
import { captureState } from '../../src/simulation';
import { accessAt } from '../../src/simulation/world/walking-space';
test('stairs reserve both full landings, charge once and connect hallways immediately',()=>{const s=upperOffice(),before=s.economy.balanceMinor;expect(accessAt(s,1,64).accessible).toBe(false);stairs(s);expect(s.economy.balanceMinor).toBe(before-5000);expect(accessAt(s,1,64).accessible).toBe(true);expect(Object.values(s.stairs)).toHaveLength(1);captureState(s);const r=command(s,{kind:'placeFacility',payload:{definitionId:'office.small',floor:0,x:9}});expect(r.code).toBe('overlap');});
test('missing, colliding, nonadjacent and unaffordable proposals are atomic',()=>{for(const payload of [{definitionId:'stairs.basic',lowerFloor:1,x:10},{definitionId:'stairs.basic',lowerFloor:0,x:0},{definitionId:'stairs.basic',lowerFloor:0,x:119},{definitionId:'stairs.basic',lowerFloor:0,upperFloor:2,x:10}]){const s=upperOffice(),before=captureState(s);expect(command(s,{kind:'buildStair',payload} as any).ok).toBe(false);expect({...s,lastCommandSequence:0}).toEqual({...before,lastCommandSequence:0});}});

test('a partially supported landing cannot be built or partially charged',()=>{const s=upperOffice(),before=captureState(s);expect(command(s,{kind:'buildStair',payload:{definitionId:'stairs.basic',lowerFloor:0,x:47}}).code).toBe('missingFloor');expect({...s,lastCommandSequence:0}).toEqual({...before,lastCommandSequence:0});});
