import type { GameState } from '../state/game-state';
import type { ElevatorQueue } from '../transportation/elevators/types';
import {queueIndex} from '../transportation/elevators/queue-index';
/** Freeze the decision maker's local FIFO position and scalar rules once for a complete boarding-cost view. */
export function routeWaitCosts(state:GameState,occupantId?:string):(queueId:string,approaching:number)=>number {
 const index=queueIndex(state),member=occupantId?index.person(occupantId):undefined,ownQueue=member?.queue.id,position=member?.position;
 const content=state.scenario.content!,cycle=content.routing.nominalCycleTicks,capacity=content.standardCarCapacity;
 return (queueId,approaching)=>Math.ceil(cycle/2)+Math.floor((ownQueue===queueId?position!:index.count(queueId)+approaching)/capacity)*cycle;
}
/** Count actual FIFO predecessors when staying; joining waits behind every existing local admission and approach. */
export function elevatorWaitCost(state:GameState,queue:ElevatorQueue,approaching:number,occupantId?:string):number {const member=occupantId?queueIndex(state).person(occupantId):undefined,ahead=member?.queue.id===queue.id?member.position:queue.entries.length+approaching,cycle=state.scenario.content!.routing.nominalCycleTicks;return Math.ceil(cycle/2)+Math.floor(ahead/state.scenario.content!.standardCarCapacity)*cycle;}
