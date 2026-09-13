import {test,expect} from 'vitest';
import {createAccrual,accrue,prorate} from '../../src/simulation/economy/accrual';
test('eligibility toggles accumulate time and existence cost continues when inaccessible',()=>{const a=createAccrual(0);accrue(a,100,true);accrue(a,300,false);accrue(a,400,true);accrue(a,500);expect(a.eligibleTicks).toBe(300);expect(a.existenceTicks).toBe(500);});
test('settlement rounds the aggregate fraction once using exact half-away arithmetic',()=>{expect(prorate(1,43200,86400)).toBe(1);expect(prorate(1,43199,86400)).toBe(0);expect(prorate(20000,64800,86400)).toBe(15000);expect(prorate(Number.MAX_SAFE_INTEGER,86400,86400)).toBe(Number.MAX_SAFE_INTEGER);});
