import type { GameState } from '../../simulation';
import { freezeDeep,clonePlain } from '../../simulation/state/plain';
import { walkingPosition } from '../../simulation/occupants/walking';
import { tripElapsed } from '../../simulation/metrics/trips';
import type { Occupant } from '../../simulation/occupants/occupant';
import type { ViewBounds } from './queries';
const active=new WeakMap<GameState['occupants'],Occupant[]>();
/** Project stable identity and current goal even when the selected worker is invisible indoors or outside. */
export function inspectOccupant(state:GameState,id:string){const p=state.occupants[id];if(!p)return null;const t=p.tripId?state.trips[p.tripId]:null;return freezeDeep({id:p.id,kind:p.kind,state:p.state,goal:clonePlain(p.goal),location:clonePlain(p.location),schedule:p.schedule?{...p.schedule}:null,trip:t?{id:t.id,outcome:t.outcome,denials:t.deniedBoardingCount,transfers:t.transferCount,purpose:t.purpose,startTick:t.startTick,elapsed:tripElapsed(t,state.clock.tick)}:null});}
/** Reuse a lifecycle-derived active list and cull logical positions without scanning dormant records each frame. */
export function visibleOccupants(state:GameState,bounds?:ViewBounds){let people=active.get(state.occupants);if(!people){people=Object.values(state.occupants).filter(p=>p.state==='walking'||p.state==='takingStairs'||p.state==='stranded'||p.state==='waitingForElevator');active.set(state.occupants,people);}return people.flatMap(p=>{const stop=p.location.kind==='queue'?state.stops[state.queues[p.location.queueId]!.stopId]:null;const at=stop?{floor:stop.floor,x2:stop.anchorX2}:walkingPosition(p,state.clock.tick);return at&&(!bounds||at.floor>=bounds.minFloor&&at.floor<=bounds.maxFloor&&at.x2/2>=bounds.minX&&at.x2/2<=bounds.maxX)?[{id:p.id,kind:p.kind,state:p.state,goal:p.goal.kind,at}]:[];});}
export type OccupantInspection=NonNullable<ReturnType<typeof inspectOccupant>>;
