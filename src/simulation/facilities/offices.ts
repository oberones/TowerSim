import type { GameState } from '../state/game-state';
import type { Accrual } from '../economy/accrual';
export interface Office {
  id:string; typeId:'office.small'; definitionVersion:1; floor:number; x:number; width:number; height:1;
  entranceX2:number; createdTick:number; generation:number;
  lease:null|{tenantId:string;leasedAtTick:number;assignedWorkerIds:string[]}; accrual:Accrual;
}
/** Resolve the persisted definition that owns office prices and workforce capacity. */
export function officeDefinition(state:GameState){return state.scenario.content!.definitions.find(d=>d.typeId==='office.small')!;}
