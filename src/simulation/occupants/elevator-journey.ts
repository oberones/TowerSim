import type { GameState } from '../state/game-state';
import type { Occupant } from './occupant';
import type { RouteLeg } from '../navigation/route';
import { requestElevator } from '../transportation/elevators/requests';
/** Commit a collapsed elevator leg only after its preceding walk reaches the actual boarding platform. */
export function beginElevatorJourney(state:GameState,p:Occupant,leg:Extract<RouteLeg,{kind:'elevator'}>):void {if(!p.tripId)throw Error('Elevator travel requires an active trip');const request=requestElevator(state,p.id,p.tripId,leg.boardingStopId,leg.unloadStopId);if(!request.ok)throw Error(`Elevator request failed: ${request.code}`);}
