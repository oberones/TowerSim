import { describe, expect, test } from 'vitest';
import { add, multiply, tick, coordinate } from '../../src/simulation/core/values';
import { allocateId, compareIds } from '../../src/simulation/core/ids/allocator';
describe('checked values and immutable ordinal identities', () => {
  test('checked addition agrees with exact integer arithmetic at both safe boundaries',()=>{
    const values=[Number.MIN_SAFE_INTEGER,Number.MIN_SAFE_INTEGER+1,-4503599627370496,-1,0,1,4503599627370496,Number.MAX_SAFE_INTEGER-1,Number.MAX_SAFE_INTEGER];
    for(const a of values)for(const b of values){const exact=BigInt(a)+BigInt(b);if(exact>BigInt(Number.MAX_SAFE_INTEGER)||exact<BigInt(Number.MIN_SAFE_INTEGER))expect(()=>add(a,b)).toThrow('overflow');else expect(add(a,b)).toBe(Number(exact));}
    for(const value of [NaN,Infinity,0.5,Number.MAX_SAFE_INTEGER+1])expect(()=>add(value,0)).toThrow('safe integer');
  });
  test('rejects unsafe inputs and arithmetic before consuming an ordinal', () => {
    for (const value of [NaN, Infinity, 1.5, -1]) expect(() => tick(value)).toThrow();
    expect(coordinate(-2)).toBe(-2);
    expect(() => add(Number.MAX_SAFE_INTEGER, 1)).toThrow();
    expect(() => multiply(Number.MAX_SAFE_INTEGER, 2)).toThrow();
    const counter = {next: Number.MAX_SAFE_INTEGER};
    expect(() => allocateId('event', counter)).toThrow();
    expect(counter.next).toBe(Number.MAX_SAFE_INTEGER);
  });
  test('sorts IDs by kind then numeric ordinal, never lexically by digits', () => {
    const counter = {next: 2};
    const id = allocateId('person', counter);
    expect(id).toBe('person:2'); expect(counter.next).toBe(3);
    expect(['person:10', id, 'person:3'].sort(compareIds)).toEqual(['person:2','person:3','person:10']);
    expect(() => compareIds('person:02', id)).toThrow();
  });
});
