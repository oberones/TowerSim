import {test,expect} from 'vitest';
import {createGame,advance,encodeState,decodeState} from '../../src/simulation';
import {MVP_DEFAULT} from '../../src/content/scenarios/mvp-default';
import {Pacing,TICKS_PER_SECOND} from '../../src/app/game/pacing';
import {place,until,WALKER_SEED} from '../fixtures/one-worker';

test.each([1,4,8] as const)('default walking stays visible for at least half a real second at %sx and admits at its actual endpoint',speed=>{
 const s=createGame(MVP_DEFAULT,WALKER_SEED);place(s);until(s,21601);
 const person=Object.values(s.occupants).sort((a,b)=>a.schedule!.arrivalTick-b.schedule!.arrivalTick)[0]!;
 expect(Object.keys(s.occupants)).toHaveLength(32);
 const arrival=person.schedule!.arrivalTick;until(s,arrival);
 const walk=s.occupants[person.id]!.location;
 expect(walk.kind).toBe('walkEdge');if(walk.kind!=='walkEdge')throw Error('Expected a committed walking leg');
 expect(walk.durationTicks).toBe(840);
 expect(walk.durationTicks/(TICKS_PER_SECOND*speed)).toBeGreaterThanOrEqual(0.875);
 const pacing=new Pacing();pacing.setSpeed(speed,0);pacing.accumulate(500);
 expect(advance(s,pacing.take(1000)).ok).toBe(true);
 expect(s.occupants[person.id]!.state).toBe('walking');
 const restored=decodeState(encodeState(s));until(s,arrival+839);expect(s.occupants[person.id]!.state).toBe('walking');
 until(s,arrival+840);expect(s.occupants[person.id]!.state).toBe('insideFacility');
 until(restored,arrival+840);expect(encodeState(restored)).toBe(encodeState(s));
});

test('previously captured scenarios retain their walking pace instead of silently retiming live journeys',()=>{
 const s=createGame({...MVP_DEFAULT,content:{...MVP_DEFAULT.content,walkingTicksPerCell:1}},WALKER_SEED);place(s);until(s,21601);
 const id=Object.keys(s.occupants)[0]!,arrival=s.occupants[id]!.schedule!.arrivalTick;until(s,arrival+10);
 const restored=decodeState(encodeState(s));expect(restored.scenario.content!.walkingTicksPerCell).toBe(1);
 until(restored,arrival+28);expect(restored.occupants[id]!.state).toBe('insideFacility');
 expect(MVP_DEFAULT.content.walkingTicksPerCell).toBe(30);
});
