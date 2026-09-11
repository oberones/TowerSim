import { test,expect } from 'vitest';
import { createHash } from 'node:crypto';
import { runBenchmark } from './harness';
import { oneElevatorPassenger } from '../fixtures/one-elevator-passenger';
import { until,WALKER_SEED } from '../fixtures/one-worker';
import { encodeState,decodeState } from '../../src/simulation';
import { createRunner } from '../../src/simulation/core/clock/advance';
/** Hash authoritative transport records outside the measured advancement interval. */
function digest(s:ReturnType<typeof oneElevatorPassenger>){return createHash('sha256').update(encodeState(s)).digest('hex');}
test('one elevator passenger route and car phase timing sample',()=>{const initial=oneElevatorPassenger();until(initial,21601);const id=Object.keys(initial.occupants)[0]!;until(initial,initial.occupants[id]!.schedule!.arrivalTick-1);const encoded=encodeState(initial);const report=runBenchmark({name:'single-elevator',seed:WALKER_SEED,contentId:initial.contentVersion,rulesId:initial.rulesetId,fixtureHash:digest(initial),ticks:1200,restore:()=>{const state=decodeState(encoded);return {state,runner:createRunner(state)};},run:runtime=>{expect(runtime.runner.advance(1200).ok).toBe(true);},digest:runtime=>digest(runtime.state),counters:({state:s})=>{const trip=Object.values(s.trips)[0]!;return {people:Object.keys(s.occupants).length,shafts:Object.keys(s.shafts).length,completedTrips:Object.values(s.trips).filter(t=>t.outcome==='completed').length,walkingTicks:trip.totals.walking,waitingTicks:trip.totals.waiting,ridingTicks:trip.totals.riding,transfers:trip.transferCount};}});expect(report.counters[0]?.completedTrips).toBe(1);});
