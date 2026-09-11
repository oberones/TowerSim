import { TRANSPORT_METRICS } from './transport-metrics';
import { validateScenario } from '../../simulation/state/scenario';
import type { PlayableScenario } from '../../simulation/state/scenario';
import { DEFINITIONS } from '../facilities/definitions';
import { SCHEDULES } from '../schedules/profiles';
import { LEVEL2 } from '../progression/level2';
import { add, multiply } from '../../simulation/core/values';
export const MVP_DEFAULT=validateScenario({
  scenarioId:'mvp-default',scenarioVersion:1,tickSeconds:1,dayTicks:86400,initialTick:21600,startingFundsMinor:1000000,capabilities:[],
  world:{widthCells:120,minFloor:0,maxFloor:40,groundFloor:0,initialConstructedRanges:[{startX:0,endXExclusive:120}],lobbyX:0,lobbyDefinitionId:'lobby.basic'},
  content:{definitions:DEFINITIONS,floorCostMinorPerCell:100,officeMarketWorkers:192,restaurantDailyCustomers:40,walkingTicksPerCell:30,stairTicksPerFloor:30,standardCarCapacity:8,
    elevatorTiming:{startTicks:2,floorTicks:4,levelTicks:2,openTicks:2,closeTicks:2,boardTicks:1,unloadTicks:1,dwellTicks:2},
    schedules:SCHEDULES,level2:LEVEL2,routing:{routeCacheEntries:4096,nominalCycleTicks:96,transferPenaltyTicks:30,rerouteImprovementTicks:10},
    metrics:TRANSPORT_METRICS,
    historyLimits:{liveTicks:3600,financeTicks:86400,days:30}},
}) as PlayableScenario;
/** Quote the published five-floor starter, two shafts and a full operating day from data. */
export function starterBudget(s:PlayableScenario):{constructionMinor:number;operatingMinor:number;remainingMinor:number} {
  /** Resolve a validated definition by its stable content identity for the starter quote. */
  const find=(id:string)=>s.content.definitions.find(d=>d.typeId===id)!;
  const office=find('office.small'),restaurant=find('restaurant.small'),stairs=find('stairs.basic'),elevator=find('elevator.standard');
  const constructionMinor=[multiply(5*s.world.widthCells,s.content.floorCostMinorPerCell),multiply(2,stairs.constructionCostMinor),multiply(3,office.constructionCostMinor),multiply(2,add(elevator.constructionCostMinor,multiply(6,elevator.perFloorCostMinor))),restaurant.constructionCostMinor].reduce(add,0);
  const operatingMinor=add(add(multiply(3,office.operatingMinorPerDay),restaurant.operatingMinorPerDay),multiply(2,elevator.operatingMinorPerDay));
  return {constructionMinor,operatingMinor,remainingMinor:add(s.startingFundsMinor,-add(constructionMinor,operatingMinor))};
}
