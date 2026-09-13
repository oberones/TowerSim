import { expect, test } from 'vitest';
import { inspectFloor } from '../../src/app/game/queries';
import { tower, floor } from '../fixtures/tower';
import { encodeState } from '../../src/simulation';

test('floor details expose exact usable space and access causes without live references',()=>{
  const s=tower();floor(s,1,0,20);floor(s,1,25,30);const before=encodeState(s);
  const ground=inspectFloor(s,0)!;expect(ground.builtCells).toBe(120);expect(ground.freeCells).toBe(112);expect(ground.spans[0]!.access.accessible).toBe(true);
  const upper=inspectFloor(s,1)!;expect(upper.builtCells).toBe(25);expect(upper.freeCells).toBe(25);expect(upper.spans.every(r=>!r.access.accessible)).toBe(true);
  expect(()=>{(upper.spans as any).pop();}).toThrow();expect(encodeState(s)).toBe(before);expect(inspectFloor(s,8)).toBe(null);
});
