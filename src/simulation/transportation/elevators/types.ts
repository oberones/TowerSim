export type Direction='up'|'down';
export interface Shaft {id:string;definitionId:'elevator.standard';x:number;width:number;minFloor:number;maxFloor:number;serviceId:string;servedMinFloor:number;servedMaxFloor:number;stopIds:string[];carIds:[string];createdTick:number;costSinceTick:number;costGeneration:number}
export interface ElevatorStop {id:string;shaftId:string;serviceId:string;floor:number;anchorX2:number;upQueueId:string;downQueueId:string}
export interface QueueEntry {id:string;occupantId:string;tripId:string;unloadStopId:string;joinedTick:number;admissionSequence:number;reservedVisitId:string|null;lastDeniedVisitId:string|null}
export interface ElevatorQueue {id:string;serviceId:string;stopId:string;direction:Direction;entries:QueueEntry[]}
export interface Passenger {occupantId:string;unloadStopId:string;boardedTick:number}
export interface ServiceVisit {id:string;stopId:string;direction:Direction;cutoffTick:number|null;unloading:Passenger[];unloadCursor:number;boarding:{entryId:string;occupantId:string;unloadStopId:string;admissionSequence:number;status:'pending'|'boarded'|'denied'|'canceled'}[];boardCursor:number}
export type CarPhase='idle'|'starting'|'moving'|'leveling'|'opening'|'unloading'|'boarding'|'dwell'|'closing';
export interface ElevatorCar {id:string;shaftId:string;serviceId:string;capacity:8;generation:number;phase:CarPhase;phaseStartTick:number;phaseDurationTicks:number;currentFloor:number;direction:Direction|null;targetStopId:string|null;segment:{fromFloor:number;toFloor:number;startTick:number;durationTicks:number}|null;onboard:Passenger[];visit:ServiceVisit|null}
