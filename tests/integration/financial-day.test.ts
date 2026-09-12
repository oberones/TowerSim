import { expect,test } from 'vitest';
import { oneWorker,until,command } from '../fixtures/one-worker';
import { elevator } from '../fixtures/transport';
import { reconcile,post } from '../../src/simulation/economy/ledger';
import { settleOffice } from '../../src/simulation/economy/settlement';
test('idle elevators accrue existence costs; removal at midnight posts no duplicate',()=>{
 const s=oneWorker();command(s,{kind:'constructFloorRange',payload:{floor:1,startX:0,endXExclusive:48}});elevator(s,1);
 until(s,86400);expect(s.economy.transactions.filter(t=>t.source.startsWith('elevator:')).map(t=>t.amountMinor)).toEqual([-2250]);
 const o=Object.values(s.offices)[0]!,before=s.economy.balanceMinor;settleOffice(s,o);expect(s.economy.balanceMinor).toBe(before);
 command(s,{kind:'demolishEntity',payload:{entityId:o.id}});expect(s.economy.balanceMinor).toBe(before);expect(reconcile(s.economy)).toBe(true);
});
test('a vacant disconnected office settles liabilities even below zero cash',()=>{
 const s=oneWorker();const old=Object.keys(s.offices)[0]!;command(s,{kind:'demolishEntity',payload:{entityId:old}});command(s,{kind:'constructFloorRange',payload:{floor:1,startX:0,endXExclusive:48}});command(s,{kind:'placeFacility',payload:{definitionId:'office.small',floor:1,x:24}});
 post(s,{source:'test:zero',amountMinor:-s.economy.balanceMinor});until(s,43200);const id=Object.keys(s.offices)[0]!;
 expect(command(s,{kind:'demolishEntity',payload:{entityId:id}}).ok).toBe(true);expect(s.economy.balanceMinor).toBe(-1000);until(s,86400);expect(s.economy.balanceMinor).toBe(-1000);
});
