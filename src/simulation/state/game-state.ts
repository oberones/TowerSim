import type { Restaurant,RestaurantDay } from '../facilities/restaurants';
import { emptyTransportReports } from '../metrics/report-state';
import type { TransportReports } from '../metrics/report-state';
import type { WorkforceDay } from '../occupants/worker-lifecycle';
import type { Shaft,ElevatorStop,ElevatorQueue,ElevatorCar } from '../transportation/elevators/types';
import type { Stair } from '../transportation/stairs/stairs';
import type { Tower } from '../world/tower';
import type { EconomyState } from '../economy/ledger';
import type { Counter } from '../core/ids/allocator';
import { Xoshiro128 } from '../core/random/xoshiro128';
import type { RandomState } from '../core/random/xoshiro128';
import type { KernelEvent } from '../core/events/event';
import { validateScenario } from './scenario';
import type { KernelScenario } from './scenario';
import type { Office } from '../facilities/offices';
import type { Occupant } from '../occupants/occupant';
import type { Trip } from '../metrics/trips';
export const STATE_VERSION=1 as const;
export const RULESET_ID='tower-restaurant-v1' as const;
export const CONTENT_VERSION='mvp-restaurant-v1' as const;
export interface GameState {
  readonly stateVersion:typeof STATE_VERSION; readonly rulesetId:typeof RULESET_ID; readonly contentVersion:typeof CONTENT_VERSION;
  readonly scenario:KernelScenario;
  clock:{tick:number;initialReviewPending:boolean;lastDayBoundaryTick:number};
  rng:RandomState;
  ids:{entity:Counter;event:Counter;eventSequence:Counter;transaction:Counter;queueAdmission:Counter};
  shafts:Record<string,Shaft>;stops:Record<string,ElevatorStop>;queues:Record<string,ElevatorQueue>;cars:Record<string,ElevatorCar>;stairs:Record<string,Stair>; offices:Record<string,Office>; occupants:Record<string,Occupant>; trips:Record<string,Trip>; officeMarket:{pendingRelease:number};
  restaurants:Record<string,Restaurant>;restaurantDays:RestaurantDay[];transportReports:TransportReports;workforceDays:WorkforceDay[];
  economy:EconomyState;
  tower:Tower|null; navigation:{topologyVersion:number}; progression:{level:1};
  lastCommandSequence:number;
  scheduledEvents:KernelEvent[];
}
/** Create only the deterministic kernel; createGame adds configured playable geometry. */
export function createKernelState(input:unknown,seed:string):GameState {
  const scenario=validateScenario(input);
  return {stateVersion:STATE_VERSION,rulesetId:RULESET_ID,contentVersion:CONTENT_VERSION,scenario,
    clock:{tick:scenario.initialTick,initialReviewPending:true,lastDayBoundaryTick:0},rng:new Xoshiro128(seed).export(),
    ids:{entity:{next:1},event:{next:2},eventSequence:{next:2},transaction:{next:1},queueAdmission:{next:1}},lastCommandSequence:0,
    restaurants:{},restaurantDays:[],transportReports:emptyTransportReports(),workforceDays:[],shafts:{},stops:{},queues:{},cars:{},stairs:{},offices:{},occupants:{},trips:{},officeMarket:{pendingRelease:0},
    tower:null,navigation:{topologyVersion:0},progression:{level:1},
    economy:{initialMinor:scenario.startingFundsMinor,balanceMinor:scenario.startingFundsMinor,transactions:[],archive:{incomeMinor:0,expensesMinor:0,netMinor:0,count:0,throughTick:0,lastOrdinal:0},operatingDays:[]},
    scheduledEvents:[{id:'event:1',dueTick:scenario.dayTicks,phasePriority:0,sequence:1,kind:'dayBoundary',targetId:'kernel:1',targetGeneration:0,payload:{}}],
  };
}
