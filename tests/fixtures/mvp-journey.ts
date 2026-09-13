import { createGame } from '../../src/simulation';
import { MVP_DEFAULT } from '../../src/content/scenarios/mvp-default';
import { command,place,until,WALKER_SEED } from './one-worker';
import { elevator } from './transport';
/** Construct the affordable starter with ordinary commands; all people, money and awards arise from gameplay. */
export function mvpJourney(seed=WALKER_SEED,officeCount=3,improve=true,top=5,scenario:unknown=MVP_DEFAULT){const s=createGame(scenario,seed);for(let floor=1;floor<=top;floor++){const r=command(s,{kind:'constructFloorRange',payload:{floor,startX:0,endXExclusive:56}});if(!r.ok)throw Error(r.code);}for(let i=0;i<officeCount;i++)place(s,top===5?24+Math.floor(i/3)*16:24,top===5?3+i%3:3+i);elevator(s,top,10);const restaurant=command(s,{kind:'placeFacility',payload:{definitionId:'restaurant.small',floor:0,x:24}});if(!restaurant.ok)throw Error(restaurant.code);until(s,33000);if(improve)elevator(s,top,14);return s;}
