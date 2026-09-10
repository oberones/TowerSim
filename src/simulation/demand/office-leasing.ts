import type { GameState } from '../state/game-state';
import type { Office } from '../facilities/offices';
import { officeDefinition } from '../facilities/offices';
import { accessAt } from '../world/walking-space';
import { allocateId,compareIds } from '../core/ids/allocator';
import { accrue } from '../economy/accrual';
import { scheduleWorker } from './office-schedules';
/** Count finite allocations including terminated leases awaiting the next review. */
export function availableMarket(state:GameState):number {return (state.scenario.content?.officeMarketWorkers??0)-Object.values(state.offices).reduce((n,o)=>n+(o.lease?.assignedWorkerIds.length??0),0)-state.officeMarket.pendingRelease;}
/** Explain vacancy separately from physical presence and suspended lease income. */
export function vacancyReason(state:GameState,o:Office):string {if(o.lease)return 'Leased';if(!accessAt(state,o.floor,o.entranceX2).accessible)return 'No lobby access';if(availableMarket(state)<officeDefinition(state).capacity)return 'Insufficient market for a whole workforce';return 'Awaiting 06:00 leasing review';}
/** Lease whole offices in stable identity order and schedule only feasible dormant workers. */
export function reviewOffices(state:GameState):void {
 if(!state.scenario.content)return;state.officeMarket.pendingRelease=0;
 for(const office of Object.values(state.offices).sort((a,b)=>compareIds(a.id,b.id))){
 if(!office.lease&&accessAt(state,office.floor,office.entranceX2).accessible&&officeDefinition(state).capacity>0&&availableMarket(state)>=officeDefinition(state).capacity){
 const tenantId=allocateId('tenant',state.ids.entity);office.lease={tenantId,leasedAtTick:state.clock.tick,assignedWorkerIds:[]};
 for(let i=0;i<officeDefinition(state).capacity;i++){const id=allocateId('occupant',state.ids.entity);state.occupants[id]={id,kind:'worker',generation:0,leaseFacilityId:office.id,goal:{kind:'none'},state:'outside',location:{kind:'outside'},schedule:null,tripId:null,replanAfterCurrentLeg:false};office.lease.assignedWorkerIds.push(id);}
 accrue(office.accrual,state.clock.tick,true);
 }
 for(const id of office.lease?.assignedWorkerIds??[])scheduleWorker(state,state.occupants[id]!);
 }
}
