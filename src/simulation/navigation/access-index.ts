import type {GameState} from '../state/game-state';
import {countWork} from '../core/work-counters';
interface Span {start:number;end:number;component:number}
interface AccessIndex {floors:Map<number,Span[]>;connected:Set<number>}
const indices=new WeakMap<GameState,{version:number;tower:GameState['tower'];stairs:GameState['stairs'];stops:GameState['stops'];shafts:GameState['shafts'];index:AccessIndex}>();
/** Find the constructed hallway component containing a half-cell anchor. */
function spanAt(floors:Map<number,Span[]>,floor:number,x2:number):Span|undefined {return floors.get(floor)?.find(span=>span.start<=x2&&x2<span.end);}
/** Rebuild undirected physical connectivity once per topology, independent of queues and route preferences.
 * MVP stairs and contiguous standard services are bidirectional; a connected component
 * therefore proves both lobby directions without computing a passenger's winning route.
 */
function buildAccessIndex(state:GameState):AccessIndex {
 countWork('accessBuilds');
 const floors=new Map<number,Span[]>(),parents:number[]=[];
 for(const floor of state.tower?.floors??[])floors.set(floor.level,floor.constructedRanges.map(range=>{const component=parents.length;parents.push(component);return {start:range.startX*2,end:range.endXExclusive*2,component};}));
 /** Compress component representatives while joining actual stair and elevator landings. */
 function root(id:number):number {while(parents[id]!==id){parents[id]=parents[parents[id]!]!;id=parents[id]!;}return id;}
 /** Connect two existing hallway spans; missing landings cannot fabricate a connection. */
 function join(a:Span|undefined,b:Span|undefined):void {if(a&&b)parents[root(b.component)]=root(a.component);}
 for(const stair of Object.values(state.stairs))join(spanAt(floors,stair.lowerAnchor.floor,stair.lowerAnchor.x2),spanAt(floors,stair.upperAnchor.floor,stair.upperAnchor.x2));
 for(const shaft of Object.values(state.shafts)){
  let previous:Span|undefined;
  for(const id of shaft.stopIds){const stop=state.stops[id]!;const current=spanAt(floors,stop.floor,stop.anchorX2);join(previous,current);previous=current;}
 }
 const lobby=state.tower?.lobby,lobbySpan=lobby&&spanAt(floors,lobby.floor,lobby.entranceX2),connected=new Set<number>();
 if(lobbySpan){const component=root(lobbySpan.component);for(const spans of floors.values())for(const span of spans)if(root(span.component)===component)connected.add(span.component);}
 return {floors,connected};
}
/** Cache only topology facts; finance, occupants, capacity and queue changes cannot affect access. */
export function hasLobbyAccess(state:GameState,floor:number,x2:number):boolean {
 countWork('accessQueries');
 let cached=indices.get(state);
 if(!cached||cached.version!==state.navigation.topologyVersion||cached.tower!==state.tower||cached.stairs!==state.stairs||cached.stops!==state.stops||cached.shafts!==state.shafts){cached={version:state.navigation.topologyVersion,tower:state.tower,stairs:state.stairs,stops:state.stops,shafts:state.shafts,index:buildAccessIndex(state)};indices.set(state,cached);}
 const span=spanAt(cached.index.floors,floor,x2);return !!span&&cached.index.connected.has(span.component);
}
