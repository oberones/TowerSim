import { test,expect } from 'vitest';
import { createGame,captureState } from '../../src/simulation';
import { createRunner } from '../../src/simulation/core/clock/advance';
import { MVP_DEFAULT } from '../../src/content/scenarios/mvp-default';
import { command,WALKER_SEED } from '../fixtures/one-worker';
import { elevator } from '../fixtures/transport';

test('mixed restaurant demand boards waiting turnaround passengers before an empty departure',()=>{
 const s=createGame(MVP_DEFAULT,WALKER_SEED);
 for(let floor=1;floor<=3;floor++)expect(command(s,{kind:'constructFloorRange',payload:{floor,startX:0,endXExclusive:48}}).ok).toBe(true);
 expect(command(s,{kind:'placeFacility',payload:{definitionId:'restaurant.small',floor:3,x:24}}).ok).toBe(true);
 elevator(s,3,10);
 const runner=createRunner(s),carId=Object.keys(s.cars)[0]!;
 while(s.clock.tick<65000){
  const car=s.cars[carId]!;
  if(car.phase==='closing'&&car.phaseStartTick+car.phaseDurationTicks===s.clock.tick+1&&car.currentFloor===0&&car.direction==='down'&&car.onboard.length===0){
   const here=Object.values(s.queues).find(q=>s.stops[q.stopId]!.floor===0&&q.direction==='up'&&q.entries.length);
   const elsewhere=Object.values(s.queues).some(q=>s.stops[q.stopId]!.floor>0&&q.entries.length);
   if(here&&elsewhere){
    const waitingIds=here.entries.map(e=>e.occupantId);
    expect(runner.advance(1).ok).toBe(true);
    expect(s.cars[carId]).toMatchObject({phase:'leveling',currentFloor:0,direction:'up',onboard:[]});
    const restored=captureState(s),restoredRunner=createRunner(restored);
    // Reopening and boarding remain timed; the opposite queue gets its own fresh visit.
    const timing=s.scenario.content!.elevatorTiming;
    const serviceTicks=timing.levelTicks+timing.openTicks+timing.boardTicks*Math.min(8,waitingIds.length);
    expect(runner.advance(serviceTicks).ok).toBe(true);
    expect(restoredRunner.advance(serviceTicks).ok).toBe(true);
    expect(s.cars[carId]!.onboard.map(p=>p.occupantId)).toEqual(waitingIds.slice(0,8));
    expect(captureState(s)).toEqual(captureState(restored));
    return;
   }
  }
  expect(runner.advance(1).ok).toBe(true);
 }
 throw Error('Restaurant demand never produced the turnaround queue');
});
