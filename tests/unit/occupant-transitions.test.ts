import {test,expect} from 'vitest';
import {leasedWorker,until} from '../fixtures/one-worker';
import {activeIndex} from '../../src/simulation/occupants/active-index';
import {transition} from '../../src/simulation/occupants/transitions';
test('one physical state with disjoint active/dormant membership and legal sleeping wakeups',()=>{const {s,id}=leasedWorker();const arrival=s.occupants[id]!.schedule!.arrivalTick;expect(activeIndex(s).dormant.has(id)).toBe(true);expect(()=>transition(s.occupants[id]!,{state:'insideFacility',location:{kind:'facility',facilityId:Object.keys(s.offices)[0]!}})).toThrow();until(s,arrival);expect(activeIndex(s).active.has(id)).toBe(true);expect(activeIndex(s).dormant.has(id)).toBe(false);until(s,arrival+28);expect(s.occupants[id]!.state).toBe('insideFacility');expect(activeIndex(s).active.size).toBe(0);expect(s.scheduledEvents.filter(e=>e.targetId===id).map(e=>e.kind)).toEqual(['workerDeparture']);});
