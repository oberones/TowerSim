import { expect,test } from 'vitest';
import { oneWorker,until } from '../fixtures/one-worker';
import { post,reconcile } from '../../src/simulation/economy/ledger';
import { retainFinanceHistory } from '../../src/simulation/economy/history';
import { encodeState,decodeState } from '../../src/simulation';
test('archives only expired detail and preserves exact reconciliation and continuation',()=>{
 const s=oneWorker();until(s,35*86400);retainFinanceHistory(s);
 expect(s.economy.archive.count).toBeGreaterThan(0);expect(reconcile(s.economy)).toBe(true);
 expect(s.economy.transactions.every(t=>t.atTick>=s.clock.tick-s.scenario.content!.historyLimits.financeTicks)).toBe(true);
 expect(s.economy.operatingDays.length).toBeLessThanOrEqual(31);
 expect(decodeState(encodeState(s))).toEqual(s);
});
test('retains transactions exactly at the cutoff and rejects aggregate overflow atomically',()=>{
 const s=oneWorker();const at=s.clock.tick;post(s,{source:'test:income',amountMinor:1});
 s.clock.tick=at+s.scenario.content!.historyLimits.financeTicks;retainFinanceHistory(s);
 expect(s.economy.transactions.some(t=>t.source==='test:income')).toBe(true);
 s.clock.tick++;retainFinanceHistory(s);expect(s.economy.transactions).toHaveLength(0);expect(reconcile(s.economy)).toBe(true);
 const before=JSON.stringify(s);expect(post(s,{source:'test:overflow',amountMinor:Number.MAX_SAFE_INTEGER}).ok).toBe(false);expect(JSON.stringify(s)).toBe(before);
});

test('operating aggregates reject overflow even when the resulting cash itself would be safe',()=>{const s=oneWorker();post(s,{source:'test:zero',amountMinor:-s.economy.balanceMinor});expect(post(s,{source:'office:historical:0:rent',amountMinor:Number.MAX_SAFE_INTEGER}).ok).toBe(true);expect(post(s,{source:'office:historical:0:cost',amountMinor:-Number.MAX_SAFE_INTEGER}).ok).toBe(true);const before=JSON.stringify(s);expect(post(s,{source:'office:historical:1:rent',amountMinor:1}).ok).toBe(false);expect(JSON.stringify(s)).toBe(before);});
