import { mountGame } from '../../src/main';
import { MVP_DEFAULT } from '../../src/content/scenarios/mvp-default';
import { createGame, advance } from '../../src/simulation';
const root=document.getElementById('app');if(!root)throw Error('Missing application root');
const chooser=document.createElement('select');chooser.setAttribute('aria-label','Starting fixture');
for(const [value,label] of [['new','Default paused site'],['narrow','Narrow site, negative ground'],['boundary','Validated completed boundary']]){const option=document.createElement('option');option.value=value!;option.textContent=label!;chooser.append(option);}
const start=document.createElement('button');start.textContent='Start selected fixture';root.append(chooser,start);
/** Supply a validated scenario or snapshot only before mounting the ordinary application. */
start.addEventListener('click',()=>{
  const seed='00000001000000020000000300000004';
  if(chooser.value==='boundary'){const state=createGame(MVP_DEFAULT,seed);advance(state,1);mountGame(root,{state});}
  else {const scenario=chooser.value==='narrow'?{...MVP_DEFAULT,world:{...MVP_DEFAULT.world,widthCells:64,groundFloor:-2,minFloor:-2,maxFloor:12,initialConstructedRanges:[{startX:0,endXExclusive:32}]}}:MVP_DEFAULT;mountGame(root,{scenario,seed});}
});
