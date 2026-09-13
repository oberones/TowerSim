import {expect,it} from 'vitest';
import {passengerAtPhase} from '../fixtures/one-elevator-passenger';
import {command} from '../fixtures/one-worker';
import {captureState} from '../../src/simulation';
it.each(['moving','unloading'] as const)('protects loaded %s commitments atomically',phase=>{const {s,carId}=passengerAtPhase(phase),shaftId=s.cars[carId]!.shaftId;for(const c of [{kind:'demolishEntity',payload:{entityId:shaftId}},{kind:'setElevatorServiceRange',payload:{shaftId,minFloor:0,maxFloor:1}}] as const){const before=captureState(s);expect(command(s,c).ok).toBe(false);expect({...s,lastCommandSequence:0}).toEqual({...before,lastCommandSequence:0});}});
it('cancels requests to removed unload stops while preserving real location and trip history',()=>{const {s,id,carId}=passengerAtPhase('leveling'),shaftId=s.cars[carId]!.shaftId,trip=s.occupants[id]!.tripId!;expect(command(s,{kind:'setElevatorServiceRange',payload:{shaftId,minFloor:0,maxFloor:2}}).ok).toBe(true);expect(s.occupants[id]!.goal.kind).toBe('exit');expect(s.trips[trip]!.outcome).toBe('abandoned');expect(Object.values(s.queues).flatMap(q=>q.entries)).toHaveLength(0);captureState(s);});
