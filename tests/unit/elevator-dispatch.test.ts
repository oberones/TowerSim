import { test,expect } from 'vitest';
import { collectiveSweep } from '../../src/simulation/transportation/elevators/collective-sweep';
import type { DispatchView } from '../../src/simulation/transportation/elevators/dispatch-policy';
/** Supply an immutable controller view with actual service stops and deterministic call ordinals. */
function view(overrides:Partial<DispatchView>={}):DispatchView {return {phase:'idle',currentFloor:2,direction:null,onboardFloors:[],stops:[0,1,2,3,4,5].map(floor=>({id:`stop:${floor+1}`,floor})),calls:[],skipCurrent:false,...overrides};}
test('idle pickups choose distance, lower floor and admission sequence',()=>{expect(collectiveSweep(view({calls:[{floor:4,direction:'down',admissionSequence:1},{floor:0,direction:'up',admissionSequence:2}]}))).toMatchObject({kind:'moveToward',floor:0,direction:'down'});expect(collectiveSweep(view({calls:[{floor:0,direction:'up',admissionSequence:1},{floor:3,direction:'down',admissionSequence:2}]}))).toMatchObject({floor:3});expect(collectiveSweep(view({calls:[{floor:2,direction:'up',admissionSequence:4},{floor:2,direction:'down',admissionSequence:3}]}))).toMatchObject({kind:'serveHere',direction:'down'});});
test('collective sweep serves 2 then 3 then reverses at 5 and skips floor 4',()=>{const calls=[{floor:2,direction:'up' as const,admissionSequence:1},{floor:5,direction:'down' as const,admissionSequence:2}];expect(collectiveSweep(view({phase:'crossing',currentFloor:1,direction:'up',onboardFloors:[3],calls}))).toMatchObject({floor:2,direction:'up'});expect(collectiveSweep(view({phase:'stopped',currentFloor:2,direction:'up',onboardFloors:[3],calls:calls.slice(1),skipCurrent:true}))).toMatchObject({floor:3});expect(collectiveSweep(view({phase:'stopped',currentFloor:3,direction:'up',calls:calls.slice(1),skipCurrent:true}))).toMatchObject({floor:5,direction:'up'});expect(collectiveSweep(view({phase:'crossing',currentFloor:5,direction:'up',calls:calls.slice(1)}))).toMatchObject({kind:'serveHere',direction:'down'});});
test('full cars retain compatible stops, onboard destinations prevent reversal, and policy is read-only',()=>{const v=view({phase:'crossing',currentFloor:1,direction:'up',onboardFloors:Array(8).fill(5),calls:[{floor:2,direction:'up',admissionSequence:1},{floor:0,direction:'up',admissionSequence:2}]});const before=JSON.stringify(v);expect(collectiveSweep(v)).toMatchObject({floor:2,direction:'up'});expect(JSON.stringify(v)).toBe(before);expect(()=>collectiveSweep({...v,phase:'moving'})).toThrow();});

test.each([
 {currentFloor:0,direction:'down' as const,pickup:'up' as const,otherFloor:3},
 {currentFloor:5,direction:'up' as const,pickup:'down' as const,otherFloor:0},
])('closing at floor $currentFloor preserves its opposite queue for reversal',({currentFloor,direction,pickup,otherFloor})=>{
 const v=view({phase:'stopped',currentFloor,direction,skipCurrent:true,calls:[
  {floor:currentFloor,direction:pickup,admissionSequence:1},
  {floor:otherFloor,direction,admissionSequence:2},
 ]});
 expect(collectiveSweep(v)).toMatchObject({kind:'serveHere',floor:currentFloor,direction:pickup});
});

test('closing skips the served direction and preserves commitments ahead of an opposite queue',()=>{
 const v=view({phase:'stopped',currentFloor:2,direction:'up',skipCurrent:true,calls:[
  {floor:2,direction:'up',admissionSequence:1},
  {floor:2,direction:'down',admissionSequence:2},
  {floor:4,direction:'up',admissionSequence:3},
 ]});
 expect(collectiveSweep(v)).toMatchObject({kind:'moveToward',floor:4,direction:'up'});
 expect(collectiveSweep({...v,onboardFloors:[5],calls:v.calls.slice(0,2)})).toMatchObject({kind:'moveToward',floor:5,direction:'up'});
});
