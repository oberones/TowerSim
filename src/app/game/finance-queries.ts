import { restaurantAmounts } from '../../simulation/economy/settlement';
import type { GameState } from '../../simulation';
import { accruedAmounts } from '../../simulation/economy/accrual';
import { shaftCost } from '../../simulation/transportation/elevators/shaft';
import { addFinance,emptyFinanceTotals,transactionKind } from '../../simulation/economy/history';
import { freezeDeep } from '../../simulation/state/plain';
import { add } from '../../simulation/core/values';
/** Turn durable source snapshots into readable receipts even when the building or customer has retired. */
export function financeSourceLabel(source:string):string {
 const id=source.match(/(?:facility|shaft|stair|floor|occupant):(\d+)/)?.[1],number=id?` #${id}`:'';
 if(source.startsWith('restaurantVisit:'))return `Customer visit${number}`;
 const type=source.includes('restaurant')?'Restaurant':source.includes('office')?'Office':source.includes('elevator')?'Elevator':source.includes('stair')?'Stairs':'Floor space';
 if(source.startsWith('construction:'))return `${type}${number} construction`;
 if(source.endsWith(':rent'))return `${type}${number} rent`;
 if(source.endsWith(':cost'))return `${type}${number} operating cost`;
 return 'Scenario adjustment';
}
/** Project posted cash history separately from pending liabilities and completed-day operating results. */
export function financeQuery(s:GameState){
 const start=Math.max(s.scenario.initialTick,s.clock.tick-s.scenario.dayTicks),day=Math.floor(s.clock.tick/s.scenario.dayTicks);
 const transactions=s.economy.transactions.filter(t=>t.atTick>=start).map(t=>({...t,kind:transactionKind(t),label:financeSourceLabel(t.source)}));
 const recent=transactions.reduce((n,t)=>addFinance(n,t.amountMinor),emptyFinanceTotals());
 const operating=transactions.filter(t=>!['construction','other'].includes(t.kind)).reduce((n,t)=>addFinance(n,t.amountMinor),emptyFinanceTotals());
 const pending=Object.values(s.offices).map(o=>({source:o.id,...accruedAmounts(s,o)})).concat(Object.values(s.restaurants).map(o=>({source:o.id,...restaurantAmounts(s,o)}))).concat(Object.values(s.shafts).map(o=>({source:o.id,incomeMinor:0,costMinor:shaftCost(s,o)})));
 return freezeDeep({balanceMinor:s.economy.balanceMinor,initialMinor:s.economy.initialMinor,lowCash:s.economy.balanceMinor<=0,startTick:start,endTick:s.clock.tick,partial:s.clock.tick-s.scenario.initialTick<s.scenario.dayTicks,recent,operating,transactions,archive:{...s.economy.archive},retained:s.economy.transactions.reduce((n,t)=>addFinance(n,t.amountMinor),emptyFinanceTotals()),currentDay:s.economy.operatingDays.find(d=>d.day===day)??{...emptyFinanceTotals(),day,partial:day===0},previousDay:s.economy.operatingDays.find(d=>d.day===day-1)??null,days:s.economy.operatingDays.map(d=>({...d})),pending,pendingNetMinor:pending.reduce((n,a)=>add(n,add(a.incomeMinor,-a.costMinor)),0)});
}
