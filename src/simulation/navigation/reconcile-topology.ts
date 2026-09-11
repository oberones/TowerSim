import { reassignWaiters } from './reassign-waiters';
import type { GameState } from '../state/game-state';
import { compareIds } from '../core/ids/allocator';
import { disruptTrip } from '../occupants/disrupted-trips';
import { pursueGoal } from '../occupants/facility-transitions';
import { transition } from '../occupants/transitions';
/** Clear future legs after edits, retain protected movement, and repair stranded exits from surviving anchors. */
export function reconcileTopology(state:GameState):void {
 for(const p of Object.values(state.occupants).sort((a,b)=>compareIds(a.id,b.id))){
 if(p.state==='outside'||p.state==='insideFacility')continue;
 if(disruptTrip(state,p))continue;
 if(p.state==='entering')pursueGoal(state,p);
 if(p.state==='stranded'){transition(p,{state:'entering',location:p.location});pursueGoal(state,p);}
 }
 reassignWaiters(state);
}
