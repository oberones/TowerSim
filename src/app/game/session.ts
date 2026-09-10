import { createGame, captureState, advance, validateCommand } from '../../simulation';
import type { GameState, Command, CommandResult } from '../../simulation';
import type { ClockPort, FramePort } from '../ports/clock';
import { Pacing } from './pacing';
import type { Speed } from './pacing';
import { dispatch } from '../commands/dispatch';
import { getHud, getWorldView, inspectFloor } from './queries';
import type { ViewBounds } from './queries';
export type SessionInput={scenario:unknown;seed:string}|{state:unknown};
/** Validate detached starting data before a session can be mounted or replaced. */
function initialState(input:SessionInput):GameState {
  if('state' in input){const state=captureState(input.state as GameState);if(!state.tower)throw Error('Prepared state must contain a playable tower');return state;}
  return createGame(input.scenario,input.seed);
}
/** Own one domain state and runner; all timing, visibility and unsaved status stays outside saves. */
export class GameSession {
  private state:GameState;private pacing=new Pacing();private stop:(()=>void)|null=null;private disposed=false;
  private revision=1;private savedRevision=0;private generation=1;error:string|null=null;
  /** Construct a paused session using platform ports that tests can fully control. */
  constructor(input:SessionInput,private readonly clock:ClockPort,private readonly driver:FramePort){this.state=initialState(input);}
  /** Subscribe once even when composition calls start repeatedly. */
  start(draw:()=>void):void {if(this.disposed)throw Error('Disposed session');if(this.stop)return;this.stop=this.driver.start(timestamp=>{this.frame(timestamp);draw();});}
  /** Preserve owed ticks while yielding after at most 240 ticks or about four milliseconds. */
  frame(timestamp:number):void {
    if(this.disposed)return;this.pacing.accumulate(timestamp);const started=this.clock.now();let remaining=240;
    while(this.pacing.speed!==0 && this.pacing.wholeTicks>0 && remaining>0){
      const count=this.pacing.take(Math.min(32,remaining));const result=advance(this.state,count);
      if(result.advanced>0)this.revision++;
      if(!result.ok){this.pacing.debt+=count-result.advanced;this.pacing.setSpeed(0,this.clock.now());this.error=`Simulation stopped: ${result.code}`;break;}
      remaining-=count;if(this.clock.now()-started>=4)break;
    }
  }
  /** Change only application speed while settling foreground elapsed time at its previous rate. */
  setSpeed(speed:Speed):void {this.pacing.setSpeed(speed,this.clock.now());}
  /** Visibility loss auto-pauses; returning never implicitly resumes or adds hidden time. */
  visibility(visible:boolean):void {this.pacing.setVisible(visible,this.clock.now());}
  /** Sequence domain edits at the last published boundary, including edits while paused. */
  dispatch(command:Command):CommandResult {const before=this.state.lastCommandSequence;const result=dispatch(this.state,command);if(before!==this.state.lastCommandSequence)this.revision++;return result;}
  /** Quote through pure domain rules without consuming command ordinals or random values. */
  preview(command:Command):CommandResult {return validateCommand(this.state,{...command,sequence:this.state.lastCommandSequence+1,atTick:this.state.clock.tick});}
  /** Return a detached valid boundary for tests and the future persistence owner. */
  capture():GameState {return captureState(this.state);}
  /** Return immutable scalar HUD information, including application-owned unsaved state. */
  hud(){return getHud(this.state,this.pacing.speed,this.revision!==this.savedRevision);}
  /** Return a bounded, detached structure projection for renderers and inspectors. */
  world(bounds?:ViewBounds){return getWorldView(this.state,bounds);}
  /** Project floor selection details without exposing mutable ranges. */
  inspectFloor(level:number){return inspectFloor(this.state,level);}
  /** Read the current geometry revision without copying any world records. */
  topologyRevision():number {return this.state.navigation.topologyVersion;}
  /** Expose diagnostic pacing values without granting access to the live accumulator. */
  pacingStatus(){return Object.freeze({debt:this.pacing.debt,speed:this.pacing.speed,generation:this.generation});}
  /** Cancel without side effects or atomically replace with a validated paused tower; never write storage. */
  replace(input:SessionInput,discard:boolean):boolean {
    if(this.revision!==this.savedRevision && !discard)return false;
    const next=initialState(input);const visible=this.pacing.visible;this.state=next;this.pacing=new Pacing();
    this.pacing.setVisible(visible,this.clock.now());this.revision=1;this.savedRevision=0;this.generation++;this.error=null;return true;
  }
  /** Cancel this session's only runner; repeated disposal is harmless. */
  dispose():void {if(this.disposed)return;this.disposed=true;this.stop?.();this.stop=null;}
}
