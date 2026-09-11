import type { GameState } from '../../simulation';
import { queueIndex } from '../../simulation/transportation/elevators/queue-index';
import { freezeDeep } from '../../simulation/state/plain';
import type { ViewBounds } from './queries';
/** Project every directional stop, including zero queues and boarders whose transfer is not complete. */
export function queueQueries(s:GameState,bounds?:ViewBounds) {
 const index=queueIndex(s);
 return freezeDeep(Object.values(s.queues).flatMap(q=>{const stop=s.stops[q.stopId]!;
  if(bounds&&(stop.floor<bounds.minFloor||stop.floor>bounds.maxFloor||stop.anchorX2/2<bounds.minX||stop.anchorX2/2>bounds.maxX))return [];
  const totals=index.total(q.id,s.clock.tick);
  return [{id:q.id,stopId:stop.id,shaftId:stop.shaftId,floor:stop.floor,x2:stop.anchorX2,direction:q.direction,...totals,oldestWaitTicks:q.entries[0]?s.clock.tick-q.entries[0].joinedTick:0,occupantIds:q.entries.map(e=>e.occupantId)}];
 }));
}
