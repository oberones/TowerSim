import { createGame,applyCommand,advance,validateScenario } from '../../src/simulation';
import type { GameState,Command } from '../../src/simulation';
import { MVP_DEFAULT } from '../../src/content/scenarios/mvp-default';
export const OFFICE_WALK_TICKS=28*MVP_DEFAULT.content.walkingTicksPerCell;
export const WALKER_SEED='00000001000000020000000300000004';
/** Validate a one-worker office scenario while leaving default workforce content unchanged. */
export function oneWorkerScenario(walkingTicksPerCell=MVP_DEFAULT.content.walkingTicksPerCell){return validateScenario({...MVP_DEFAULT,scenarioId:'one-worker',content:{...MVP_DEFAULT.content,walkingTicksPerCell,definitions:MVP_DEFAULT.content.definitions.map(d=>d.typeId==='office.small'?{...d,capacity:1}:d)}});}
/** Send every fixture construction action through public ordered gameplay ingress. */
export function command(s:GameState,c:Command){return applyCommand(s,{...c,sequence:s.lastCommandSequence+1,atTick:s.clock.tick});}
/** Place an office with ordinary geometry and finite-market validation. */
export function place(s:GameState,x=24,floor=0){const r=command(s,{kind:'placeFacility',payload:{definitionId:'office.small',floor,x}});if(!r.ok)throw Error(r.message??r.code);return Object.values(s.offices).at(-1)!;}
/** Prepare the paused checkpoint before leasing; gameplay alone subsequently produces the worker. */
export function oneWorker(walkingTicksPerCell=MVP_DEFAULT.content.walkingTicksPerCell){const s=createGame(oneWorkerScenario(walkingTicksPerCell),WALKER_SEED);place(s);return s;}
/** Advance a fixture to an absolute completed tick and fail loudly on any deterministic error. */
export function until(s:GameState,tick:number):void {const r=advance(s,tick-s.clock.tick);if(!r.ok)throw Error(JSON.stringify(r));}
/** Run only the initial review, returning the retained worker produced by the domain. */
export function leasedWorker(){const s=oneWorker();until(s,s.clock.tick+1);return {s,id:Object.keys(s.occupants)[0]!};}

/** Prepare the default-speed approach using normal construction and advancement before mounting. */
export function oneWorkerObservation(){const sc=oneWorkerScenario();const s=createGame({...sc,scenarioId:'one-worker-observation'},WALKER_SEED);place(s);until(s,21601);until(s,Object.values(s.occupants)[0]!.schedule!.arrivalTick-120);return s;}
