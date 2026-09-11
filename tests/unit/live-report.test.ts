import { test,expect } from 'vitest';
import { liveReport } from '../../src/simulation/metrics/live-report';
import { startTrip,openSegment,finishTrip } from '../../src/simulation/metrics/trips';
import { oneWorker } from '../fixtures/one-worker';
test('live scope includes every unfinished and recent failed trip once and never rewards an empty sample',()=>{
 const s=oneWorker();expect(liveReport(s)).toMatchObject({samples:0,quality:null,label:'No trips yet'});
 const a=startTrip(s,'occupant:999','officeArrival');openSegment(a,'waiting',s.clock.tick);s.clock.tick+=60;
 const before=JSON.stringify(s);expect(liveReport(s)).toMatchObject({samples:1,unresolved:1,quality:97});expect(JSON.stringify(s)).toBe(before);
 finishTrip(s,a,'abandoned',s.clock.tick);const b=startTrip(s,'occupant:998','abandonedExit');b.outcome='stranded';openSegment(b,'stranded',s.clock.tick);
 expect(liveReport(s)).toMatchObject({samples:2,abandoned:1,stranded:1});s.clock.tick+=3600;
 expect(liveReport(s)).toMatchObject({samples:1,abandoned:0,stranded:1,quality:0});
});
