import type { GameState } from '../state/game-state';
import { accrue } from '../economy/accrual';
import { settleOffice } from '../economy/settlement';
import { accessAt } from '../world/walking-space';
import { cancelEvents } from '../occupants/schedule-events';
import { departWorker,pursueGoal } from '../occupants/facility-transitions';
import { transition } from '../occupants/transitions';
import { retireOccupant } from '../occupants/retirement';
/** Reconcile rent eligibility and repair stranded exits only when topology actually changes. */
export function reconcileOfficeAccess(state:GameState):void {for(const o of Object.values(state.offices))accrue(o.accrual,state.clock.tick,!!o.lease&&accessAt(state,o.floor,o.entranceX2).accessible);for(const p of Object.values(state.occupants))if(p.state==='stranded'){transition(p,{state:'entering',location:p.location});pursueGoal(state,p);}}
/** Settle the removed source, cancel obsolete visits and retain workers until their real exit. */
export function removeOffice(state:GameState,id:string):void {
 const o=state.offices[id]!;settleOffice(state,o);state.officeMarket.pendingRelease+=o.lease?.assignedWorkerIds.length??0;
 for(const workerId of o.lease?.assignedWorkerIds??[]){const p=state.occupants[workerId]!;cancelEvents(state,p.id,'workerArrival');cancelEvents(state,p.id,'workerDeparture');p.leaseFacilityId=null;if(p.schedule)p.schedule.status='canceled';departWorker(state,p);retireOccupant(state,p);}
 delete state.offices[id];
}
