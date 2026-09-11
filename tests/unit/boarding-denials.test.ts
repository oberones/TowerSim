import { test,expect } from 'vitest';
import { nineAtBoarding } from '../fixtures/nine-passengers';
import { createRunner } from '../../src/simulation/core/clock/advance';
import { freezeBoarding } from '../../src/simulation/transportation/elevators/service-visit';
import { tripElapsed } from '../../src/simulation/metrics/trips';
import { cancelElevatorRequest } from '../../src/simulation/transportation/elevators/requests';
import { createGame } from '../../src/simulation';
import { MVP_DEFAULT } from '../../src/content/scenarios/mvp-default';
import { command,place,until,WALKER_SEED } from '../fixtures/one-worker';
import { elevator } from '../fixtures/transport';
test('a full descending car still serves a compatible intermediate stop and records real capacity denials',()=>{
 const s=createGame({...MVP_DEFAULT,content:{...MVP_DEFAULT.content,officeMarketWorkers:16,definitions:MVP_DEFAULT.content.definitions.map(d=>d.typeId==='office.small'?{...d,capacity:8}:d),schedules:{...MVP_DEFAULT.content.schedules,office:{...MVP_DEFAULT.content.schedules.office,arrivalEnd:28801,departureEnd:61201}}}},WALKER_SEED);
 for(let floor=1;floor<=3;floor++)command(s,{kind:'constructFloorRange',payload:{floor,startX:0,endXExclusive:48}});place(s,24,1);place(s,24,3);elevator(s,3);
 until(s,61200);const runner=createRunner(s);let deniedFullStop=false;
 for(let i=0;i<2000;i++){expect(runner.advance(1).ok).toBe(true);const c=Object.values(s.cars)[0]!;if(c.currentFloor===1&&c.direction==='down'&&c.onboard.length===8&&c.visit?.boarding.some(r=>r.status==='denied')){deniedFullStop=true;expect(c.visit.unloading).toHaveLength(0);break;}}
 expect(deniedFullStop).toBe(true);until(s,72000);expect(Object.values(s.occupants).every(p=>p.state==='outside')).toBe(true);
});
test('arrivals after a frozen cutoff receive neither a reserved place nor a false capacity denial',()=>{
 const s=nineAtBoarding(32,30),runner=createRunner(s),carId=Object.keys(s.cars)[0]!,visit=s.cars[carId]!.visit!,cutoff=visit.cutoffTick!,members=new Set(visit.boarding.map(r=>r.occupantId));let late=0;
 for(let i=0;i<10&&s.cars[carId]!.visit?.id===visit.id;i++){for(const q of Object.values(s.queues))for(const e of q.entries)if(e.joinedTick>cutoff){late++;expect(members.has(e.occupantId)).toBe(false);expect(e.reservedVisitId).toBeNull();expect(s.trips[e.tripId]!.deniedBoardingCount).toBe(0);}expect(runner.advance(1).ok).toBe(true);}
 expect(late).toBeGreaterThan(0);
});
test('two eligible visits deny the same last passenger once each and cancellation retains experience',()=>{
 const s=nineAtBoarding(17),car=Object.values(s.cars)[0]!,last=car.visit!.boarding.at(-1)!,id=last.occupantId,tripId=s.occupants[id]!.tripId!;
 freezeBoarding(s,car);freezeBoarding(s,car);expect(s.trips[tripId]!.deniedBoardingCount).toBe(1);
 const runner=createRunner(s);for(let i=0;i<1000&&s.trips[tripId]!.deniedBoardingCount<2;i++)expect(runner.advance(1).ok).toBe(true);
 expect(s.trips[tripId]!.deniedBoardingCount).toBe(2);const elapsed=tripElapsed(s.trips[tripId]!,s.clock.tick).waiting;
 const p=s.occupants[id]!;if(p.location.kind!=='queue')throw Error('Expected waiting');cancelElevatorRequest(s,p.location.entryId,'goalChanged');
 expect(s.trips[tripId]!.totals.waiting).toBe(elapsed);expect(s.trips[tripId]!.deniedBoardingCount).toBe(2);
});
