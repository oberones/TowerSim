import type { GameState } from '../state/game-state';
import { compareIds } from '../core/ids/allocator';
import { accessAt } from '../world/walking-space';
import { departWorker,pursueGoal } from '../occupants/facility-transitions';
import { transition } from '../occupants/transitions';
/** Clear future legs after edits, retain protected movement, and repair stranded exits from surviving anchors. */
export function reconcileTopology(state:GameState):void {
 for(const p of Object.values(state.occupants).sort((a,b)=>compareIds(a.id,b.id))){
 if(p.state==='outside'||p.state==='insideFacility')continue;
 if(p.journey){p.journey.legs=[];p.replanAfterCurrentLeg=true;}
 if(p.goal.kind==='office'){const o=state.offices[p.goal.facilityId];if(!o||!accessAt(state,o.floor,o.entranceX2).accessible){departWorker(state,p);continue;}}
 if(p.state==='entering')pursueGoal(state,p);
 if(p.state==='stranded'){transition(p,{state:'entering',location:p.location});pursueGoal(state,p);}
 }
}
