import { expect, test } from 'vitest';
import { createGame, advance, encodeState, decodeState } from '../../src/simulation';
import { MVP_DEFAULT } from '../../src/content/scenarios/mvp-default';
import { SEEDS } from '../fixtures/seeds';

test('creates a supported permanent lobby, funds, Level 1 and pending 06:00 review', () => {
  const s = createGame(MVP_DEFAULT, SEEDS[0]);
  expect(s.clock).toEqual({ tick: 21600, initialReviewPending: true, lastDayBoundaryTick: 0 });
  expect(s.tower!.floors[0]!.constructedRanges).toEqual([{ startX: 0, endXExclusive: 120 }]);
  expect(s.tower!.lobby).toMatchObject({ floor: 0, x: 0, width: 8 });
  expect(s.progression.level).toBe(1); expect(s.economy.balanceMinor).toBe(1000000);
  expect(s.economy.transactions).toEqual([]); expect(s.rng.seed).toBe(SEEDS[0]);
  expect(decodeState(encodeState(s))).toEqual(s);
  advance(s, 0); expect(s.clock.initialReviewPending).toBe(true);
  advance(s, 1); expect(s.clock.initialReviewPending).toBe(false);
  expect(s.economy.transactions).toEqual([]);
});
test('honors a nondefault width, negative ground and disjoint configured base ranges', () => {
  const input = JSON.parse(JSON.stringify(MVP_DEFAULT));
  input.world = { ...input.world, widthCells: 63, groundFloor: -2, minFloor: -3, maxFloor: 6,
    initialConstructedRanges: [{startX: 0, endXExclusive: 24}, {startX: 30, endXExclusive: 63}] };
  const s = createGame(input, SEEDS[1]);
  expect(s.tower!.floors[0]!.level).toBe(-2); expect(s.tower!.lobby.floor).toBe(-2);
  expect(s.tower!.floors[0]!.constructedRanges).toEqual(input.world.initialConstructedRanges);
  expect(decodeState(encodeState(s))).toEqual(s);
  input.world.initialConstructedRanges[0].endXExclusive = 4;
  expect(() => createGame(input, SEEDS[1])).toThrow();
});
