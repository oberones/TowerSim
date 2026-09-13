import { queueIndex } from '../transportation/elevators/queue-index';
import { buildGraph } from '../navigation/graph';
import { RouteCache } from '../navigation/route-cache';
import { activeIndex } from '../occupants/active-index';
import { buildWalkingSpace } from '../world/walking-space';
import { Scheduler } from '../core/events/scheduler';
import type { GameState } from './game-state';
import type { RuntimeContext } from './runtime';
import { assertState } from './validate-state';
/** Validate a boundary and rebuild disposable scheduler/walking indices without changing state or RNG. */
export function rebuildDerived(state:GameState):RuntimeContext {assertState(state);return {queues:queueIndex(state),...activeIndex(state),graph:buildGraph(state),routes:new RouteCache(state.scenario.content?.routing.routeCacheEntries??1),walking:buildWalkingSpace(state),scheduler:new Scheduler(state.scheduledEvents,state.clock.tick)};}
