import { createRunner } from '../../src/simulation/core/clock/advance';
import { createGame, validateScenario } from '../../src/simulation';
import { MVP_DEFAULT } from '../../src/content/scenarios/mvp-default';
import { command, place, WALKER_SEED } from './one-worker';
import { elevator } from './transport';
/** Lease a finite nine-person office with a concentrated, ordinarily generated request window. */
export function ninePassengers(count=9,arrivalWindow=1) {
  const scenario=validateScenario({...MVP_DEFAULT,scenarioId:'nine-passengers',content:{...MVP_DEFAULT.content,officeMarketWorkers:count,definitions:MVP_DEFAULT.content.definitions.map(d=>d.typeId==='office.small'?{...d,capacity:count}:d),schedules:{...MVP_DEFAULT.content.schedules,office:{...MVP_DEFAULT.content.schedules.office,arrivalEnd:28800+arrivalWindow}}}});
  const s=createGame(scenario,WALKER_SEED);
  for(let floor=1;floor<=3;floor++)command(s,{kind:'constructFloorRange',payload:{floor,startX:0,endXExclusive:48}});
  place(s,24,3);elevator(s,3);return s;
}
/** Stop at a real multi-person service boundary without editing passengers, requests or car state. */
export function nineAtBoarding(count=9,arrivalWindow=1) {
  const s=ninePassengers(count,arrivalWindow),runner=createRunner(s);
  for(let n=0;n<12000;n++){const car=Object.values(s.cars)[0]!;if(car.phase==='boarding')return s;const r=runner.advance(1);if(!r.ok)throw Error(r.code);}
  throw Error('No boarding phase');
}
