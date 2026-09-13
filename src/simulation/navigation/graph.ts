import { countWork } from '../core/work-counters';
import { elevatorPortals,addElevatorEdges,applyElevatorCosts } from './elevator-edges';
import { multiply } from '../core/values';
import type { GameState } from '../state/game-state';
import type { Anchor } from '../occupants/occupant';
export interface Portal {id:string;at:Anchor;ride?:boolean}
export interface GraphEdge {to:string;cost2:number;kind:'walk'|'stair'|'board'|'ride'|'alight';ownerId?:string;queueId?:string;approachKey?:string;tie?:string}
export interface WalkGraph {nodes:Portal[];edges:Map<string,GraphEdge[]>;walkingTicksPerCell:number}
const scopes=new WeakMap<GameState,Map<string,WalkGraph>>();
/** Share bounded static topology during a batch of ordered decisions, never a queue-sensitive winning route. */
export function withGraphCache<T>(state:GameState,run:()=>T):T {scopes.set(state,new Map());try{return run();}finally{scopes.delete(state);}}
/** Attach a fresh load view to shared static hallways, stairs and portal identities. */
export function buildGraph(state:GameState,extra:Portal[]=[],occupantId?:string):WalkGraph {
 const cache=scopes.get(state),key=extra.map(p=>`${p.id}:${p.at.floor}:${p.at.x2}`).join('|');
 let base=cache?.get(key);
 if(!base){
  if(cache){let shared=cache.get('');if(!shared){shared=buildStaticGraph(state,[]);cache.set('',shared);}base=extra.length?withAnchors(state,shared,extra):shared;}
  else base=buildStaticGraph(state,extra);
  if(cache){if(cache.size>=state.scenario.content!.routing.routeCacheEntries)cache.delete(cache.keys().next().value!);cache.set(key,base);}
 }
 const edges=applyElevatorCosts(state,base.edges,occupantId);
 return {...base,edges};
}
/** Insert decision anchors by rebuilding only their affected hallway floors, retaining exact canonical edge order. */
function withAnchors(state:GameState,base:WalkGraph,extra:Portal[]):WalkGraph {
 const nodes=[...base.nodes,...extra],keys=new Map(nodes.map(node=>[node.id,node.id.replace(/\d+/g,n=>n.padStart(16,'0'))]));
 nodes.sort((a,b)=>a.at.floor-b.at.floor||a.at.x2-b.at.x2||(keys.get(a.id)!<keys.get(b.id)!?-1:a.id===b.id?0:1));
 const edges=new Map(base.edges),changed=new Set(extra.map(node=>node.at.floor));for(const node of extra)edges.set(node.id,[]);
 for(const node of nodes)if(!node.ride&&changed.has(node.at.floor))edges.set(node.id,(edges.get(node.id)??[]).filter(edge=>edge.kind!=='walk'));
 for(const floor of state.tower?.floors??[])if(changed.has(floor.level))for(const span of floor.constructedRanges){const anchors=nodes.filter(node=>!node.ride&&node.at.floor===floor.level&&node.at.x2>=span.startX*2&&node.at.x2<span.endXExclusive*2);
  for(let index=1;index<anchors.length;index++){const a=anchors[index-1]!,b=anchors[index]!,cost2=multiply(b.at.x2-a.at.x2,base.walkingTicksPerCell);edges.get(a.id)!.unshift({to:b.id,cost2,kind:'walk',tie:`/:${keys.get(b.id)}`});edges.get(b.id)!.unshift({to:a.id,cost2,kind:'walk',tie:`/:${keys.get(a.id)}`});}
 }
 // Original hallway edges precede stairs and elevators, and list the left neighbor first.
 for(const node of nodes)if(!node.ride&&changed.has(node.at.floor)){const outgoing=edges.get(node.id)!;const walks=outgoing.filter(edge=>edge.kind==='walk');walks.reverse();edges.set(node.id,[...walks,...outgoing.filter(edge=>edge.kind!=='walk')]);}
 return {...base,nodes,edges};
}
/** Connect canonical hallway anchors within spans, then add physical adjacent-floor stair edges. */
function buildStaticGraph(state:GameState,extra:Portal[]):WalkGraph {
 countWork('graphBuilds');
 const nodes:Portal[]=[...(state.tower?[{id:state.tower.lobby.id,at:{floor:state.tower.lobby.floor,x2:state.tower.lobby.entranceX2}}]:[]),...[...Object.values(state.offices),...Object.values(state.restaurants)].map(o=>({id:o.id,at:{floor:o.floor,x2:o.entranceX2}})),...Object.values(state.stairs).flatMap(s=>[{id:`${s.id}:lower`,at:s.lowerAnchor},{id:`${s.id}:upper`,at:s.upperAnchor}]),...elevatorPortals(state),...extra];
 nodes.sort((a,b)=>a.at.floor-b.at.floor||a.at.x2-b.at.x2||(a.id.replace(/\d+/g,n=>n.padStart(16,'0'))<b.id.replace(/\d+/g,n=>n.padStart(16,'0'))?-1:a.id===b.id?0:1));
 const edges=new Map(nodes.map(n=>[n.id,[] as GraphEdge[]]));
 for(const floor of state.tower?.floors??[])for(const span of floor.constructedRanges){const anchors=nodes.filter(n=>!n.ride&&n.at.floor===floor.level&&n.at.x2>=span.startX*2&&n.at.x2<span.endXExclusive*2);for(let i=1;i<anchors.length;i++){const a=anchors[i-1]!,b=anchors[i]!,cost2=multiply(b.at.x2-a.at.x2,state.scenario.content!.walkingTicksPerCell);edges.get(a.id)!.push({to:b.id,cost2,kind:'walk'});edges.get(b.id)!.push({to:a.id,cost2,kind:'walk'});}}
 for(const s of Object.values(state.stairs)){edges.get(`${s.id}:lower`)!.push({to:`${s.id}:upper`,cost2:s.traversalTicks*2,kind:'stair',ownerId:s.id});edges.get(`${s.id}:upper`)!.push({to:`${s.id}:lower`,cost2:s.traversalTicks*2,kind:'stair',ownerId:s.id});}
 if(Object.keys(state.shafts).length)addElevatorEdges(state,edges);
 for(const outgoing of edges.values())for(const edge of outgoing)edge.tie=`/${(edge.ownerId??'').replace(/\d+/g,n=>n.padStart(16,'0'))}:${edge.to.replace(/\d+/g,n=>n.padStart(16,'0'))}`;
 return {nodes,edges,walkingTicksPerCell:state.scenario.content?.walkingTicksPerCell??1};
}
