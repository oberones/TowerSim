import type { GameState } from '../state/game-state';
import type { FloorPayload } from '../commands/types';
/** Protect real anchors and every cell crossed by a committed walk, including its not-yet-reached endpoint. */
export function occupiedFloorSpan(state:GameState,p:FloorPayload):boolean {return Object.values(state.occupants).some(o=>o.location.kind==='walkEdge'?o.location.from.floor===p.floor&&Math.min(o.location.from.x2,o.location.to.x2)<p.endXExclusive*2&&Math.max(o.location.from.x2,o.location.to.x2)>=p.startX*2:o.location.kind==='anchor'&&o.location.at.floor===p.floor&&o.location.at.x2>=p.startX*2&&o.location.at.x2<p.endXExclusive*2);}
