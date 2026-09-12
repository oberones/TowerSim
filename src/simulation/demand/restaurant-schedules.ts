import type { Content } from '../state/content';
import type { PreparedVisit } from './restaurant-allocation';
import { Xoshiro128 } from '../core/random/xoshiro128';
import { fromBigInt,add } from '../core/values';
/** Generate stratified seeded meal times and bounded off-peak visits without multiplying allocated demand. */
export function restaurantSchedules(facilityId:string,count:number,base:number,profile:Content['schedules']['restaurant'],rng:Xoshiro128):PreparedVisit[] {
 const meal=fromBigInt((BigInt(count)*BigInt(profile.mealShareBasisPoints)+9999n)/10000n),result:PreparedVisit[]=[];
 for(let i=0;i<count;i++){
 let at:number;
 if(i<meal){const width=profile.mealEnd-profile.mealStart,start=profile.mealStart+Math.floor(i*width/meal),end=profile.mealStart+Math.floor((i+1)*width/meal);at=start+rng.bounded(Math.max(1,end-start));}
 else {const early=profile.mealStart-profile.start,late=profile.end-profile.mealEnd,offset=rng.bounded(early+late);at=offset<early?profile.start+offset:profile.mealEnd+offset-early;}
 result.push({facilityId,arrivalTick:add(base,at),durationTicks:profile.visitMinTicks+rng.bounded(profile.visitMaxTicks-profile.visitMinTicks+1)});
 }
 return result;
}
