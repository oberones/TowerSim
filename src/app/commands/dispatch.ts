import { applyCommand } from '../../simulation';
import type { GameState, Command, CommandResult } from '../../simulation';
import { add } from '../../simulation/core/values';
/** Deliver one intent at the current completed boundary with the next durable command sequence. */
export function dispatch(state:GameState,command:Command):CommandResult {return applyCommand(state,{...command,sequence:add(state.lastCommandSequence,1),atTick:state.clock.tick});}
