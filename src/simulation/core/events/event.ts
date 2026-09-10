import { assertPlain } from '../../state/plain';
import { positive, tick, DomainError } from '../values';
import { parseId } from '../ids/allocator';
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type EventPriority = 0 | 10 | 20 | 30 | 40;
export interface EventRecord {
  readonly id: string;
  dueTick: number;
  readonly phasePriority: EventPriority;
  sequence: number;
  readonly kind: string;
  readonly targetId: string;
  readonly targetGeneration: number;
  readonly payload: { [key: string]: Json };
}
export type KernelEvent = EventRecord & ({kind:'dayBoundary'; phasePriority:0} | {kind:'dailyReview'; phasePriority:20} | {kind:'workerArrival';phasePriority:30} | {kind:'workerDeparture';phasePriority:10} | {kind:'walkComplete';phasePriority:40});
/** Totally order events by due tick, phase priority and unique insertion sequence. */
export function compareEvents(a: EventRecord,b: EventRecord): number { return a.dueTick-b.dueTick || a.phasePriority-b.phasePriority || a.sequence-b.sequence; }
/** Reject invalid identities, generations, phases and nonfuture scheduled times. */
export function validateEvent(event: EventRecord, currentTick: number): void {
  assertPlain(event);
  if (parseId(event.id).kind !== 'event') throw new DomainError('invalidState','Expected event ID');
  parseId(event.targetId); positive(event.sequence); tick(event.targetGeneration); tick(currentTick); tick(event.dueTick);
  if (event.dueTick <= currentTick || ![0,10,20,30,40].includes(event.phasePriority)) throw new DomainError('invalidState','Event must be future and use a supported phase');
}
