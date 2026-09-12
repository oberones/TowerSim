import type { GameState } from '../state/game-state';
import type { Accrual } from '../economy/accrual';
export interface Restaurant {id:string;typeId:'restaurant.small';definitionVersion:1;floor:number;x:number;width:number;height:1;entranceX2:number;createdTick:number;generation:number;accrual:Accrual;visits:number;revenueMinor:number}
export interface RestaurantVisit {occupantId:string;facilityId:string;generation:number;arrivalTick:number;durationTicks:number;admittedTick:number|null;endTick:number|null;paidMinor:number;status:'scheduled'|'traveling'|'inside'|'exiting'|'departed'|'canceled'|'skipped'}
export interface RestaurantDay {day:number;allowance:number;allocations:{facilityId:string;count:number}[];visits:RestaurantVisit[]}
/** Resolve the saved restaurant definition rather than importing mutable global balance data. */
export function restaurantDefinition(s:GameState){return s.scenario.content!.definitions.find(d=>d.typeId==='restaurant.small')!;}
/** Locate a customer's historical visit even after its destination room has been demolished. */
export function customerVisit(s:GameState,id:string):RestaurantVisit|undefined {for(const day of s.restaurantDays){const visit=day.visits.find(v=>v.occupantId===id);if(visit)return visit;}return undefined;}
