import type { GameState } from '../../state/game-state';
import type { Direction,ElevatorQueue,QueueEntry } from './types';
/** Find an explicit directional stop queue without inventing terminal-direction requests. */
export function stopQueue(state:GameState,stopId:string,direction:Direction):ElevatorQueue|null {const stop=state.stops[stopId];return stop?state.queues[direction==='up'?stop.upQueueId:stop.downQueueId]??null:null;}
/** Locate a persistent entry and its single queue for request cancellation and transfer completion. */
export function findEntry(state:GameState,entryId:string):{queue:ElevatorQueue;entry:QueueEntry}|null {for(const queue of Object.values(state.queues)){const entry=queue.entries.find(e=>e.id===entryId);if(entry)return {queue,entry};}return null;}
/** Derive current queue age without updating every waiting person on each tick. */
export function waitingTicks(state:GameState,entry:QueueEntry):number {return state.clock.tick-entry.joinedTick;}
