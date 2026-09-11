import { test,expect } from 'vitest';
import { oneWorker } from '../fixtures/one-worker';
import { startTrip,openSegment,finishTrip } from '../../src/simulation/metrics/trips';
import { finalizeTransportDay } from '../../src/simulation/metrics/daily-report';
test('cross-midnight trips contribute once per active day using cumulative experience and bounded daily summaries',()=>{
 const s=oneWorker(),trip=startTrip(s,'occupant:999','officeArrival');openSegment(trip,'waiting',s.clock.tick);s.clock.tick=86400;finalizeTransportDay(s);
 expect(s.transportReports.daily[0]).toMatchObject({samples:1,unresolved:1,completed:0});
 s.clock.tick++;finishTrip(s,trip,'completed',s.clock.tick);s.clock.tick=172800;finalizeTransportDay(s);
 expect(s.transportReports.daily[1]).toMatchObject({samples:1,completed:1,unresolved:0});
 for(let day=3;day<=35;day++){s.clock.tick=day*86400;finalizeTransportDay(s);}
 expect(s.transportReports.daily).toHaveLength(30);expect(s.transportReports.daily.at(-1)).toMatchObject({samples:0,quality:null});
});
