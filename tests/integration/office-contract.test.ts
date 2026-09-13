import {test,expect} from 'vitest';
import {createGame,advance,validateCommand} from '../../src/simulation';
import {MVP_DEFAULT} from '../../src/content/scenarios/mvp-default';
import {inspectOffice} from '../../src/app/game/facility-queries';
import {place,command,WALKER_SEED} from '../fixtures/one-worker';
test('placement quotes price; leasing assigns a finite whole workforce without inventing presence or rent',()=>{
 const s=createGame({...MVP_DEFAULT,content:{...MVP_DEFAULT.content,officeMarketWorkers:33}},WALKER_SEED),before=JSON.stringify(s);
 const q=validateCommand(s,{kind:'placeFacility',payload:{definitionId:'office.small',floor:0,x:24},sequence:1,atTick:s.clock.tick});expect(q.quote?.constructionCostMinor).toBe(60000);expect(JSON.stringify(s)).toBe(before);
 const a=place(s),b=place(s,44);expect(inspectOffice(s,a.id)).toMatchObject({tenancy:'vacant',assigned:0,present:0,accrued:{incomeMinor:0,costMinor:0}});
 advance(s,0);expect(s.offices[a.id]!.lease).toBeNull();expect(advance(s,1).ok).toBe(true);
 expect(inspectOffice(s,a.id)).toMatchObject({tenancy:'leased',assigned:32,present:0,availableMarket:1});expect(inspectOffice(s,b.id)?.vacancyReason).toContain('whole workforce');
 expect(s.economy.transactions.every(t=>t.source.startsWith('construction:'))).toBe(true);
 command(s,{kind:'constructFloorRange',payload:{floor:1,startX:0,endXExclusive:60}});const upper=place(s,24,1);expect(inspectOffice(s,upper.id)).toMatchObject({tenancy:'vacant',access:{accessible:false}});
});
