import { createHash } from 'node:crypto';
import { encodeState } from '../../src/simulation';
import type { GameState } from '../../src/simulation';
export const sha256=(value:string):string=>createHash('sha256').update(value).digest('hex');
export const digest=(state:GameState):string=>sha256(encodeState(state));
