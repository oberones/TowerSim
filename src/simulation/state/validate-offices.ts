import type { GameState } from './game-state';
import { record } from './plain';
import { parseId } from '../core/ids/allocator';
import { tick,integer,multiply } from '../core/values';
import { officeDefinition } from '../facilities/offices';
import { reservations } from '../world/reservations';
import { covers } from '../world/ranges';
import { hasWalkingPath,accessAt } from '../world/walking-space';
/** Reject malformed or inconsistent office state before it can replace a live game. */
function check(condition:unknown,message:string):asserts condition {if(!condition)throw Error(message);}
/** Validate live ownership, single physical state, future wakeups, source accruals and historical identity. */
export function assertOffices(s:GameState):void {
 for(const map of [s.offices,s.occupants,s.trips])check(!!map&&typeof map==='object'&&!Array.isArray(map),'Missing entity map');
 record(s.officeMarket,['pendingRelease']);tick(s.officeMarket.pendingRelease);
 const eventsByOwner=new Map<string,typeof s.scheduledEvents>();for(const event of s.scheduledEvents){const list=eventsByOwner.get(event.targetId)??[];list.push(event);eventsByOwner.set(event.targetId,list);}
 const used=new Set<number>();for(const id of [s.tower?.id,s.tower?.lobby.id,...(s.tower?.floors.map(f=>f.id)??[])])if(id)used.add(parseId(id).ordinal);
 /** Enforce the single durable entity ordinal stream across live and retained historical records. */
 function identity(id:string,kind:string):void {const p=parseId(id);check(p.kind===kind&&p.ordinal<s.ids.entity.next&&!used.has(p.ordinal),'Invalid entity identity');used.add(p.ordinal);}
 for(const [id,o] of Object.entries(s.offices)){
 record(o,['id','typeId','definitionVersion','floor','x','width','height','entranceX2','createdTick','generation','lease','accrual']);identity(id,'facility');const d=officeDefinition(s);integer(o.floor);tick(o.x);tick(o.generation);tick(o.createdTick);
 check(o.id===id&&o.typeId===d.typeId&&o.definitionVersion===1&&o.width===d.footprint.width&&o.height===1&&o.entranceX2===o.x*2+d.entranceOffsetX2&&o.createdTick<=s.clock.tick,'Invalid office definition');
 check(covers(s.tower?.floors.find(f=>f.level===o.floor)?.constructedRanges??[],{startX:o.x,endXExclusive:o.x+o.width}),'Unsupported facility');
 const a=o.accrual;record(a,['sinceTick','lastTick','eligibleTicks','existenceTicks','eligible','generation']);for(const n of [a.sinceTick,a.lastTick,a.eligibleTicks,a.existenceTicks,a.generation])tick(n);
 check(a.sinceTick>=o.createdTick&&a.lastTick>=a.sinceTick&&a.lastTick<=s.clock.tick&&a.existenceTicks===a.lastTick-a.sinceTick&&a.eligibleTicks<=a.existenceTicks&&a.eligible===(!!o.lease&&accessAt(s,o.floor,o.entranceX2).accessible),'Invalid accrual interval');
 if(o.lease){record(o.lease,['tenantId','leasedAtTick','assignedWorkerIds']);identity(o.lease.tenantId,'tenant');tick(o.lease.leasedAtTick);check(o.lease.leasedAtTick>=o.createdTick&&o.lease.leasedAtTick<=s.clock.tick&&o.lease.assignedWorkerIds.length===d.capacity&&new Set(o.lease.assignedWorkerIds).size===d.capacity,'Invalid whole workforce');for(const worker of o.lease.assignedWorkerIds)check(s.occupants[worker]?.leaseFacilityId===id,'Missing leased worker');}
 }
 const reserved=reservations(s);for(let i=1;i<reserved.length;i++){const a=reserved[i-1]!,b=reserved[i]!;check(a.floor!==b.floor||a.endXExclusive<=b.startX,'Overlapping reservations');}
 const allocated=Object.values(s.offices).reduce((n,o)=>n+(o.lease?.assignedWorkerIds.length??0),s.officeMarket.pendingRelease);check(allocated<=(s.scenario.content?.officeMarketWorkers??0),'Overallocated office market');
 for(const [id,p] of Object.entries(s.occupants)){
 record(p,['id','kind','generation','leaseFacilityId','goal','state','location','schedule','tripId','replanAfterCurrentLeg']);identity(id,'occupant');tick(p.generation);check(p.id===id&&p.kind==='worker'&&typeof p.replanAfterCurrentLeg==='boolean','Invalid occupant');
 if(p.leaseFacilityId!==null)check(s.offices[p.leaseFacilityId]?.lease?.assignedWorkerIds.includes(id),'Invalid live lease');
 record(p.goal,p.goal.kind==='office'?['kind','facilityId']:['kind']);check(['office','exit','none'].includes(p.goal.kind),'Invalid goal');if(p.goal.kind==='office')check(!!s.offices[p.goal.facilityId]&&p.goal.facilityId===p.leaseFacilityId,'Missing goal');
 const l=p.location;const events=eventsByOwner.get(id)??[];
 if(l.kind==='outside'){record(l,['kind']);check(p.state==='outside'&&p.tripId===null&&p.goal.kind==='none','Outside location mismatch');}
 else if(l.kind==='facility'){record(l,['kind','facilityId']);check(p.state==='insideFacility'&&!!s.offices[l.facilityId]&&p.leaseFacilityId===l.facilityId&&p.tripId===null&&p.goal.kind==='office'&&!!p.schedule&&p.schedule.departureTick>s.clock.tick,'Invalid sleeping location');}
 else if(l.kind==='walkEdge'){record(l,['kind','from','to','startTick','durationTicks']);record(l.from,['floor','x2']);record(l.to,['floor','x2']);for(const a of [l.from,l.to]){integer(a.floor);tick(a.x2);}tick(l.startTick);tick(l.durationTicks);check(p.state==='walking'&&l.durationTicks>0&&l.durationTicks===Math.ceil(multiply(Math.abs(l.to.x2-l.from.x2),s.scenario.content!.walkingTicksPerCell)/2)&&l.from.floor===l.to.floor&&!!s.tower&&hasWalkingPath(s.tower,l.from.floor,l.from.x2,l.to.x2)&&l.startTick<=s.clock.tick&&l.startTick+l.durationTicks>s.clock.tick,'Invalid committed leg');check(events.filter(e=>e.kind==='walkComplete'&&e.dueTick===l.startTick+l.durationTicks&&e.phasePriority===40).length===1,'Missing walk completion');}
 else{record(l,['kind','at']);record(l.at,['floor','x2']);integer(l.at.floor);tick(l.at.x2);check(l.kind==='anchor'&&p.state==='stranded'&&!!s.tower&&hasWalkingPath(s.tower,l.at.floor,l.at.x2,l.at.x2),'Invalid stranded anchor');}
 if(p.tripId!==null)check(s.trips[p.tripId]?.occupantId===id&&s.trips[p.tripId]?.endTick===null,'Invalid active trip');
 check((p.state==='walking'||p.state==='stranded')===(p.tripId!==null),'Movement needs one active trip');
 if(p.schedule){record(p.schedule,['day','arrivalTick','departureTick','status']);const q=p.schedule;tick(q.day);tick(q.arrivalTick);tick(q.departureTick);const profile=s.scenario.content!.schedules.office,base=q.day*s.scenario.dayTicks;check(['scheduled','traveling','admitted','departed','skipped','canceled'].includes(q.status)&&q.arrivalTick>=base+profile.arrivalStart&&q.arrivalTick<base+profile.arrivalEnd&&q.departureTick>=base+profile.departureStart&&q.departureTick<base+profile.departureEnd,'Invalid schedule');if(q.status==='scheduled')check(p.state==='outside'&&events.filter(e=>e.kind==='workerArrival'&&e.dueTick===q.arrivalTick).length===1,'Missing arrival');if(['scheduled','traveling','admitted'].includes(q.status)&&q.departureTick>s.clock.tick)check(events.filter(e=>e.kind==='workerDeparture'&&e.dueTick===q.departureTick).length===1,'Missing departure');}
 for(const e of events){check(e.targetGeneration===p.generation,'Stale worker generation');if(e.kind==='workerArrival')check(p.schedule?.status==='scheduled'&&e.phasePriority===30&&e.dueTick===p.schedule.arrivalTick,'Invalid arrival event');else if(e.kind==='workerDeparture')check(!!p.schedule&&p.schedule.status!=='canceled'&&e.phasePriority===10&&e.dueTick===p.schedule.departureTick,'Invalid departure event');else check(e.kind==='walkComplete'&&p.state==='walking','Invalid occupant event');}
 }
 for(const [id,t] of Object.entries(s.trips)){record(t,['id','occupantId','purpose','startTick','endTick','outcome','totals','openSegment','deniedBoardingCount','transferCount']);identity(id,'trip');check(id===t.id&&parseId(t.occupantId).kind==='occupant'&&parseId(t.occupantId).ordinal<s.ids.entity.next,'Invalid trip identity');tick(t.startTick);tick(t.deniedBoardingCount);tick(t.transferCount);check(t.startTick<=s.clock.tick,'Trip starts in future');record(t.totals,['walking','waiting','stair','riding','stranded']);for(const n of Object.values(t.totals))tick(n);check(['officeArrival','officeExit','abandonedExit'].includes(t.purpose)&&['active','stranded','completed','abandoned'].includes(t.outcome),'Invalid trip labels');if(t.endTick!==null){tick(t.endTick);check(t.endTick>=t.startTick&&t.endTick<=s.clock.tick&&t.openSegment===null&&['completed','abandoned'].includes(t.outcome),'Invalid finished trip');}else check(s.occupants[t.occupantId]?.tripId===id,'Dangling active trip');check(Object.values(t.totals).reduce((n,v)=>n+v,0)<=(t.endTick??s.clock.tick)-t.startTick,'Trip intervals overlap');if(t.openSegment){record(t.openSegment,['kind','startTick']);tick(t.openSegment.startTick);check(Object.hasOwn(t.totals,t.openSegment.kind)&&t.openSegment.startTick>=t.startTick&&t.openSegment.startTick<=s.clock.tick,'Invalid open interval');}}
}
