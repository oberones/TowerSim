import type { GameState } from '../../simulation';
import { carPosition } from '../../simulation/transportation/elevators/car';
import { shaftCost } from '../../simulation/transportation/elevators/shaft';
import { freezeDeep } from '../../simulation/state/plain';
/** Return truthful, detached car and per-stop queue data including explicitly empty queues. */
export function inspectElevator(state:GameState,shaftId:string){const s=state.shafts[shaftId];if(!s)return null;const c=state.cars[s.carIds[0]]!;return freezeDeep({id:s.id,serviceId:s.serviceId,carId:c.id,minFloor:s.minFloor,maxFloor:s.maxFloor,servedMinFloor:s.servedMinFloor,servedMaxFloor:s.servedMaxFloor,phase:c.phase,direction:c.direction,position:carPosition(c,state.clock.tick),load:c.onboard.length,capacity:c.capacity,pendingCostMinor:shaftCost(state,s),operatingMinorPerDay:state.scenario.content!.definitions.find(d=>d.typeId===s.definitionId)!.operatingMinorPerDay,stops:s.stopIds.map(id=>{const stop=state.stops[id]!;return {id,floor:stop.floor,up:state.queues[stop.upQueueId]!.entries.length,down:state.queues[stop.downQueueId]!.entries.length};})});}
export type ElevatorInspection=NonNullable<ReturnType<typeof inspectElevator>>;
