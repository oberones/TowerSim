import type { GameState } from '../state/game-state';
import type { ElevatorQueue } from '../transportation/elevators/types';
/** Count actual FIFO predecessors when staying; joining waits behind every existing local admission and approach. */
export function elevatorWaitCost(state:GameState,queue:ElevatorQueue,approaching:number,occupantId?:string):number {const position=queue.entries.findIndex(e=>e.occupantId===occupantId),ahead=position>=0?position:queue.entries.length+approaching,cycle=state.scenario.content!.routing.nominalCycleTicks;return Math.ceil(cycle/2)+Math.floor(ahead/state.scenario.content!.standardCarCapacity)*cycle;}
