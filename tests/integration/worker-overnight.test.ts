import { test,expect } from 'vitest';
import { createGame, captureState, decodeState, encodeState } from '../../src/simulation';
import { oneWorkerScenario,command,place,until,WALKER_SEED } from '../fixtures/one-worker';
import { elevator } from '../fixtures/transport';
/** Use deliberately slow valid travel to carry the same committed rider across a departure and midnight. */
function overnightWorker(){const base=oneWorkerScenario(),s=createGame({...base,content:{...base.content!,elevatorTiming:{...base.content!.elevatorTiming,floorTicks:40000}}},WALKER_SEED);command(s,{kind:'constructFloorRange',payload:{floor:1,startX:0,endXExclusive:48}});place(s,24,1);elevator(s,1);until(s,21601);return s;}
test('overdue riders abandon the visit but retain unloading commitments and cannot receive another visit overnight',()=>{
 const s=overnightWorker(),id=Object.keys(s.occupants)[0]!;until(s,s.occupants[id]!.schedule!.departureTick);expect(s.occupants[id]!.state).toBe('ridingElevator');expect(s.occupants[id]!.goal.kind).toBe('exit');expect(Object.values(s.trips).filter(t=>t.outcome==='abandoned')).toHaveLength(1);
 const copy=decodeState(encodeState(s));until(s,108001);until(copy,108001);expect(encodeState(copy)).toBe(encodeState(s));expect(s.workforceDays.flatMap(d=>d.members)).toHaveLength(1);expect(s.scheduledEvents.filter(e=>e.kind==='workerArrival')).toHaveLength(0);
 until(s,130000);expect(s.occupants[id]!.state).toBe('outside');until(s,194401);expect(s.occupants[id]!.schedule!.day).toBe(2);expect(Object.keys(s.occupants)).toEqual([id]);captureState(s);
});
test('repeated lease and demolition cycles retire former workers while preserving historical request identity',()=>{
 const s=createGame(oneWorkerScenario(),WALKER_SEED),old:string[]=[];
 for(let day=0;day<3;day++){const office=place(s);until(s,21601+day*86400);const id=Object.keys(s.occupants)[0]!;old.push(id);expect(command(s,{kind:'demolishEntity',payload:{entityId:office.id}}).ok).toBe(true);expect(Object.keys(s.occupants)).toHaveLength(0);expect(s.officeMarket.pendingRelease).toBe(1);captureState(s);}
 expect(new Set(old).size).toBe(3);expect(s.workforceDays.flatMap(d=>d.members.map(m=>m.occupantId))).toEqual(old);
});
