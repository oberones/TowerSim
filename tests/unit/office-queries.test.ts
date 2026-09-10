import {test,expect} from 'vitest';
import {leasedWorker,until} from '../fixtures/one-worker';
import {inspectOffice} from '../../src/app/game/facility-queries';
import {inspectFloor} from '../../src/app/game/queries';
test('office and floor queries reconcile reservations, assigned/present counts and exact pending finance without mutation',()=>{const {s,id}=leasedWorker(),o=Object.keys(s.offices)[0]!;until(s,s.occupants[id]!.schedule!.arrivalTick+28);const before=JSON.stringify(s),q=inspectOffice(s,o)!;expect(q.assigned).toBe(1);expect(q.present).toBe(1);expect(q.availableMarket).toBe(s.scenario.content!.officeMarketWorkers-1);expect(q.accrued.incomeMinor).toBeGreaterThan(0);expect(inspectFloor(s,0)?.freeCells).toBe(96);expect(()=>{(q as any).present=99;}).toThrow();expect(JSON.stringify(s)).toBe(before);});
