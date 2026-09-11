import type { GameState } from '../../state/game-state';
import type { Shaft } from './types';
import type { CommandResult,FloorQuote } from '../../commands/types';
import { rectangleReservations,reservations,reservationConflict } from '../../world/reservations';
import { covers } from '../../world/ranges';
import { add,multiply } from '../../core/values';
import { prorate } from '../../economy/accrual';
import { post } from '../../economy/ledger';
export interface ShaftPayload {definitionId:string;x:number;minFloor:number;maxFloor:number;servedMinFloor:number;servedMaxFloor:number}
export interface ServicePayload {shaftId:string;minFloor:number;maxFloor:number}
/** Quote the aligned full-height footprint and single base charge plus every reserved floor. */
export function quoteShaft(state:GameState,p:ShaftPayload):CommandResult {
 const w=state.scenario.world,d=state.scenario.content?.definitions.find(d=>d.typeId===p.definitionId);if(!w||!d||p.definitionId!=='elevator.standard')return {ok:false,code:'invalidCommand'};
 if(![p.x,p.minFloor,p.maxFloor,p.servedMinFloor,p.servedMaxFloor].every(Number.isSafeInteger)||p.x<0||p.x+d.footprint.width>w.widthCells||p.minFloor<w.minFloor||p.maxFloor>w.maxFloor)return {ok:false,code:'outOfBounds'};
 if(p.minFloor>=p.maxFloor||p.servedMinFloor<p.minFloor||p.servedMaxFloor>p.maxFloor||p.servedMinFloor>=p.servedMaxFloor)return {ok:false,code:'invalidServiceRange',message:'Serve at least two adjacent floors inside the reserved shaft.'};
 try{const cost=add(d.constructionCostMinor,multiply(d.perFloorCostMinor,p.maxFloor-p.minFloor+1)),quote:FloorQuote={footprint:{floor:p.minFloor,startX:p.x,endXExclusive:p.x+d.footprint.width},constructionCostMinor:cost,demolitionCostMinor:0,accruedSettlementMinor:0,cashDeltaMinor:-cost,topologyVersion:state.navigation.topologyVersion};
 for(const r of rectangleReservations('proposal',p.minFloor,p.x,d.footprint.width,p.maxFloor-p.minFloor+1)){if(!covers(state.tower?.floors.find(f=>f.level===r.floor)?.constructedRanges??[],r))return {ok:false,code:'missingFloor',quote,message:`Build the full shaft landing on floor ${r.floor}.`};const owner=reservationConflict(reservations(state),r);if(owner)return {ok:false,code:'overlap',quote,message:`Shaft floor ${r.floor} is reserved by ${owner}.`};}
 if(state.economy.balanceMinor<cost)return {ok:false,code:'insufficientFunds',quote};add(state.ids.entity.next,3+3*(p.servedMaxFloor-p.servedMinFloor+1));add(state.ids.transaction.next,1);add(state.navigation.topologyVersion,1);return {ok:true,code:'valid',quote};
 }catch{return {ok:false,code:'overflow'};}
}
export { quoteService } from './service-edits';
/** Quote running cost by existence time, including empty idle service. */
export function shaftCost(state:GameState,s:Shaft):number {const d=state.scenario.content!.definitions.find(d=>d.typeId===s.definitionId)!;return prorate(d.operatingMinorPerDay,state.clock.tick-s.costSinceTick,state.scenario.dayTicks);}
/** Settle an elevator's accrued cost exactly once at demolition or midnight. */
export function settleShaft(state:GameState,s:Shaft):void {const cost=shaftCost(state,s);if(cost&&!post(state,{source:`elevator:${s.id}:${s.costGeneration}:cost`,amountMinor:-cost}).ok)throw Error('Elevator operating settlement failed');s.costSinceTick=state.clock.tick;s.costGeneration=add(s.costGeneration,1);}
/** Reject removal of loaded cars and disclose the separately accrued operating settlement. */
export function quoteShaftRemoval(state:GameState,id:string):CommandResult {const s=state.shafts[id];if(!s)return {ok:false,code:'invalidCommand'};if(state.cars[s.carIds[0]]!.onboard.length)return {ok:false,code:'loadedCar',message:'Unload all passengers before removing this shaft.'};try{const cost=shaftCost(state,s);add(state.economy.balanceMinor,-cost);return {ok:true,code:'valid',quote:{footprint:{floor:s.minFloor,startX:s.x,endXExclusive:s.x+s.width},constructionCostMinor:0,demolitionCostMinor:0,accruedSettlementMinor:-cost,cashDeltaMinor:-cost,topologyVersion:state.navigation.topologyVersion}};}catch{return {ok:false,code:'overflow'};}}
