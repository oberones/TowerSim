import { expect,test } from 'vitest';
import { oneWorker,until,command } from '../fixtures/one-worker';
import { financeQuery } from '../../src/app/game/finance-queries';
import { post,reconcile } from '../../src/simulation/economy/ledger';
test('discloses partial recent cash, source history, pending accrual and operating-only results',()=>{
 const s=oneWorker();until(s,43200);const before=JSON.stringify(s),f=financeQuery(s);
 expect(f.partial).toBe(true);expect(f.recent.expensesMinor).toBe(60000);expect(f.operating.netMinor).toBe(0);expect(f.pendingNetMinor).toBe(4000);expect(f.transactions[0]!.kind).toBe('construction');expect(JSON.stringify(s)).toBe(before);expect(Object.isFrozen(f)).toBe(true);
 until(s,86400);const closed=financeQuery(s);expect(closed.previousDay).toMatchObject({netMinor:12000,partial:true});expect(closed.pendingNetMinor).toBe(0);expect(reconcile(s.economy)).toBe(true);
});
test('negative cash permits operation and free demolition while positive-cost construction rejects',()=>{
 const s=oneWorker();post(s,{source:'test:liability',amountMinor:-s.economy.balanceMinor});until(s,43200);
 expect(financeQuery(s).lowCash).toBe(true);expect(command(s,{kind:'placeFacility',payload:{definitionId:'office.small',floor:0,x:48}})).toMatchObject({ok:false,code:'insufficientFunds'});
 expect(command(s,{kind:'demolishEntity',payload:{entityId:Object.keys(s.offices)[0]!}}).ok).toBe(true);until(s,86400);expect(reconcile(s.economy)).toBe(true);
});
