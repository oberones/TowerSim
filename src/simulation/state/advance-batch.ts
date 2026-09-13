import type {GameState} from './game-state';
import {countWork} from '../core/work-counters';
/** Own two detached entity collections for one synchronous application/headless batch.
 * Only dictionary slots are journaled between ticks; every changed entity remains copied.
 * Closing a batch drops this privilege so references from the next caller remain isolated.
 */
export class AdvanceBatch {
 private occupants:GameState['occupants']|null=null;private trips:GameState['trips']|null=null;
 /** Detach collection roots once, including after a command replaces either collection mid-batch. */
 prepare(state:GameState):GameState {
  if(this.occupants!==state.occupants)this.occupants=this.copy(state.occupants);
  if(this.trips!==state.trips)this.trips=this.copy(state.trips);
  return {...state,occupants:this.occupants,trips:this.trips};
 }
 /** Copy record slots without cloning any existing entity or touching immutable historical data. */
 private copy<T>(records:Record<string,T>):Record<string,T> {const result:Record<string,T>={};let slots=0;for(const key of Object.keys(records)){result[key]=records[key]!;slots++;}countWork('draftCopiedSlots',slots);countWork('draftContainersCopied');return result;}
}
