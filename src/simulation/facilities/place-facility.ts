import { restaurantDefinition } from './restaurants';
import { removeRestaurant } from './restaurant-lifecycle';
import { restaurantAmounts } from '../economy/settlement';
import type { GameState } from '../state/game-state';
import type { CommandResult,FloorQuote } from '../commands/types';
import { officeDefinition } from './offices';
import { reservations,reservationConflict } from '../world/reservations';
import { covers } from '../world/ranges';
import { allocateId } from '../core/ids/allocator';
import { add } from '../core/values';
import { createAccrual,accruedAmounts } from '../economy/accrual';
import { post } from '../economy/ledger';
import { prepareState } from '../state/transaction';
import { topologyChanged } from '../world/topology-change';
import { removeOffice } from './office-lifecycle';
export interface FacilityPayload {definitionId:string;floor:number;x:number}
/** Quote a complete known room footprint without allocating IDs, schedules or lease demand. */
export function quoteFacility(state:GameState,p:FacilityPayload):CommandResult {
 if(!state.tower||!state.scenario.content)return {ok:false,code:'notImplemented'};
 if(!['office.small','restaurant.small'].includes(p.definitionId))return {ok:false,code:'notImplemented',message:'Choose a supported room type.'};
 const d=p.definitionId==='restaurant.small'?restaurantDefinition(state):officeDefinition(state),w=state.scenario.world!;
 const quote:FloorQuote={footprint:{floor:p.floor,startX:p.x,endXExclusive:p.x+d.footprint.width},constructionCostMinor:d.constructionCostMinor,demolitionCostMinor:0,accruedSettlementMinor:0,cashDeltaMinor:-d.constructionCostMinor,topologyVersion:state.navigation.topologyVersion};
 /** Attach the entire price and footprint to a specific placement failure. */
 const reject=(code:'outOfBounds'|'missingFloor'|'overlap'|'insufficientFunds'|'overflow',message:string):CommandResult=>({ok:false,code,message,quote});
 if(!Number.isSafeInteger(p.floor)||!Number.isSafeInteger(p.x)||p.floor<w.minFloor||p.floor>w.maxFloor||p.x<0||quote.footprint.endXExclusive>w.widthCells)return reject('outOfBounds','Room footprint must fit within the world.');
 if(!covers(state.tower.floors.find(f=>f.level===p.floor)?.constructedRanges??[],quote.footprint))return reject('missingFloor','Construct the entire room floor first.');
 const conflict=reservationConflict(reservations(state),{ownerId:'proposal',floor:p.floor,startX:p.x,endXExclusive:quote.footprint.endXExclusive});if(conflict)return reject('overlap',`Footprint is reserved by ${conflict}.`);
 if(d.constructionCostMinor>0&&state.economy.balanceMinor<d.constructionCostMinor)return reject('insufficientFunds','Not enough cash for this room.');
 try{add(state.ids.entity.next,1);add(state.ids.transaction.next,1);add(state.navigation.topologyVersion,1);add(state.economy.balanceMinor,-d.constructionCostMinor);}catch{return reject('overflow','Placement exceeds safe integer limits.');}
 return {ok:true,code:'valid',quote};
}
/** Quote free room demolition separately from the accrued operating settlement it will post. */
export function quoteOfficeRemoval(state:GameState,id:string):CommandResult {
 const o=state.offices[id]??state.restaurants[id];if(!o)return {ok:false,code:id===state.tower?.lobby.id?'protectedBase':'invalidCommand',message:'Select an existing removable room.'};
 const a=o.typeId==='restaurant.small'?restaurantAmounts(state,o):accruedAmounts(state,o),delta=a.incomeMinor-a.costMinor;
 try{prepareState(state,draft=>{if(draft.restaurants[id])removeRestaurant(draft,id);else removeOffice(draft,id);topologyChanged(draft);});}catch{return {ok:false,code:'overflow',message:'The accrued settlement or exit cannot fit within safe limits.'};}
 return {ok:true,code:'valid',quote:{footprint:{floor:o.floor,startX:o.x,endXExclusive:o.x+o.width},constructionCostMinor:0,demolitionCostMinor:0,accruedSettlementMinor:delta,cashDeltaMinor:delta,topologyVersion:state.navigation.topologyVersion}};
}
/** Stage all facility, finance and occupant effects before publishing an accepted edit. */
export function commitFacility(state:GameState,p:FacilityPayload|string,sequence:number):CommandResult {
 const result=typeof p==='string'?quoteOfficeRemoval(state,p):quoteFacility(state,p);if(!result.ok)return result;
 try{const completed=prepareState(state,draft=>{
 if(typeof p==='string'){if(draft.restaurants[p])removeRestaurant(draft,p);else removeOffice(draft,p);}else{const d=p.definitionId==='restaurant.small'?restaurantDefinition(draft):officeDefinition(draft),id=allocateId('facility',draft.ids.entity);const base={id,typeId:'office.small' as const,definitionVersion:1 as const,floor:p.floor,x:p.x,width:d.footprint.width,height:1 as const,entranceX2:p.x*2+d.entranceOffsetX2,createdTick:draft.clock.tick,generation:0,lease:null,accrual:createAccrual(draft.clock.tick)};if(p.definitionId==='restaurant.small'){const {lease,...room}=base;draft.restaurants[id]={...room,typeId:'restaurant.small',visits:0,revenueMinor:0};}else draft.offices[id]=base;if(d.constructionCostMinor){const charge=post(draft,{source:`construction:command:${sequence}:${p.definitionId}:${id}`,amountMinor:-d.constructionCostMinor});if(!charge.ok)throw Error('Charge failed');}}
 topologyChanged(draft);});Object.assign(state,completed);return {...result,code:'applied'};
 }catch{return {ok:false,code:'overflow',message:'The complete edit could not settle within safe limits.'};}
}
