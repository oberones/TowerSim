import type { GameState } from '../state/game-state';
import type { Transaction } from './ledger';
import { add } from '../core/values';
export interface FinanceTotals {incomeMinor:number;expensesMinor:number;netMinor:number;count:number}
export interface FinanceArchive extends FinanceTotals {throughTick:number;lastOrdinal:number}
export interface OperatingDay extends FinanceTotals {day:number;partial:boolean}
/** Create exact empty counters shared by archived activity and daily operating reports. */
export function emptyFinanceTotals():FinanceTotals {return {incomeMinor:0,expensesMinor:0,netMinor:0,count:0};}
/** Classify durable source labels without consulting a possibly demolished live facility. */
export function transactionKind(t:Pick<Transaction,'source'>):'construction'|'officeRent'|'restaurantVisit'|'operatingCost'|'other' {
 if(t.source.startsWith('construction:'))return 'construction';
 if(t.source.startsWith('restaurantVisit:'))return 'restaurantVisit';
 if(t.source.endsWith(':rent'))return 'officeRent';
 if(t.source.endsWith(':cost'))return 'operatingCost';
 return 'other';
}
/** Aggregate into a detached record so overflow never leaves partially incremented totals. */
export function addFinance(totals:FinanceTotals,amount:number):FinanceTotals {
 return {incomeMinor:add(totals.incomeMinor,Math.max(0,amount)),expensesMinor:add(totals.expensesMinor,Math.max(0,-amount)),netMinor:add(totals.netMinor,amount),count:add(totals.count,1)};
}
/** Prepare the operating summary associated with a posting before the ledger commits it. */
export function operatingPosting(state:GameState,transaction:Transaction,day:number):OperatingDay[] {
 const kind=transactionKind(transaction);if(kind==='construction'||kind==='other')return state.economy.operatingDays;
 const previous=state.economy.operatingDays.find(d=>d.day===day)??{...emptyFinanceTotals(),day,partial:day===0&&state.scenario.initialTick>0};
 const updated={...previous,...addFinance(previous,transaction.amountMinor)};
 return [...state.economy.operatingDays.filter(d=>d.day!==day),updated].sort((a,b)=>a.day-b.day);
}
/** Archive expired detail by time, retaining the cutoff itself and a reconcilable earlier-activity checkpoint. */
export function retainFinanceHistory(state:GameState):void {
 const cutoff=state.clock.tick-(state.scenario.content?.historyLimits.financeTicks??86400);
 let archive={...state.economy.archive};let count=0;
 for(const t of state.economy.transactions){if(t.atTick>=cutoff)break;archive={...archive,...addFinance(archive,t.amountMinor),throughTick:t.atTick,lastOrdinal:Number(t.id.split(':')[1])};count++;}
 const day=Math.floor(state.clock.tick/state.scenario.dayTicks),limit=state.scenario.content?.historyLimits.days??30;
 state.economy.archive=archive;state.economy.transactions=state.economy.transactions.slice(count);state.economy.operatingDays=state.economy.operatingDays.filter(d=>d.day>=day-limit);
}

/** Close even a zero-activity operating day so the previous-day report never disappears. */
export function finalizeFinanceDay(s:GameState):void {const day=s.clock.tick/s.scenario.dayTicks-1;if(!s.economy.operatingDays.some(d=>d.day===day))s.economy.operatingDays.push({...emptyFinanceTotals(),day,partial:day===0&&s.scenario.initialTick>0});retainFinanceHistory(s);}
