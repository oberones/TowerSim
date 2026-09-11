import type { GameState } from '../../state/game-state';
import type { ElevatorCar } from './types';
import { allocateId,compareIds } from '../../core/ids/allocator';
import { stopQueue,findEntry } from './queue';
import { transition } from '../../occupants/transitions';
import { closeSegment,openSegment } from '../../metrics/trips';
import { pursueGoal } from '../../occupants/facility-transitions';
/** Freeze unloading commitments at opening while retaining historical snapshots until the visit ends. */
export function createVisit(state:GameState,car:ElevatorCar):void {if(!car.targetStopId||!car.direction)throw Error('Service needs a landed target and direction');car.visit={id:allocateId('visit',state.ids.entity),stopId:car.targetStopId,direction:car.direction,cutoffTick:null,unloading:car.onboard.filter(o=>o.unloadStopId===car.targetStopId).map(o=>({...o})),unloadCursor:0,boarding:[],boardCursor:0};}
/** Freeze FIFO admissions after all unloading and boundary arrivals, recording capacity denials once. */
export function freezeBoarding(state:GameState,car:ElevatorCar):void {
 const visit=car.visit!;if(visit.cutoffTick!==null)return;visit.cutoffTick=state.clock.tick;const queue=stopQueue(state,visit.stopId,visit.direction)!;let free=car.capacity-car.onboard.length;
 for(const entry of [...queue.entries].sort((a,b)=>a.admissionSequence-b.admissionSequence||compareIds(a.occupantId,b.occupantId))){const selected=free>0;if(selected){free--;entry.reservedVisitId=visit.id;}else if(entry.lastDeniedVisitId!==visit.id){entry.lastDeniedVisitId=visit.id;state.trips[entry.tripId]!.deniedBoardingCount++;}visit.boarding.push({entryId:entry.id,occupantId:entry.occupantId,unloadStopId:entry.unloadStopId,admissionSequence:entry.admissionSequence,status:selected?'pending':'denied'});}
}
/** Complete one elapsed unloading transfer atomically before pursuing the person's current goal. */
export function completeUnload(state:GameState,car:ElevatorCar):void {const visit=car.visit!,record=visit.unloading[visit.unloadCursor++];if(!record)throw Error('Missing unload commitment');const p=state.occupants[record.occupantId]!,stop=state.stops[visit.stopId]!;car.onboard=car.onboard.filter(o=>o.occupantId!==p.id);if(p.tripId)closeSegment(state.trips[p.tripId]!,state.clock.tick);transition(p,{state:'entering',location:{kind:'anchor',at:{floor:stop.floor,x2:stop.anchorX2}}});pursueGoal(state,p);}
/** Complete one elapsed boarding transfer, keeping canceled historical cohort rows harmless. */
export function completeBoard(state:GameState,car:ElevatorCar):void {const v=car.visit!,row=v.boarding[v.boardCursor++];if(!row||row.status!=='pending')return;const found=findEntry(state,row.entryId);if(!found||found.entry.reservedVisitId!==v.id)throw Error('Missing selected queue entry');if(car.onboard.length>=car.capacity)throw Error('Car capacity exceeded');const {queue,entry}=found,p=state.occupants[entry.occupantId]!;queue.entries=queue.entries.filter(e=>e.id!==entry.id);car.onboard.push({occupantId:p.id,unloadStopId:entry.unloadStopId,boardedTick:state.clock.tick});row.status='boarded';transition(p,{state:'ridingElevator',location:{kind:'car',carId:car.id,unloadStopId:entry.unloadStopId}});const trip=state.trips[entry.tripId]!;openSegment(trip,'riding',state.clock.tick);trip.transferCount++;}
