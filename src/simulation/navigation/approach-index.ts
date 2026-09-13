import {draftRead} from '../state/draft';
import type { GameState } from '../state/game-state';
import type {Occupant} from '../occupants/occupant';
interface Approaches {counts:Map<string,number>;people:Map<string,string>}
const scopes=new WeakMap<GameState,Approaches>();
/** Identify only the next committed elevator approach; people already waiting/riding reserve no approach. */
function assignment(p:Occupant):string|undefined {if(p.state==='waitingForElevator'||p.state==='ridingElevator')return;const leg=p.journey?.legs.find(l=>l.kind==='elevator');if(leg?.kind==='elevator')return `${leg.boardingStopId}:${leg.to.floor>leg.from.floor?'up':'down'}`;}
/** Scope repeated topology decisions to one reservation scan with explicit per-traveler updates. */
export function withApproachIndex<T>(state:GameState,run:()=>T):T {
 const index:Approaches={counts:new Map(),people:new Map()};
 for(const p of Object.values(draftRead(state.occupants))){const key=assignment(p);if(key){index.people.set(p.id,key);index.counts.set(key,(index.counts.get(key)??0)+1);}}
 scopes.set(state,index);try{return run();}finally{scopes.delete(state);}
}
/** Publish one migrated traveler's new approach before scoring the following FIFO decision. */
export function updateApproach(state:GameState,p:Occupant):void {
 const index=scopes.get(state);if(!index)return;
 const old=index.people.get(p.id),next=assignment(p);if(old===next)return;
 if(old){const count=index.counts.get(old)!-1;if(count)index.counts.set(old,count);else index.counts.delete(old);index.people.delete(p.id);}
 if(next){index.people.set(p.id,next);index.counts.set(next,(index.counts.get(next)??0)+1);}
}
/** Reconstruct reservations from each person's next committed elevator leg, excluding the current decision maker. */
export function approachIndex(state:GameState,exclude?:string):Map<string,number> {const scoped=scopes.get(state);if(scoped){const result=new Map(scoped.counts),key=exclude?scoped.people.get(exclude):undefined;if(key){const count=result.get(key)!-1;if(count)result.set(key,count);else result.delete(key);}return result;}const result=new Map<string,number>();for(const p of Object.values(draftRead(state.occupants))){if(p.id===exclude)continue;const key=assignment(p);if(key)result.set(key,(result.get(key)??0)+1);}return result;}
