import { buildGraph } from '../navigation/graph';
import { findRoute } from '../navigation/find-route';
import type { Tower } from './tower';
import type { GameState } from '../state/game-state';
import type { Range } from '../state/content';
export interface WalkingSpace {topologyVersion:number;floors:ReadonlyMap<number,readonly Range[]>}
/** Connect half-cell anchors only inside one continuous constructed span; gaps never create shortcuts. */
export function hasWalkingPath(tower:Tower,floor:number,fromX2:number,toX2:number):boolean {
  return tower.floors.find(f=>f.level===floor)?.constructedRanges.some(r=>r.startX*2<=Math.min(fromX2,toX2) && r.endXExclusive*2>Math.max(fromX2,toX2))??false;
}
/** Explain real lobby reachability through constructed hallways and available vertical connections. */
export function accessAt(state:GameState,floor:number,x2:number):{accessible:boolean;reason:string} {
  const t=state.tower;if(!t || !hasWalkingPath(t,floor,x2,x2))return {accessible:false,reason:'No constructed walking space at this location'};
  if(Object.keys(state.stairs).length||Object.keys(state.shafts).length){const accessible=!!findRoute(buildGraph(state,[{id:'access:target',at:{floor,x2}}]),t.lobby.id,'access:target');return {accessible,reason:accessible?'Connected to the lobby by walking and vertical transport':'No connected stairs or elevator landing reaches this span'};}
  if(floor!==t.lobby.floor)return {accessible:false,reason:'No stairs or elevator connection to the lobby'};
  const accessible=hasWalkingPath(t,floor,t.lobby.entranceX2,x2);return {accessible,reason:accessible?'Connected to the lobby by the shared walking path':'An unbuilt gap separates this span from the lobby'};
}
/** Rebuild disposable per-floor walking intervals at the existing saved topology version. */
export function buildWalkingSpace(state:GameState):WalkingSpace|null {
  if(!state.tower)return null;return {topologyVersion:state.navigation.topologyVersion,floors:new Map(state.tower.floors.map(f=>[f.level,f.constructedRanges.map(r=>Object.freeze({...r}))]))};
}
