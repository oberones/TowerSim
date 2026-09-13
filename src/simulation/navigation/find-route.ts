import { countWork } from '../core/work-counters';
import {RouteFrontier} from './route-frontier';
import { add } from '../core/values';
import type { WalkGraph,GraphEdge } from './graph';
import type { Anchor } from '../occupants/occupant';
import { modePreference } from './route';
import type { RouteLeg,ModePreference } from './route';
export interface WalkRoute {from:Anchor;to:Anchor;cost2:number;durationTicks:number;legs:RouteLeg[]}
/** Apply immutable journey mode preference before comparing route costs or current queue estimates. */
export function findRoute(graph:WalkGraph,from:string,to:string,preference?:ModePreference):WalkRoute|null {
 countWork('routeRequests');
 const a=graph.nodes.find(n=>n.id===from),b=graph.nodes.find(n=>n.id===to);if(!a||!b)return null;const mode=preference??modePreference(a.at,b.at);
 if(mode==='walk'||a.at.floor===b.at.floor){const walk=search(graph,from,to,'walk');if(walk)return walk;}
 if(mode==='nearest')return search(graph,from,to,'nearest');
 if(mode==='elevator')return search(graph,from,to,'elevator')??search(graph,from,to,'stairs');
 return search(graph,from,to,'stairs')??search(graph,from,to,'elevator');
}
/** Give entity-number ties numeric ordering rather than placing entity 10 before entity 2. */
function semanticKey(id:string):string {return id.replace(/\d+/g,n=>n.padStart(16,'0'));}
const edgeKeys=new WeakMap<GraphEdge,string>();
/** Reuse semantic keys across alternative searches over the same immutable graph edges. */
function edgeKey(edge:GraphEdge):string {if(edge.tie!==undefined)return edge.tie;let key=edgeKeys.get(edge);if(key===undefined){key=`/${semanticKey(edge.ownerId??'')}:${semanticKey(edge.to)}`;edgeKeys.set(edge,key);}return key;}
/** Track the first vertical leg: short trips minimize its walking approach, while long trips require an actual ride. */
function search(graph:WalkGraph,from:string,to:string,mode:'walk'|'stairs'|'elevator'|'nearest'):WalkRoute|null {
 countWork('pathSearches');
 const count=graph.nodes.length,indices=new Map(graph.nodes.map((node,index)=>[node.id,index])),start=indices.get(from)!,goal=indices.get(to)!;
 type Score={approach:number;cost:number;transfers:number;tie:string};
 const distances:(Score|undefined)[]=new Array(count*2),previous:({key:number;from:string;edge:GraphEdge}|undefined)[]=new Array(count*2),done=new Uint8Array(count*2);
 distances[start]={approach:0,cost:0,transfers:0,tie:''};
 /** Break equal entrance distances by total cost, board count and stable semantic edge identities. */
 function compare(a:Score,b:Score):number {return a.approach-b.approach||a.cost-b.cost||a.transfers-b.transfers||(a.tie<b.tie?-1:a.tie>b.tie?1:0);}
 const pending=new RouteFrontier((a,b)=>compare(distances[a]!,distances[b]!),count*2);pending.add(start);
 while(pending.size){const key=pending.pop(),index=key%count,id=graph.nodes[index]!.id,used=key>=count,score=distances[key]!;done[key]=1;
 if(index===goal&&(mode!=='elevator'||used)){const steps:{from:string;edge:GraphEdge}[]=[];let cursor=key;while(cursor!==start){const p=previous[cursor]!;steps.unshift({from:p.from,edge:p.edge});cursor=p.key;}const legs=collapse(graph,steps);return {from:{...graph.nodes[start]!.at},to:{...graph.nodes[goal]!.at},cost2:score.cost,durationTicks:legs.reduce((n,l)=>n+l.durationTicks,0),legs};}
 for(const edge of graph.edges.get(id)??[]){if(mode!=='elevator'&&mode!=='nearest'&&edge.kind!=='walk'&&(mode!=='stairs'||edge.kind!=='stair'))continue;const next=indices.get(edge.to)!+(used||edge.kind==='ride'||(mode==='nearest'&&edge.kind==='stair')?count:0);if(done[next])continue;const candidate={approach:add(score.approach,mode==='nearest'&&!used&&edge.kind==='walk'?edge.cost2:0),cost:add(score.cost,edge.cost2),transfers:score.transfers+(edge.kind==='board'?1:0),tie:score.tie+edgeKey(edge)},old=distances[next];if(!old||compare(candidate,old)<0){distances[next]=candidate;previous[next]={key,from:id,edge};pending.add(next);}}
 }
 return null;
}
/** Collapse hallway subdivisions and same-service ride edges into executable physical commitments. */
function collapse(graph:WalkGraph,steps:{from:string;edge:GraphEdge}[]):RouteLeg[] {
 const nodes=new Map(graph.nodes.map(n=>[n.id,n])),legs:RouteLeg[]=[];let ride:Extract<RouteLeg,{kind:'elevator'}>|null=null;
 for(const step of steps){const source=nodes.get(step.from)!.at,dest=nodes.get(step.edge.to)!.at,last=legs.at(-1);
 if(step.edge.kind==='walk'){if(source.x2===dest.x2)continue;if(last?.kind==='walk'&&last.to.floor===source.floor&&last.to.x2===source.x2){last.to={...dest};last.durationTicks=Math.ceil(Math.abs(last.to.x2-last.from.x2)*graph.walkingTicksPerCell/2);}else legs.push({kind:'walk',from:{...source},to:{...dest},durationTicks:Math.ceil(step.edge.cost2/2)});}
 else if(step.edge.kind==='stair')legs.push({kind:'stair',stairId:step.edge.ownerId!,from:{...source},to:{...dest},durationTicks:step.edge.cost2/2});
 else if(step.edge.kind==='board')ride={kind:'elevator',serviceId:step.edge.ownerId!,boardingStopId:step.from,unloadStopId:'',from:{...source},to:{...dest},durationTicks:0};
 else if(step.edge.kind==='ride'&&ride){ride.to={...dest};ride.durationTicks+=step.edge.cost2/2;}
 else if(step.edge.kind==='alight'&&ride){ride.unloadStopId=step.edge.to;if(ride.durationTicks>0)legs.push(ride);ride=null;}
 }
 return legs;
}
