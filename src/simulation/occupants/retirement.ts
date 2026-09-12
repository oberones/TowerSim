import type { GameState } from '../state/game-state';
import type { Occupant } from './occupant';
import { cancelEvents } from './schedule-events';
/** Retire a customer or former worker only after outside cancellation or real exit, preserving historical trips. */
export function retireOccupant(state:GameState,p:Occupant):boolean {if(p.leaseFacilityId!==null||p.state!=='outside'||p.tripId!==null||p.goal.kind!=='none'||p.journey!==null||Object.values(state.trips).some(t=>t.occupantId===p.id&&t.endTick===null)||Object.values(state.queues).some(q=>q.entries.some(e=>e.occupantId===p.id))||Object.values(state.cars).some(c=>c.onboard.some(o=>o.occupantId===p.id)))return false;cancelEvents(state,p.id);delete state.occupants[p.id];return true;}
