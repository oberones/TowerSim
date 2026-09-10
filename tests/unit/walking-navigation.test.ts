import {test,expect} from 'vitest';
import {oneWorker} from '../fixtures/one-worker';
import {buildGraph} from '../../src/simulation/navigation/graph';
import {findRoute} from '../../src/simulation/navigation/find-route';
import {RouteCache} from '../../src/simulation/navigation/route-cache';
import {floor} from '../fixtures/tower';
test('half-tick cost rounds once across added anchors and lobby access is symmetric',()=>{const s=oneWorker(1),extra=[{id:'a',at:{floor:0,x2:9}},{id:'b',at:{floor:0,x2:14}}];const base=findRoute(buildGraph(s,extra),'a','b')!;expect(base).toMatchObject({cost2:5,durationTicks:3});expect(findRoute(buildGraph(s,[...extra,{id:'middle',at:{floor:0,x2:10}}]),'a','b')).toEqual(base);const id=Object.keys(s.offices)[0]!;expect(findRoute(buildGraph(s),s.tower!.lobby.id,id)?.durationTicks).toBe(28);expect(findRoute(buildGraph(s),id,s.tower!.lobby.id)?.durationTicks).toBe(28);});
test('gaps cannot route and bounded cache eviction is semantically neutral',()=>{const s=oneWorker();floor(s,1,0,8);floor(s,1,16,24);const g=buildGraph(s,[{id:'a',at:{floor:1,x2:4}},{id:'b',at:{floor:1,x2:40}}]);expect(findRoute(g,'a','b')).toBeNull();const cache=new RouteCache(1);expect(cache.get(0,'a','b',()=>findRoute(g,'a','b'))).toBeNull();cache.get(1,'x','y',()=>null);expect(cache.size).toBe(1);expect(cache.get(0,'a','b',()=>findRoute(g,'a','b'))).toBeNull();});
