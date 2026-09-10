import type { ClockPort } from '../../src/app/ports/clock';
/** Deterministic platform clock that also retains callbacks for stale-generation tests. */
export class FakeClock implements ClockPort {
  time=0; ordinal=0; callback: ((time:number)=>void)|undefined;
  pending=new Map<number,(time:number)=>void>();
  /** Read injected monotonic time without consulting a real timer. */
  now():number { return this.time; }
  /** Queue one callback and retain it for explicit test delivery. */
  requestFrame(callback:(time:number)=>void):number { this.callback=callback; this.pending.set(++this.ordinal,callback); return this.ordinal; }
  /** Remove a pending callback as a platform cancellation would. */
  cancelFrame(id:number):void { this.pending.delete(id); }
  /** Deliver the next queued frame at an exact test timestamp. */
  fire(time:number):void { this.time=time; const next=this.pending.entries().next().value; if(next){this.pending.delete(next[0]);next[1](time);} }
}
