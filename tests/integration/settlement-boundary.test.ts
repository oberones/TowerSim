import {test,expect} from 'vitest';
import {leasedWorker,until,command,oneWorker} from '../fixtures/one-worker';
import {post} from '../../src/simulation/economy/ledger';
import {advance} from '../../src/simulation';
test('one midnight owner posts partial-day rent and costs once, independent of attendance',()=>{const {s}=leasedWorker();until(s,86400);expect(s.economy.transactions.filter(t=>t.source.includes(':rent')).map(t=>t.amountMinor)).toEqual([15000]);expect(s.economy.transactions.filter(t=>t.source.includes(':cost')).map(t=>t.amountMinor)).toEqual([-3000]);advance(s,0);expect(s.economy.transactions).toHaveLength(3);});
test('demolition settles accrued income before removal and cannot bill the removed source at midnight',()=>{const {s}=leasedWorker(),id=Object.keys(s.offices)[0]!;until(s,43200);const r=command(s,{kind:'demolishEntity',payload:{entityId:id}});expect(r.ok).toBe(true);expect(r.quote?.accruedSettlementMinor).toBe(4000);const transactions=[...s.economy.transactions];until(s,86400);expect(s.economy.transactions).toEqual(transactions);});
test('free demolition remains available with negative cash and continues to settle incurred costs',()=>{const s=oneWorker(),id=Object.keys(s.offices)[0]!;until(s,21601);post(s,{source:'test:loss',amountMinor:-s.economy.balanceMinor-100});expect(command(s,{kind:'demolishEntity',payload:{entityId:id}}).ok).toBe(true);expect(s.economy.balanceMinor).toBeLessThan(0);});
test('a failing settlement quote and demolition leave finance, workers and allocations unchanged',()=>{
 const {s}=leasedWorker(),id=Object.keys(s.offices)[0]!;until(s,43200);s.ids.transaction.next=Number.MAX_SAFE_INTEGER;
 const before=JSON.stringify({...s,lastCommandSequence:0});expect(command(s,{kind:'demolishEntity',payload:{entityId:id}}).code).toBe('overflow');expect(JSON.stringify({...s,lastCommandSequence:0})).toBe(before);
});
