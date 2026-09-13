import { createGame,captureState } from '../../src/simulation';
import type { GameState } from '../../src/simulation';
import { MVP_DEFAULT } from '../../src/content/scenarios/mvp-default';
import { compareEvents } from '../../src/simulation/core/events/event';
import { command,place,until,WALKER_SEED } from './one-worker';
import { elevator } from './transport';
/** Count actual traveling/waiting people separately from scheduled or physically indoor sleepers. */
export function performancePopulation(s:GameState){const people=Object.values(s.occupants),dormant=people.filter(p=>p.state==='outside'||p.state==='insideFacility').length;return {active:people.length-dormant,dormant,walking:people.filter(p=>p.state==='walking').length,waiting:people.filter(p=>p.state==='waitingForElevator').length,events:s.scheduledEvents.length};}
/** Build valid scale workloads with saved finite overrides and enough remaining travel for each timed interval. */
export function performanceTower(count:number,workload:'walking'|'rush',dormant=0):GameState {
 const rush=workload==='rush',population=count+(rush?96:dormant),top=count===5000?12:count===1000?8:4;
 const scenario={...MVP_DEFAULT,scenarioId:`performance-${workload}-${count}-${dormant}`,startingFundsMinor:10000000,
  content:{...MVP_DEFAULT.content,officeMarketWorkers:population,restaurantDailyCustomers:0,walkingTicksPerCell:rush?30:1000,
   schedules:{...MVP_DEFAULT.content.schedules,office:{...MVP_DEFAULT.content.schedules.office,arrivalStart:28800,arrivalEnd:rush?28806:36000}},
   definitions:MVP_DEFAULT.content.definitions.map(d=>d.typeId==='office.small'?{...d,capacity:rush?population/4:population}:d)}};
 const s=createGame(scenario,WALKER_SEED);
 if(rush){for(let floor=1;floor<=top;floor++){const r=command(s,{kind:'constructFloorRange',payload:{floor,startX:0,endXExclusive:96}});if(!r.ok)throw Error(r.code);}for(const x of [10,14,18])elevator(s,top,x);for(let floor=top-3;floor<=top;floor++)place(s,48,floor);}
 else place(s);
 until(s,21601);
 if(!rush){
  // Controlled schedule-only DTO arrangement keeps domain-created identities and every retained trace in agreement.
  // Sleepers wake at 09:10, after the measured 08:00 interval; all values remain inside the saved arrival window.
  for(const [i,p] of Object.values(s.occupants).entries()){p.schedule!.arrivalTick=i<count?28800:33000;for(const e of s.scheduledEvents)if(e.targetId===p.id&&e.kind==='workerArrival')e.dueTick=p.schedule!.arrivalTick;}
  for(const member of s.workforceDays[0]!.members)member.arrivalTick=s.occupants[member.occupantId]!.schedule!.arrivalTick;
  s.scheduledEvents.sort(compareEvents);
 }
 until(s,rush?29100:28800);return captureState(s);
}
