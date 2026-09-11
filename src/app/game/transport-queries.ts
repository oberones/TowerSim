import type { GameState } from '../../simulation';
import { freezeDeep,clonePlain } from '../../simulation/state/plain';
import { liveReport } from '../../simulation/metrics/live-report';
import { cohortReport } from '../../simulation/metrics/cohort-report';
import { queueQueries } from './queue-queries';
import { inspectElevator } from './elevator-queries';
/** Project scope-labeled measured transport, unique waiting people and physical traffic hotspots. */
export function transportQuery(s:GameState) {
 const stops=queueQueries(s),morning=cohortReport(s),previousMorning=cohortReport(s,s.workforceDays.at(-2)?.day??-1);
 return freezeDeep({tick:s.clock.tick,waiting:stops.reduce((n,q)=>n+q.count,0),stops,live:liveReport(s),morning,previousMorning,
  previousDay:s.transportReports.daily.at(-1)?clonePlain(s.transportReports.daily.at(-1)!):null,
  hotspot:[...stops].filter(q=>q.count>0).sort((a,b)=>b.oldestWaitTicks-a.oldestWaitTicks||b.count-a.count||a.floor-b.floor)[0]??null,
  cars:Object.keys(s.shafts).map(id=>inspectElevator(s,id)!),
  people:Object.values(s.occupants).map(p=>({id:p.id,kind:p.kind,state:p.state,goal:p.goal.kind})),coefficients:s.scenario.content?{...s.scenario.content.metrics}:null});
}
