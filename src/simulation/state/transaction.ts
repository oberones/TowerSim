import {createDraft} from './draft';
import type {GameState} from './game-state';
import {Scheduler} from '../core/events/scheduler';
import {withEventSchedule} from '../occupants/schedule-events';
import {publishQueueIndex} from '../transportation/elevators/queue-index';
/** Prepare a complete command candidate with one private indexed schedule and copy-on-write records.
 * Callers may discard this result for a preview or publish it once after success. A throw
 * abandons geometry, accounting, pending wakeups and all derived draft-only indices together.
 */
export function prepareState(state:GameState,change:(draft:GameState)=>void):GameState {
 const transaction=createDraft(state,Object.isFrozen(state.scenario)?[state.scenario]:[]),draft=transaction.value,heap=Scheduler.fromOwned(state.scheduledEvents,state.clock.tick);
 withEventSchedule(draft,heap,()=>change(draft));
 const queues=draft.queues,completed={...transaction.finish(),scheduledEvents:heap.ownedSnapshot()};
 publishQueueIndex(queues,completed.queues);return completed;
}
