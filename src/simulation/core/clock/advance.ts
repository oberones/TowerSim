import { evaluateProgression } from '../../progression/evaluate';
import { beginProgressionDay } from '../../progression/day-evidence';
import { arriveCustomer,departCustomer } from '../../occupants/customer-lifecycle';
import { finalizeFinanceDay } from '../../economy/history';
import { finalizeTransportDay } from '../../metrics/daily-report';
import { completeCarPhase,resolveCars } from '../../transportation/elevators/car';
import { settleShaft } from '../../transportation/elevators/shaft';
import { compareIds } from '../ids/allocator';
import { Scheduler } from '../events/scheduler';
import { add, tick, DomainError } from '../values';
import type { KernelEvent } from '../events/event';
import { compareEvents } from '../events/event';
import type { GameState } from '../../state/game-state';
import { assertState } from '../../state/validate-state';
import { clonePlain } from '../../state/plain';
import { scheduleEvent } from '../../occupants/schedule-events';
import { dailyReview } from '../../demand/daily-review';
import { settleOffices } from '../../economy/settlement';
import { arriveWorker,departWorker,completeWalk } from '../../occupants/facility-transitions';
import { pruneTrips } from '../../metrics/trips';
const heaps=new WeakMap<GameState['scheduledEvents'],Scheduler<KernelEvent>>();
/** Reuse the immutable pending-event heap until a lifecycle boundary publishes a replacement list. */
function nextDue(state:GameState):number {let heap=heaps.get(state.scheduledEvents);if(!heap){heap=new Scheduler(state.scheduledEvents,state.clock.tick);heaps.set(state.scheduledEvents,heap);}return heap.peek()?.dueTick??Infinity;}
export type AdvanceResult={ok:true;advanced:number;atTick:number}|{ok:false;code:'invalidNumber'|'overflow'|'invalidState';advanced:number;atTick:number};
/** Dispatch ordered wakeups on an unpublished boundary; departures precede endpoint admission. */
function processEvent(state:GameState,event:KernelEvent):void {
 if(event.kind==='dayBoundary'){finalizeTransportDay(state);settleOffices(state);for(const shaft of Object.values(state.shafts))settleShaft(state,shaft);pruneTrips(state);finalizeFinanceDay(state);evaluateProgression(state);beginProgressionDay(state);state.clock.lastDayBoundaryTick=state.clock.tick;scheduleEvent(state,event.kind,'kernel:1',0,add(event.dueTick,state.scenario.dayTicks));}
 else if(event.kind==='dailyReview'){dailyReview(state);scheduleEvent(state,event.kind,'kernel:1',0,add(event.dueTick,state.scenario.dayTicks));}
 else if(event.kind==='carComplete'){const car=state.cars[event.targetId];if(car&&car.generation===event.targetGeneration)completeCarPhase(state,car);}
 else{const p=state.occupants[event.targetId];if(!p||p.generation!==event.targetGeneration)return;if(event.kind==='customerArrival')arriveCustomer(state,p);else if(event.kind==='customerVisitEnd')departCustomer(state,p);else if(event.kind==='workerArrival')arriveWorker(state,p);else if(event.kind==='workerDeparture')departWorker(state,p);else completeWalk(state,p);}
}
/** Advance every integer interval exactly; timestamp-based walking permits coalescing intervals with no transitions. */
function advanceOwned(state:GameState,count:number,validate:boolean):AdvanceResult {
 const start=state.clock.tick;
 try{if(validate){assertState(state);heaps.delete(state.scheduledEvents);}tick(count);const end=add(start,count);if(count===0)return {ok:true,advanced:0,atTick:start};
 while(state.clock.tick<end){
 const bootstrap=state.clock.initialReviewPending;
 const due=nextDue(state);
 const next=bootstrap?state.clock.tick+1:Math.min(end,due);
 if(!bootstrap&&due>next){state.clock.tick=next;continue;}
 if(!bootstrap&&next>state.clock.tick+1)state.clock.tick=next-1;
 const draft=clonePlain(state);
 if(bootstrap){dailyReview(draft);scheduleEvent(draft,'dailyReview','kernel:1',0,add(draft.clock.tick,draft.scenario.dayTicks));draft.clock.initialReviewPending=false;}
 draft.clock.tick=next;draft.scheduledEvents.sort(compareEvents);
 const dueEvents=draft.scheduledEvents.filter(e=>e.dueTick===next);draft.scheduledEvents=draft.scheduledEvents.filter(e=>e.dueTick!==next);
 for(const event of dueEvents.filter(e=>e.kind!=='walkComplete'&&e.kind!=='carComplete'))processEvent(draft,event);
 for(const event of dueEvents.filter(e=>e.kind==='walkComplete').sort((a,b)=>compareIds(a.targetId,b.targetId)))processEvent(draft,event);
 for(const event of dueEvents.filter(e=>e.kind==='carComplete').sort((a,b)=>(draft.cars[a.targetId]?.phase==='unloading'?-1:0)-(draft.cars[b.targetId]?.phase==='unloading'?-1:0)||compareIds(a.targetId,b.targetId)))processEvent(draft,event);
 resolveCars(draft);
 Object.assign(state,draft);
 }
 return {ok:true,advanced:state.clock.tick-start,atTick:state.clock.tick};
 }catch(error){return {ok:false,code:error instanceof DomainError?error.code:'invalidState',advanced:state.clock.tick-start,atTick:state.clock.tick};}
}

/** Validate arbitrary external state before advancing through the public headless boundary. */
export function advance(state:GameState,count:number):AdvanceResult {return advanceOwned(state,count,true);}
/** Validate a privately owned runtime once; callers must use domain commands for all subsequent mutations. */
export function createRunner(state:GameState){assertState(state);nextDue(state);return {advance:(count:number)=>advanceOwned(state,count,false)};}
