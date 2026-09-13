import type { GameSession } from './session';
import type { SaveRepository } from '../ports/save-repository';
import { SaveGame } from './save-game';
import { loadGame } from './load-game';
/** Own mutually exclusive player storage actions while allowing ordinary simulation and construction to continue. */
export class SaveWorkflow {busy=false;message='Save explicitly to keep this tower on this browser.';private saver:SaveGame;
 /** Share one serialized writer with the lifetime of the mounted application. */
 constructor(private readonly session:GameSession,private readonly repository:SaveRepository){this.saver=new SaveGame(session,repository);}
 /** Save a completed boundary and explain whether later play remains unsaved. */
 async save():Promise<void> {if(this.busy)return;this.busy=true;this.message='Saving…';try{const result=await this.saver.save();this.message=result.current?`Saved tick ${result.tick}.${this.session.hud().unsaved?' Newer progress is still unsaved.':''}`:'Saved the previous tower; the current tower is still unsaved.';}catch(error){this.message=`Save failed: ${error instanceof Error?error.message:'storage unavailable'}. Your previous save is retained. Retry when storage is available.`;}finally{this.busy=false;}}
 /** Validate before opening the replacement choice, and keep failures/cancellation usable for a retry. */
 async load(confirm:(tick:number)=>Promise<boolean>):Promise<boolean> {if(this.busy)return false;this.busy=true;this.message='Reading and checking the local save…';try{const result=await loadGame(this.session,this.repository,confirm);this.message=result==='loaded'?`Loaded tick ${this.session.hud().tick}, paused. Resume when ready.`:result==='canceled'?'Load canceled. Your tower is unchanged.':'Load ignored because the active tower changed.';return result==='loaded';}catch(error){this.message=`Load failed: ${error instanceof Error?error.message:'storage unavailable'}. Your current tower is unchanged.`;return false;}finally{this.busy=false;}}
}
