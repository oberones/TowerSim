import { test,expect } from 'vitest';
import { stairs,upperOffice,arrival } from '../fixtures/transport';
import { until } from '../fixtures/one-worker';
import { captureState,validateState } from '../../src/simulation';
import { walkingPosition } from '../../src/simulation/occupants/walking';
test('stairs start after walking without a second movement and interpolate exactly in both directions',()=>{const s=stairs(upperOffice()),id=arrival(s);let p=s.occupants[id]!;if(p.location.kind!=='walkEdge')throw Error('Expected walking');until(s,p.location.startTick+p.location.durationTicks);p=s.occupants[id]!;if(p.location.kind!=='stair')throw Error('Expected stair');expect(p.location.startTick).toBe(s.clock.tick);const duration=p.location.durationTicks,start=s.clock.tick;until(s,start+duration/2);expect(walkingPosition(s.occupants[id]!,s.clock.tick)?.floor).toBe(0.5);const bad=captureState(s);if(bad.occupants[id]!.location.kind==='stair')bad.occupants[id]!.location.to.floor=3;expect(validateState(bad).ok).toBe(false);until(s,start+duration);expect(s.occupants[id]!.state).toBe('walking');expect(walkingPosition(s.occupants[id]!,s.clock.tick)?.floor).toBe(1);captureState(s);});
