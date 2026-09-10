import type { GameState } from '../../simulation';
import { officeDefinition } from '../../simulation/facilities/offices';
import { accessAt } from '../../simulation/world/walking-space';
import { availableMarket,vacancyReason } from '../../simulation/demand/office-leasing';
import { accruedAmounts } from '../../simulation/economy/accrual';
import { freezeDeep } from '../../simulation/state/plain';
/** Expose tenancy, actual attendance, access and finance as separate immutable inspector facts. */
export function inspectOffice(state:GameState,id:string){const o=state.offices[id];if(!o)return null;const d=officeDefinition(state),access=accessAt(state,o.floor,o.entranceX2);return freezeDeep({id:o.id,floor:o.floor,x:o.x,width:o.width,tenancy:o.lease?'leased':'vacant',tenantId:o.lease?.tenantId??null,assigned:o.lease?.assignedWorkerIds.length??0,present:(o.lease?.assignedWorkerIds??[]).filter(id=>{const p=state.occupants[id];return p?.location.kind==='facility'&&p.location.facilityId===o.id;}).length,access,vacancyReason:vacancyReason(state,o),rentSuspended:!!o.lease&&!access.accessible,rentMinorPerDay:d.rentMinorPerDay,operatingMinorPerDay:d.operatingMinorPerDay,accrued:accruedAmounts(state,o),recentIncomeMinor:state.economy.transactions.filter(t=>t.source.startsWith(`office:${id}:`)&&t.amountMinor>0&&t.atTick>state.clock.tick-state.scenario.dayTicks).reduce((n,t)=>n+t.amountMinor,0),availableMarket:availableMarket(state),nextReviewTick:state.clock.initialReviewPending?state.clock.tick:state.scenario.initialTick+(Math.floor((state.clock.tick-state.scenario.initialTick)/state.scenario.dayTicks)+1)*state.scenario.dayTicks});}
export type OfficeInspection=NonNullable<ReturnType<typeof inspectOffice>>;
