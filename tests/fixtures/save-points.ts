import type { GameState } from '../../src/simulation';
import { leasedWorker,until,command,OFFICE_WALK_TICKS } from './one-worker';
import { passengerAtPhase } from './one-elevator-passenger';
import { servicePhase } from './service-phases';
import { stairObservation } from './transport';
import { oneCustomer } from './restaurant';
/** Capture dormant, walking, indoor, invalidated and retired workers through their real lifecycle. */
function workerPoint(kind:string):GameState {const {s,id}=leasedWorker();if(kind==='scheduled')return s;until(s,s.occupants[id]!.schedule!.arrivalTick+(kind==='walking'?10:OFFICE_WALK_TICKS));if(kind==='retired-worker'){command(s,{kind:'demolishEntity',payload:{entityId:Object.keys(s.offices)[0]!}});until(s,s.clock.tick+OFFICE_WALK_TICKS);}return s;}
/** Retain an actual stranded person and its unresolved trip after losing the sole elevator. */
function strandedPoint():GameState {const {s,id}=passengerAtPhase('moving');until(s,43200);command(s,{kind:'demolishEntity',payload:{entityId:Object.keys(s.shafts)[0]!}});until(s,s.occupants[id]!.schedule!.departureTick);return s;}
/** Cancel a selected exchange using ordinary demolition, retaining historical processed cohort rows. */
function canceledPoint():GameState {const s=servicePhase('boarding');command(s,{kind:'demolishEntity',payload:{entityId:Object.keys(s.offices)[0]!}});return s;}
/** Publish a safe topology change while preserving the active passenger's physical commitment. */
function topologyPoint():GameState {const {s}=passengerAtPhase('moving');command(s,{kind:'setElevatorServiceRange',payload:{shaftId:Object.keys(s.shafts)[0]!,minFloor:0,maxFloor:3}});return s;}
/** Stop a customer at real admission, retirement or either side of the billing boundary. */
function customerPoint(at:number):GameState {const s=oneCustomer();until(s,at);return s;}
export const SAVE_POINTS:[string,()=>GameState][]=[...['scheduled','walking','inside-office','retired-worker'].map(k=>[k,()=>workerPoint(k)] as [string,()=>GameState]),['stair',()=>stairObservation('climbing').s],['queue-after-denials',()=>servicePhase('denied')],['riding',()=>passengerAtPhase('moving').s],['opening',()=>passengerAtPhase('opening').s],['partial-unload',()=>servicePhase('unloading')],['partial-board',()=>servicePhase('boarding')],['canceled-selection',canceledPoint],['stranded',strandedPoint],['post-topology-edit',topologyPoint],['inside-restaurant',()=>customerPoint(36900)],['retired-customer',()=>customerPoint(40000)],['pre-billing',()=>customerPoint(86399)],['post-billing',()=>customerPoint(86400)]];
