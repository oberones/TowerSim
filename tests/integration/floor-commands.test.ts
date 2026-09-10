import { expect, test } from 'vitest';
import { encodeState, validateCommand } from '../../src/simulation';
import { tower, floor } from '../fixtures/tower';
import { MVP_DEFAULT } from '../../src/content/scenarios/mvp-default';
import { applyCommand } from '../../src/simulation';
import { post } from '../../src/simulation/economy/ledger';

test('exactly affordable success charges once and duplicate submission cannot replay',()=>{
  const s=tower({...MVP_DEFAULT,startingFundsMinor:1000});const input={kind:'constructFloorRange',payload:{floor:1,startX:0,endXExclusive:10},atTick:s.clock.tick,sequence:1};
  const before=encodeState(s);expect(validateCommand(s,input)).toMatchObject({ok:true,quote:{constructionCostMinor:1000,cashDeltaMinor:-1000}});expect(encodeState(s)).toBe(before);
  expect(applyCommand(s,input).ok).toBe(true);expect(s.economy.balanceMinor).toBe(0);expect(s.economy.transactions).toHaveLength(1);
  expect(applyCommand(s,input)).toMatchObject({ok:false,code:'duplicateCommand'});expect(s.economy.transactions).toHaveLength(1);
  expect(floor(s,1,10,11)).toMatchObject({ok:false,code:'insufficientFunds'});
});
test('rejected edits change only sequencing, preserving geometry, RNG, IDs, events and ledger',()=>{
  const s=tower();floor(s,1,0,10);
  for(const [level,start,end,remove] of [[1,5,15,false],[2,0,11,false],[0,0,2,true],[1,20,25,true]] as const){
    const before=JSON.parse(encodeState(s));const result=floor(s,level,start,end,remove);expect(result.ok).toBe(false);before.lastCommandSequence++;expect(JSON.parse(encodeState(s))).toEqual(before);
  }
});
test('zero-cost construction and free demolition work at negative cash without refunds',()=>{
  const s=tower({...MVP_DEFAULT,content:{...MVP_DEFAULT.content,floorCostMinorPerCell:0}});post(s,{source:'fixture:liability',amountMinor:-1000001});
  expect(floor(s,1,0,10).ok).toBe(true);expect(floor(s,1,3,7,true)).toMatchObject({ok:true,quote:{demolitionCostMinor:0,accruedSettlementMinor:0,cashDeltaMinor:0}});
  expect(s.economy.balanceMinor).toBe(-1);expect(s.economy.transactions).toHaveLength(1);
});
test('overflow is rejected before geometry, topology, money or allocation mutation',()=>{
  for(const edit of [(s:any)=>s.ids.entity.next=Number.MAX_SAFE_INTEGER,(s:any)=>s.ids.transaction.next=Number.MAX_SAFE_INTEGER,(s:any)=>s.navigation.topologyVersion=Number.MAX_SAFE_INTEGER]){
    const s=tower();edit(s);const before=JSON.parse(encodeState(s));expect(floor(s,1,0,10)).toMatchObject({ok:false,code:'overflow'});before.lastCommandSequence++;expect(JSON.parse(encodeState(s))).toEqual(before);
  }
  const s=tower({...MVP_DEFAULT,content:{...MVP_DEFAULT.content,floorCostMinorPerCell:Number.MAX_SAFE_INTEGER}});expect(floor(s,1,0,2)).toMatchObject({ok:false,code:'overflow'});
});
test('demolishing an empty whole floor removes its record but never reuses its identity',()=>{
  const s=tower();floor(s,1,0,10);const id=s.tower!.floors.find(f=>f.level===1)!.id;
  floor(s,1,0,10,true);expect(s.tower!.floors.some(f=>f.level===1)).toBe(false);
  floor(s,1,0,10);expect(s.tower!.floors.find(f=>f.level===1)!.id).not.toBe(id);
});
