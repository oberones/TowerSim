import type { Direction } from './types';
export interface DispatchView {readonly phase:'idle'|'stopped'|'crossing'|'moving';readonly currentFloor:number;readonly direction:Direction|null;readonly onboardFloors:readonly number[];readonly stops:readonly {readonly id:string;readonly floor:number}[];readonly calls:readonly {readonly floor:number;readonly direction:Direction;readonly admissionSequence:number}[];readonly skipCurrent:boolean}
export type DispatchDecision={kind:'idle'}|{kind:'serveHere';stopId:string;floor:number;direction:Direction}|{kind:'moveToward';stopId:string;floor:number;direction:Direction};
export type DispatchPolicy=(view:DispatchView)=>DispatchDecision;
