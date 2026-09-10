import type { GameState } from '../state/game-state';
import type { FloorKind, FloorPayload, CommandResult } from './types';
import { commitFloor } from '../construction/transaction';
/** Route a validated envelope into the atomic floor transaction with its unique command identity. */
export function applyFloorCommand(state:GameState,kind:FloorKind,payload:FloorPayload,sequence:number):CommandResult {return commitFloor(state,kind,payload,sequence);}
