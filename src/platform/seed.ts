import { parseSeed } from '../simulation/core/random/xoshiro128';
/** Generate platform entropy, reject the forbidden zero state, and reuse the domain seed parser. */
export function newSeed():string {
  const words=new Uint32Array(4);do{crypto.getRandomValues(words);}while(words.every(word=>word===0));
  return parseSeed(Array.from(words,word=>word.toString(16).padStart(8,'0')).join('')).seed;
}
