import type { GameState } from '../state/game-state';
import type { Occupant,Anchor } from './occupant';
import { buildGraph } from '../navigation/graph';
import { findRoute } from '../navigation/find-route';
import { RouteCache } from '../navigation/route-cache';
import { scheduleEvent } from './schedule-events';
import { transition } from './transitions';
import { openSegment } from '../metrics/trips';
const caches=new WeakMap<GameState,RouteCache>();
/** Commit one timed semantic walk; current position is derived from absolute integer endpoints. */
export function beginWalk(state:GameState,p:Occupant,to:Anchor):boolean {
 if(p.location.kind!=='anchor')throw Error('Walking must begin at a physical anchor');const from=p.location.at;
 let cache=caches.get(state);if(!cache){cache=new RouteCache(state.scenario.content!.routing.routeCacheEntries);caches.set(state,cache);}
 const a=`from:${from.floor}:${from.x2}`,b=`to:${to.floor}:${to.x2}`;
 const route=cache.get(state.navigation.topologyVersion,a,b,()=>findRoute(buildGraph(state,[{id:a,at:from},{id:b,at:to}]),a,b));
 if(!route){transition(p,{state:'stranded',location:{kind:'anchor',at:{...from}}});if(p.tripId){const trip=state.trips[p.tripId]!;trip.outcome='stranded';openSegment(trip,'stranded',state.clock.tick);}return false;}
 if(route.durationTicks===0)return true;
 transition(p,{state:'walking',location:{kind:'walkEdge',from:route.from,to:route.to,startTick:state.clock.tick,durationTicks:route.durationTicks}});
 if(p.tripId){const trip=state.trips[p.tripId]!;trip.outcome='active';openSegment(trip,'walking',state.clock.tick);}scheduleEvent(state,'walkComplete',p.id,p.generation,state.clock.tick+route.durationTicks);return true;
}
/** Derive a walker's exact current logical position without mutating elapsed movement every tick. */
export function walkingPosition(p:Occupant,atTick:number):Anchor|null {if(p.location.kind==='anchor')return {...p.location.at};if(p.location.kind!=='walkEdge')return null;const l=p.location,ratio=Math.max(0,Math.min(1,(atTick-l.startTick)/l.durationTicks));return {floor:l.from.floor,x2:l.from.x2+(l.to.x2-l.from.x2)*ratio};}
