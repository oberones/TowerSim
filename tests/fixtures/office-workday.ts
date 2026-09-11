import { createGame } from '../../src/simulation';
import { MVP_DEFAULT } from '../../src/content/scenarios/mvp-default';
import { command, place, WALKER_SEED, until } from './one-worker';
import { elevator } from './transport';
/** Build one full default workforce served by a standard elevator, preserving production demand data. */
export function officeWorkday() {const s=createGame(MVP_DEFAULT,WALKER_SEED);for(let floor=1;floor<=3;floor++)command(s,{kind:'constructFloorRange',payload:{floor,startX:0,endXExclusive:48}});place(s,24,3);return elevator(s,3);}
/** Supply ordinary-workday observation boundaries before mounting the unmodified player application. */
export function officeObservation(stage:'morning'|'evening'|'inside'|'nextday'|'stranded') {
 const s=officeWorkday();until(s,stage==='morning'?28680:stage==='evening'?61080:stage==='nextday'?108001:43200);
 if(stage==='stranded'){const result=command(s,{kind:'demolishEntity',payload:{entityId:Object.keys(s.shafts)[0]!}});if(!result.ok)throw Error(result.code);until(s,70000);}
 return s;
}
