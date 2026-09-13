import {expect,it} from 'vitest';
import {passengerAtPhase} from '../fixtures/one-elevator-passenger';
import {stairObservation} from '../fixtures/transport';
import {command} from '../fixtures/one-worker';
import {captureState} from '../../src/simulation';
const cases=[
 {name:'permanent base',state:()=>passengerAtPhase('moving').s,edit:()=>({kind:'demolishFloorRange',payload:{floor:0,startX:0,endXExclusive:1}} as const)},
 {name:'upper support',state:()=>passengerAtPhase('moving').s,edit:()=>({kind:'demolishFloorRange',payload:{floor:1,startX:40,endXExclusive:42}} as const)},
 {name:'facility footprint',state:()=>passengerAtPhase('moving').s,edit:()=>({kind:'demolishFloorRange',payload:{floor:3,startX:24,endXExclusive:25}} as const)},
 {name:'loaded shaft',state:()=>passengerAtPhase('moving').s,edit:(s:ReturnType<typeof captureState>)=>({kind:'demolishEntity',payload:{entityId:Object.keys(s.shafts)[0]!}} as const)},
 {name:'occupied stair',state:()=>stairObservation('climbing').s,edit:(s:ReturnType<typeof captureState>)=>({kind:'demolishEntity',payload:{entityId:Object.keys(s.stairs)[0]!}} as const)},
];
it.each(cases)('rejects $name without partial settlement, movement, RNG or geometry changes',({state,edit})=>{const s=state(),before=captureState(s);expect(command(s,edit(s)).ok).toBe(false);expect({...s,lastCommandSequence:0}).toEqual({...before,lastCommandSequence:0});});

it.each([
 {name:'overlapping construction',payload:{floor:1,startX:0,endXExclusive:10}},
 {name:'out-of-bounds construction',payload:{floor:1,startX:-1,endXExclusive:10}},
 {name:'missing upper support',payload:{floor:4,startX:50,endXExclusive:60}},
])('rejects $name with no partial action',({payload})=>{const s=passengerAtPhase('moving').s,before=captureState(s);expect(command(s,{kind:'constructFloorRange',payload}).ok).toBe(false);expect({...s,lastCommandSequence:0}).toEqual({...before,lastCommandSequence:0});});

it('allows occupied office removal from its surviving entrance and preserves the real exit',()=>{const {s,id}=passengerAtPhase('unloading');const officeId=Object.keys(s.offices)[0]!;expect(command(s,{kind:'demolishEntity',payload:{entityId:officeId}}).ok).toBe(true);expect(s.occupants[id]!.goal.kind).toBe('exit');expect(s.occupants[id]!.state).toBe('ridingElevator');captureState(s);});

import { oneCustomer } from '../fixtures/restaurant';
import { until as customerUntil,command as customerCommand } from '../fixtures/one-worker';
it('an occupied restaurant removal retains earned payment and exposes guests at its surviving entrance',()=>{const s=oneCustomer();customerUntil(s,36900);const id=Object.keys(s.occupants)[0]!,room=Object.keys(s.restaurants)[0]!,paid=s.economy.transactions.find(t=>t.source.startsWith('restaurantVisit:'));expect(customerCommand(s,{kind:'demolishEntity',payload:{entityId:room}}).ok).toBe(true);expect(s.occupants[id]!.state).toBe('walking');expect(s.occupants[id]!.goal.kind).toBe('exit');expect(s.economy.transactions.filter(t=>t.source.startsWith('restaurantVisit:'))).toEqual([paid]);customerUntil(s,40000);expect(s.occupants[id]).toBeUndefined();});
