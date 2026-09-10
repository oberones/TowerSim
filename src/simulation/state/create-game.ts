import { createKernelState } from './game-state';
import type { GameState } from './game-state';
import { createTower } from '../world/tower';
import { assertState } from './validate-state';
/** Create a paused-session-ready site; construction and queries leave the initial review pending. */
export function createGame(scenario:unknown,seed:string):GameState {
  const state=createKernelState(scenario,seed);state.tower=createTower(state);assertState(state);return state;
}
