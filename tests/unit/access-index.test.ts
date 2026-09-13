import {expect,test} from 'vitest';
import {hasLobbyAccess} from '../../src/simulation/navigation/access-index';
import {buildGraph} from '../../src/simulation/navigation/graph';
import {findRoute} from '../../src/simulation/navigation/find-route';
import {measureWork} from '../../src/simulation/core/work-counters';
import {decodeState,encodeState} from '../../src/simulation';
import {upperOffice,elevator} from '../fixtures/transport';
import {command} from '../fixtures/one-worker';
import type {GameState} from '../../src/simulation';

/** Compare connectivity against the pre-optimization graph/path oracle at arbitrary half-cell anchors. */
function matchesRoutes(state:GameState):void {
 for(let floor=0;floor<=3;floor++)for(const x2 of [0,1,20,21,47,48,95,96]){
  const graph=buildGraph(state,[{id:'oracle',at:{floor,x2}}]),lobby=state.tower!.lobby.id;
  expect(hasLobbyAccess(state,floor,x2),`${floor}:${x2}`).toBe(!!findRoute(graph,lobby,'oracle')&&!!findRoute(graph,'oracle',lobby));
 }
}
test('connectivity matches routes before/after service changes and after a cold restore',()=>{
 const state=upperOffice(3);matchesRoutes(state);elevator(state,3);matchesRoutes(state);
 const shaftId=Object.keys(state.shafts)[0]!;
 expect(command(state,{kind:'setElevatorServiceRange',payload:{shaftId,minFloor:0,maxFloor:2}}).ok).toBe(true);matchesRoutes(state);
 matchesRoutes(decodeState(encodeState(state)));
 expect(command(state,{kind:'demolishEntity',payload:{entityId:shaftId}}).ok).toBe(true);matchesRoutes(state);
});
test('many access checks share one topology index and rejected edits leave that topology usable',()=>{
 const state=decodeState(encodeState(elevator(upperOffice(3),3)));
 const result=measureWork(()=>{for(let n=0;n<100;n++)expect(hasLobbyAccess(state,3,50)).toBe(true);});
 expect(result.counts.accessBuilds).toBe(1);expect(result.counts.pathSearches).toBe(0);
 const version=state.navigation.topologyVersion;
 expect(command(state,{kind:'demolishFloorRange',payload:{floor:0,startX:0,endXExclusive:10}}).ok).toBe(false);
 expect(state.navigation.topologyVersion).toBe(version);expect(hasLobbyAccess(state,3,50)).toBe(true);
});
