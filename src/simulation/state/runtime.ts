import type { QueueIndex } from '../transportation/elevators/queue-index';
import type { WalkGraph } from '../navigation/graph';
import type { RouteCache } from '../navigation/route-cache';
import type { WalkingSpace } from '../world/walking-space';
import type { Scheduler } from '../core/events/scheduler';
import type { KernelEvent } from '../core/events/event';
/** Derived, disposable indices. Never serialized into GameState. */
export interface RuntimeContext { queues:QueueIndex; scheduler:Scheduler<KernelEvent>; walking:WalkingSpace|null; graph:WalkGraph; routes:RouteCache; active:Set<string>; dormant:Set<string> }
