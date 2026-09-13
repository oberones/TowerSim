import { maintainDayEvidence } from '../progression/day-evidence';
import { reconcileTopology } from '../navigation/reconcile-topology';
import { reconcileOfficeAccess } from '../facilities/office-lifecycle';
import type { GameState } from '../state/game-state';
import { add } from '../core/values';
import { buildWalkingSpace } from './walking-space';
import { resolveCars } from '../transportation/elevators/car';
/** Publish one topology revision and synchronously reconstruct the current slice's access primitives. */
export function topologyChanged(draft:GameState):void {
 draft.navigation.topologyVersion=add(draft.navigation.topologyVersion,1);
 buildWalkingSpace(draft);reconcileOfficeAccess(draft);reconcileTopology(draft);maintainDayEvidence(draft);
 // Any geometry edit can recover a traveler directly into a queue at their current
 // landing. Wake idle cars in this transaction so the event-driven runner has a
 // future service completion instead of sleeping until an unrelated daily event.
 resolveCars(draft);
}
