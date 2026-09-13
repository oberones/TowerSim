import { compareIds } from '../core/ids/allocator';
import { Xoshiro128 } from '../core/random/xoshiro128';
import { restaurantSchedules } from './restaurant-schedules';
import type { GameState } from '../state/game-state';
import type { RestaurantDay } from '../facilities/restaurants';
import { allocateId } from '../core/ids/allocator';
import { add,positive,tick } from '../core/values';
import { accessAt } from '../world/walking-space';
import { scheduleEvent } from '../occupants/schedule-events';
export interface PreparedVisit {facilityId:string;arrivalTick:number;durationTicks:number}
/** Validate the entire finite plan before allocating one day's dormant customers and future arrival events. */
export function allocateRestaurantVisits(s:GameState,plans:readonly PreparedVisit[]):void {
 const day=Math.floor(s.clock.tick/s.scenario.dayTicks),content=s.scenario.content!,base=day*s.scenario.dayTicks;
 if(s.restaurantDays.some(d=>d.day===day))throw Error('Restaurant demand already allocated');
 if(plans.length>content.restaurantDailyCustomers)throw Error('Restaurant allowance exceeded');
 for(const p of plans){const room=s.restaurants[p.facilityId];tick(p.arrivalTick);positive(p.durationTicks);if(!room||!accessAt(s,room.floor,room.entranceX2).accessible||p.arrivalTick<=s.clock.tick||p.arrivalTick<base+content.schedules.restaurant.start||p.arrivalTick>=base+content.schedules.restaurant.end||p.durationTicks<content.schedules.restaurant.visitMinTicks||p.durationTicks>content.schedules.restaurant.visitMaxTicks)throw Error('Invalid prepared visit');add(p.arrivalTick,p.durationTicks);}
 add(s.ids.entity.next,plans.length);add(s.ids.event.next,plans.length);add(s.ids.eventSequence.next,plans.length);
 const record:RestaurantDay={day,allowance:content.restaurantDailyCustomers,allocations:[],visits:[]};
 for(const p of plans){const id=allocateId('occupant',s.ids.entity),generation=1;const allocation=record.allocations.find(a=>a.facilityId===p.facilityId);if(allocation)allocation.count++;else record.allocations.push({facilityId:p.facilityId,count:1});
 record.visits.push({occupantId:id,facilityId:p.facilityId,generation,arrivalTick:p.arrivalTick,durationTicks:p.durationTicks,admittedTick:null,endTick:null,paidMinor:0,status:'scheduled'});
 s.occupants[id]={id,kind:'customer',generation,leaseFacilityId:null,goal:{kind:'none'},state:'outside',location:{kind:'outside'},schedule:{day,arrivalTick:p.arrivalTick,departureTick:add(p.arrivalTick,p.durationTicks),status:'scheduled'},journey:null,tripId:null,replanAfterCurrentLeg:false};
 scheduleEvent(s,'customerArrival',id,generation,p.arrivalTick);
 }
 s.restaurantDays.push(record);
}

/** Allocate a saved finite daily allowance once, using stable room order and integer remainder sharing. */
export function reviewRestaurants(s:GameState):void {
 if(!s.scenario.content)return;const day=Math.floor(s.clock.tick/s.scenario.dayTicks);if(s.restaurantDays.some(d=>d.day===day))return;
 const rooms=Object.values(s.restaurants).filter(r=>accessAt(s,r.floor,r.entranceX2).accessible).sort((a,b)=>compareIds(a.id,b.id));
 const rng=Xoshiro128.restore(s.rng),allowance=s.scenario.content.restaurantDailyCustomers,plans:PreparedVisit[]=[];
 for(let i=0;i<rooms.length;i++){const count=Math.floor(allowance/rooms.length)+(i<allowance%rooms.length?1:0);plans.push(...restaurantSchedules(rooms[i]!.id,count,day*s.scenario.dayTicks,s.scenario.content.schedules.restaurant,rng));}
 allocateRestaurantVisits(s,plans);s.rng=rng.export();
 const cutoff=day-s.scenario.content.historyLimits.days+1;s.restaurantDays=s.restaurantDays.filter(d=>d.day>=cutoff||d.visits.some(v=>s.occupants[v.occupantId]!==undefined));
}
