import { integer, add, DomainError } from '../core/values';
import { allocateId } from '../core/ids/allocator';
import type { GameState } from '../state/game-state';
export interface Transaction {readonly id:string;readonly source:string;readonly amountMinor:number;readonly atTick:number}
export interface EconomyState {initialMinor:number;balanceMinor:number;transactions:Transaction[]}
/** Preflight exact balance and allocation, then post one idempotent source transaction atomically. */
export function post(state:GameState,input:{source:string;amountMinor:number}):{ok:true;id:string;replayed:boolean}|{ok:false;code:'invalidState'|'invalidNumber'|'overflow'|'transactionConflict'} {
  try {
    integer(input.amountMinor);if(typeof input.source!=='string' || !input.source.length)throw new DomainError('invalidState','Missing transaction source');
    const prior=state.economy.transactions.find(t=>t.source===input.source);
    if(prior)return prior.amountMinor===input.amountMinor ? {ok:true,id:prior.id,replayed:true} : {ok:false,code:'transactionConflict'};
    const balance=add(state.economy.balanceMinor,input.amountMinor);
    const counter={...state.ids.transaction};const id=allocateId('transaction',counter);
    const transaction={id,source:input.source,amountMinor:input.amountMinor,atTick:state.clock.tick};
    state.economy.transactions.push(transaction);state.economy.balanceMinor=balance;state.ids.transaction.next=counter.next;
    return {ok:true,id,replayed:false};
  }catch(error){return {ok:false,code:error instanceof DomainError ? error.code : 'invalidState'};}
}
/** Compare cash with initial funds plus all retained transactions using exact integer arithmetic. */
export function reconcile(economy:EconomyState):boolean {
  return BigInt(economy.initialMinor)+economy.transactions.reduce((sum,t)=>sum+BigInt(t.amountMinor),0n)===BigInt(economy.balanceMinor);
}
