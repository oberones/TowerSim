import type { WalkingSpace } from '../world/walking-space';
import type { Scheduler } from '../core/events/scheduler';
import type { KernelEvent } from '../core/events/event';
/** Derived, disposable indices. Never serialized into GameState. */
export interface RuntimeContext { scheduler:Scheduler<KernelEvent>; walking:WalkingSpace|null }
