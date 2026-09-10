import { freezeDeep } from '../../simulation/state/plain';
export const SCHEDULES=freezeDeep({
  office:{id:'office.workday',arrivalStart:28800,arrivalEnd:36000,departureStart:61200,departureEnd:68400},
  restaurant:{id:'restaurant.lunch',start:36000,end:57600,mealStart:41400,mealEnd:48600,mealShareBasisPoints:8000,visitMinTicks:1200,visitMaxTicks:2400},
} as const);
