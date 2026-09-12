import type { GameState } from '../state/game-state';
import { accessAt } from '../world/walking-space';
export interface DayEvidence {dayStart:number;eligibleFullDay:boolean;minAccessibleLeasedOffices:number;minAssignedWorkers:number;restaurantAccessibleEvidence:number;admittedRestaurantVisits:number;completedOfficeArrivals:number}
export interface ProgressionState {level:1|2;awardedTick:number|null;dayEvidence:DayEvidence;lastEvaluation:null|{day:number;evidence:DayEvidence;cashMinor:number;operatingNetMinor:number;quality:number|null;samples:number;strandedCount:number;unresolvedPriorDayTrips:number}}
/** Start an empty partial day; midnight replaces its minima with the actual eligible population. */
export function initialProgression(initialTick:number):ProgressionState {return {level:1,awardedTick:null,lastEvaluation:null,dayEvidence:{dayStart:0,eligibleFullDay:initialTick===0,minAccessibleLeasedOffices:0,minAssignedWorkers:0,restaurantAccessibleEvidence:0,admittedRestaurantVisits:0,completedOfficeArrivals:0}};}
/** Count eligible leases only when leasing or topology changes, never on presentation frames. */
export function eligiblePopulation(s:GameState){const offices=Object.values(s.offices).filter(o=>o.lease&&accessAt(s,o.floor,o.entranceX2).accessible);return {offices:offices.length,workers:offices.reduce((n,o)=>n+o.lease!.assignedWorkerIds.length,0),restaurants:Object.values(s.restaurants).filter(r=>accessAt(s,r.floor,r.entranceX2).accessible).length};}
/** Preserve temporary access/lease losses even when repairs restore the tower before midnight. */
export function maintainDayEvidence(s:GameState):void {const p=eligiblePopulation(s),e=s.progression.dayEvidence;e.minAccessibleLeasedOffices=Math.min(e.minAccessibleLeasedOffices,p.offices);e.minAssignedWorkers=Math.min(e.minAssignedWorkers,p.workers);e.restaurantAccessibleEvidence=Math.max(e.restaurantAccessibleEvidence,p.restaurants);}
/** Seed the next full day at midnight before any later-priority transitions can affect its minima. */
export function beginProgressionDay(s:GameState):void {const p=eligiblePopulation(s);s.progression.dayEvidence={dayStart:s.clock.tick,eligibleFullDay:true,minAccessibleLeasedOffices:p.offices,minAssignedWorkers:p.workers,restaurantAccessibleEvidence:p.restaurants,admittedRestaurantVisits:0,completedOfficeArrivals:0};}
