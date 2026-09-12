import type { FloorQuote } from '../simulation/commands/types';
import { money } from './elements';
/** Explain an edit's new charge separately from liabilities earned before a free demolition. */
export function constructionQuote(q:FloorQuote):string {return `Build ${money(q.constructionCostMinor)} · removal ${money(q.demolitionCostMinor)} · accrued settlement ${money(q.accruedSettlementMinor)} · cash change ${money(q.cashDeltaMinor)}`;}
