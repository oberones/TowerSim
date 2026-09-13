import type { GameState } from '../../state/game-state';
import type { CommandResult } from '../../commands/types';
import type { ServicePayload } from './shaft';
/** Validate service changes against every loaded unload commitment and current physical car phase. */
export function quoteService(state:GameState,p:ServicePayload):CommandResult {
 const s=state.shafts[p.shaftId];if(!s)return {ok:false,code:'invalidCommand'};
 if(![p.minFloor,p.maxFloor].every(Number.isSafeInteger)||p.minFloor<p.maxFloor&& (p.minFloor<s.minFloor||p.maxFloor>s.maxFloor)||p.minFloor>=p.maxFloor)return {ok:false,code:'invalidServiceRange',message:'Keep a contiguous service of at least two floors inside this shaft.'};
 const car=state.cars[s.carIds[0]]!;
 /** Check whether a protected floor survives the complete proposed service range. */
 const within=(floor:number)=>floor>=p.minFloor&&floor<=p.maxFloor;
 if(car.onboard.some(o=>!within(state.stops[o.unloadStopId]!.floor)))return {ok:false,code:'loadedCar',message:'The loaded car must retain every committed unloading stop.'};
 if(!within(car.currentFloor)||car.segment&&(!within(car.segment.fromFloor)||!within(car.segment.toFloor))||car.targetStopId&&!within(state.stops[car.targetStopId]!.floor)||car.visit&&!within(state.stops[car.visit.stopId]!.floor))return {ok:false,code:'activeTraversal',message:'This range removes the car’s current position or committed stop. Wait until it is safely within the range.'};
 return {ok:true,code:'valid',quote:{footprint:{floor:s.minFloor,startX:s.x,endXExclusive:s.x+s.width},constructionCostMinor:0,demolitionCostMinor:0,accruedSettlementMinor:0,cashDeltaMinor:0,topologyVersion:state.navigation.topologyVersion}};
}
