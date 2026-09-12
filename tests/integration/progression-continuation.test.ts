import { expect,it } from 'vitest';
import { mvpJourney } from '../fixtures/mvp-journey';
import { until } from '../fixtures/one-worker';
import { encodeState,rebuildDerived } from '../../src/simulation';
import { createSaveEnvelope,validateSaveEnvelope } from '../../src/simulation/state/save-envelope';
it('preserves unmet-to-met and already-awarded midnight state through the following full day',()=>{const s=mvpJourney();for(const at of [86399,86400,172799,172800]){until(s,at);const copy=validateSaveEnvelope(createSaveEnvelope(s)).state;rebuildDerived(copy);const direct=validateSaveEnvelope(createSaveEnvelope(s)).state;const end=(Math.floor(at/86400)+2)*86400;until(direct,end);until(copy,at+100);until(copy,end);expect(encodeState(copy)).toBe(encodeState(direct));}until(s,172800);expect(s.progression.level).toBe(2);},300000);
