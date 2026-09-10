import { visibleOccupants } from './occupant-queries';
import { reservations } from '../../simulation/world/reservations';
import type { GameState } from '../../simulation';
import type { Speed } from './pacing';
import { freezeDeep } from '../../simulation/state/plain';
export interface ViewBounds {minX:number;maxX:number;minFloor:number;maxFloor:number}
/** Project small scalar HUD data without exposing live mutable domain objects. */
export function getHud(state:GameState,speed:Speed,unsaved:boolean) {
  const tick=state.clock.tick;return Object.freeze({tick,day:Math.floor(tick/86400)+1,time:`${String(Math.floor(tick%86400/3600)).padStart(2,'0')}:${String(Math.floor(tick%3600/60)).padStart(2,'0')}`,cashMinor:state.economy.balanceMinor,seed:state.rng.seed,level:state.progression.level,speed,unsaved});
}
/** Copy only visible structure records; time advancement never requires a complete state clone. */
export function getWorldView(state:GameState,bounds?:ViewBounds) {
  const tower=state.tower;if(!tower || !state.scenario.world)throw Error('No playable world');
  const floors=tower.floors.filter(f=>!bounds || f.level>=bounds.minFloor && f.level<=bounds.maxFloor).map(f=>({id:f.id,level:f.level,constructedRanges:f.constructedRanges.filter(r=>!bounds || r.startX<bounds.maxX && r.endXExclusive>bounds.minX).map(r=>({...r}))}));
  return freezeDeep({offices:Object.values(state.offices).filter(o=>!bounds||o.floor>=bounds.minFloor&&o.floor<=bounds.maxFloor&&o.x<bounds.maxX&&o.x+o.width>bounds.minX).map(o=>({id:o.id,floor:o.floor,x:o.x,width:o.width})),occupants:visibleOccupants(state,bounds),floors,lobby:{...tower.lobby},bounds:{widthCells:state.scenario.world.widthCells,minFloor:state.scenario.world.minFloor,maxFloor:state.scenario.world.maxFloor,groundFloor:state.scenario.world.groundFloor},topologyVersion:state.navigation.topologyVersion});
}
export type WorldView=ReturnType<typeof getWorldView>;

import { accessAt } from '../../simulation/world/walking-space';
import { subtractRange } from '../../simulation/world/ranges';
/** Project constructed/free spans and per-span access, preserving the lobby's placement reservation. */
export function inspectFloor(state:GameState,level:number){
  const floor=state.tower?.floors.find(f=>f.level===level);if(!floor || !state.tower)return null;
  let free=floor.constructedRanges.map(r=>({...r}));for(const r of reservations(state).filter(r=>r.floor===level))free=subtractRange(free,r);
  return freezeDeep({id:floor.id,level,builtCells:floor.constructedRanges.reduce((sum,r)=>sum+r.endXExclusive-r.startX,0),freeCells:free.reduce((sum,r)=>sum+r.endXExclusive-r.startX,0),freeRanges:free,
    spans:floor.constructedRanges.map(r=>({...r,access:accessAt(state,level,r.startX+r.endXExclusive)}))});
}
export type FloorInspection=NonNullable<ReturnType<typeof inspectFloor>>;
