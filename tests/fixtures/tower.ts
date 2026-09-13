import { createGame, applyCommand } from '../../src/simulation';
import type { GameState } from '../../src/simulation';
import { MVP_DEFAULT } from '../../src/content/scenarios/mvp-default';
import { SEEDS } from './seeds';
/** Create configurable test sites through the validated production new-game boundary. */
export function tower(input:unknown=MVP_DEFAULT):GameState {return createGame(input,SEEDS[0]);}
/** Submit floor edits through exactly the same ordered ingress as the player. */
export function floor(s:GameState,level:number,startX:number,endXExclusive:number,remove=false){return applyCommand(s,{kind:remove?'demolishFloorRange':'constructFloorRange',payload:{floor:level,startX,endXExclusive},sequence:s.lastCommandSequence+1,atTick:s.clock.tick});}
