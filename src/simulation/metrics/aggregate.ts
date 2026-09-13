import type { Content } from '../state/content';
import type { Trip } from './trips';
import { tripElapsed } from './trips';
import type { TripAggregate } from './report-state';
import { tripQuality,QUALITY_UNITS_PER_POINT } from './quality';
import { add } from '../core/values';
/** Add one explicitly selected trip, including its open interval and unsuccessful outcome, exactly once. */
export function addTrip(a:TripAggregate,t:Trip,atTick:number,c:Content['metrics']):void {
 a.samples=add(a.samples,1);if(t.endTick===null)a.unresolved=add(a.unresolved,1);if(t.outcome==='completed')a.completed=add(a.completed,1);else if(t.outcome==='abandoned')a.abandoned=add(a.abandoned,1);else if(t.outcome==='stranded')a.stranded=add(a.stranded,1);
 const totals=tripElapsed(t,atTick);for(const key of Object.keys(totals) as (keyof typeof totals)[])a.totals[key]=add(a.totals[key],totals[key]);
 a.denials=add(a.denials,t.deniedBoardingCount);a.transfers=add(a.transfers,t.transferCount);a.qualityUnits=add(a.qualityUnits,tripQuality(t,atTick,c).units);
}
/** Derive unrounded means with null quality for an empty or not-yet-measured population. */
export function aggregateMeans(a:TripAggregate) {return {quality:a.samples?a.qualityUnits/a.samples/QUALITY_UNITS_PER_POINT:null,meanWaitingTicks:a.samples?a.totals.waiting/a.samples:null};}
