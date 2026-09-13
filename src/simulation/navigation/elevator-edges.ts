import { approachIndex } from './approach-index';
import { routeWaitCosts } from './elevator-cost';
import type { GameState } from '../state/game-state';
import type { Portal,GraphEdge } from './graph';
/** Create directed service nodes with only adjacent ride links, keeping topology linear in stop count. */
export function elevatorPortals(state:GameState):Portal[] {return Object.values(state.stops).flatMap(s=>[{id:s.id,at:{floor:s.floor,x2:s.anchorX2}},...(['up','down'] as const).map(direction=>({id:`${s.id}:${direction}`,at:{floor:s.floor,x2:s.anchorX2},ride:true}))]);}
/** Build stable boarding metadata and adjacent ride/alight links once per static graph. */
export function addElevatorEdges(state:GameState,edges:Map<string,GraphEdge[]>):void {
 const content=state.scenario.content!;
 for(const shaft of Object.values(state.shafts))for(const [index,id] of shaft.stopIds.entries())for(const direction of ['up','down'] as const){const stop=state.stops[id]!,rideId=`${id}:${direction}`,next=shaft.stopIds[index+(direction==='up'?1:-1)],queue=state.queues[direction==='up'?stop.upQueueId:stop.downQueueId]!;
 if(next){edges.get(id)!.push({kind:'board',ownerId:shaft.serviceId,to:rideId,cost2:0,queueId:queue.id,approachKey:`${id}:${direction}`});edges.get(rideId)!.push({kind:'ride',ownerId:shaft.serviceId,to:`${next}:${direction}`,cost2:2*content.elevatorTiming.floorTicks});}
 edges.get(rideId)!.push({kind:'alight',ownerId:shaft.serviceId,to:id,cost2:0});
}
}
/** Refresh every eligible boarding cost from the current FIFO/approach view; static links are immutable. */
export function applyElevatorCosts(state:GameState,base:Map<string,GraphEdge[]>,occupantId?:string):Map<string,GraphEdge[]> {
 const result=new Map(base);if(!Object.keys(state.shafts).length)return result;
 const approaches=approachIndex(state,occupantId),penalty=state.scenario.content!.routing.transferPenaltyTicks,wait=routeWaitCosts(state,occupantId);
 for(const [id,outgoing] of base)if(outgoing.some(edge=>edge.kind==='board'))result.set(id,outgoing.map(edge=>edge.kind==='board'?{...edge,cost2:2*(wait(edge.queueId!,approaches.get(edge.approachKey!)??0)+penalty)}:edge));
 return result;
}
