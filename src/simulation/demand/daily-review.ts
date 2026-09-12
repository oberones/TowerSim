import type { GameState } from '../state/game-state';
import { reviewOffices } from './office-leasing';
import { reviewRestaurants } from './restaurant-allocation';
/** Lease offices before allocating external restaurant customers, keeping one deterministic 06:00 review owner. */
export function dailyReview(state:GameState):void {reviewOffices(state);reviewRestaurants(state);}
