import { departCustomer } from './customer-lifecycle';
import type { GameState } from '../state/game-state';
import type { Occupant } from './occupant';
import { accessAt } from '../world/walking-space';
import { departWorker } from './facility-transitions';
/** Drop stale future legs while retaining physical commitments, abandoning only destinations with no valid access. */
export function disruptTrip(state:GameState,p:Occupant):boolean {if(p.journey){p.journey.legs=[];p.replanAfterCurrentLeg=true;}if((p.goal.kind==='office'||p.goal.kind==='restaurant')){const office=(state.offices[p.goal.facilityId]??state.restaurants[p.goal.facilityId]);if(!office||!accessAt(state,office.floor,office.entranceX2).accessible){if(p.kind==='customer')departCustomer(state,p);else departWorker(state,p);return true;}}return false;}
