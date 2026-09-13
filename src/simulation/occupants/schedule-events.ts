import { countWork } from '../core/work-counters';
import type { GameState } from '../state/game-state';
import type { KernelEvent } from '../core/events/event';
import { allocateId } from '../core/ids/allocator';
import { add,tick } from '../core/values';
import { compareEvents } from '../core/events/event';
import type { Scheduler } from '../core/events/scheduler';
const schedules=new WeakMap<GameState,Scheduler<KernelEvent>>();
/** Bind an unpublished tick to its owned heap; a failed tick discards that heap before further advancement. */
export function withEventSchedule<T>(state:GameState,scheduler:Scheduler<KernelEvent>,run:()=>T):T {schedules.set(state,scheduler);try{return run();}finally{schedules.delete(state);}}
/** Insert a future lifecycle wakeup with durable ordering and an explicit owner generation. */
export function scheduleEvent(state:GameState,kind:KernelEvent['kind'],targetId:string,targetGeneration:number,dueTick:number):void {
 countWork('eventsScheduled');tick(dueTick);if(dueTick<=state.clock.tick)throw Error('Wakeup must be future');
 const phasePriority=kind==='dayBoundary'?0:(kind==='workerDeparture'||kind==='customerVisitEnd')?10:kind==='dailyReview'?20:(kind==='workerArrival'||kind==='customerArrival')?30:40;
 const event={id:allocateId('event',state.ids.event),kind,targetId,targetGeneration,dueTick,phasePriority,sequence:state.ids.eventSequence.next,payload:{}} as KernelEvent;
 state.ids.eventSequence.next=add(state.ids.eventSequence.next,1);
 const scheduler=schedules.get(state);if(scheduler){scheduler.insert(event,state.clock.tick);return;}
 // Command transactions use the same canonical order without sorting all pending events after each insert.
 let low=0,high=state.scheduledEvents.length;while(low<high){const middle=(low+high)>>>1;if(compareEvents(state.scheduledEvents[middle]!,event)<0)low=middle+1;else high=middle;}state.scheduledEvents.splice(low,0,event);
}
/** Remove obsolete owner wakeups physically instead of retaining lifecycle tombstones. */
export function cancelEvents(state:GameState,ownerId:string,kind?:KernelEvent['kind']):void {const scheduler=schedules.get(state);if(scheduler){scheduler.cancelKind(ownerId,kind);return;}state.scheduledEvents=state.scheduledEvents.filter(e=>e.targetId!==ownerId||(kind!==undefined&&e.kind!==kind));}
