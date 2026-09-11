import { beginElevatorJourney } from './elevator-journey';
import type { GameState } from '../state/game-state';
import type { Occupant,Anchor } from './occupant';
import { buildGraph } from '../navigation/graph';
import { findRoute } from '../navigation/find-route';
import { modePreference } from '../navigation/route';
import { scheduleEvent } from './schedule-events';
import { transition } from './transitions';
import { openSegment } from '../metrics/trips';
import { beginStair } from '../transportation/stairs/traversal';
/** Plan from a real anchor, retain journey-origin mode, and start only one physical leg per boundary. */
export function beginWalk(state:GameState,p:Occupant,to:Anchor):boolean {
 if(p.location.kind!=='anchor')throw Error('Travel must begin at a physical anchor');const from=p.location.at;
 if(from.floor===to.floor&&from.x2===to.x2){p.journey=null;return true;}
 if(!p.journey||p.replanAfterCurrentLeg||p.journey.topologyVersion!==state.navigation.topologyVersion||!p.journey.legs.length){
 const origin=p.journey?.origin??{...from},preference=p.journey?.preference??modePreference(origin,to);
 const route=findRoute(buildGraph(state,[{id:'route:from',at:from},{id:'route:to',at:to}]),'route:from','route:to',preference);
 if(!route){p.journey={origin,destination:{...to},preference,legs:[],topologyVersion:state.navigation.topologyVersion};p.replanAfterCurrentLeg=false;transition(p,{state:'stranded',location:{kind:'anchor',at:{...from}}});if(p.tripId){const trip=state.trips[p.tripId]!;trip.outcome='stranded';openSegment(trip,'stranded',state.clock.tick);}return false;}
 p.journey={origin,destination:{...to},preference,legs:route.legs,topologyVersion:state.navigation.topologyVersion};p.replanAfterCurrentLeg=false;
 }
 const leg=p.journey.legs.shift()!;if(p.tripId)state.trips[p.tripId]!.outcome='active';
 if(leg.kind==='stair'){beginStair(state,p,leg);return true;}
 if(leg.kind==='elevator'){beginElevatorJourney(state,p,leg);return true;}
 transition(p,{state:'walking',location:{kind:'walkEdge',from:{...leg.from},to:{...leg.to},startTick:state.clock.tick,durationTicks:leg.durationTicks}});
 if(p.tripId)openSegment(state.trips[p.tripId]!,'walking',state.clock.tick);scheduleEvent(state,'walkComplete',p.id,p.generation,state.clock.tick+leg.durationTicks);return true;
}
/** Derive logical walk and stair positions solely from committed endpoints and elapsed simulation ticks. */
export function walkingPosition(p:Occupant,atTick:number):Anchor|null {if(p.location.kind==='anchor')return {...p.location.at};if(p.location.kind!=='walkEdge'&&p.location.kind!=='stair')return null;const l=p.location,ratio=Math.max(0,Math.min(1,(atTick-l.startTick)/l.durationTicks));return {floor:l.from.floor+(l.to.floor-l.from.floor)*ratio,x2:l.from.x2+(l.to.x2-l.from.x2)*ratio};}
