import type { GameState } from '../state/game-state';
import { compareIds } from '../core/ids/allocator';
/** Reconstruct disjoint active and dormant identities only at lifecycle or restore boundaries. */
export function activeIndex(state:GameState){const active=new Set<string>(),dormant=new Set<string>();for(const p of Object.values(state.occupants).sort((a,b)=>compareIds(a.id,b.id)))(p.state==='outside'||p.state==='insideFacility'?dormant:active).add(p.id);return {active,dormant};}
