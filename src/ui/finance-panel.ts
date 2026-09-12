import type { GameSession } from '../app/game/session';
import { element,money,timeOfDay } from './elements';
/** Render reconcilable posted activity and pending accrual without changing simulation time or cash. */
export function createFinancePanel(session:GameSession){
 const node=element('details'),summary=element('summary','Finances'),totals=element('p'),operating=element('p'),pending=element('p'),archive=element('p'),history=element('ol');node.append(summary,totals,operating,pending,archive,history);let lastTick=-1;
 /** Refresh only an open panel at changed boundaries, preserving all recent detail without a count cap. */
 function draw():void {if(!node.open)return;const f=session.finance();if(f.endTick===lastTick&&totals.dataset.balance===String(f.balanceMinor))return;lastTick=f.endTick;totals.dataset.balance=String(f.balanceMinor);
 totals.textContent=`Balance ${money(f.balanceMinor)}. ${f.lowCash?'Low cash: positive-cost construction is unavailable; time, inspection and free removal remain usable. ':''}${f.partial?'Partial first 24 hours':'Last 24 hours'}: income ${money(f.recent.incomeMinor)}, expenses ${money(f.recent.expensesMinor)}, net ${money(f.recent.netMinor)}.`;
 operating.textContent=`Recent operating net ${money(f.operating.netMinor)} (construction excluded). Current day ${money(f.currentDay.netMinor)}; previous completed day ${f.previousDay?money(f.previousDay.netMinor)+(f.previousDay.partial?' (partial)':''):'none yet'}. Retained operating days: ${f.days.length}.`;
 pending.textContent=`Pending accrual net ${money(f.pendingNetMinor)}. `+f.pending.map(p=>`${p.source}: rent ${money(p.incomeMinor)}, cost ${money(p.costMinor)}`).join('; ');
 archive.textContent=`Initial funds ${money(f.initialMinor)} + earlier archived activity ${money(f.archive.netMinor)} (${f.archive.count} transactions) + retained detail ${money(f.retained.netMinor)} (${f.retained.count} transactions) = current cash. Archive is a checkpoint, not a new charge.`;
 history.replaceChildren(...f.transactions.map(t=>element('li',`Day ${Math.floor(t.atTick/86400)+1} ${timeOfDay(t.atTick%86400)} · ${t.label} · ${money(t.amountMinor)}`)));
 }
 return {node,draw};
}
