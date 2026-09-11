import type { Anchor } from '../../occupants/occupant';
import type { GameState } from '../../state/game-state';
import type { CommandResult } from '../../commands/types';
import { covers } from '../../world/ranges';
import { reservations,rectangleReservations,reservationConflict } from '../../world/reservations';
import { add } from '../../core/values';
export interface Stair {id:string;definitionId:'stairs.basic';lowerFloor:number;upperFloor:number;x:number;width:number;lowerAnchor:Anchor;upperAnchor:Anchor;traversalTicks:number;createdTick:number}
export interface StairPayload {definitionId:string;lowerFloor:number;x:number}
/** Quote both adjacent landing footprints and the full one-time stair price without mutation. */
export function quoteStair(state:GameState,p:StairPayload):CommandResult {
 const world=state.scenario.world,d=state.scenario.content?.definitions.find(d=>d.typeId===p.definitionId);
 if(!world||!d||p.definitionId!=='stairs.basic')return {ok:false,code:'invalidCommand',message:'Choose the basic stair definition.'};
 const footprint={floor:p.lowerFloor,startX:p.x,endXExclusive:p.x+d.footprint.width},quote={footprint,constructionCostMinor:d.constructionCostMinor,demolitionCostMinor:0,accruedSettlementMinor:0,cashDeltaMinor:-d.constructionCostMinor,topologyVersion:state.navigation.topologyVersion};
 if(![p.lowerFloor,p.x].every(Number.isSafeInteger)||p.lowerFloor<world.minFloor||p.lowerFloor>=world.maxFloor||p.x<0||footprint.endXExclusive>world.widthCells)return {ok:false,code:'outOfBounds',quote,message:'Both adjacent stair landings must fit inside the world.'};
 for(const r of rectangleReservations('proposal',p.lowerFloor,p.x,d.footprint.width,2)){
 if(!covers(state.tower?.floors.find(f=>f.level===r.floor)?.constructedRanges??[],r))return {ok:false,code:'missingFloor',quote,message:`Build the full stair landing on floor ${r.floor}.`};
 const owner=reservationConflict(reservations(state),r);if(owner)return {ok:false,code:'overlap',quote,message:`Landing on floor ${r.floor} is reserved by ${owner}.`};}
 if(state.economy.balanceMinor<d.constructionCostMinor)return {ok:false,code:'insufficientFunds',quote};
 try{add(state.ids.entity.next,1);add(state.ids.transaction.next,1);add(state.navigation.topologyVersion,1);}catch{return {ok:false,code:'overflow',quote};}
 return {ok:true,code:'valid',quote};
}
/** Protect an occupied stair while allowing future route plans to be reconciled after removal. */
export function quoteStairRemoval(state:GameState,id:string):CommandResult {const stair=state.stairs[id];if(!stair)return {ok:false,code:'invalidCommand'};if(Object.values(state.occupants).some(p=>p.location.kind==='stair'&&p.location.stairId===id))return {ok:false,code:'activeTraversal',message:'A person is using these stairs. Wait for them to reach the landing.'};return {ok:true,code:'valid',quote:{footprint:{floor:stair.lowerFloor,startX:stair.x,endXExclusive:stair.x+stair.width},constructionCostMinor:0,demolitionCostMinor:0,accruedSettlementMinor:0,cashDeltaMinor:0,topologyVersion:state.navigation.topologyVersion}};}
