import { test,expect } from 'vitest';
import { stairs,upperOffice,elevator } from '../fixtures/transport';
import { buildGraph } from '../../src/simulation/navigation/graph';
import { findRoute } from '../../src/simulation/navigation/find-route';
test.each([1,2,3])('journeys to floor %i use nearer stairs for short trips and prefer elevators for long trips',floor=>{const s=elevator(stairs(upperOffice(floor),floor),floor),g=buildGraph(s),r=findRoute(g,s.tower!.lobby.id,Object.keys(s.offices)[0]!)!;expect(r.legs.some(l=>l.kind==='elevator')).toBe(floor===3);expect(r.legs.some(l=>l.kind==='stair')).toBe(floor<=2);});
test('opposite-mode fallback stays reachable and same-floor trips walk',()=>{const s=elevator(upperOffice(1),1);expect(findRoute(buildGraph(s),s.tower!.lobby.id,Object.keys(s.offices)[0]!)!.legs.some(l=>l.kind==='elevator')).toBe(true);const a=stairs(upperOffice(3),3);expect(findRoute(buildGraph(a),a.tower!.lobby.id,Object.keys(a.offices)[0]!)!.legs.some(l=>l.kind==='stair')).toBe(true);const g=buildGraph(s,[{id:'near',at:{floor:0,x2:60}}]);expect(findRoute(g,s.tower!.lobby.id,'near')!.legs.every(l=>l.kind==='walk')).toBe(true);});
test('an immutable elevator preference survives intermediate floors and a large queue estimate',()=>{const s=elevator(stairs(upperOffice(3),3),3);const g=buildGraph(s,[{id:'replan',at:{floor:2,x2:20}}]);for(const edges of g.edges.values())for(const edge of edges)if(edge.kind==='board')edge.cost2=1000000;expect(findRoute(g,'replan',Object.keys(s.offices)[0]!,'elevator')!.legs.some(l=>l.kind==='elevator')).toBe(true);});

test.each([1,2])('short floor-%i journeys use the nearer elevator even with a long estimated wait',floor=>{
 const s=elevator(stairs(upperOffice(floor),floor),floor,8),g=buildGraph(s);
 for(const edges of g.edges.values())for(const edge of edges)if(edge.kind==='board')edge.cost2=1000000;
 const route=findRoute(g,s.tower!.lobby.id,Object.keys(s.offices)[0]!)!;
 expect(route.legs.find(l=>l.kind!=='walk')?.kind).toBe('elevator');
});
test.each([1,2])('short descending floor-%i journeys also choose the nearer usable entrance',floor=>{
 const s=elevator(stairs(upperOffice(floor),floor),floor,18),g=buildGraph(s);
 const route=findRoute(g,Object.keys(s.offices)[0]!,s.tower!.lobby.id)!;
 expect(route.legs.find(l=>l.kind!=='walk')?.kind).toBe('elevator');
});
test('short trips still use nearer stairs when an elevator has a lower estimated total cost',()=>{
 const s=elevator(stairs(upperOffice(1)),1),g=buildGraph(s);
 for(const edges of g.edges.values())for(const edge of edges)if(edge.kind==='stair')edge.cost2=1000000;
 expect(findRoute(g,s.tower!.lobby.id,Object.keys(s.offices)[0]!)!.legs.find(l=>l.kind!=='walk')?.kind).toBe('stair');
});

test('an unusable nearby elevator cannot hide a connected stair alternative',()=>{
 const s=elevator(stairs(upperOffice(2),2),2,8),g=buildGraph(s);
 for(const [id,edges] of g.edges)g.edges.set(id,edges.filter(edge=>edge.kind!=='ride'));
 const route=findRoute(g,s.tower!.lobby.id,Object.keys(s.offices)[0]!)!;
 expect(route.legs.some(l=>l.kind==='stair')).toBe(true);
 expect(route.legs.some(l=>l.kind==='elevator')).toBe(false);
});
