import type { Content } from '../state/content';
import type { Trip } from './trips';
import { tripElapsed } from './trips';
import { add,multiply } from '../core/values';
export const QUALITY_UNITS_PER_POINT=6000;
/** Keep basis-point-seconds exact through scoring; only presentation rounds the final score. */
export function tripQuality(trip:Trip,atTick:number,c:Content['metrics']) {
 const t=tripElapsed(trip,atTick);
 const influences={walking:multiply(add(t.walking,t.stair),c.walkingBasisPointsPerMinute),waiting:multiply(t.waiting,c.waitingBasisPointsPerMinute),riding:multiply(t.riding,c.ridingBasisPointsPerMinute),denials:multiply(multiply(trip.deniedBoardingCount,c.denialBasisPoints),60),transfers:multiply(multiply(trip.transferCount,c.transferBasisPoints),60),stranded:multiply(t.stranded,c.strandedBasisPointsPerMinute)};
 const penalty=Object.values(influences).reduce(add,0),unclampedUnits=add(100*QUALITY_UNITS_PER_POINT,-penalty),units=Math.max(0,Math.min(100*QUALITY_UNITS_PER_POINT,unclampedUnits));
 return {units,unclampedUnits,score:units/QUALITY_UNITS_PER_POINT,influences};
}
