import { test, expect } from 'vitest';
import { nineAtBoarding } from '../fixtures/nine-passengers';
import { queueIndex } from '../../src/simulation/transportation/elevators/queue-index';
import { cancelElevatorRequest } from '../../src/simulation/transportation/elevators/requests';
test('indexed membership and timestamp aggregates stay exact without scanning on repeated reads',()=>{
 const s=nineAtBoarding(),q=Object.values(s.queues).find(q=>q.entries.length)!;
 const index=queueIndex(s),visits=index.entriesVisited;
 for(let n=0;n<100;n++){expect(index.total(q.id,s.clock.tick+n)).toEqual({count:9,waitingTicks:q.entries.reduce((sum,e)=>sum+s.clock.tick+n-e.joinedTick,0)});expect(index.person(q.entries[0]!.occupantId)?.entry.id).toBe(q.entries[0]!.id);}
 expect(index.entriesVisited).toBe(visits);
 const entry=q.entries[0]!;cancelElevatorRequest(s,entry.id,'goalChanged');
 expect(index.person(entry.occupantId)).toBeUndefined();expect(index.total(q.id,s.clock.tick).count).toBe(8);
});
