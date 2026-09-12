import type { SaveRepository } from '../../src/app/ports/save-repository';
import type { SaveEnvelope,SaveMetadata } from '../../src/simulation/state/save-envelope';
/** Model commit acknowledgement and atomic failure without claiming to emulate native IndexedDB. */
export class MemorySaveRepository implements SaveRepository {slot:unknown|null=null;writes=0;fail=false;gate:Promise<void>|null=null;
 /** Return an independent candidate, including deliberately corrupted data for workflow tests. */
 async read(slotId:string):Promise<unknown|null>{if(slotId!=='local-main')throw Error('Unexpected slot');return structuredClone(this.slot);}
 /** Publish only after the controllable commit gate and preserve old data on failure. */
 async write(slotId:string,envelope:SaveEnvelope):Promise<void>{if(slotId!=='local-main')throw Error('Unexpected slot');this.writes++;await this.gate;if(this.fail)throw Error('Quota exceeded');this.slot=structuredClone(envelope);}
 /** Expose metadata for the one fixture slot. */
 async listMetadata():Promise<SaveMetadata[]>{return this.slot?[(this.slot as SaveEnvelope).metadata]:[];}}
