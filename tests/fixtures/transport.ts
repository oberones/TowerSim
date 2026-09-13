import { createGame } from '../../src/simulation';
import type { GameState } from '../../src/simulation';
import { command,oneWorkerScenario,place,WALKER_SEED,until } from './one-worker';
/** Construct an upper office through the same public commands as the player. */
export function upperOffice(top=1){const s=createGame(oneWorkerScenario(),WALKER_SEED);for(let floor=1;floor<=top;floor++){const r=command(s,{kind:'constructFloorRange',payload:{floor,startX:0,endXExclusive:48}});if(!r.ok)throw Error(r.code);}place(s,24,top);return s;}
/** Place adjacent stairs at alternating free landings without overlapping reservations. */
export function stairs(s:GameState,top=1){for(let lowerFloor=0;lowerFloor<top;lowerFloor++){const r=command(s,{kind:'buildStair',payload:{definitionId:'stairs.basic',lowerFloor,x:10+lowerFloor*2}});if(!r.ok)throw Error(r.message??r.code);}return s;}
/** Build one standard shaft while retaining its production eight-person capacity. */
export function elevator(s:GameState,top=3,x=18){const r=command(s,{kind:'buildElevatorShaft',payload:{definitionId:'elevator.standard',x,minFloor:0,maxFloor:top,servedMinFloor:0,servedMaxFloor:top}});if(!r.ok)throw Error(r.message??r.code);return s;}
/** Wake the fixture's leased worker and stop at the actual arrival request. */
export function arrival(s:GameState){until(s,s.clock.tick+1);const p=Object.values(s.occupants)[0]!;until(s,p.schedule!.arrivalTick);return p.id;}
/** Prepare a real stair journey at a completed boundary, retaining production schedules and traversal timings. */
export function stairObservation(stage:'climbing'|'descending'|'inside'){
 const s=stairs(upperOffice()),id=arrival(s),p=s.occupants[id]!;
 if(stage==='descending')until(s,p.schedule!.departureTick);
 const expected=stage==='inside'?'insideFacility':'takingStairs';
 for(let ticks=0;ticks<2000;ticks++){if(s.occupants[id]!.state===expected)return {s,id};until(s,s.clock.tick+1);}
 throw Error(`Worker never reached stair observation ${stage}`);
}
