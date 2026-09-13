import { elevator,upperOffice,arrival } from './transport';
import { until } from './one-worker';
import type { CarPhase } from '../../src/simulation/transportation/elevators/types';
/** Prepare one leased upper-floor worker without changing production elevator capacity or timings. */
export function oneElevatorPassenger(){return elevator(upperOffice(3),3);}
/** Stop at the first occurrence of a real car phase produced by the worker's public gameplay journey. */
export function passengerAtPhase(phase:CarPhase){const s=oneElevatorPassenger(),id=arrival(s),carId=Object.keys(s.cars)[0]!;for(let ticks=0;ticks<2000;ticks++){if(s.cars[carId]!.phase===phase)return {s,id,carId};until(s,s.clock.tick+1);}throw Error(`Car never reached ${phase}`);}
/** Prepare a paused observation shortly before the real worker's request for the shared browser application. */
export function elevatorObservation(){const s=oneElevatorPassenger();until(s,s.clock.tick+1);until(s,Object.values(s.occupants)[0]!.schedule!.arrivalTick-120);return s;}
