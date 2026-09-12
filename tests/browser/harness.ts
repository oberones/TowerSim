import { performanceRecorder } from './scenarios/performance';
import { progressionObservation } from '../fixtures/progression-observation';
import { referenceTower } from '../fixtures/reference-tower';
import { AbortingNativeRepository,observeNativeStorage } from './scenarios/storage';
import { restaurantObservation,mealObservation,financeObservation } from '../fixtures/restaurant';
import { mixedNineAtBoarding } from '../fixtures/nine-passengers';
import { congestionScenario } from './scenarios/congestion';
import { nineAtBoarding } from '../fixtures/nine-passengers';
import { officeObservation } from '../fixtures/office-workday';
import { until } from '../fixtures/one-worker';
import { elevatorObservation,oneElevatorPassenger,passengerAtPhase } from '../fixtures/one-elevator-passenger';
import { stairs,upperOffice,stairObservation } from '../fixtures/transport';
import type { CarPhase } from '../../src/simulation/transportation/elevators/types';
import { oneWorker,oneWorkerObservation } from '../fixtures/one-worker';
import { mountGame } from '../../src/main';
import { MVP_DEFAULT } from '../../src/content/scenarios/mvp-default';
import { createGame, advance } from '../../src/simulation';
const root=document.getElementById('app');if(!root)throw Error('Missing application root');observeNativeStorage(root);
const chooser=document.createElement('select');chooser.setAttribute('aria-label','Starting fixture');
const phases:CarPhase[]=['idle','starting','leveling','opening','dwell','closing'];
for(const [value,label] of [['performance','Performance reference — recorded frames and input'],['progression','Level 2 — ten ticks before qualifying midnight'],['storage-reference','Storage reference — 2000 people, active rush'],['storage-abort','Storage exercise — native aborted replacement'],['restaurant-visit','One customer — restaurant visit'],['restaurant-meal','Two restaurants — finite meal wave'],['restaurant-finance','Finances — zero cash and accrued restaurant cost'],['queue-mixed','Four workers and five customers — boarding cutoff'],['congestion-baseline','96 workers — one-shaft congestion baseline'],['congestion-improved','Same 96 workers — two-shaft comparison'],['queue-ready','Nine workers — paused at boarding cutoff'],['queue-full','Eight aboard — ninth waiting'],['office-morning','Office workday — before morning rush'],['office-evening','Office workday — before evening rush'],['office-inside','Office workday — full attendance'],['office-nextday','Office workday — recurring next-day requests'],['office-stranded','Office workday — stranded after safe access removal'],['elevator-moving','One elevator rider — paused mid-flight'],['elevator-boarding','One elevator rider — paused boarding'],['elevator-unloading','One elevator rider — paused unloading'],['stair-climbing','One worker — paused on stairs'],['stair-descending','One worker — paused descending stairs'],['stair-inside','One worker — inside upper office before access removal'],...phases.map(phase=>[`phase-${phase}`,`Elevator phase — ${phase}`]),['elevator-observe','One elevator rider — visible approach'],['elevator','One elevator rider — paused construction'],['stairs','One worker — upper office and stairs'],['stairs-build','One worker — upper office needing stairs'],['elevator-build','One worker — upper office needing elevator'],['walker-observe','One worker — visible approach'],['walker','One worker — same-floor office'],['new','Default paused site'],['narrow','Narrow site, negative ground'],['boundary','Validated completed boundary']]){const option=document.createElement('option');option.value=value!;option.textContent=label!;chooser.append(option);}
const start=document.createElement('button');start.textContent='Start selected fixture';root.append(chooser,start);
/** Supply a validated scenario or snapshot only before mounting the ordinary application. */
start.addEventListener('click',()=>{
  const seed='00000001000000020000000300000004';
  if(chooser.value==='performance')mountGame(root,{state:referenceTower(),...performanceRecorder(root)});
  else if(chooser.value==='progression')mountGame(root,{state:progressionObservation()});
  else if(chooser.value==='storage-reference')mountGame(root,{state:referenceTower()});
  else if(chooser.value==='storage-abort')mountGame(root,{state:passengerAtPhase('moving').s,repository:new AbortingNativeRepository()});
  else if(chooser.value==='restaurant-visit')mountGame(root,{state:restaurantObservation()});
  else if(chooser.value==='restaurant-meal')mountGame(root,{state:mealObservation()});
  else if(chooser.value==='restaurant-finance')mountGame(root,{state:financeObservation()});
  else if(chooser.value==='queue-mixed')mountGame(root,{state:mixedNineAtBoarding()});
  else if(chooser.value.startsWith('congestion-'))mountGame(root,{state:congestionScenario(chooser.value==='congestion-improved')});
  else if(chooser.value==='queue-ready')mountGame(root,{state:nineAtBoarding()});
  else if(chooser.value==='queue-full'){const state=nineAtBoarding();until(state,state.clock.tick+8);mountGame(root,{state});}
  else if(chooser.value.startsWith('office-'))mountGame(root,{state:officeObservation(chooser.value.slice(7) as 'morning'|'evening'|'inside'|'nextday'|'stranded')});
  else if(chooser.value==='elevator-moving')mountGame(root,{state:passengerAtPhase('moving').s});
  else if(chooser.value==='elevator-boarding')mountGame(root,{state:passengerAtPhase('boarding').s});
  else if(chooser.value==='elevator-unloading')mountGame(root,{state:passengerAtPhase('unloading').s});
  else if(chooser.value==='stair-climbing')mountGame(root,{state:stairObservation('climbing').s});
  else if(chooser.value==='stair-descending')mountGame(root,{state:stairObservation('descending').s});
  else if(chooser.value==='stair-inside')mountGame(root,{state:stairObservation('inside').s});
  else if(chooser.value.startsWith('phase-'))mountGame(root,{state:passengerAtPhase(phases.find(phase=>`phase-${phase}`===chooser.value)!).s});
  else if(chooser.value==='elevator-observe')mountGame(root,{state:elevatorObservation()});
  else if(chooser.value==='elevator')mountGame(root,{state:oneElevatorPassenger()});
  else if(chooser.value==='stairs')mountGame(root,{state:stairs(upperOffice())});
  else if(chooser.value==='stairs-build')mountGame(root,{state:upperOffice()});
  else if(chooser.value==='elevator-build')mountGame(root,{state:upperOffice(3)});
  else if(chooser.value==='walker-observe'){mountGame(root,{state:oneWorkerObservation()});}
  else if(chooser.value==='walker'){mountGame(root,{state:oneWorker()});}
  else if(chooser.value==='boundary'){const state=createGame(MVP_DEFAULT,seed);advance(state,1);mountGame(root,{state});}
  else {const scenario=chooser.value==='narrow'?{...MVP_DEFAULT,world:{...MVP_DEFAULT.world,widthCells:64,groundFloor:-2,minFloor:-2,maxFloor:12,initialConstructedRanges:[{startX:0,endXExclusive:32}]}}:MVP_DEFAULT;mountGame(root,{scenario,seed});}
});
