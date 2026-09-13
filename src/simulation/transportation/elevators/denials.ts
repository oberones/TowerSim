import type { GameState } from '../../state/game-state';
import type { QueueEntry } from './types';
import { add } from '../../core/values';
/** Record only capacity exclusions from a frozen eligible cohort, once for each service visit. */
export function denyBoarding(s:GameState,entry:QueueEntry,visitId:string):void {if(entry.lastDeniedVisitId===visitId)return;const trip=s.trips[entry.tripId]!;trip.deniedBoardingCount=add(trip.deniedBoardingCount,1);entry.lastDeniedVisitId=visitId;}
