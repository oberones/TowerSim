export { createKernelState } from './state/game-state';
export type { GameState } from './state/game-state';
export { validateCommand, applyCommand, query } from './commands/ingress';
export type { Command, CommandEnvelope, CommandResult } from './commands/types';
export { advance } from './core/clock/advance';
export type { AdvanceResult } from './core/clock/advance';
export { captureState, encodeState, decodeState } from './state/codec';
export { validateState } from './state/validate-state';
export { rebuildDerived } from './state/rebuild-derived';

export { createGame } from './state/create-game';
export { validateScenario } from './state/scenario';
export type { PlayableScenario } from './state/scenario';
