import type { GameState } from '../state/game-state';
import type { KernelEvent } from '../core/events/event';
import { allocateId } from '../core/ids/allocator';
import { add,tick } from '../core/values';
import { compareEvents } from '../core/events/event';
/** Insert a future lifecycle wakeup with durable ordering and an explicit owner generation. */
export function scheduleEvent(state:GameState,kind:KernelEvent['kind'],targetId:string,targetGeneration:number,dueTick:number):void {
 tick(dueTick);if(dueTick<=state.clock.tick)throw Error('Wakeup must be future');
 const phasePriority=kind==='dayBoundary'?0:(kind==='workerDeparture'||kind==='customerVisitEnd')?10:kind==='dailyReview'?20:(kind==='workerArrival'||kind==='customerArrival')?30:40;
 const event={id:allocateId('event',state.ids.event),kind,targetId,targetGeneration,dueTick,phasePriority,sequence:state.ids.eventSequence.next,payload:{}} as KernelEvent;
 state.ids.eventSequence.next=add(state.ids.eventSequence.next,1);state.scheduledEvents.push(event);state.scheduledEvents.sort(compareEvents);
}
/** Remove obsolete owner wakeups physically instead of retaining lifecycle tombstones. */
export function cancelEvents(state:GameState,ownerId:string,kind?:KernelEvent['kind']):void {state.scheduledEvents=state.scheduledEvents.filter(e=>e.targetId!==ownerId||(kind!==undefined&&e.kind!==kind));}
