import type { Anchor } from '../occupants/occupant';
export type ModePreference='walk'|'stairs'|'elevator';
export type RouteLeg={kind:'walk';from:Anchor;to:Anchor;durationTicks:number}|{kind:'stair';stairId:string;from:Anchor;to:Anchor;durationTicks:number}|{kind:'elevator';serviceId:string;boardingStopId:string;unloadStopId:string;from:Anchor;to:Anchor;durationTicks:number};
export interface Journey {origin:Anchor;destination:Anchor;preference:ModePreference;legs:RouteLeg[];topologyVersion:number}
/** Fix mode preference at the journey origin, independent of later intermediate floors or queues. */
export function modePreference(from:Anchor,to:Anchor):ModePreference {const floors=Math.abs(to.floor-from.floor);return floors===0?'walk':floors<=2?'stairs':'elevator';}
