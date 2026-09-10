import type { GameState } from '../state/game-state';
import type { Office } from '../facilities/offices';
import { accruedAmounts } from './accrual';
import { post } from './ledger';
/** Post each source's prorated rent and cost once, then reset its interval at this boundary. */
export function settleOffice(state:GameState,office:Office):void {
 const amounts=accruedAmounts(state,office),a=office.accrual;
 for(const [kind,amount] of [['rent',amounts.incomeMinor],['cost',-amounts.costMinor]] as const)if(amount!==0){const result=post(state,{source:`office:${office.id}:${a.generation}:${kind}`,amountMinor:amount});if(!result.ok)throw Error('Settlement overflow');}
 a.sinceTick=state.clock.tick;a.lastTick=state.clock.tick;a.eligibleTicks=0;a.existenceTicks=0;a.generation++;
}
/** Let the single midnight owner settle all extant offices before daily reset. */
export function settleOffices(state:GameState):void {for(const office of Object.values(state.offices))settleOffice(state,office);}
