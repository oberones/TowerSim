import { add, tick, DomainError } from '../values';
import { allocateId } from '../ids/allocator';
import { Scheduler } from '../events/scheduler';
import type { KernelEvent } from '../events/event';
import { runBoundary } from '../events/phases';
import type { GameState } from '../../state/game-state';
import { assertState } from '../../state/validate-state';
import { clonePlain } from '../../state/plain';
export type AdvanceResult={ok:true;advanced:number;atTick:number}|{ok:false;code:'invalidNumber'|'overflow'|'invalidState';advanced:number;atTick:number};
/** Allocate a future recurring event on the unpublished boundary draft using durable sequence counters. */
function schedule(state:GameState,heap:Scheduler<KernelEvent>,kind:KernelEvent['kind'],dueTick:number):void {
  const event={id:allocateId('event',state.ids.event),dueTick,sequence:state.ids.eventSequence.next,
    targetId:'kernel:1',targetGeneration:0,payload:{}};
  state.ids.eventSequence.next=add(state.ids.eventSequence.next,1);
  heap.insert(kind==='dayBoundary' ? {...event,kind,phasePriority:0} : {...event,kind,phasePriority:20},state.clock.tick);
}
/** Consume the current recurring event and schedule its next occurrence exactly once. */
function processEvent(state:GameState,heap:Scheduler<KernelEvent>):void {
  const event=heap.pop()!;
  if(event.targetId!=='kernel:1' || event.targetGeneration!==0)return;
  if(event.kind==='dayBoundary') {
    // One owner for future settlement/report/evaluation/reset, introduced by owning stories.
    state.clock.lastDayBoundaryTick=state.clock.tick;
  }
  schedule(state,heap,event.kind,add(event.dueTick,state.scenario.dayTicks));
}
/** Publish only completed boundaries; event failures retain the preceding tick. */
export function advance(state: GameState, count: number): AdvanceResult {
  let advanced = 0;
  try {
    assertState(state);
    tick(count);
    add(state.clock.tick, count); // Preflight the entire requested range before mutation.
    if (count === 0) return { ok: true, advanced, atTick: state.clock.tick };

    let next = state.clock.tick;
    let draft = state;
    let heap: Scheduler<KernelEvent> | undefined;
    /** Find the next due boundary without rebuilding the scheduler on ordinary idle ticks. */
    const earliestEvent = () => Math.min(...state.scheduledEvents.map(event => event.dueTick));
    let nextEventTick = earliestEvent();
    // Construct the phase callbacks once per call, outside the per-tick hot loop.
    // Movement/completions/decisions gain real owners in the later story tasks.
    const phases = {
      integrate: () => {},
      boundary: () => {
        draft.clock.tick = next;
        while (heap?.peek()?.dueTick === next && heap.peek()?.phasePriority === 0) {
          processEvent(draft, heap);
        }
      },
      events: () => {
        while (heap?.peek()?.dueTick === next) processEvent(draft, heap);
      },
      completions: () => {},
      decisions: () => {},
      commit: () => {
        if (heap) {
          draft.scheduledEvents = heap.exportSorted();
          Object.assign(state, {
            clock: draft.clock,
            ids: draft.ids,
            scheduledEvents: draft.scheduledEvents,
          });
          nextEventTick = earliestEvent();
        }
      },
    };
    for (; advanced < count; advanced++) {
      next = state.clock.tick + 1; // Safe because the requested end tick was checked above.
      const needsEvents = state.clock.initialReviewPending || nextEventTick <= next;
      // Phase 2 has no active movement. Event boundaries use a detached draft for rollback;
      // ordinary ticks change only the clock. Stateful story handlers must extend staging.
      draft = needsEvents ? clonePlain(state) : state;
      heap = needsEvents ? new Scheduler(draft.scheduledEvents, draft.clock.tick) : undefined;
      if (draft.clock.initialReviewPending && heap) {
        schedule(draft, heap, 'dailyReview', add(draft.clock.tick, draft.scenario.dayTicks));
        draft.clock.initialReviewPending = false;
      }
      runBoundary(phases);
    }
    return { ok: true, advanced, atTick: state.clock.tick };
  } catch (error) {
    return {
      ok: false,
      code: error instanceof DomainError ? error.code : 'invalidState',
      advanced,
      atTick: state.clock.tick,
    };
  }
}
