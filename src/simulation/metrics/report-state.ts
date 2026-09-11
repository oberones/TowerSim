import type { SegmentKind } from './trips';
export interface TripAggregate {samples:number;completed:number;abandoned:number;stranded:number;unresolved:number;totals:Record<SegmentKind,number>;denials:number;transfers:number;qualityUnits:number}
export interface DailyTransportReport extends TripAggregate {day:number;startTick:number;endTick:number;partial:boolean;quality:number|null;meanWaitingTicks:number|null}
export interface CohortCounters {day:number;currentQueued:number;peakQueue:number}
export interface TransportReports {dayFinished:TripAggregate;daily:DailyTransportReport[];cohorts:CohortCounters[]}
/** Allocate independent zero-valued counters; zero samples have no implied quality. */
export function emptyAggregate():TripAggregate {return {samples:0,completed:0,abandoned:0,stranded:0,unresolved:0,totals:{walking:0,waiting:0,stair:0,riding:0,stranded:0},denials:0,transfers:0,qualityUnits:0};}
/** Initialize report history without inventing a completed day or morning population. */
export function emptyTransportReports():TransportReports {return {dayFinished:emptyAggregate(),daily:[],cohorts:[]};}
