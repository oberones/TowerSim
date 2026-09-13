import type { Occupant, OccupantPosition } from './occupant';
const allowed:Record<Occupant['state'],readonly Occupant['state'][]>= {outside:['entering'],waitingForElevator:['entering','ridingElevator'],ridingElevator:['entering'],takingStairs:['entering'],entering:['waitingForElevator','takingStairs','walking','insideFacility','outside','stranded'],walking:['entering'],insideFacility:['entering'],stranded:['entering']};
/** Replace the discriminated physical state atomically and reject impossible lifecycle jumps. */
export function transition(person:Occupant,next:OccupantPosition):void {if(!allowed[person.state].includes(next.state))throw Error(`Illegal transition ${person.state} to ${next.state}`);Object.assign(person,next);}
