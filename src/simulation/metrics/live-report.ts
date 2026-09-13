import type { GameState } from '../state/game-state';
import { emptyAggregate } from './report-state';
import { addTrip,aggregateMeans } from './aggregate';
/** Include unfinished trips of any age and finished outcomes strictly inside the trailing hour, once each. */
export function liveReport(s:GameState) {
 const endTick=s.clock.tick,startTick=Math.max(s.scenario.initialTick,endTick-(s.scenario.content?.historyLimits.liveTicks??3600)),a=emptyAggregate();
 for(const t of Object.values(s.trips))if(t.endTick===null||t.endTick>startTick)addTrip(a,t,endTick,s.scenario.content!.metrics);
 return {...a,...aggregateMeans(a),startTick,endTick,label:a.samples?'Last 60 minutes + all unfinished trips':'No trips yet'};
}
