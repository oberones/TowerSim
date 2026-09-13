import { allocateId } from '../core/ids/allocator';
import { prepareState } from '../state/transaction';
import type { GameState } from '../state/game-state';
import type { CommandResult } from './types';
import { quoteStair,quoteStairRemoval } from '../transportation/stairs/stairs';
import type { StairPayload } from '../transportation/stairs/stairs';
import { topologyChanged } from '../world/topology-change';
import { post } from '../economy/ledger';
/** Publish stair geometry, charge and reconciled routes together only after full validation. */
export function commitStair(state:GameState,p:StairPayload|string,sequence:number):CommandResult {
 const result=typeof p==='string'?quoteStairRemoval(state,p):quoteStair(state,p);if(!result.ok)return result;
 try{const completed=prepareState(state,draft=>{if(typeof p==='string')delete draft.stairs[p];else{const d=draft.scenario.content!.definitions.find(d=>d.typeId===p.definitionId)!,id=allocateId('stair',draft.ids.entity),x2=p.x*2+d.entranceOffsetX2;
 draft.stairs[id]={id,definitionId:'stairs.basic',lowerFloor:p.lowerFloor,upperFloor:p.lowerFloor+1,x:p.x,width:d.footprint.width,lowerAnchor:{floor:p.lowerFloor,x2},upperAnchor:{floor:p.lowerFloor+1,x2},traversalTicks:draft.scenario.content!.stairTicksPerFloor,createdTick:draft.clock.tick};
 if(d.constructionCostMinor&&!post(draft,{source:`construction:command:${sequence}:stair:${id}`,amountMinor:-d.constructionCostMinor}).ok)throw Error('Stair charge failed');}
 topologyChanged(draft);});Object.assign(state,completed);return {...result,code:'applied'};
 }catch{return {ok:false,code:'overflow',message:'The complete stair edit could not be settled.'};}
}
