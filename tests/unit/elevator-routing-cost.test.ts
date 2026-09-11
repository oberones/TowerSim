import { expect,it } from 'vitest';
import { nineAtBoarding } from '../fixtures/nine-passengers';
import { elevatorWaitCost } from '../../src/simulation/navigation/elevator-cost';
import { approachIndex } from '../../src/simulation/navigation/approach-index';
import { encodeState } from '../../src/simulation';
it('uses actual predecessors for staying and all reservations for joining without mutating state',()=>{const s=nineAtBoarding(),q=Object.values(s.queues).find(q=>q.entries.length===9)!,before=encodeState(s);expect(elevatorWaitCost(s,q,20,q.entries[0]!.occupantId)).toBe(48);expect(elevatorWaitCost(s,q,20,q.entries[8]!.occupantId)).toBe(144);expect(elevatorWaitCost(s,q,7)).toBe(240);expect([...approachIndex(s).values()].reduce((a,b)=>a+b,0)).toBe(0);expect(encodeState(s)).toBe(before);});
