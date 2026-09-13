import type { GameState } from '../../state/game-state';
import type { ElevatorCar,CarPhase } from './types';
import type { DispatchView } from './dispatch-policy';
import { collectiveSweep } from './collective-sweep';
import { scheduleEvent } from '../../occupants/schedule-events';
import { add } from '../../core/values';
import { compareIds } from '../../core/ids/allocator';
import { createVisit,freezeBoarding,completeUnload,completeBoard } from './service-visit';
/** Derive controller requests from live queue membership and protected onboard destinations. */
export function dispatchView(state:GameState,car:ElevatorCar,phase:DispatchView['phase'],skipCurrent=false):DispatchView {return {phase,currentFloor:car.currentFloor,direction:car.direction,onboardFloors:car.onboard.map(o=>state.stops[o.unloadStopId]!.floor),stops:state.shafts[car.shaftId]!.stopIds.map(id=>({id,floor:state.stops[id]!.floor})),calls:Object.values(state.queues).filter(q=>q.serviceId===car.serviceId&&q.entries.length).map(q=>({floor:state.stops[q.stopId]!.floor,direction:q.direction,admissionSequence:q.entries[0]!.admissionSequence})),skipCurrent};}
/** Start a positive-duration car phase with exactly one durable future completion. */
function phase(state:GameState,car:ElevatorCar,kind:CarPhase,duration:number):void {car.phase=kind;car.phaseStartTick=state.clock.tick;car.phaseDurationTicks=duration;scheduleEvent(state,'carComplete',car.id,car.generation,add(state.clock.tick,duration));}
/** Put an empty car to sleep at its actual current landing, retaining no movement or service cursor. */
function idle(state:GameState,car:ElevatorCar):void {if(car.onboard.length)throw Error('Loaded car cannot idle');car.phase='idle';car.phaseStartTick=state.clock.tick;car.phaseDurationTicks=0;car.direction=null;car.targetStopId=null;car.segment=null;car.visit=null;}
/** Begin the next adjacent segment, paying no second start allowance at pass-through floors. */
function move(state:GameState,car:ElevatorCar):void {const timing=state.scenario.content!.elevatorTiming;car.segment={fromFloor:car.currentFloor,toFloor:car.currentFloor+(car.direction==='up'?1:-1),startTick:state.clock.tick,durationTicks:timing.floorTicks};phase(state,car,'moving',timing.floorTicks);}
/** Apply sweep decisions only at stopped or crossing boundaries; direction never changes mid-segment. */
function dispatchCar(state:GameState,car:ElevatorCar,crossing=false,skipCurrent=false):void {const decision=collectiveSweep(dispatchView(state,car,crossing?'crossing':car.phase==='idle'?'idle':'stopped',skipCurrent));if(decision.kind==='idle'){idle(state,car);return;}car.direction=decision.direction;car.targetStopId=decision.stopId;if(decision.kind==='serveHere'){phase(state,car,'leveling',state.scenario.content!.elevatorTiming.levelTicks);return;}if(crossing)move(state,car);else phase(state,car,'starting',state.scenario.content!.elevatorTiming.startTicks);}
/** Skip processed administrative rows while keeping each actual passenger transfer positive in time. */
function boardingPhase(state:GameState,car:ElevatorCar):void {const visit=car.visit!;freezeBoarding(state,car);while(visit.boardCursor<visit.boarding.length&&visit.boarding[visit.boardCursor]!.status!=='pending')visit.boardCursor++;const timing=state.scenario.content!.elevatorTiming;if(visit.boardCursor<visit.boarding.length)phase(state,car,'boarding',timing.boardTicks);else phase(state,car,'dwell',timing.dwellTicks);}
/** Complete one car phase after due departures and walking endpoints, preserving unloaded-before-boarded order. */
export function completeCarPhase(state:GameState,car:ElevatorCar):void {
 const t=state.scenario.content!.elevatorTiming;
 switch(car.phase){
 case 'starting':move(state,car);break;
 case 'moving':car.currentFloor=car.segment!.toFloor;car.segment=null;dispatchCar(state,car,true);break;
 case 'leveling':createVisit(state,car);phase(state,car,'opening',t.openTicks);break;
 case 'opening':if(car.visit!.unloading.length)phase(state,car,'unloading',t.unloadTicks);else{car.phase='boarding';car.phaseDurationTicks=0;}break;
 case 'unloading':completeUnload(state,car);if(car.visit!.unloadCursor<car.visit!.unloading.length)phase(state,car,'unloading',t.unloadTicks);else{car.phase='boarding';car.phaseDurationTicks=0;}break;
 case 'boarding':completeBoard(state,car);car.phaseDurationTicks=0;break;
 case 'dwell':phase(state,car,'closing',t.closeTicks);break;
 case 'closing':car.visit=null;dispatchCar(state,car,false,true);break;
 case 'idle':throw Error('Idle car cannot own a completion');
 }
}
/** Resolve idle requests and freeze new boarding cutoffs after all physical arrivals at this boundary. */
export function resolveCars(state:GameState):void {for(const car of Object.values(state.cars).sort((a,b)=>compareIds(a.id,b.id))){if(car.phase==='idle')dispatchCar(state,car);else if(car.phase==='boarding'&&car.phaseDurationTicks===0)boardingPhase(state,car);}}
/** Interpolate logical car position from its persisted adjacent segment without mutating progress. */
export function carPosition(car:ElevatorCar,atTick:number):number {const s=car.segment;if(!s)return car.currentFloor;const ratio=Math.max(0,Math.min(1,(atTick-s.startTick)/s.durationTicks));return s.fromFloor+(s.toFloor-s.fromFloor)*ratio;}
