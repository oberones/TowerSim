import { reconcileOfficeAccess } from '../facilities/office-lifecycle';
import type { GameState } from '../state/game-state';
import { add } from '../core/values';
import { buildWalkingSpace } from './walking-space';
/** Publish one topology revision and synchronously reconstruct the current slice's access primitives. */
export function topologyChanged(draft:GameState):void {draft.navigation.topologyVersion=add(draft.navigation.topologyVersion,1);buildWalkingSpace(draft);reconcileOfficeAccess(draft);}
