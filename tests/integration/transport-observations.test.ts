import { test,expect } from 'vitest';
import { captureState,advance,rebuildDerived } from '../../src/simulation';
import { stairObservation } from '../fixtures/transport';
import { passengerAtPhase } from '../fixtures/one-elevator-passenger';
import { until } from '../fixtures/one-worker';

test.each(['climbing','descending','inside'] as const)('stair %s observation is a valid completed boundary and resumes the real journey',stage=>{
 const {s,id}=stairObservation(stage),p=s.occupants[id]!,copy=captureState(s);
 if(stage==='inside')expect(p.state).toBe('insideFacility');
 else {expect(p.state).toBe('takingStairs');if(p.location.kind!=='stair')throw Error('Expected a physical stair leg');expect(p.location.to.floor-p.location.from.floor).toBe(stage==='climbing'?1:-1);expect(p.location.durationTicks).toBe(s.scenario.content!.stairTicksPerFloor);}
 rebuildDerived(copy);expect(advance(s,0).ok).toBe(true);expect(s).toEqual(copy);
 until(s,s.clock.tick+1200);until(copy,copy.clock.tick+1200);expect(s).toEqual(copy);expect(s.occupants[id]!.state).toBe(stage==='descending'?'outside':'insideFacility');
});

test.each(['idle','starting','moving','leveling','opening','unloading','boarding','dwell','closing'] as const)('elevator %s observation freezes and resumes without losing or duplicating its rider',phase=>{
 const {s,id,carId}=passengerAtPhase(phase),copy=captureState(s);expect(s.cars[carId]!.phase).toBe(phase);
 rebuildDerived(copy);expect(advance(s,0).ok).toBe(true);expect(s).toEqual(copy);
 until(s,s.clock.tick+1200);until(copy,copy.clock.tick+1200);expect(s).toEqual(copy);expect(s.occupants[id]!.state).toBe('insideFacility');expect(s.cars[carId]!.onboard).toHaveLength(0);
});
