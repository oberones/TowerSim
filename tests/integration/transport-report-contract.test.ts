import { test,expect } from 'vitest';
import { transportQuery } from '../../src/app/game/transport-queries';
import { inspectOccupant } from '../../src/app/game/occupant-queries';
import { nineAtBoarding } from '../fixtures/nine-passengers';
import { until } from '../fixtures/one-worker';
test('reports expose exact directional stop counts, stable person goals and explicit scopes without mutation',()=>{
 const s=nineAtBoarding(),before=JSON.stringify(s),q=transportQuery(s);
 expect(q.waiting).toBe(9);expect(q.stops).toHaveLength(8);expect(q.live.samples).toBe(9);expect(q.morning?.samples).toBe(9);expect(q.previousDay).toBeNull();expect(Object.isFrozen(q.live.totals)).toBe(true);expect(JSON.stringify(s)).toBe(before);
 const p=inspectOccupant(s,q.stops.find(q=>q.count)!.occupantIds[8]!)!;expect(p).toMatchObject({kind:'worker',state:'waitingForElevator',goal:{kind:'office'},trip:{denials:1,transfers:0}});
 until(s,s.clock.tick+1);expect(transportQuery(s).waiting).toBe(8);expect(inspectOccupant(s,q.stops.find(q=>q.count)!.occupantIds[0]!)!.state).toBe('ridingElevator');
});
