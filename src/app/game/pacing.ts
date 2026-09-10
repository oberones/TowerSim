export type Speed=0|1|4|8;
export const TICKS_PER_SECOND=120;
/** Keep foreground fractional/whole debt across pauses and speed changes without skipping ticks. */
export class Pacing {
  speed:Speed=0; debt=0; visible=true; private anchor:number|null=null;
  /** Count complete owed ticks, absorbing sub-ulp accumulator noise. */
  get wholeTicks():number {return Math.floor(this.debt+1e-9);}
  /** Earn time only while running and visible; monotonic timestamps come from the platform. */
  accumulate(now:number):void {
    if(!Number.isFinite(now) || now<0 || (this.anchor!==null && now<this.anchor))throw Error('Nonmonotonic platform timestamp');
    if(this.anchor!==null && this.visible && this.speed!==0)this.debt+=(now-this.anchor)/1000*TICKS_PER_SECOND*this.speed;
    this.anchor=now;
  }
  /** Settle time at the old rate before changing the selected speed. */
  setSpeed(speed:Speed,now:number):void {
    if(![0,1,4,8].includes(speed))throw Error('Unsupported speed');
    this.accumulate(now);this.speed=this.visible?speed:0;
  }
  /** Suspend on visibility loss, retaining earned debt for deliberate player resume. */
  setVisible(visible:boolean,now:number):void {this.accumulate(now);this.visible=visible;if(!visible)this.speed=0;}
  /** Consume at most the requested whole ticks while running, preserving all remaining debt. */
  take(limit:number):number {
    if(!Number.isSafeInteger(limit)||limit<0)throw Error('Invalid batch size');
    if(!this.visible || this.speed===0)return 0;
    const count=Math.min(limit,this.wholeTicks);this.debt=Math.max(0,this.debt-count);return count;
  }
}
