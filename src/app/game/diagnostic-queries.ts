import type { GameState } from '../../simulation';
import { freezeDeep } from '../../simulation/state/plain';
import { buildGraph } from '../../simulation/navigation/graph';
import { liveReport } from '../../simulation/metrics/live-report';
/** Inspect a detached development snapshot without advancing time, drawing RNG or warming runtime caches. */
export function diagnosticQuery(state:GameState){
 const people=Object.values(state.occupants),graph=buildGraph(state),report=liveReport(state);
 const dormant=people.filter(p=>p.state==='outside'||p.state==='insideFacility').length;
 return freezeDeep({tick:state.clock.tick,rng:{...state.rng,words:[...state.rng.words]},active:people.length-dormant,dormant,events:state.scheduledEvents.length,
  cars:Object.values(state.cars).map(c=>({id:c.id,phase:c.phase,load:c.onboard.length})),
  waiting:Object.values(state.queues).reduce((n,q)=>n+q.entries.length,0),queues:Object.values(state.queues).map(q=>({id:q.id,count:q.entries.length})),
  graph:{version:state.navigation.topologyVersion,nodes:graph.nodes.length,edges:[...graph.edges.values()].reduce((n,e)=>n+e.length,0)},
  cache:{entries:0,limit:state.scenario.content!.routing.routeCacheEntries,note:'Routing currently rebuilds per search; no live route cache.'},
  meanWaitingTicks:report.meanWaitingTicks,denials:report.denials});
}
