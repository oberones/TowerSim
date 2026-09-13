import { test,expect } from 'vitest';
import { captureState,validateCommand } from '../../src/simulation';
import { createRunner } from '../../src/simulation/core/clock/advance';
import { upperOffice } from '../fixtures/transport';
import { command,until } from '../fixtures/one-worker';

test('a stair repair wakes an idle car at the same boundary and survives saved continuation',()=>{
 const s=upperOffice(3);
 const stair={kind:'buildStair',payload:{definitionId:'stairs.basic',lowerFloor:0,x:8}} as const;
 expect(command(s,stair).ok).toBe(true);
 expect(command(s,{kind:'buildElevatorShaft',payload:{definitionId:'elevator.standard',x:10,minFloor:1,maxFloor:3,servedMinFloor:1,servedMaxFloor:3}}).ok).toBe(true);
 until(s,s.clock.tick+1);
 const id=Object.keys(s.occupants)[0]!,carId=Object.keys(s.cars)[0]!;
 until(s,s.occupants[id]!.schedule!.departureTick);
 expect(s.occupants[id]!.state).toBe('walking');
 expect(command(s,{kind:'demolishEntity',payload:{entityId:Object.keys(s.stairs)[0]!}}).ok).toBe(true);
 const leg=s.occupants[id]!.location;
 if(leg.kind!=='walkEdge')throw Error('Expected the supported exit walk to the elevator');
 until(s,leg.startTick+leg.durationTicks);
 expect(s.occupants[id]!.state).toBe('stranded');
 expect(s.cars[carId]!.phase).toBe('idle');
 expect(s.scheduledEvents.map(e=>e.kind)).toEqual(['dayBoundary','dailyReview']);

 const before=captureState(s);
 expect(validateCommand(s,{...stair,sequence:s.lastCommandSequence+1,atTick:s.clock.tick}).ok).toBe(true);
 expect(s).toEqual(before);
 expect(command(s,stair).ok).toBe(true);
 expect(s.clock.tick).toBe(before.clock.tick);
 expect(s.occupants[id]!.state).toBe('waitingForElevator');
 expect(s.cars[carId]).toMatchObject({phase:'leveling',currentFloor:3,direction:'down',onboard:[]});
 expect(s.scheduledEvents.filter(e=>e.kind==='carComplete')).toMatchObject([
  {targetId:carId,dueTick:s.clock.tick+s.scenario.content!.elevatorTiming.levelTicks},
 ]);

 const restored=captureState(s);
 expect(createRunner(s).advance(1200).ok).toBe(true);
 expect(createRunner(restored).advance(1200).ok).toBe(true);
 expect(s.occupants[id]!.state).toBe('outside');
 expect(captureState(s)).toEqual(captureState(restored));
});
