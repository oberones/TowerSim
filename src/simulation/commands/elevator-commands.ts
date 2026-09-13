import type { GameState } from '../state/game-state';
import type { CommandResult } from './types';
import type { Shaft } from '../transportation/elevators/types';
import { quoteShaft,quoteService,quoteShaftRemoval,settleShaft } from '../transportation/elevators/shaft';
import type { ShaftPayload,ServicePayload } from '../transportation/elevators/shaft';
import { prepareState } from '../state/transaction';
import { allocateId } from '../core/ids/allocator';
import { post } from '../economy/ledger';
import { topologyChanged } from '../world/topology-change';
import { cancelEvents } from '../occupants/schedule-events';
import { cancelElevatorRequest } from '../transportation/elevators/requests';
/** Add new contiguous stops while retaining stable identities for unchanged floors. */
function updateStops(state:GameState,s:Shaft):void {
 const retained=s.stopIds.filter(id=>{const stop=state.stops[id]!;if(stop.floor>=s.servedMinFloor&&stop.floor<=s.servedMaxFloor)return true;for(const queueId of [stop.upQueueId,stop.downQueueId]){for(const entry of [...state.queues[queueId]!.entries])cancelElevatorRequest(state,entry.id,'serviceRemoved');delete state.queues[queueId];}delete state.stops[id];return false;});
 for(let floor=s.servedMinFloor;floor<=s.servedMaxFloor;floor++){if(retained.some(id=>state.stops[id]!.floor===floor))continue;const id=allocateId('stop',state.ids.entity),upQueueId=allocateId('queue',state.ids.entity),downQueueId=allocateId('queue',state.ids.entity);state.stops[id]={id,shaftId:s.id,serviceId:s.serviceId,floor,anchorX2:s.x*2+s.width,upQueueId,downQueueId};state.queues[upQueueId]={id:upQueueId,serviceId:s.serviceId,stopId:id,direction:'up',entries:[]};state.queues[downQueueId]={id:downQueueId,serviceId:s.serviceId,stopId:id,direction:'down',entries:[]};retained.push(id);}
 s.stopIds=retained.sort((a,b)=>state.stops[a]!.floor-state.stops[b]!.floor);
 for(const queue of Object.values(state.queues).filter(q=>q.serviceId===s.serviceId))for(const entry of [...queue.entries])if(!state.stops[entry.unloadStopId])cancelElevatorRequest(state,entry.id,'serviceRemoved');
}
/** Commit complete shaft construction, range edits or removal as one unpublished transaction. */
export function commitElevator(state:GameState,p:ShaftPayload|ServicePayload|string,sequence:number):CommandResult {
 const result=typeof p==='string'?quoteShaftRemoval(state,p):'shaftId' in p?quoteService(state,p):quoteShaft(state,p);if(!result.ok)return result;
 try{const completed=prepareState(state,draft=>{
 if(typeof p==='string'){const s=draft.shafts[p]!;settleShaft(draft,s);for(const stopId of s.stopIds){const stop=draft.stops[stopId]!;for(const queueId of [stop.upQueueId,stop.downQueueId]){for(const entry of [...draft.queues[queueId]!.entries])cancelElevatorRequest(draft,entry.id,'serviceRemoved');delete draft.queues[queueId];}delete draft.stops[stopId];}cancelEvents(draft,s.carIds[0]);delete draft.cars[s.carIds[0]];delete draft.shafts[p];}
 else if('shaftId' in p){const s=draft.shafts[p.shaftId]!;s.servedMinFloor=p.minFloor;s.servedMaxFloor=p.maxFloor;updateStops(draft,s);}
 else{const id=allocateId('shaft',draft.ids.entity),serviceId=allocateId('service',draft.ids.entity),carId=allocateId('car',draft.ids.entity),d=draft.scenario.content!.definitions.find(d=>d.typeId===p.definitionId)!;const s:Shaft={id,definitionId:'elevator.standard',x:p.x,width:d.footprint.width,minFloor:p.minFloor,maxFloor:p.maxFloor,serviceId,servedMinFloor:p.servedMinFloor,servedMaxFloor:p.servedMaxFloor,stopIds:[],carIds:[carId],createdTick:draft.clock.tick,costSinceTick:draft.clock.tick,costGeneration:0};draft.shafts[id]=s;updateStops(draft,s);draft.cars[carId]={id:carId,shaftId:id,serviceId,capacity:8,generation:0,phase:'idle',phaseStartTick:draft.clock.tick,phaseDurationTicks:0,currentFloor:p.servedMinFloor,direction:null,targetStopId:null,segment:null,onboard:[],visit:null};if(result.quote!.constructionCostMinor&&!post(draft,{source:`construction:command:${sequence}:shaft:${id}`,amountMinor:result.quote!.cashDeltaMinor}).ok)throw Error('Shaft charge failed');}
 topologyChanged(draft);});Object.assign(state,completed);return {...result,code:'applied'};
 }catch{return {ok:false,code:'overflow',message:'The complete elevator edit could not be settled.'};}
}
