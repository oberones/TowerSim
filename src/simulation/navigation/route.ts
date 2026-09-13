import type { Anchor } from '../occupants/occupant';
/** Retain the legacy stairs value for already-committed short journeys in existing saves. */
export type ModePreference='walk'|'nearest'|'stairs'|'elevator';
export type RouteLeg={kind:'walk';from:Anchor;to:Anchor;durationTicks:number}|{kind:'stair';stairId:string;from:Anchor;to:Anchor;durationTicks:number}|{kind:'elevator';serviceId:string;boardingStopId:string;unloadStopId:string;from:Anchor;to:Anchor;durationTicks:number};
export interface Journey {origin:Anchor;destination:Anchor;preference:ModePreference;legs:RouteLeg[];topologyVersion:number}
/** Choose nearby entrances for short trips and elevators for long trips from the immutable journey origin. */
export function modePreference(from:Anchor,to:Anchor):ModePreference {const floors=Math.abs(to.floor-from.floor);return floors===0?'walk':floors<=2?'nearest':'elevator';}
