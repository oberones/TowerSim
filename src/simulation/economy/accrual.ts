import type { GameState } from '../state/game-state';
import type { Office } from '../facilities/offices';
import { officeDefinition } from '../facilities/offices';
export interface Accrual {sinceTick:number;lastTick:number;eligibleTicks:number;existenceTicks:number;eligible:boolean;generation:number}
/** Start a source interval with no immediate rent or operating transaction. */
export function createAccrual(atTick:number):Accrual {return {sinceTick:atTick,lastTick:atTick,eligibleTicks:0,existenceTicks:0,eligible:false,generation:0};}
/** Close eligibility time before switching access or tenancy; costs continue throughout existence. */
export function accrue(a:Accrual,atTick:number,eligible=a.eligible):void {const elapsed=atTick-a.lastTick;if(elapsed<0)throw Error('Accrual time reversed');a.existenceTicks+=elapsed;if(a.eligible)a.eligibleTicks+=elapsed;a.lastTick=atTick;a.eligible=eligible;}
/** Round an exact prorated positive amount half away from zero once per settlement. */
export function prorate(rate:number,ticks:number,dayTicks:number):number {const n=BigInt(rate)*BigInt(ticks),d=BigInt(dayTicks);const result=Number((n*2n+d)/(2n*d));if(!Number.isSafeInteger(result))throw Error('Accrual overflow');return result;}
/** Quote pending income and costs using a detached interval, including current open eligibility. */
export function accruedAmounts(state:GameState,office:Office){const a={...office.accrual};accrue(a,state.clock.tick);const d=officeDefinition(state);return {incomeMinor:prorate(d.rentMinorPerDay,a.eligibleTicks,state.scenario.dayTicks),costMinor:prorate(d.operatingMinorPerDay,a.existenceTicks,state.scenario.dayTicks)};}
