export interface Anchor {floor:number;x2:number}
export type Goal={kind:'office';facilityId:string}|{kind:'exit'}|{kind:'none'};
export type Location={kind:'outside'}|{kind:'anchor';at:Anchor}|{kind:'facility';facilityId:string}|{kind:'walkEdge';from:Anchor;to:Anchor;startTick:number;durationTicks:number};
export type OccupantPosition=
 |{state:'outside';location:{kind:'outside'}}
 |{state:'walking';location:Extract<Location,{kind:'walkEdge'}>}
 |{state:'insideFacility';location:Extract<Location,{kind:'facility'}>}
 |{state:'stranded'|'entering';location:Extract<Location,{kind:'anchor'}>};
export type Occupant={id:string;kind:'worker'|'customer';generation:number;leaseFacilityId:string|null;goal:Goal;
  schedule:null|{day:number;arrivalTick:number;departureTick:number;status:'scheduled'|'traveling'|'admitted'|'departed'|'skipped'|'canceled'};
  tripId:string|null;replanAfterCurrentLeg:boolean} & OccupantPosition;
