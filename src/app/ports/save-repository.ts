import type { SaveEnvelope,SaveMetadata } from '../../simulation/state/save-envelope';
export const MAIN_SLOT='local-main';
/** Own atomic slot replacement; adapters reject failures and acknowledge only committed transactions. */
export interface SaveRepository {read(slotId:string):Promise<unknown|null>;write(slotId:string,envelope:SaveEnvelope):Promise<void>;listMetadata():Promise<SaveMetadata[]>}
