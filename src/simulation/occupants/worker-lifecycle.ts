import type { GameState } from '../state/game-state';
import type { Occupant } from './occupant';
export type WorkStatus=NonNullable<Occupant['schedule']>['status'];
export interface WorkRequest {occupantId:string;facilityId:string;generation:number;arrivalTick:number;departureTick:number;status:WorkStatus;tripId:string|null}
export interface WorkforceDay {day:number;seed:string;profileId:string;members:WorkRequest[]}
/** Do not regenerate visits for workers still inside, exiting or stranded from an earlier workday. */
export function canScheduleWorker(s:GameState,p:Occupant):boolean {return p.state==='outside'&&p.leaseFacilityId!==null&&p.schedule?.day!==Math.floor(s.clock.tick/s.scenario.dayTicks);}
/** Retain exact seeded request times separately from delayed physical arrivals and subsequent schedules. */
export function recordWorkRequest(s:GameState,p:Occupant):void {
 const schedule=p.schedule!;let day=s.workforceDays.find(d=>d.day===schedule.day);
 if(!day){day={day:schedule.day,seed:s.rng.seed,profileId:s.scenario.content!.schedules.office.id,members:[]};s.workforceDays.push(day);s.transportReports.cohorts.push({day:schedule.day,currentQueued:0,peakQueue:0});}
 if(day.members.some(m=>m.occupantId===p.id))throw Error('Duplicate daily workforce');
 day.members.push({occupantId:p.id,facilityId:p.leaseFacilityId!,generation:p.generation,arrivalTick:schedule.arrivalTick,departureTick:schedule.departureTick,status:schedule.status,tripId:null});
 const cutoff=schedule.day-(s.scenario.content?.historyLimits.days??30)+1;
 s.workforceDays=s.workforceDays.filter(d=>d.day>=cutoff||d.members.some(m=>m.status==='traveling'||m.status==='admitted'||s.occupants[m.occupantId]?.schedule?.day===d.day));
 s.transportReports.cohorts=s.transportReports.cohorts.filter(c=>s.workforceDays.some(d=>d.day===c.day));
}
/** Update one retained request at its lifecycle transition without scanning workers on every tick. */
export function setWorkStatus(s:GameState,p:Occupant,status:WorkStatus):void {
 if(!p.schedule)return;p.schedule.status=status;
 const member=s.workforceDays.find(d=>d.day===p.schedule!.day)?.members.find(m=>m.occupantId===p.id);
 if(member){member.status=status;if(p.tripId&&s.trips[p.tripId]?.purpose==='officeArrival')member.tripId=p.tripId;}
}
