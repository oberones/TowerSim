import {test,expect} from 'vitest';
import {leasedWorker,until,command,oneWorkerScenario,place,WALKER_SEED} from '../fixtures/one-worker';
import {createGame,advance,encodeState} from '../../src/simulation';
import {floor} from '../fixtures/tower';
import {inspectOffice} from '../../src/app/game/facility-queries';
test.each(['outside','walking','inside'] as const)('demolition during %s preserves physical exits and clears live facility references',phase=>{const {s,id}=leasedWorker();const o=Object.keys(s.offices)[0]!,q=s.occupants[id]!.schedule!;if(phase!=='outside')until(s,q.arrivalTick+(phase==='inside'?28:10));expect(command(s,{kind:'demolishEntity',payload:{entityId:o}}).ok).toBe(true);expect(s.offices[o]).toBeUndefined();expect(s.scheduledEvents.filter(e=>e.targetId===id).every(e=>e.kind==='walkComplete')).toBe(true);if(phase==='walking')expect(s.occupants[id]!.replanAfterCurrentLeg).toBe(true);encodeState(s);until(s,s.clock.tick+100);expect(s.occupants[id]).toBeUndefined();expect(s.officeMarket.pendingRelease).toBe(1);expect(Object.values(s.trips).every(t=>t.endTick!==null)).toBe(true);});
test('access loss retains tenant, suspends rent, skips the missed arrival and repair does not invent attendance',()=>{const sc=oneWorkerScenario();const s=createGame({...sc,world:{...sc.world!,initialConstructedRanges:[{startX:0,endXExclusive:8}]}},WALKER_SEED);floor(s,0,8,40);const o=place(s);advance(s,1);const id=Object.keys(s.occupants)[0]!,arrival=s.occupants[id]!.schedule!.arrivalTick,tenant=s.offices[o.id]!.lease!.tenantId;until(s,25000);expect(floor(s,0,8,16,true).ok).toBe(true);expect(inspectOffice(s,o.id)).toMatchObject({rentSuspended:true,tenantId:tenant});until(s,arrival);expect(s.occupants[id]!.schedule!.status).toBe('skipped');expect(floor(s,0,8,16).ok).toBe(true);expect(inspectOffice(s,o.id)).toMatchObject({rentSuspended:false,present:0,tenantId:tenant});encodeState(s);});
test('a demolished indoor worker stranded by a gap survives until repair and a real exit',()=>{
 const sc=oneWorkerScenario(),s=createGame({...sc,world:{...sc.world!,initialConstructedRanges:[{startX:0,endXExclusive:8}]}},WALKER_SEED);
 floor(s,0,8,40);const o=place(s);advance(s,1);const id=Object.keys(s.occupants)[0]!;until(s,s.occupants[id]!.schedule!.arrivalTick+28);
 expect(floor(s,0,8,16,true).ok).toBe(true);command(s,{kind:'demolishEntity',payload:{entityId:o.id}});
 expect(s.occupants[id]!.state).toBe('stranded');until(s,s.clock.tick+100);expect(s.occupants[id]!.state).toBe('stranded');encodeState(s);
 floor(s,0,8,16);expect(s.occupants[id]!.state).toBe('walking');until(s,s.clock.tick+28);expect(s.occupants[id]).toBeUndefined();expect(Object.values(s.trips).some(t=>t.totals.stranded===100)).toBe(true);encodeState(s);
});
