import type { GameState } from '../../state/game-state';
import { allocateId } from '../../core/ids/allocator';
import { add } from '../../core/values';
import { transition } from '../../occupants/transitions';
import { openSegment,closeSegment } from '../../metrics/trips';
import { stopQueue,findEntry } from './queue';
export type RequestResult={ok:true;entryId:string}|{ok:false;code:'invalidRequest'|'conflictingMembership'|'notAtLanding'};
/** Admit exactly one physical passenger request; repeating its same active intent is idempotent. */
export function requestElevator(state:GameState,occupantId:string,tripId:string,boardingStopId:string,unloadStopId:string):RequestResult {
 const p=state.occupants[occupantId],from=state.stops[boardingStopId],to=state.stops[unloadStopId];if(!p||!from||!to||from.serviceId!==to.serviceId||from.floor===to.floor||p.tripId!==tripId)return {ok:false,code:'invalidRequest'};
 if(p.location.kind==='queue'){const existing=findEntry(state,p.location.entryId);return existing&&existing.entry.tripId===tripId&&existing.queue.stopId===boardingStopId&&existing.entry.unloadStopId===unloadStopId?{ok:true,entryId:existing.entry.id}:{ok:false,code:'conflictingMembership'};}
 if(p.location.kind==='car'||Object.values(state.queues).some(q=>q.entries.some(e=>e.occupantId===occupantId))||Object.values(state.cars).some(c=>c.onboard.some(o=>o.occupantId===occupantId)))return {ok:false,code:'conflictingMembership'};
 if(p.location.kind!=='anchor'||p.location.at.floor!==from.floor||p.location.at.x2!==from.anchorX2)return {ok:false,code:'notAtLanding'};
 const queue=stopQueue(state,boardingStopId,to.floor>from.floor?'up':'down')!,next=add(state.ids.queueAdmission.next,1),id=allocateId('entry',state.ids.entity);queue.entries.push({id,occupantId,tripId,unloadStopId,joinedTick:state.clock.tick,admissionSequence:state.ids.queueAdmission.next,reservedVisitId:null,lastDeniedVisitId:null});state.ids.queueAdmission.next=next;
 transition(p,{state:'waitingForElevator',location:{kind:'queue',queueId:queue.id,entryId:id}});openSegment(state.trips[tripId]!,'waiting',state.clock.tick);return {ok:true,entryId:id};
}
/** Cancel membership at its real stop, settle waiting, and mark any reserved transfer safely canceled. */
export function cancelElevatorRequest(state:GameState,entryId:string,_reason:'goalChanged'|'serviceRemoved'):boolean {
 const found=findEntry(state,entryId);if(!found)return false;const {queue,entry}=found,p=state.occupants[entry.occupantId]!,stop=state.stops[queue.stopId]!;
 for(const car of Object.values(state.cars)){const selected=car.visit?.boarding.find(b=>b.entryId===entryId&&b.status==='pending');if(selected)selected.status='canceled';}
 closeSegment(state.trips[entry.tripId]!,state.clock.tick);queue.entries=queue.entries.filter(e=>e.id!==entryId);transition(p,{state:'entering',location:{kind:'anchor',at:{floor:stop.floor,x2:stop.anchorX2}}});if(p.journey)p.journey.legs=[];p.replanAfterCurrentLeg=true;return true;
}
