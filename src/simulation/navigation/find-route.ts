import { add } from '../core/values';
import type { WalkGraph } from './graph';
import type { Anchor } from '../occupants/occupant';
export interface WalkRoute {from:Anchor;to:Anchor;cost2:number;durationTicks:number}
/** Find deterministic shortest half-tick costs and collapse straight hallway subdivision before rounding. */
export function findRoute(graph:WalkGraph,from:string,to:string):WalkRoute|null {
 const distances=new Map<string,number>([[from,0]]),pending=new Set(graph.nodes.map(n=>n.id));
 while(pending.size){const id=[...pending].sort((a,b)=>(distances.get(a)??Infinity)-(distances.get(b)??Infinity)||(a<b?-1:a>b?1:0))[0]!;const cost=distances.get(id);if(cost===undefined)break;pending.delete(id);if(id===to){const a=graph.nodes.find(n=>n.id===from),b=graph.nodes.find(n=>n.id===to);return a&&b?{from:{...a.at},to:{...b.at},cost2:cost,durationTicks:Math.ceil(cost/2)}:null;}for(const edge of graph.edges.get(id)??[])if(pending.has(edge.to)&&add(cost,edge.cost2)<(distances.get(edge.to)??Infinity))distances.set(edge.to,add(cost,edge.cost2));}
 return null;
}
