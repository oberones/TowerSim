import type { GameState } from '../../state/game-state';
import type { Occupant } from '../../occupants/occupant';
import type { RouteLeg } from '../../navigation/route';
import { transition } from '../../occupants/transitions';
import { scheduleEvent } from '../../occupants/schedule-events';
import { openSegment } from '../../metrics/trips';
/** Commit one supported stair traversal, owned by a single future physical completion event. */
export function beginStair(state:GameState,p:Occupant,leg:Extract<RouteLeg,{kind:'stair'}>):void {if(p.location.kind!=='anchor'||!state.stairs[leg.stairId])throw Error('Missing physical stair origin');transition(p,{state:'takingStairs',location:{kind:'stair',stairId:leg.stairId,from:{...leg.from},to:{...leg.to},startTick:state.clock.tick,durationTicks:leg.durationTicks}});if(p.tripId)openSegment(state.trips[p.tripId]!,'stair',state.clock.tick);scheduleEvent(state,'walkComplete',p.id,p.generation,state.clock.tick+leg.durationTicks);}
