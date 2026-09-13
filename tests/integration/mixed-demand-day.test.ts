import { expect,test } from 'vitest';
import { restaurantTower } from '../fixtures/restaurant';
import { command,until } from '../fixtures/one-worker';
import { validateScenario,createGame,encodeState,decodeState } from '../../src/simulation';
import { WALKER_SEED } from '../fixtures/one-worker';
test('office leases and external restaurant requests coexist in deterministic review order',()=>{const fixture=restaurantTower(0,5),s=createGame(validateScenario({...fixture.scenario,content:{...fixture.scenario.content!,officeMarketWorkers:32}}),WALKER_SEED);command(s,{kind:'placeFacility',payload:{definitionId:'office.small',floor:0,x:24}});command(s,{kind:'placeFacility',payload:{definitionId:'restaurant.small',floor:0,x:48}});until(s,21601);const workerIds=Object.values(s.occupants).filter(p=>p.kind==='worker').map(p=>p.id);expect(workerIds).toHaveLength(32);expect(s.restaurantDays[0]!.visits).toHaveLength(5);until(s,86400);expect(Object.keys(s.occupants)).toEqual(workerIds);expect(s.restaurantDays[0]!.visits.every(v=>v.status==='departed')).toBe(true);expect(decodeState(encodeState(s))).toEqual(s);});
