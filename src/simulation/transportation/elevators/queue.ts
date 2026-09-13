import { changeCohortQueue } from '../../metrics/cohort-report';
import { queueIndex } from './queue-index';
import type { GameState } from '../../state/game-state';
import type { Direction,ElevatorQueue,QueueEntry } from './types';
/** Find an explicit directional stop queue without inventing terminal-direction requests. */
export function stopQueue(state:GameState,stopId:string,direction:Direction):ElevatorQueue|null {const stop=state.stops[stopId];return stop?state.queues[direction==='up'?stop.upQueueId:stop.downQueueId]??null:null;}
/** Locate a persistent entry and its single queue for request cancellation and transfer completion. */
export function findEntry(state:GameState,entryId:string):{queue:ElevatorQueue;entry:QueueEntry}|null {return queueIndex(state).entry(entryId)??null;}
/** Derive current queue age without updating every waiting person on each tick. */
export function waitingTicks(state:GameState,entry:QueueEntry):number {return state.clock.tick-entry.joinedTick;}

/** Append one monotonic admission while keeping derived membership and join-time sums synchronized. */
export function appendEntry(state:GameState,queue:ElevatorQueue,entry:QueueEntry):void {const index=queueIndex(state);if((queue.entries.at(-1)?.admissionSequence??0)>=entry.admissionSequence)throw Error('Admission order reversed');index.add(queue,entry);queue.entries.push(entry);changeCohortQueue(state,entry,1);}
/** Remove one request by identity and preserve FIFO order for the remaining queue. */
export function removeEntry(state:GameState,entryId:string):void {const found=queueIndex(state).remove(entryId);if(found)changeCohortQueue(state,found.entry,-1);}
