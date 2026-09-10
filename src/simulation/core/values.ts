/** Domain programmer/invariant errors; public ingress translates these to typed failures. */
export class DomainError extends Error {
  /** Attach a stable domain error code to a human-readable invariant failure. */
  constructor(readonly code: 'invalidNumber' | 'overflow' | 'invalidState', message: string) { super(message); }
}
/** Require an exactly representable safe integer before it enters authoritative arithmetic. */
export function integer(value: number): number {
  if (!Number.isSafeInteger(value)) throw new DomainError('invalidNumber', 'Expected a safe integer');
  return value;
}
/** Require a nonnegative safe integer tick or monotonically allocated counter. */
export function tick(value: number): number {
  integer(value);
  if (value < 0) throw new DomainError('invalidNumber', 'Expected a nonnegative tick/counter');
  return value;
}
export const coordinate = integer;
/** Require a strictly positive safe integer duration, bound or ordinal. */
export function positive(value: number): number {
  tick(value);
  if (value === 0) throw new DomainError('invalidNumber', 'Expected a positive integer');
  return value;
}
/** Range-check an exact temporary integer before converting it to a serializable number. */
export function fromBigInt(value: bigint): number {
  if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER)) throw new DomainError('overflow', 'Safe integer overflow');
  return Number(value);
}
/** Add safe integers exactly and reject overflow before mutation. */
export function add(a: number, b: number): number { return fromBigInt(BigInt(integer(a)) + BigInt(integer(b))); }
/** Multiply safe integers exactly and reject overflow before mutation. */
export function multiply(a: number, b: number): number { return fromBigInt(BigInt(integer(a)) * BigInt(integer(b))); }
