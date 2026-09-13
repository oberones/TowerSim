import type { GameState } from '../../simulation';
import { progressionPredicates } from '../../simulation/progression/evaluate';
import { freezeDeep,clonePlain } from '../../simulation/state/plain';
/** Explain the last settled evaluation separately from today's unfinished evidence; live quality cannot qualify. */
export function progressionQuery(s:GameState){const p=s.progression;return freezeDeep({level:p.level,awardedTick:p.awardedTick,current:clonePlain(p.dayEvidence),evaluatedDay:p.lastEvaluation?.day??null,predicates:p.lastEvaluation&&s.scenario.content?progressionPredicates(p.lastEvaluation,s.scenario.content.level2):[],targets:s.scenario.content?.level2??null});}
