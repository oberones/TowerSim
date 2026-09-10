import { multiply } from '../core/values';
import type { GameState } from '../state/game-state';
import type { Anchor } from '../occupants/occupant';
export interface Portal {id:string;at:Anchor}
export interface WalkGraph {nodes:Portal[];edges:Map<string,{to:string;cost2:number}[]>}
/** Connect ordered semantic anchors only within one constructed hallway span. */
export function buildGraph(state:GameState,extra:Portal[]=[]):WalkGraph {
 const nodes:Portal[]=[...(state.tower?[{id:state.tower.lobby.id,at:{floor:state.tower.lobby.floor,x2:state.tower.lobby.entranceX2}}]:[]),...Object.values(state.offices).map(o=>({id:o.id,at:{floor:o.floor,x2:o.entranceX2}})),...extra];
 nodes.sort((a,b)=>a.at.floor-b.at.floor||a.at.x2-b.at.x2||(a.id<b.id?-1:a.id>b.id?1:0));
 const edges=new Map(nodes.map(n=>[n.id,[] as {to:string;cost2:number}[]]));
 for(const floor of state.tower?.floors??[])for(const span of floor.constructedRanges){const anchors=nodes.filter(n=>n.at.floor===floor.level&&n.at.x2>=span.startX*2&&n.at.x2<span.endXExclusive*2).sort((a,b)=>a.at.x2-b.at.x2||(a.id<b.id?-1:a.id>b.id?1:0));for(let i=1;i<anchors.length;i++){const a=anchors[i-1]!,b=anchors[i]!,cost2=multiply(b.at.x2-a.at.x2,state.scenario.content!.walkingTicksPerCell);edges.get(a.id)!.push({to:b.id,cost2});edges.get(b.id)!.push({to:a.id,cost2});}}
 return {nodes,edges};
}
