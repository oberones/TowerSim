import { expect,it } from 'vitest';
import { referenceTower } from '../fixtures/reference-tower';
import { createSaveEnvelope,validateSaveEnvelope } from '../../src/simulation/state/save-envelope';
import { encodeState } from '../../src/simulation';
it('validates the explicit 2000-person native-storage reference without changing eight-person cars',()=>{const s=referenceTower();expect(s.tower!.floors).toHaveLength(13);expect(Object.keys(s.offices)).toHaveLength(24);expect(Object.keys(s.restaurants)).toHaveLength(2);expect(Object.keys(s.stairs)).toHaveLength(12);expect(Object.values(s.cars).map(c=>c.capacity)).toEqual([8,8,8]);expect(Object.keys(s.occupants)).toHaveLength(2000);expect(Object.values(s.occupants).filter(p=>!['outside','insideFacility'].includes(p.state)).length).toBeGreaterThanOrEqual(500);expect(encodeState(validateSaveEnvelope(createSaveEnvelope(s)).state)).toBe(encodeState(s));},240000);
