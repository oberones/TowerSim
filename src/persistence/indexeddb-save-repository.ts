import type { SaveRepository } from '../app/ports/save-repository';
import type { SaveEnvelope,SaveMetadata } from '../simulation/state/save-envelope';
import { validateSaveEnvelope } from '../simulation/state/save-envelope';
/** Implement one-record atomic replacement with native transaction-complete acknowledgement. */
export class IndexedDbSaveRepository implements SaveRepository {
 /** Permit an injected browser factory for deterministic event-order tests; opening remains lazy. */
 constructor(private readonly factory:()=>IDBFactory=()=>globalThis.indexedDB){}
 /** Report unavailable/blocked connections and close late successes after a rejected open. */
 private open():Promise<IDBDatabase> {return new Promise((resolve,reject)=>{let request:IDBOpenDBRequest;let rejected=false;try{const factory=this.factory();if(!factory)throw Error('Local storage is unavailable in this browser');request=factory.open('TowerSimSaves',1);}catch(error){reject(error);return;}request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('saves'))request.result.createObjectStore('saves');};request.onblocked=()=>{rejected=true;reject(Error('Local storage is blocked by another open TowerSim tab. Close that tab and retry.'));};request.onerror=()=>{rejected=true;reject(request.error??Error('Unable to open local storage'));};request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>db.close();if(rejected)db.close();else resolve(db);};});}
 /** Issue all database work synchronously and acknowledge only complete, keeping request success provisional. */
 private async transaction<T>(mode:IDBTransactionMode,issue:(store:IDBObjectStore)=>IDBRequest<T>):Promise<T> {const db=await this.open();return new Promise((resolve,reject)=>{let tx:IDBTransaction;try{tx=db.transaction('saves',mode);const request=issue(tx.objectStore('saves'));let result:T;request.onsuccess=()=>{result=request.result;};tx.oncomplete=()=>{db.close();resolve(result);};tx.onabort=()=>{db.close();reject(tx.error??request.error??Error('Local save was not committed; your previous save remains available.'));};tx.onerror=()=>{};}catch(error){db.close();reject(error);}});}
 /** Return detached stored data for application validation; reading never alters the saved slot. */
 async read(slotId:string):Promise<unknown|null> {return (await this.transaction('readonly',store=>store.get(slotId)))??null;}
 /** Validate and serialize before the transaction opens; put replaces the complete prior envelope atomically. */
 async write(slotId:string,envelope:SaveEnvelope):Promise<void> {const candidate=JSON.parse(JSON.stringify(validateSaveEnvelope(envelope,slotId))) as SaveEnvelope;await this.transaction('readwrite',store=>store.put(candidate,slotId));}
 /** List supported slot metadata without exposing invalid saved payloads as loadable towers. */
 async listMetadata():Promise<SaveMetadata[]> {const values=await this.transaction<unknown[]>('readonly',store=>store.getAll());return values.map(value=>validateSaveEnvelope(value).metadata);}
}
