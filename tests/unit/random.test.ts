import { expect, test } from 'vitest';
import { parseSeed, Xoshiro128 } from '../../src/simulation/core/random/xoshiro128';
// Values independently computed with the author's unsigned C reference transition.
test('matches corrected xoshiro128** 1.1 golden vector and restored continuation', () => {
  const rng = new Xoshiro128('00000001000000020000000300000004');
  expect(Array.from({length: 10}, () => rng.nextUint32())).toEqual([11520,0,5927040,70819200,2031721883,1637235492,1287239034,3734860849,3729100597,4258142804]);
  const copy = Xoshiro128.restore(rng.export());
  expect(Array.from({length: 50}, () => copy.nextUint32())).toEqual(Array.from({length: 50}, () => rng.nextUint32()));
});
test('rejects malformed/zero state and canonicalizes hexadecimal seed case', () => {
  for (const seed of ['', '1', '0'.repeat(32), 'g'.repeat(32)]) expect(() => parseSeed(seed)).toThrow();
  const rng = new Xoshiro128('ABCDEF01000000020000000300000004');
  expect(rng.export().seed).toBe('abcdef01000000020000000300000004');
  for (const words of [[0,0,0,0],[1,2,3,-1],[1,2,3,2**32],[1,2,3],[1,2,3,1.2]]) expect(() => Xoshiro128.restore({...rng.export(), words})).toThrow();
  const exported = rng.export(); exported.words[0] = 0;
  expect(rng.export().words[0]).not.toBe(0);
});
test('bounded rejection sampling discards biased tail and checks bounds before drawing', () => {
  const rng = new Xoshiro128('00000001000000020000000300000004');
  const before = rng.export();
  for (const bound of [0,-1,1.5,2**32+1]) expect(() => rng.bounded(bound)).toThrow();
  expect(rng.export()).toEqual(before);
  const draws = [0xffffffff, 7]; let count = 0;
  rng.nextUint32 = () => draws[count++]!;
  expect(rng.bounded(10)).toBe(7); expect(count).toBe(2);
  expect(new Xoshiro128(before.seed).bounded(2**32)).toBe(11520);
});
