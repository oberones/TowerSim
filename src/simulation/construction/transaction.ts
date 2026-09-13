import type { GameState } from '../state/game-state';
import type { CommandResult, FloorKind, FloorPayload } from '../commands/types';
import { quoteFloor } from './floors';
import { allocateId } from '../core/ids/allocator';
import { prepareState } from '../state/transaction';
import { normalizeRanges, subtractRange } from '../world/ranges';
import { post } from '../economy/ledger';
import { topologyChanged } from '../world/topology-change';
/** Stage geometry, allocations, finance and topology together; publish only after every step succeeds. */
export function commitFloor(state:GameState,kind:FloorKind,payload:FloorPayload,sequence:number):CommandResult {
  const validation=quoteFloor(state,kind,payload);if(!validation.ok || !validation.quote)return validation;
  const quote=validation.quote;let chargeFailure:CommandResult|undefined;
  try {
  const completed=prepareState(state,draft=>{
  const tower=draft.tower!;let floor=tower.floors.find(f=>f.level===payload.floor);
  if(!floor){floor={id:allocateId('floor',draft.ids.entity),level:payload.floor,constructedRanges:[]};tower.floors.push(floor);tower.floors.sort((a,b)=>a.level-b.level);}
  floor.constructedRanges=kind==='constructFloorRange'?normalizeRanges([...floor.constructedRanges,{startX:payload.startX,endXExclusive:payload.endXExclusive}]):subtractRange(floor.constructedRanges,payload);
  if(floor.constructedRanges.length===0)tower.floors=tower.floors.filter(f=>f!==floor);
  if(quote.cashDeltaMinor!==0){const result=post(draft,{source:`construction:command:${sequence}:floor:${payload.floor}:${payload.startX}-${payload.endXExclusive}`,amountMinor:quote.cashDeltaMinor});if(!result.ok){chargeFailure={ok:false,code:result.code==='overflow'?'overflow':'invalidCommand',message:'The construction charge could not be posted.'};throw Error(chargeFailure.message);}}
  topologyChanged(draft);
  });Object.assign(state,completed);
  return {...validation,code:'applied'};
  }catch{return chargeFailure??{ok:false,code:'overflow',message:'The complete floor edit could not settle within safe limits.'};}
}
