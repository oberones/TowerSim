import {expect,test} from 'vitest';
import {buildGraph,withGraphCache} from '../../src/simulation/navigation/graph';
import {findRoute} from '../../src/simulation/navigation/find-route';
import {withApproachIndex,updateApproach,approachIndex} from '../../src/simulation/navigation/approach-index';
import {elevator,upperOffice} from '../fixtures/transport';
import {nineAtBoarding} from '../fixtures/nine-passengers';
import {command} from '../fixtures/one-worker';

test('shared static graphs retain exact portal/edge ordering at coincident and inserted half-cell anchors',()=>{
 const s=elevator(upperOffice(3),3);
 expect(command(s,{kind:'buildStair',payload:{definitionId:'stairs.basic',lowerFloor:0,x:40}}).ok).toBe(true);
 const pairs=[[0,20,3,50],[0,21,1,81],[2,1,3,3],[0,95,3,95]];
 const expected=pairs.map(([floor,x2,toFloor,toX2])=>buildGraph(s,[{id:'from',at:{floor:floor!,x2:x2!}},{id:'to',at:{floor:toFloor!,x2:toX2!}}]));
 withGraphCache(s,()=>pairs.forEach(([floor,x2,toFloor,toX2],index)=>{
  const actual=buildGraph(s,[{id:'from',at:{floor:floor!,x2:x2!}},{id:'to',at:{floor:toFloor!,x2:toX2!}}]);
  expect(actual).toEqual(expected[index]);expect(findRoute(actual,'from','to')).toEqual(findRoute(expected[index]!,'from','to'));
 }));
});

test('scoped approach updates agree with a fresh reconstruction after a traveler changes commitment',()=>{
 const s=nineAtBoarding(),person=Object.values(s.occupants).find(p=>p.state==='walking')??Object.values(s.occupants)[0]!;
 withApproachIndex(s,()=>{person.journey=null;updateApproach(s,person);const cached=approachIndex(s,person.id);const clone=JSON.parse(JSON.stringify(s));expect(cached).toEqual(approachIndex(clone,person.id));});
});
