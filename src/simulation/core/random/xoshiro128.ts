/** Adapted from Blackman/Vigna's permitted corrected transition.
 * Full reference permission and disclaimer: tests/fixtures/xoshiro-reference.c;
 * attribution and provenance: docs/provenance.md.
 */
import { DomainError, positive } from '../values';
export const ALGORITHM_ID = 'xoshiro128ss-v1' as const;
export type Words = [number, number, number, number];
export interface RandomState { readonly algorithmId: typeof ALGORITHM_ID; readonly seed: string; words: Words }
/** Parse exactly 128 nonzero-together bits and return the canonical lowercase displayed seed. */
export function parseSeed(seed: string): { seed: string; words: Words } {
  if (typeof seed !== 'string' || !/^[0-9a-fA-F]{32}$/.test(seed)) throw new DomainError('invalidState', 'Seed must contain 32 hexadecimal digits');
  const words = [0,8,16,24].map(offset => Number.parseInt(seed.slice(offset, offset+8),16)) as Words;
  validateWords(words);
  return {seed: seed.toLowerCase(), words};
}
/** Reject invalid uint32 words and the absorbing all-zero generator state. */
function validateWords(words: number[]): asserts words is Words {
  if (words.length !== 4 || words.some(word => !Number.isInteger(word) || word < 0 || word > 0xffffffff) || words.every(word => word === 0)) throw new DomainError('invalidState', 'Expected four nonzero-together uint32 words');
}
/** Rotate one unsigned 32-bit word left using the corrected xoshiro transition semantics. */
const rotate = (value: number, bits: number) => ((value << bits) | (value >>> (32-bits))) >>> 0;
export class Xoshiro128 {
  private words: Words;
  readonly seed: string;
  /** Initialize current generator words from a validated canonical seed. */
  constructor(seed: string) { const parsed = parseSeed(seed); this.seed = parsed.seed; this.words = parsed.words; }
  /** Restore the supported algorithm and current words without replaying or consuming random draws. */
  static restore(state: {algorithmId: string; seed: string; words: number[]}): Xoshiro128 {
    if (state.algorithmId !== ALGORITHM_ID) throw new DomainError('invalidState', 'Unsupported random algorithm');
    validateWords(state.words);
    const rng = new Xoshiro128(state.seed); rng.words = [...state.words]; return rng;
  }
  /** Advance the corrected xoshiro128** state once and return its unsigned 32-bit output. */
  nextUint32(): number {
    const s = this.words;
    const result = Math.imul(rotate(Math.imul(s[1],5),7),9) >>> 0;
    const t = s[1] << 9;
    s[2] = (s[2] ^ s[0]) >>> 0; s[3] = (s[3] ^ s[1]) >>> 0;
    s[1] = (s[1] ^ s[2]) >>> 0; s[0] = (s[0] ^ s[3]) >>> 0;
    s[2] = (s[2] ^ t) >>> 0; s[3] = rotate(s[3],11);
    return result;
  }
  /** Use rejection sampling to return an unbiased integer below the positive uint32 bound. */
  bounded(bound: number): number {
    positive(bound);
    if (bound > 2**32) throw new DomainError('invalidNumber', 'Bound exceeds uint32 range');
    const limit = 2**32 - (2**32 % bound);
    let word: number;
    do { word = this.nextUint32(); } while (word >= limit);
    return word % bound;
  }
  /** Return detached current words and the original seed for exact continuation. */
  export(): RandomState { return {algorithmId: ALGORITHM_ID, seed: this.seed, words: [...this.words]}; }
}
