import type { GameState } from '../state/game-state';
import type { Occupant } from './occupant';
import { cancelEvents } from './schedule-events';
/** Retire a former worker only after outside cancellation or real exit, preserving historical trips. */
export function retireOccupant(state:GameState,p:Occupant):boolean {if(p.leaseFacilityId!==null||p.state!=='outside'||p.tripId!==null)return false;cancelEvents(state,p.id);delete state.occupants[p.id];return true;}
