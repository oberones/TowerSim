import type { GameState } from '../state/game-state';
import { allocateId } from '../core/ids/allocator';
export type SegmentKind='walking'|'waiting'|'stair'|'riding'|'stranded';
export interface Trip {id:string;occupantId:string;purpose:'officeArrival'|'officeExit'|'abandonedExit';startTick:number;endTick:number|null;outcome:'active'|'completed'|'abandoned'|'stranded';totals:Record<SegmentKind,number>;openSegment:null|{kind:SegmentKind;startTick:number};deniedBoardingCount:number;transferCount:number}
/** Allocate a separate visit or exit history without fabricating successful admission. */
export function startTrip(state:GameState,occupantId:string,purpose:Trip['purpose']):Trip {
 const trip:Trip={id:allocateId('trip',state.ids.entity),occupantId,purpose,startTick:state.clock.tick,endTick:null,outcome:'active',totals:{walking:0,waiting:0,stair:0,riding:0,stranded:0},openSegment:null,deniedBoardingCount:0,transferCount:0};state.trips[trip.id]=trip;return trip;
}
/** Settle the open interval once, leaving subsequent closures harmless. */
export function closeSegment(trip:Trip,atTick:number):void {if(trip.openSegment){if(atTick<trip.openSegment.startTick)throw Error('Segment time reversed');trip.totals[trip.openSegment.kind]+=atTick-trip.openSegment.startTick;trip.openSegment=null;}}
/** Switch measured modes at one boundary without overlapping time intervals. */
export function openSegment(trip:Trip,kind:SegmentKind,atTick:number):void {closeSegment(trip,atTick);trip.openSegment={kind,startTick:atTick};}
/** Close a trip exactly once while retaining its experienced failure or completion. */
export function finishTrip(trip:Trip,outcome:'completed'|'abandoned',atTick:number):void {if(trip.endTick!==null)return;closeSegment(trip,atTick);trip.endTick=atTick;trip.outcome=outcome;}
/** Project current segment age without settling or otherwise mutating history. */
export function tripElapsed(trip:Trip,atTick:number):Record<SegmentKind,number> {const totals={...trip.totals};if(trip.openSegment)totals[trip.openSegment.kind]+=atTick-trip.openSegment.startTick;return totals;}
/** Expire closed histories only beyond the configured reporting retention window. */
export function pruneTrips(state:GameState):void {const cutoff=state.clock.tick-(state.scenario.content?.historyLimits.days??30)*state.scenario.dayTicks;for(const trip of Object.values(state.trips))if(trip.endTick!==null&&trip.endTick<cutoff)delete state.trips[trip.id];}
