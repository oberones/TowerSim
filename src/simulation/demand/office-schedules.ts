import type { GameState } from '../state/game-state';
import type { Occupant } from '../occupants/occupant';
import { Xoshiro128 } from '../core/random/xoshiro128';
import { scheduleEvent } from '../occupants/schedule-events';
/** Generate one day's two future goals once, preserving dormant worker identity and RNG on retries. */
export function scheduleWorker(state:GameState,p:Occupant):void {
 const day=Math.floor(state.clock.tick/state.scenario.dayTicks);if(p.schedule?.day===day||p.state!=='outside'||!p.leaseFacilityId)return;
 const profile=state.scenario.content!.schedules.office,base=day*state.scenario.dayTicks,rng=Xoshiro128.restore(state.rng);
 const arrivalTick=base+profile.arrivalStart+rng.bounded(profile.arrivalEnd-profile.arrivalStart),departureTick=base+profile.departureStart+rng.bounded(profile.departureEnd-profile.departureStart);
 state.rng=rng.export();p.generation++;p.schedule={day,arrivalTick,departureTick,status:arrivalTick>state.clock.tick?'scheduled':'skipped'};
 if(arrivalTick>state.clock.tick){scheduleEvent(state,'workerArrival',p.id,p.generation,arrivalTick);scheduleEvent(state,'workerDeparture',p.id,p.generation,departureTick);}
}
