import { cancelElevatorRequest } from '../transportation/elevators/requests';
import type { GameState } from '../state/game-state';
import type { Occupant } from './occupant';
import { accessAt } from '../world/walking-space';
import { beginWalk } from './walking';
import { transition } from './transitions';
import { startTrip,finishTrip,closeSegment } from '../metrics/trips';
import { retireOccupant } from './retirement';
/** Route an anchored person to their live goal, completing only actual endpoint admissions/exits. */
export function pursueGoal(state:GameState,p:Occupant):void {
 if(p.location.kind!=='anchor')return;
 const office=p.goal.kind==='office'?state.offices[p.goal.facilityId]:null,lobby=state.tower!.lobby;
 const to=office?{floor:office.floor,x2:office.entranceX2}:{floor:lobby.floor,x2:lobby.entranceX2};
 if(!beginWalk(state,p,to)||p.location.kind!=='anchor')return;
 if(p.tripId){finishTrip(state.trips[p.tripId]!,'completed',state.clock.tick);p.tripId=null;}
 if(office){transition(p,{state:'insideFacility',location:{kind:'facility',facilityId:office.id}});if(p.schedule)p.schedule.status='admitted';}
 else{transition(p,{state:'outside',location:{kind:'outside'}});p.goal={kind:'none'};if(p.schedule&&p.schedule.status!=='canceled')p.schedule.status='departed';retireOccupant(state,p);}
}
/** Enter from the lobby only at the scheduled request when a live accessible destination remains. */
export function arriveWorker(state:GameState,p:Occupant):void {
 if(p.state!=='outside'||!p.schedule||p.schedule.status!=='scheduled')return;const o=p.leaseFacilityId?state.offices[p.leaseFacilityId]:null;
 if(!o||!accessAt(state,o.floor,o.entranceX2).accessible||state.clock.tick>=p.schedule.departureTick){p.schedule.status='skipped';return;}
 const lobby=state.tower!.lobby;p.goal={kind:'office',facilityId:o.id};p.schedule.status='traveling';p.tripId=startTrip(state,p.id,'officeArrival').id;
 transition(p,{state:'entering',location:{kind:'anchor',at:{floor:lobby.floor,x2:lobby.entranceX2}}});pursueGoal(state,p);
}
/** Abandon an unfinished visit separately and attempt a physical exit, preserving a supported current leg. */
export function departWorker(state:GameState,p:Occupant):void {
 if(p.state==='outside')return;if(p.goal.kind==='exit')return;
 const abandoned=p.state!=='insideFacility';if(p.tripId)finishTrip(state.trips[p.tripId]!,'abandoned',state.clock.tick);
 p.tripId=startTrip(state,p.id,abandoned?'abandonedExit':'officeExit').id;p.goal={kind:'exit'};p.journey=null;
 if(p.state==='waitingForElevator')cancelElevatorRequest(state,p.location.entryId,'goalChanged');
 if(p.state==='ridingElevator'){p.replanAfterCurrentLeg=true;state.trips[p.tripId]!.openSegment={kind:'riding',startTick:state.clock.tick};return;}
 if(p.state==='walking'||p.state==='takingStairs'){p.replanAfterCurrentLeg=true;state.trips[p.tripId]!.openSegment={kind:p.state==='takingStairs'?'stair':'walking',startTick:state.clock.tick};return;}
 if(p.location.kind==='facility'){const o=state.offices[p.location.facilityId]!;transition(p,{state:'entering',location:{kind:'anchor',at:{floor:o.floor,x2:o.entranceX2}}});}
 else if(p.state==='stranded')transition(p,{state:'entering',location:p.location});
 pursueGoal(state,p);
}
/** Finish a supported walk after same-tick departures, then reconsider the current live goal. */
export function completeWalk(state:GameState,p:Occupant):void {if(p.location.kind!=='walkEdge'&&p.location.kind!=='stair')return;const at=p.location.to;if(p.tripId)closeSegment(state.trips[p.tripId]!,state.clock.tick);transition(p,{state:'entering',location:{kind:'anchor',at:{...at}}});p.replanAfterCurrentLeg=false;pursueGoal(state,p);}
