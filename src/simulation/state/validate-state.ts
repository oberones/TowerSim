import { assertReports } from './validate-reports';
import { assertWorkforce } from './validate-workforce';
import { assertOffices } from './validate-offices';
import { assertTower } from '../world/tower';
import { DomainError, integer, tick, positive } from '../core/values';
import { parseId } from '../core/ids/allocator';
import { Xoshiro128 } from '../core/random/xoshiro128';
import { validateEvent, compareEvents } from '../core/events/event';
import { STATE_VERSION,RULESET_ID,CONTENT_VERSION } from './game-state';
import type { GameState } from './game-state';
import { validateScenario } from './scenario';
import { assertPlain, record, clonePlain } from './plain';
import { reconcile } from '../economy/ledger';
/** Convert failed state predicates into stable invalid-state domain errors. */
function check(condition:unknown,message:string):asserts condition {if(!condition)throw new DomainError('invalidState',message);}
/** Enforce compatibility, world, clock, allocation, event and ledger invariants before capture or restore. */
export function assertState(value:unknown):asserts value is GameState {
  assertPlain(value);
  const root=record(value,['stateVersion','rulesetId','contentVersion','scenario','clock','rng','ids','lastCommandSequence','scheduledEvents','economy','tower','navigation','progression','offices','occupants','trips','officeMarket','stairs','shafts','stops','queues','cars','workforceDays','transportReports']);
  check(root.stateVersion===STATE_VERSION && root.rulesetId===RULESET_ID && root.contentVersion===CONTENT_VERSION,'Unsupported state/rules/content version');
  const scenario=validateScenario(root.scenario);const s=value as GameState;
  record(s.clock,['tick','initialReviewPending','lastDayBoundaryTick']);tick(s.clock.tick);tick(s.clock.lastDayBoundaryTick);
  check(s.clock.tick>=scenario.initialTick && typeof s.clock.initialReviewPending==='boolean','Invalid clock');
  check(s.clock.lastDayBoundaryTick===Math.floor(s.clock.tick/scenario.dayTicks)*scenario.dayTicks,'Day boundary correspondence');
  check(!s.clock.initialReviewPending || s.clock.tick===scenario.initialTick,'Bootstrap must remain at initial tick');
  record(s.rng,['algorithmId','seed','words']);const rng=Xoshiro128.restore(s.rng);check(rng.seed===s.rng.seed,'Noncanonical seed');
  record(s.ids,['entity','event','eventSequence','transaction','queueAdmission']);for(const counter of Object.values(s.ids)){record(counter,['next']);positive(counter.next);}
  record(s.navigation,['topologyVersion']);tick(s.navigation.topologyVersion);
  record(s.progression,['level']);check(s.progression.level===1,'Unsupported progression state');assertTower(s);
  tick(s.lastCommandSequence);
  check(Array.isArray(s.scheduledEvents),'Missing events');
  const ids=new Set<string>();const sequences=new Set<number>();let boundaries=0;let reviews=0;
  for(const event of s.scheduledEvents) {
    record(event,['id','dueTick','phasePriority','sequence','kind','targetId','targetGeneration','payload']);record(event.payload,[]);
    validateEvent(event,s.clock.tick);
    check(!ids.has(event.id) && !sequences.has(event.sequence),'Duplicate event identity');ids.add(event.id);sequences.add(event.sequence);
    check(parseId(event.id).ordinal<s.ids.event.next && event.sequence<s.ids.eventSequence.next,'Event counter behind records');
    if(event.kind==='dayBoundary'||event.kind==='dailyReview')check(event.targetId==='kernel:1' && event.targetGeneration===0,'Invalid kernel owner/generation');
    else if(event.kind==='carComplete')check(!!s.cars[event.targetId]&&s.cars[event.targetId]!.generation===event.targetGeneration,'Invalid car event owner');
    else check(!!s.occupants[event.targetId]&&s.occupants[event.targetId]!.generation===event.targetGeneration,'Invalid worker owner/generation');
    if(event.kind==='dayBoundary') {boundaries++;check(event.phasePriority===0 && event.dueTick===s.clock.lastDayBoundaryTick+scenario.dayTicks,'Invalid day boundary');}
    else if(event.kind==='dailyReview') {
      reviews++;const nextReview=scenario.initialTick+(Math.floor((s.clock.tick-scenario.initialTick)/scenario.dayTicks)+1)*scenario.dayTicks;
      check(event.phasePriority===20 && event.dueTick===nextReview,'Invalid review schedule');
    }else check(['workerArrival','workerDeparture','walkComplete','carComplete'].includes(event.kind),'Unsupported event kind');
  }
  check(boundaries===1 && reviews===(s.clock.initialReviewPending ? 0 : 1),'Missing or duplicate recurring owner');
  record(s.economy,['initialMinor','balanceMinor','transactions']);integer(s.economy.initialMinor);integer(s.economy.balanceMinor);
  check(s.economy.initialMinor===scenario.startingFundsMinor && Array.isArray(s.economy.transactions),'Invalid initial money/ledger');
  const sources=new Set<string>();const transactionIds=new Set<string>();let balance=s.economy.initialMinor;
  let lastOrdinal=0;let lastTick:number=scenario.initialTick;
  for(const transaction of s.economy.transactions) {
    record(transaction,['id','source','amountMinor','atTick']);integer(transaction.amountMinor);tick(transaction.atTick);
    const id=parseId(transaction.id);
    check(id.kind==='transaction' && id.ordinal>lastOrdinal && id.ordinal<s.ids.transaction.next && transaction.atTick>=lastTick && transaction.atTick<=s.clock.tick,'Invalid transaction chronology/counter');
    check(typeof transaction.source==='string' && transaction.source.length>0 && !sources.has(transaction.source) && !transactionIds.has(transaction.id),'Duplicate/invalid transaction');
    sources.add(transaction.source);transactionIds.add(transaction.id);lastOrdinal=id.ordinal;lastTick=transaction.atTick;
    balance+=transaction.amountMinor;integer(balance);
  }
  check(reconcile(s.economy),'Ledger does not reconcile');assertOffices(s);assertWorkforce(s);assertReports(s);
}
export type StateValidation={ok:true;state:GameState}|{ok:false;errors:string[]};
/** Return a detached canonical candidate or useful validation errors without touching the source. */
export function validateState(value:unknown):StateValidation {
  try {assertState(value);const state=clonePlain(value);Object.assign(state,{scenario:validateScenario(state.scenario)});state.scheduledEvents.sort(compareEvents);return {ok:true,state};}
  catch(error){return {ok:false,errors:[error instanceof Error ? error.message : 'Invalid state']};}
}
