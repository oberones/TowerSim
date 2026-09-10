import type { GameSession } from '../app/game/session';
import type { CommandResult, FloorKind, FloorPayload } from '../simulation/commands/types';
import { previewConstruction, commitConstruction } from '../app/commands/construction';
import { clonePlain, freezeDeep } from '../simulation/state/plain';
export type ToolState={kind:'inactive'}|{kind:'choosingTool';mode:FloorKind}|{kind:'preview';mode:FloorKind;proposal:FloorPayload;quote:CommandResult}|{kind:'committing';mode:FloorKind;proposal:FloorPayload};
/** Keep logical preview coordinates independent of camera state, revisions and pointer rendering. */
export class BuildTool {
  private state:ToolState={kind:'inactive'};
  /** Retain only the application boundary; input never owns a mutable domain state. */
  constructor(private readonly session:GameSession){}
  /** Select a floor edit mode without making a proposal or changing the tower. */
  choose(mode:FloorKind):void {this.state={kind:'choosingTool',mode};}
  /** Copy a logical proposal and quote its entire footprint against current domain rules. */
  propose(proposal:FloorPayload):void {if(this.state.kind==='inactive')return;this.state={kind:'preview',mode:this.state.mode,proposal:{...proposal},quote:previewConstruction(this.session,this.state.mode,proposal)};}
  /** Return a detached immutable tool snapshot for preview rendering and text feedback. */
  current():ToolState {return freezeDeep(clonePlain(this.state));}
  /** Requote the unchanged logical location when authoritative time or geometry has changed. */
  revalidate():void {if(this.state.kind==='preview')this.propose(this.state.proposal);}
  /** Submit exactly once, then retain an up-to-date preview of that same world span. */
  commit():CommandResult {
    if(this.state.kind!=='preview')return {ok:false,code:'invalidCommand',message:'Choose a floor span first.'};
    const {mode,proposal}=this.state;this.state={kind:'committing',mode,proposal};const result=commitConstruction(this.session,mode,proposal);
    this.state={kind:'preview',mode,proposal,quote:previewConstruction(this.session,mode,proposal)};return result;
  }
  /** Escape abandons tool state without issuing a domain command or consuming a sequence. */
  cancel():void {this.state={kind:'inactive'};}
}
