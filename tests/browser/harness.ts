import { elevatorObservation,oneElevatorPassenger,passengerAtPhase } from '../fixtures/one-elevator-passenger';
import { stairs,upperOffice,stairObservation } from '../fixtures/transport';
import type { CarPhase } from '../../src/simulation/transportation/elevators/types';
import { oneWorker,oneWorkerObservation } from '../fixtures/one-worker';
import { mountGame } from '../../src/main';
import { MVP_DEFAULT } from '../../src/content/scenarios/mvp-default';
import { createGame, advance } from '../../src/simulation';
const root=document.getElementById('app');if(!root)throw Error('Missing application root');
const chooser=document.createElement('select');chooser.setAttribute('aria-label','Starting fixture');
const phases:CarPhase[]=['idle','starting','leveling','opening','dwell','closing'];
for(const [value,label] of [['elevator-moving','One elevator rider — paused mid-flight'],['elevator-boarding','One elevator rider — paused boarding'],['elevator-unloading','One elevator rider — paused unloading'],['stair-climbing','One worker — paused on stairs'],['stair-descending','One worker — paused descending stairs'],['stair-inside','One worker — inside upper office before access removal'],...phases.map(phase=>[`phase-${phase}`,`Elevator phase — ${phase}`]),['elevator-observe','One elevator rider — visible approach'],['elevator','One elevator rider — paused construction'],['stairs','One worker — upper office and stairs'],['stairs-build','One worker — upper office needing stairs'],['elevator-build','One worker — upper office needing elevator'],['walker-observe','One worker — visible approach'],['walker','One worker — same-floor office'],['new','Default paused site'],['narrow','Narrow site, negative ground'],['boundary','Validated completed boundary']]){const option=document.createElement('option');option.value=value!;option.textContent=label!;chooser.append(option);}
const start=document.createElement('button');start.textContent='Start selected fixture';root.append(chooser,start);
/** Supply a validated scenario or snapshot only before mounting the ordinary application. */
start.addEventListener('click',()=>{
  const seed='00000001000000020000000300000004';
  if(chooser.value==='elevator-moving')mountGame(root,{state:passengerAtPhase('moving').s});
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
