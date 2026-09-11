import { elevatorPortals,addElevatorEdges } from './elevator-edges';
import { multiply } from '../core/values';
import type { GameState } from '../state/game-state';
import type { Anchor } from '../occupants/occupant';
export interface Portal {id:string;at:Anchor;ride?:boolean}
export interface GraphEdge {to:string;cost2:number;kind:'walk'|'stair'|'board'|'ride'|'alight';ownerId?:string}
export interface WalkGraph {nodes:Portal[];edges:Map<string,GraphEdge[]>;walkingTicksPerCell:number}
/** Connect canonical hallway anchors within spans, then add physical adjacent-floor stair edges. */
export function buildGraph(state:GameState,extra:Portal[]=[]):WalkGraph {
 const nodes:Portal[]=[...(state.tower?[{id:state.tower.lobby.id,at:{floor:state.tower.lobby.floor,x2:state.tower.lobby.entranceX2}}]:[]),...Object.values(state.offices).map(o=>({id:o.id,at:{floor:o.floor,x2:o.entranceX2}})),...Object.values(state.stairs).flatMap(s=>[{id:`${s.id}:lower`,at:s.lowerAnchor},{id:`${s.id}:upper`,at:s.upperAnchor}]),...elevatorPortals(state),...extra];
 nodes.sort((a,b)=>a.at.floor-b.at.floor||a.at.x2-b.at.x2||(a.id.replace(/\d+/g,n=>n.padStart(16,'0'))<b.id.replace(/\d+/g,n=>n.padStart(16,'0'))?-1:a.id===b.id?0:1));
 const edges=new Map(nodes.map(n=>[n.id,[] as GraphEdge[]]));
 for(const floor of state.tower?.floors??[])for(const span of floor.constructedRanges){const anchors=nodes.filter(n=>!n.ride&&n.at.floor===floor.level&&n.at.x2>=span.startX*2&&n.at.x2<span.endXExclusive*2);for(let i=1;i<anchors.length;i++){const a=anchors[i-1]!,b=anchors[i]!,cost2=multiply(b.at.x2-a.at.x2,state.scenario.content!.walkingTicksPerCell);edges.get(a.id)!.push({to:b.id,cost2,kind:'walk'});edges.get(b.id)!.push({to:a.id,cost2,kind:'walk'});}}
 for(const s of Object.values(state.stairs)){edges.get(`${s.id}:lower`)!.push({to:`${s.id}:upper`,cost2:s.traversalTicks*2,kind:'stair',ownerId:s.id});edges.get(`${s.id}:upper`)!.push({to:`${s.id}:lower`,cost2:s.traversalTicks*2,kind:'stair',ownerId:s.id});}
 if(Object.keys(state.shafts).length)addElevatorEdges(state,edges);
 return {nodes,edges,walkingTicksPerCell:state.scenario.content?.walkingTicksPerCell??1};
}
