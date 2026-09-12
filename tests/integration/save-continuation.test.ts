import { it,expect } from 'vitest';
import { SAVE_POINTS } from '../fixtures/save-points';
import { createSaveEnvelope,validateSaveEnvelope } from '../../src/simulation/state/save-envelope';
import { encodeState,rebuildDerived } from '../../src/simulation';
import { until,command } from '../fixtures/one-worker';
it.each(SAVE_POINTS)('continues a complete following day from %s with every authoritative field preserved',(name,prepare)=>{const s=prepare(),before=encodeState(s),copy=validateSaveEnvelope(JSON.parse(JSON.stringify(createSaveEnvelope(s)))).state;rebuildDerived(copy);expect(encodeState(copy)).toBe(before);const end=(Math.floor(s.clock.tick/86400)+2)*86400;for(const state of [s,copy]){until(state,state.clock.tick+100);expect(command(state,{kind:'constructFloorRange',payload:{floor:Math.max(...state.tower!.floors.map(f=>f.level))+1,startX:0,endXExclusive:8}}).ok).toBe(true);until(state,end);}expect(encodeState(copy)).toBe(encodeState(s));if(name==='retired-worker'||name==='retired-customer')expect(Object.values(copy.trips).some(t=>!copy.occupants[t.occupantId])).toBe(true);},30000);
