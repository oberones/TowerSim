import { quoteShaft,quoteService,quoteShaftRemoval } from '../transportation/elevators/shaft';
import type { ShaftPayload,ServicePayload } from '../transportation/elevators/shaft';
import { commitElevator } from './elevator-commands';
import { quoteStair,quoteStairRemoval } from '../transportation/stairs/stairs';
import type { StairPayload } from '../transportation/stairs/stairs';
import { commitStair } from './stair-commands';
import { quoteFacility,quoteOfficeRemoval,commitFacility } from '../facilities/place-facility';
import type { FacilityPayload } from '../facilities/place-facility';
import { quoteFloor } from '../construction/floors';
import { applyFloorCommand } from './floor-commands';
import type { FloorKind, FloorPayload } from './types';
import type { GameState } from '../state/game-state';
import { assertPlain, record } from '../state/plain';
import type { CommandResult } from './types';
const fields:Record<string,readonly string[]>={
  constructFloorRange:['floor','startX','endXExclusive'],demolishFloorRange:['floor','startX','endXExclusive'],
  placeFacility:['definitionId','floor','x'],buildStair:['definitionId','lowerFloor','x'],
  buildElevatorShaft:['definitionId','x','minFloor','maxFloor','servedMinFloor','servedMaxFloor'],
  setElevatorServiceRange:['shaftId','minFloor','maxFloor'],demolishEntity:['entityId'],
};
/** Reject non-plain or malformed command envelopes before any sequencing metadata is consumed. */
function envelope(value:unknown):Record<string,unknown> {
  assertPlain(value);const command=record(value,['sequence','atTick','kind','payload']);
  if(typeof command.sequence!=='number' || !Number.isSafeInteger(command.sequence) || command.sequence<=0 || typeof command.atTick!=='number' || !Number.isSafeInteger(command.atTick) || command.atTick<0)throw Error('Invalid envelope');return command;
}
/** Validate the closed command payload, then invoke its pure implemented gameplay validator. */
function proposal(state:GameState,command:Record<string,unknown>):CommandResult {
  if(typeof command.kind!=='string' || !Object.hasOwn(fields,command.kind))return {ok:false,code:'unknownCommand'};
  try {
    const payload=record(command.payload,fields[command.kind]!);
    for(const [key,value] of Object.entries(payload)) {
      if(key.endsWith('Id') ? typeof value!=='string' || value.length===0 : typeof value!=='number' || !Number.isSafeInteger(value))return {ok:false,code:'invalidCommand'};
    }
  }catch{return {ok:false,code:'invalidCommand'};}
  if(command.kind==='constructFloorRange'||command.kind==='demolishFloorRange')return quoteFloor(state,command.kind,command.payload as FloorPayload);
  if(command.kind==='placeFacility')return quoteFacility(state,command.payload as FacilityPayload);
  if(command.kind==='buildElevatorShaft')return quoteShaft(state,command.payload as ShaftPayload);
  if(command.kind==='setElevatorServiceRange')return quoteService(state,command.payload as ServicePayload);
  if(command.kind==='demolishEntity'&&state.shafts[(command.payload as {entityId:string}).entityId])return quoteShaftRemoval(state,(command.payload as {entityId:string}).entityId);
  if(command.kind==='buildStair')return quoteStair(state,command.payload as StairPayload);
  if(command.kind==='demolishEntity'&&state.stairs[(command.payload as {entityId:string}).entityId])return quoteStairRemoval(state,(command.payload as {entityId:string}).entityId);
  if(command.kind==='demolishEntity')return quoteOfficeRemoval(state,(command.payload as {entityId:string}).entityId);
  return {ok:false,code:'notImplemented'};
}
/** Check current-tick sequencing and quote a command without changing any authoritative state. */
export function validateCommand(state:GameState,value:unknown):CommandResult {
  try {const command=envelope(value);
    if((command.sequence as number)<=state.lastCommandSequence)return {ok:false,code:'duplicateCommand'};
    if(command.atTick!==state.clock.tick)return {ok:false,code:'staleTick'};
    return proposal(state,command);
  }catch{return {ok:false,code:'invalidCommand'};}
}
/** Apply accepted gameplay atomically and consume well-formed new command sequences even on rejection. */
export function applyCommand(state:GameState,value:unknown):CommandResult {
  let result=validateCommand(state,value);
  if(result.ok){const command=envelope(value);result=command.kind==='buildElevatorShaft'||command.kind==='setElevatorServiceRange'?commitElevator(state,command.payload as ShaftPayload|ServicePayload,command.sequence as number):command.kind==='demolishEntity'&&state.shafts[(command.payload as {entityId:string}).entityId]?commitElevator(state,(command.payload as {entityId:string}).entityId,command.sequence as number):command.kind==='buildStair'?commitStair(state,command.payload as StairPayload,command.sequence as number):command.kind==='demolishEntity'&&state.stairs[(command.payload as {entityId:string}).entityId]?commitStair(state,(command.payload as {entityId:string}).entityId,command.sequence as number):command.kind==='placeFacility'?commitFacility(state,command.payload as FacilityPayload,command.sequence as number):command.kind==='demolishEntity'?commitFacility(state,(command.payload as {entityId:string}).entityId,command.sequence as number):applyFloorCommand(state,command.kind as FloorKind,command.payload as FloorPayload,command.sequence as number);}
  try {const command=envelope(value);if((command.sequence as number)>state.lastCommandSequence)state.lastCommandSequence=command.sequence as number;}catch { /* Invalid envelope consumes no metadata. */ }
  return result;
}
/** Expose a detached immutable kernel diagnostic projection without random draws or state mutation. */
export function query(state:GameState) {return Object.freeze({tick:state.clock.tick,seed:state.rng.seed,initialReviewPending:state.clock.initialReviewPending,pendingEvents:state.scheduledEvents.length});}
