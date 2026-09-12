import { OFFICE_WALK_TICKS } from '../fixtures/one-worker';
import {test,expect} from 'vitest';
import {leasedWorker,until,command,place} from '../fixtures/one-worker';
import {retireOccupant} from '../../src/simulation/occupants/retirement';
import {encodeState,decodeState} from '../../src/simulation';
test('ordinary departed workers survive; repeated demolition never reuses identities or resurrects former workers',()=>{const {s,id}=leasedWorker();const departure=s.occupants[id]!.schedule!.departureTick;until(s,departure+OFFICE_WALK_TICKS);expect(retireOccupant(s,s.occupants[id]!)).toBe(false);const firstIds=new Set(Object.keys(s.occupants));for(let i=0;i<3;i++){const o=Object.keys(s.offices)[0]!;command(s,{kind:'demolishEntity',payload:{entityId:o}});expect(Object.keys(s.occupants)).toHaveLength(0);place(s);until(s,(i+1)*86400+21600);expect(Object.keys(s.occupants)).toHaveLength(1);expect(firstIds.has(Object.keys(s.occupants)[0]!)).toBe(false);firstIds.add(Object.keys(s.occupants)[0]!);}const restored=decodeState(encodeState(s));expect(restored.occupants[id]).toBeUndefined();expect(Object.values(restored.trips).some(t=>t.occupantId===id)).toBe(true);});

import { oneCustomer } from '../fixtures/restaurant';
import { activeIndex } from '../../src/simulation/occupants/active-index';
test('customers transition between dormant and active indices and retire only after physical exit',()=>{const s=oneCustomer(),id=Object.keys(s.occupants)[0]!;expect(activeIndex(s).dormant.has(id)).toBe(true);until(s,36000);expect(activeIndex(s).active.has(id)).toBe(true);expect(retireOccupant(s,s.occupants[id]!)).toBe(false);until(s,36900);expect(activeIndex(s).dormant.has(id)).toBe(true);expect(retireOccupant(s,s.occupants[id]!)).toBe(false);until(s,40000);expect(activeIndex(s).active.has(id)).toBe(false);expect(activeIndex(s).dormant.has(id)).toBe(false);expect(s.occupants[id]).toBeUndefined();expect(Object.values(s.trips).filter(t=>t.occupantId===id)).toHaveLength(2);});
