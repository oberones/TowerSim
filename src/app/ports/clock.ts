/** Platform timing is injected; simulation code receives only integer ticks. */
export interface ClockPort {
  now():number;
  requestFrame(callback:(timestamp:number)=>void):number;
  cancelFrame(id:number):void;
}
/** A generation-owned platform loop; the session can own at most one subscription. */
export interface FramePort {start(callback:(timestamp:number)=>void):()=>void}
