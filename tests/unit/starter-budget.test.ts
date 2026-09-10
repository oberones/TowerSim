import { DEFINITIONS } from '../../src/content/facilities/definitions';
import { SCHEDULES } from '../../src/content/schedules/profiles';
import { LEVEL2 } from '../../src/content/progression/level2';
import { expect, test } from 'vitest';
import { MVP_DEFAULT, starterBudget } from '../../src/content/scenarios/mvp-default';
import { validateScenario } from '../../src/simulation/state/scenario';

test('immutable content funds the published starter plus a full operating day', () => {
  const budget = starterBudget(MVP_DEFAULT);
  expect(budget).toEqual({ constructionMinor: 790000, operatingMinor: 24000, remainingMinor: 186000 });
  expect(Object.isFrozen(MVP_DEFAULT.content.definitions)).toBe(true);
  for(const value of [DEFINITIONS,DEFINITIONS[0]!.footprint,SCHEDULES.office,LEVEL2])expect(Object.isFrozen(value)).toBe(true);
  expect(validateScenario(MVP_DEFAULT)).toEqual(MVP_DEFAULT);
  expect(MVP_DEFAULT.content.standardCarCapacity).toBe(8);
});
test('rejects incompatible capabilities, timing, references and world bounds', () => {
  for (const edit of [
    (s: any) => s.content.definitions[1].capabilities.push('express'),
    (s: any) => s.content.elevatorTiming.boardTicks = 0,
    (s: any) => s.content.definitions[1].scheduleProfileId = 'missing',
    (s: any) => s.world.widthCells = 4,
    (s: any) => s.content.standardCarCapacity = 9,
    (s: any) => s.content.schedules.restaurant.mealShareBasisPoints = 6000,
  ]) {
    const candidate = JSON.parse(JSON.stringify(MVP_DEFAULT)); edit(candidate);
    expect(() => validateScenario(candidate)).toThrow();
  }
});
