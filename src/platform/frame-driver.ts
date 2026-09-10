import type { ClockPort, FramePort } from '../app/ports/clock';
/** Protect each platform frame loop against duplicate starts and already-queued stale callbacks. */
export class FrameDriver implements FramePort {
  private generation=0;private running=false;
  /** Retain the injected platform functions rather than using globals in application code. */
  constructor(private readonly clock:ClockPort) {}
  /** Subscribe once; cancellation invalidates the generation before canceling its queued frame. */
  start(callback:(timestamp:number)=>void):()=>void {
    if(this.running)throw Error('Frame driver already running');
    this.running=true;const generation=++this.generation;let id=0;
    /** Sample monotonic time at delivery: a RAF frame stamp may predate a newer control event. */
    const frame=(_timestamp:number):void=>{if(!this.running || generation!==this.generation)return;callback(this.clock.now());if(this.running && generation===this.generation)id=this.clock.requestFrame(frame);};
    id=this.clock.requestFrame(frame);
    return ()=>{if(generation!==this.generation)return;this.running=false;this.generation++;this.clock.cancelFrame(id);};
  }
}
/** Bind the actual browser clock only at composition time. */
export function browserClock():ClockPort {return {now:()=>performance.now(),requestFrame:callback=>requestAnimationFrame(callback),cancelFrame:id=>cancelAnimationFrame(id)};}
