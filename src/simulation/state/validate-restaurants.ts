import type { GameState } from './game-state';
import { record } from './plain';
import { integer,tick,positive } from '../core/values';
import { parseId } from '../core/ids/allocator';
import { restaurantDefinition } from '../facilities/restaurants';
import { covers } from '../world/ranges';
/** Reject unsupported room, visit, allocation and payment combinations before rebuilding runtime indices. */
function check(condition:unknown,message:string):asserts condition {if(!condition)throw Error(message);}
/** Validate finite historical demand separately from live customer and restaurant identities. */
export function assertRestaurants(s:GameState,identity:(id:string,kind:string)=>void):void {
 check(!!s.restaurants&&typeof s.restaurants==='object'&&!Array.isArray(s.restaurants)&&Array.isArray(s.restaurantDays),'Missing restaurant state');
 for(const [id,r] of Object.entries(s.restaurants)){
 record(r,['id','typeId','definitionVersion','floor','x','width','height','entranceX2','createdTick','generation','accrual','visits','revenueMinor']);identity(id,'facility');const d=restaurantDefinition(s);
 integer(r.floor);for(const n of [r.x,r.createdTick,r.generation,r.visits,r.revenueMinor])tick(n);
 check(id===r.id&&r.typeId===d.typeId&&r.definitionVersion===1&&r.width===d.footprint.width&&r.height===1&&r.entranceX2===r.x*2+d.entranceOffsetX2&&r.createdTick<=s.clock.tick&&BigInt(r.visits)*BigInt(d.visitPriceMinor)===BigInt(r.revenueMinor),'Invalid restaurant definition or revenue');
 check(covers(s.tower?.floors.find(f=>f.level===r.floor)?.constructedRanges??[],{startX:r.x,endXExclusive:r.x+r.width}),'Unsupported restaurant');
 const a=r.accrual;record(a,['sinceTick','lastTick','eligibleTicks','existenceTicks','eligible','generation']);for(const n of [a.sinceTick,a.lastTick,a.eligibleTicks,a.existenceTicks,a.generation])tick(n);check(a.sinceTick>=r.createdTick&&a.sinceTick<=s.clock.tick&&a.lastTick===a.sinceTick&&a.eligibleTicks===0&&a.existenceTicks===0&&a.eligible===false,'Invalid restaurant accrual');
 }
 const ids=new Set<string>();let previousDay=-1;
 for(const d of s.restaurantDays){record(d,['day','allowance','allocations','visits']);tick(d.day);tick(d.allowance);check(d.day>previousDay&&d.day<=Math.floor(s.clock.tick/s.scenario.dayTicks)&&d.allowance===s.scenario.content!.restaurantDailyCustomers&&Array.isArray(d.allocations)&&Array.isArray(d.visits)&&d.visits.length<=d.allowance,'Invalid restaurant day');previousDay=d.day;
 const allocations=new Map<string,number>();for(const a of d.allocations){record(a,['facilityId','count']);positive(a.count);check(parseId(a.facilityId).kind==='facility'&&!allocations.has(a.facilityId),'Duplicate restaurant allocation');allocations.set(a.facilityId,a.count);}
 check([...allocations.values()].reduce((a,b)=>a+b,0)===d.visits.length,'Allocation total mismatch');
 const actual=new Map<string,number>();for(const v of d.visits){record(v,['occupantId','facilityId','generation','arrivalTick','durationTicks','admittedTick','endTick','paidMinor','status']);const id=parseId(v.occupantId);check(id.kind==='occupant'&&id.ordinal<s.ids.entity.next&&!ids.has(v.occupantId),'Duplicate customer visit');ids.add(v.occupantId);positive(v.generation);tick(v.arrivalTick);positive(v.durationTicks);tick(v.paidMinor);
 const profile=s.scenario.content!.schedules.restaurant,base=d.day*s.scenario.dayTicks;
 check(v.arrivalTick>=base+profile.start&&v.arrivalTick<base+profile.end&&v.durationTicks>=profile.visitMinTicks&&v.durationTicks<=profile.visitMaxTicks&&['scheduled','traveling','inside','exiting','departed','canceled','skipped'].includes(v.status),'Invalid restaurant request');actual.set(v.facilityId,(actual.get(v.facilityId)??0)+1);
 const p=s.occupants[v.occupantId];if(['scheduled','traveling','inside','exiting'].includes(v.status))check(!!p&&p.kind==='customer'&&p.generation===v.generation&&p.schedule?.day===d.day&&p.schedule.arrivalTick===v.arrivalTick,'Missing live customer');
 if(v.admittedTick===null)check(v.endTick===null&&v.paidMinor===0&&v.status!=='inside','Unadmitted payment');else{tick(v.admittedTick);tick(v.endTick!);check(v.endTick===v.admittedTick+v.durationTicks&&v.admittedTick>=v.arrivalTick&&v.admittedTick<=s.clock.tick&&v.paidMinor===restaurantDefinition(s).visitPriceMinor,'Invalid admission');}
 if(v.status==='scheduled')check(v.arrivalTick>s.clock.tick&&p?.state==='outside'&&!!s.restaurants[v.facilityId],'Invalid future customer');
 if(v.status==='inside')check(p?.location.kind==='facility'&&p.location.facilityId===v.facilityId&&v.endTick!>s.clock.tick,'Invalid restaurant stay');
 if(v.status==='traveling')check(p?.goal.kind==='restaurant'&&p.goal.facilityId===v.facilityId&&v.admittedTick===null,'Invalid inbound customer');
 if(v.status==='exiting')check(p?.goal.kind==='exit','Invalid departing customer');
 if(['departed','canceled','skipped'].includes(v.status))check(!p,'Retired visit retains a customer');
 }
 check([...allocations].every(([id,count])=>actual.get(id)===count),'Restaurant share mismatch');
 }
 for(const p of Object.values(s.occupants))if(p.kind==='customer')check(ids.has(p.id)&&p.leaseFacilityId===null,'Missing customer visit identity');
}
