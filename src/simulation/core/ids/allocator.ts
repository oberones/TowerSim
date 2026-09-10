import { add, positive, DomainError } from '../values';
export interface Counter { next: number }
/** Validate a kind-prefixed stable ID and parse its positive safe-integer ordinal. */
export function parseId(id: string): { kind: string; ordinal: number } {
  const match = /^([a-z][a-zA-Z]*):([1-9][0-9]*)$/.exec(id);
  if (!match) throw new DomainError('invalidState', 'Malformed entity ID');
  return {kind: match[1]!, ordinal: positive(Number(match[2]))};
}
/** Preflight the next ordinal before consuming a never-reused entity identity. */
export function allocateId(kind: string, counter: Counter): string {
  const id = `${kind}:${positive(counter.next)}`;
  parseId(id);
  const next = add(counter.next, 1); // Validate every result before mutation.
  counter.next = next;
  return id;
}
/** Compare stable kinds and numeric ordinals, so ordinal 2 precedes ordinal 10. */
export function compareIds(a: string, b: string): number {
  const left = parseId(a); const right = parseId(b);
  return left.kind < right.kind ? -1 : left.kind > right.kind ? 1 : left.ordinal - right.ordinal;
}
