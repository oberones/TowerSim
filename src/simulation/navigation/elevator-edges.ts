import { approachIndex } from './approach-index';
import { elevatorWaitCost } from './elevator-cost';
import type { GameState } from '../state/game-state';
import type { Portal,GraphEdge } from './graph';
/** Create directed service nodes with only adjacent ride links, keeping topology linear in stop count. */
export function elevatorPortals(state:GameState):Portal[] {return Object.values(state.stops).flatMap(s=>[{id:s.id,at:{floor:s.floor,x2:s.anchorX2}},...(['up','down'] as const).map(direction=>({id:`${s.id}:${direction}`,at:{floor:s.floor,x2:s.anchorX2},ride:true}))]);}
/** Add board, adjacent ride and alight edges with a frozen, integer load estimate for this route decision. */
export function addElevatorEdges(state:GameState,edges:Map<string,GraphEdge[]>,occupantId?:string):void {
 const content=state.scenario.content!,approaches=approachIndex(state,occupantId);
 for(const shaft of Object.values(state.shafts))for(const [index,id] of shaft.stopIds.entries())for(const direction of ['up','down'] as const){const stop=state.stops[id]!,rideId=`${id}:${direction}`,next=shaft.stopIds[index+(direction==='up'?1:-1)],queue=state.queues[direction==='up'?stop.upQueueId:stop.downQueueId]!;
 const wait=elevatorWaitCost(state,queue,approaches.get(`${id}:${direction}`)??0,occupantId);
 if(next){edges.get(id)!.push({kind:'board',ownerId:shaft.serviceId,to:rideId,cost2:2*(wait+content.routing.transferPenaltyTicks)});edges.get(rideId)!.push({kind:'ride',ownerId:shaft.serviceId,to:`${next}:${direction}`,cost2:2*content.elevatorTiming.floorTicks});}
 edges.get(rideId)!.push({kind:'alight',ownerId:shaft.serviceId,to:id,cost2:0});
 }
}
