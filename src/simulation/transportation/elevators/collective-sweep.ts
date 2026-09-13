import type { DispatchView,DispatchDecision } from './dispatch-policy';
import type { Direction } from './types';
/** Choose requested stops with a fixed directional sweep; never mutate the supplied controller view. */
export function collectiveSweep(v:DispatchView):DispatchDecision {
 if(v.phase==='moving')throw Error('Dispatch requires a landing or floor crossing');
 // After closing, suppress only the direction just served. The opposite queue
 // must remain eligible if the sweep reverses here, while requests ahead still
 // prevent premature reversal and repeated service of the previous cutoff.
 const floor=v.currentFloor,calls=v.calls.filter(c=>!v.skipCurrent||c.floor!==floor||c.direction!==v.direction),floors=[...v.onboardFloors,...calls.map(c=>c.floor)];if(!floors.length)return {kind:'idle'};
 /** Resolve a valid service stop while distinguishing sweep direction from idle pickup direction. */
 function decide(target:number,direction:Direction):DispatchDecision {const stop=v.stops.find(s=>s.floor===target);if(!stop)throw Error('Request outside served range');return {kind:target===floor?'serveHere':'moveToward',stopId:stop.id,floor:target,direction};}
 if(v.direction===null){const call=[...calls].sort((a,b)=>Math.abs(a.floor-floor)-Math.abs(b.floor-floor)||a.floor-b.floor||a.admissionSequence-b.admissionSequence)[0];if(!call)throw Error('Idle car cannot have onboard commitments');return decide(call.floor,call.floor===floor?call.direction:call.floor>floor?'up':'down');}
 let direction=v.direction;
 for(let attempt=0;attempt<2;attempt++){
 const sign=direction==='up'?1:-1;
 if(v.onboardFloors.includes(floor)||calls.some(c=>c.floor===floor&&c.direction===direction))return decide(floor,direction);
 const ahead=floors.filter(f=>(f-floor)*sign>0);
 if(ahead.length){const compatible=[...v.onboardFloors,...calls.filter(c=>c.direction===direction).map(c=>c.floor)].filter(f=>(f-floor)*sign>0).sort((a,b)=>(a-b)*sign);const target=compatible[0]??ahead.sort((a,b)=>(b-a)*sign)[0]!;return decide(target,direction);}
 direction=direction==='up'?'down':'up';
 }
 return {kind:'idle'};
}
