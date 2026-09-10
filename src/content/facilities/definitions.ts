import { freezeDeep } from '../../simulation/state/plain';
import type { FacilityDefinition } from '../../simulation/state/content';
/** Compose original MVP definition data with explicit economic and capability fields. */
function definition(typeId:string,displayName:string,width:number,capability:string,cost:number,operating:number,extra:Partial<FacilityDefinition>={}):FacilityDefinition {
  return {typeId,definitionVersion:1,displayName,footprint:{width,height:1},entranceOffsetX2:width,constructionCostMinor:cost,operatingMinorPerDay:operating,capacity:0,rentMinorPerDay:0,visitPriceMinor:0,perFloorCostMinor:0,scheduleProfileId:null,capabilities:[capability],...extra};
}
export const DEFINITIONS=freezeDeep([
  definition('lobby.basic','Lobby',8,'entrance',0,0),
  definition('office.small','Office',16,'officeLease',60000,4000,{capacity:32,rentMinorPerDay:20000,scheduleProfileId:'office.workday'}),
  definition('restaurant.small','Restaurant',20,'customerVisit',80000,6000,{visitPriceMinor:500,scheduleProfileId:'restaurant.lunch'}),
  definition('stairs.basic','Stairs',2,'verticalStair',5000,0),
  definition('elevator.standard','Elevator',2,'elevatorService',200000,3000,{capacity:8,perFloorCostMinor:5000}),
] as const);
