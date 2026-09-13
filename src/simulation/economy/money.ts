import { integer, tick, positive, fromBigInt } from '../core/values';
/** Round once, exactly, with ties away from zero. BigInt is temporary, never state. */
export function prorate(amountMinor:number,elapsedTicks:number,periodTicks:number):number {
  const product=BigInt(integer(amountMinor))*BigInt(tick(elapsedTicks));const denominator=BigInt(positive(periodTicks));
  const sign=product<0n ? -1n : 1n;const magnitude=product*sign;
  return fromBigInt(sign*((magnitude*2n+denominator)/(denominator*2n)));
}
