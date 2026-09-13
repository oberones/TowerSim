import type { Journey } from '../navigation/route';
export interface Anchor {floor:number;x2:number}
export type Goal={kind:'office'|'restaurant';facilityId:string}|{kind:'exit'}|{kind:'none'};
export type Location={kind:'outside'}|{kind:'anchor';at:Anchor}|{kind:'facility';facilityId:string}|{kind:'queue';queueId:string;entryId:string}|{kind:'car';carId:string;unloadStopId:string}|{kind:'stair';stairId:string;from:Anchor;to:Anchor;startTick:number;durationTicks:number}|{kind:'walkEdge';from:Anchor;to:Anchor;startTick:number;durationTicks:number};
export type OccupantPosition=
 |{state:'outside';location:{kind:'outside'}}
 |{state:'waitingForElevator';location:Extract<Location,{kind:'queue'}>}
 |{state:'ridingElevator';location:Extract<Location,{kind:'car'}>}
 |{state:'takingStairs';location:Extract<Location,{kind:'stair'}>}
 |{state:'walking';location:Extract<Location,{kind:'walkEdge'}>}
 |{state:'insideFacility';location:Extract<Location,{kind:'facility'}>}
 |{state:'stranded'|'entering';location:Extract<Location,{kind:'anchor'}>};
export type Occupant={id:string;kind:'worker'|'customer';generation:number;leaseFacilityId:string|null;goal:Goal;
  schedule:null|{day:number;arrivalTick:number;departureTick:number;status:'scheduled'|'traveling'|'admitted'|'departed'|'skipped'|'canceled'};
  journey:Journey|null;tripId:string|null;replanAfterCurrentLeg:boolean} & OccupantPosition;
