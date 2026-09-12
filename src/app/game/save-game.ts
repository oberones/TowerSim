import type { SaveRepository } from '../ports/save-repository';
import { MAIN_SLOT } from '../ports/save-repository';
import { createSaveEnvelope } from '../../simulation/state/save-envelope';
import type { GameSession } from './session';
export type SaveResult={tick:number;revision:number;generation:number;current:boolean};
/** Serialize writes across this repository so an earlier slow transaction cannot overwrite a later capture. */
export class SaveGame {private tail:Promise<unknown>=Promise.resolve();
 /** Bind one session and application-owned storage port without opening a database. */
 constructor(private readonly session:GameSession,private readonly repository:SaveRepository){}
 /** Detach immediately, permit continued play, and mark only the committed capture revision as saved. */
 save():Promise<SaveResult> {const token=this.session.persistenceToken(),envelope=createSaveEnvelope(this.session.capture(),MAIN_SLOT);const work=this.tail.catch(()=>{}).then(async()=>{await this.repository.write(MAIN_SLOT,envelope);const current=this.session.markSaved(token);return {...token,current};});this.tail=work;return work;}
}
