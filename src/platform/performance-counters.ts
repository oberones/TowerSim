export interface RateSample {durationMs:number;fps:number;ticksPerSecond:number;speed:number}
/** Measure delivered frames and completed ticks with constant storage, outside authoritative state. */
export class PerformanceCounters {
 private start:number|null=null;private tick=0;private frames=0;private speed=0;private generation=0;
 /** Discard an incomplete window after visibility loss or a sampling pause. */
 reset():void {this.start=null;this.frames=0;}
 /** Publish only complete same-speed, same-session windows; loads never produce negative throughput. */
 sample(now:number,tick:number,speed:number,generation:number):RateSample|null {
  if(this.start===null||speed!==this.speed||generation!==this.generation||tick<this.tick){this.start=now;this.tick=tick;this.frames=0;this.speed=speed;this.generation=generation;return null;}
  this.frames++;const durationMs=now-this.start;if(durationMs<1000)return null;
  const sample={durationMs,fps:this.frames*1000/durationMs,ticksPerSecond:(tick-this.tick)*1000/durationMs,speed};
  this.start=now;this.tick=tick;this.frames=0;return Object.freeze(sample);
 }
}
