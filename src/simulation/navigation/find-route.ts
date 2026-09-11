import { add } from '../core/values';
import type { WalkGraph,GraphEdge } from './graph';
import type { Anchor } from '../occupants/occupant';
import { modePreference } from './route';
import type { RouteLeg,ModePreference } from './route';
export interface WalkRoute {from:Anchor;to:Anchor;cost2:number;durationTicks:number;legs:RouteLeg[]}
/** Apply immutable journey mode preference before comparing route costs or current queue estimates. */
export function findRoute(graph:WalkGraph,from:string,to:string,preference?:ModePreference):WalkRoute|null {
 const a=graph.nodes.find(n=>n.id===from),b=graph.nodes.find(n=>n.id===to);if(!a||!b)return null;const mode=preference??modePreference(a.at,b.at);
 if(mode==='walk'||a.at.floor===b.at.floor){const walk=search(graph,from,to,'walk');if(walk)return walk;}
 if(mode==='elevator')return search(graph,from,to,'elevator')??search(graph,from,to,'stairs');
 return search(graph,from,to,'stairs')??search(graph,from,to,'elevator');
}
/** Give entity-number ties numeric ordering rather than placing entity 10 before entity 2. */
function semanticKey(id:string):string {return id.replace(/\d+/g,n=>n.padStart(16,'0'));}
/** Search two-state paths so preferred elevator routes must contain an actual ride, not just boarding. */
function search(graph:WalkGraph,from:string,to:string,mode:'walk'|'stairs'|'elevator'):WalkRoute|null {
 const start=`0|${from}`,distances=new Map<string,{cost:number;transfers:number;tie:string}>([[start,{cost:0,transfers:0,tie:''}]]),previous=new Map<string,{key:string;from:string;edge:GraphEdge}>(),nodes=new Map(graph.nodes.map(n=>[n.id,n])),pending=new Set([start]),done=new Set<string>();
 /** Compare total cost, actual board count, and stable semantic edge identities in that order. */
 function compare(a:{cost:number;transfers:number;tie:string},b:{cost:number;transfers:number;tie:string}):number {return a.cost-b.cost||a.transfers-b.transfers||(a.tie<b.tie?-1:a.tie>b.tie?1:0);}
 while(pending.size){const key=[...pending].sort((a,b)=>compare(distances.get(a)!,distances.get(b)!))[0]!,id=key.slice(2),used=key[0]==='1',score=distances.get(key)!;pending.delete(key);done.add(key);
 if(id===to&&(mode!=='elevator'||used)){const steps:{from:string;edge:GraphEdge}[]=[];let cursor=key;while(cursor!==start){const p=previous.get(cursor)!;steps.unshift({from:p.from,edge:p.edge});cursor=p.key;}const legs=collapse(graph,steps);return {from:{...nodes.get(from)!.at},to:{...nodes.get(to)!.at},cost2:score.cost,durationTicks:legs.reduce((n,l)=>n+l.durationTicks,0),legs};}
 for(const edge of graph.edges.get(id)??[]){if(mode!=='elevator'&&edge.kind!=='walk'&&(mode!=='stairs'||edge.kind!=='stair'))continue;const next=`${used||edge.kind==='ride'?1:0}|${edge.to}`;if(done.has(next))continue;const candidate={cost:add(score.cost,edge.cost2),transfers:score.transfers+(edge.kind==='board'?1:0),tie:`${score.tie}/${semanticKey(edge.ownerId??'')}:${semanticKey(edge.to)}`},old=distances.get(next);if(!old||compare(candidate,old)<0){distances.set(next,candidate);previous.set(next,{key,from:id,edge});pending.add(next);}}
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
