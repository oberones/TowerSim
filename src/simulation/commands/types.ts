export type Command =
  | {kind:'constructFloorRange'|'demolishFloorRange';payload:{floor:number;startX:number;endXExclusive:number}}
  | {kind:'placeFacility';payload:{definitionId:string;floor:number;x:number}}
  | {kind:'buildStair';payload:{definitionId:string;lowerFloor:number;x:number}}
  | {kind:'buildElevatorShaft';payload:{definitionId:string;x:number;minFloor:number;maxFloor:number;servedMinFloor:number;servedMaxFloor:number}}
  | {kind:'setElevatorServiceRange';payload:{shaftId:string;minFloor:number;maxFloor:number}}
  | {kind:'demolishEntity';payload:{entityId:string}};
export type CommandEnvelope = Command & {sequence:number;atTick:number};
export type FloorKind='constructFloorRange'|'demolishFloorRange';
export interface FloorPayload {floor:number;startX:number;endXExclusive:number}
export interface FloorQuote {footprint:FloorPayload;constructionCostMinor:number;demolitionCostMinor:number;accruedSettlementMinor:number;cashDeltaMinor:number;topologyVersion:number}
export type CommandError = 'activeTraversal'|'loadedCar'|'invalidServiceRange'|'invalidCommand'|'duplicateCommand'|'staleTick'|'unknownCommand'|'notImplemented'|'outOfBounds'|'overlap'|'missingSupport'|'insufficientFunds'|'missingFloor'|'protectedBase'|'upperSupport'|'overflow';
export type CommandResult = {ok:true;code:'applied'|'valid';quote?:FloorQuote} | {ok:false;code:CommandError;message?:string;quote?:FloorQuote;blockingFloor?:number};
