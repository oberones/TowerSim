import type { GameState } from '../state/game-state';
import type { ProgressionState } from './day-evidence';
import type { Content } from '../state/content';
import { clonePlain } from '../state/plain';
export type Evaluation=NonNullable<ProgressionState['lastEvaluation']>;
/** Describe every independent predicate using completed-day evidence and unrounded quality. */
export function progressionPredicates(v:Evaluation,t:Content['level2']) {const e=v.evidence;return [
 {label:'Full calendar day',current:e.eligibleFullDay?1:0,target:1,met:e.eligibleFullDay},
 {label:'Minimum accessible leased offices',current:e.minAccessibleLeasedOffices,target:t.offices,met:e.minAccessibleLeasedOffices>=t.offices},
 {label:'Minimum assigned workers',current:e.minAssignedWorkers,target:t.workers,met:e.minAssignedWorkers>=t.workers},
 {label:'Accessible restaurants',current:e.restaurantAccessibleEvidence,target:t.restaurants,met:e.restaurantAccessibleEvidence>=t.restaurants},
 {label:'Admitted restaurant visits',current:e.admittedRestaurantVisits,target:t.visits,met:e.admittedRestaurantVisits>=t.visits},
 {label:'Completed office arrivals',current:e.completedOfficeArrivals,target:t.completedOfficeArrivals,met:e.completedOfficeArrivals>=t.completedOfficeArrivals},
 {label:'Post-settlement cash',minorUnits:true,current:v.cashMinor,target:t.minimumCashMinor,met:v.cashMinor>=t.minimumCashMinor},
 {label:'Operating net (must be positive)',minorUnits:true,current:v.operatingNetMinor,target:1,met:v.operatingNetMinor>0},
 {label:'Completed-day transport quality',current:v.quality,target:t.quality,met:v.samples>0&&v.quality!==null&&v.quality>=t.quality},
 {label:'Stranded people (maximum)',current:v.strandedCount,target:t.maximumStranded,met:v.strandedCount<=t.maximumStranded},
 {label:'Unresolved prior-day trips (maximum)',current:v.unresolvedPriorDayTrips,target:t.maximumUnresolvedPriorDayTrips,met:v.unresolvedPriorDayTrips<=t.maximumUnresolvedPriorDayTrips}];}
/** Evaluate once after phase-zero reporting and settlement; an attained level is never revoked or re-awarded. */
export function evaluateProgression(s:GameState):void {if(!s.scenario.content)return;const day=s.clock.tick/s.scenario.dayTicks-1;if(s.progression.lastEvaluation?.day===day)return;const report=s.transportReports.daily.at(-1),finance=s.economy.operatingDays.find(d=>d.day===day);if(report?.day!==day||!finance)throw Error('Progression requires settled completed-day reports');
 const v:Evaluation={day,evidence:clonePlain(s.progression.dayEvidence),cashMinor:s.economy.balanceMinor,operatingNetMinor:finance.netMinor,quality:report.quality,samples:report.samples,strandedCount:Object.values(s.occupants).filter(p=>p.state==='stranded').length,unresolvedPriorDayTrips:Object.values(s.trips).filter(t=>t.endTick===null&&t.startTick<s.clock.tick).length};s.progression.lastEvaluation=v;
 if(s.progression.level===1&&progressionPredicates(v,s.scenario.content.level2).every(p=>p.met)){s.progression.level=2;s.progression.awardedTick=s.clock.tick;}
}
