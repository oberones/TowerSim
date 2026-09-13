import { occupiedFloorSpan } from './dependencies';
import { reservations } from '../world/reservations';
import type { GameState } from '../state/game-state';
import { add, multiply, DomainError } from '../core/values';
import { covers, overlaps } from '../world/ranges';
import type { CommandResult, FloorPayload, FloorKind, FloorQuote, CommandError } from '../commands/types';
/** Quote one whole floor edit using the same pure support, bounds, price and allocation rules as commit. */
export function quoteFloor(state:GameState,kind:FloorKind,p:FloorPayload):CommandResult {
  const world=state.scenario.world,content=state.scenario.content,tower=state.tower;
  if(!world || !content || !tower)return {ok:false,code:'notImplemented'};
  let quote:FloorQuote|undefined;
  /** Attach complete available quote data and a specific blocking reason without mutating the tower. */
  const reject=(code:CommandError,message:string,blockingFloor?:number):CommandResult=>({ok:false,code,message,...(quote?{quote}:{}),...(blockingFloor!==undefined?{blockingFloor}:{})});
  try{
    if(![p.floor,p.startX,p.endXExclusive].every(Number.isSafeInteger)||p.startX>=p.endXExclusive)return reject('invalidCommand','Choose a positive span with whole-cell coordinates.');
    const price=kind==='constructFloorRange'?multiply(p.endXExclusive-p.startX,content.floorCostMinorPerCell):0;
    quote={footprint:{...p},constructionCostMinor:price,demolitionCostMinor:0,accruedSettlementMinor:0,cashDeltaMinor:price===0?0:-price,topologyVersion:state.navigation.topologyVersion};
    if(p.floor<world.minFloor||p.floor>world.maxFloor||p.startX<0||p.endXExclusive>world.widthCells)return reject('outOfBounds',`Stay within cells 0–${world.widthCells} and floors ${world.minFloor}–${world.maxFloor}.`);
    const existing=tower.floors.find(f=>f.level===p.floor);
    if(kind==='constructFloorRange'){
      if(existing?.constructedRanges.some(r=>overlaps(r,p)))return reject('overlap','The proposed span overlaps existing floor space.');
      if(p.floor>world.groundFloor && !covers(tower.floors.find(f=>f.level===p.floor-1)?.constructedRanges??[],p))return reject('missingSupport',`Build full support on floor ${p.floor-1} first.`,p.floor-1);
      if(price>0 && state.economy.balanceMinor<price)return reject('insufficientFunds','There is not enough cash for the entire quoted span.');
      if(!existing)add(state.ids.entity.next,1);if(price!==0)add(state.ids.transaction.next,1);add(state.economy.balanceMinor,-price);
    }else{
      if(!existing || !covers(existing.constructedRanges,p))return reject('missingFloor','Demolition requires an entirely constructed span.');
      if(p.floor===world.groundFloor && world.initialConstructedRanges.some(r=>overlaps(r,p)))return reject('protectedBase','The initial ground base and permanent lobby are protected.');
      if(tower.floors.find(f=>f.level===p.floor+1)?.constructedRanges.some(r=>overlaps(r,p)))return reject('upperSupport',`This span supports floor ${p.floor+1}; remove the upper space first.`,p.floor+1);
      if(reservations(state).some(r=>r.floor===p.floor&&overlaps(r,p)))return reject('overlap','Remove the supported room or transport first.');
      if(occupiedFloorSpan(state,p))return reject('overlap','This span supports a person or committed walking leg.');
    }
    add(state.navigation.topologyVersion,1);
    return {ok:true,code:'valid',quote};
  }catch(error){return reject(error instanceof DomainError && error.code==='overflow'?'overflow':'invalidCommand','The edit exceeds safe integer limits or contains invalid coordinates.');}
}
