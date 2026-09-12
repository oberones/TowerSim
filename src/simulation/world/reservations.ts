import type { GameState } from '../state/game-state';
export interface Reservation {ownerId:string;floor:number;startX:number;endXExclusive:number}
/** Expand rectangles into per-floor reservations shared by rooms and later transport footprints. */
export function rectangleReservations(ownerId:string,floor:number,x:number,width:number,height:number):Reservation[] {return Array.from({length:height},(_,i)=>({ownerId,floor:floor+i,startX:x,endXExclusive:x+width}));}
/** Build sorted reserved footprints without occupying the implicit shared hallway. */
export function reservations(state:GameState):Reservation[] {const t=state.tower;if(!t)return [];return [ ...rectangleReservations(t.lobby.id,t.lobby.floor,t.lobby.x,t.lobby.width,1),...Object.values(state.shafts).flatMap(s=>rectangleReservations(s.id,s.minFloor,s.x,s.width,s.maxFloor-s.minFloor+1)),...Object.values(state.stairs).flatMap(s=>rectangleReservations(s.id,s.lowerFloor,s.x,s.width,2)),...[...Object.values(state.offices),...Object.values(state.restaurants)].flatMap(o=>rectangleReservations(o.id,o.floor,o.x,o.width,o.height))].sort((a,b)=>a.floor-b.floor||a.startX-b.startX);}
/** Locate a conflicting owner at a floor using half-open overlap semantics. */
export function reservationConflict(items:readonly Reservation[],proposal:Reservation):string|null {return items.find(r=>r.floor===proposal.floor&&r.startX<proposal.endXExclusive&&proposal.startX<r.endXExclusive)?.ownerId??null;}
