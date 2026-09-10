import type { GameState } from './game-state';
import { validateState } from './validate-state';
import { DomainError } from '../core/values';
export type SaveStateDTO=GameState;
/** Validate and detach a completed authoritative boundary without browser metadata or runtime indices. */
export function captureState(state:GameState):SaveStateDTO {
  const result=validateState(state);if(!result.ok)throw new DomainError('invalidState',result.errors.join('; '));return result.state;
}
/** Recursively sort record keys while retaining semantically meaningful array order. */
function canonical(value:unknown):unknown {
  if(Array.isArray(value))return value.map(canonical);
  if(value && typeof value==='object')return Object.fromEntries(Object.entries(value).sort(([a],[b])=>a<b ? -1 : a>b ? 1 : 0).map(([key,child])=>[key,canonical(child)]));
  return value;
}
/** Encode a validated detached boundary as deterministic canonical JSON. */
export function encodeState(state:GameState):string {return JSON.stringify(canonical(captureState(state)));}
/** Parse and validate an unknown JSON snapshot before returning any candidate game state. */
export function decodeState(text:string):GameState {
  let value:unknown;try{value=JSON.parse(text);}catch{throw new DomainError('invalidState','Malformed state JSON');}
  const result=validateState(value);if(!result.ok)throw new DomainError('invalidState',result.errors.join('; '));return result.state;
}
