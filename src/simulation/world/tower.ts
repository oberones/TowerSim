import { allocateId, parseId } from '../core/ids/allocator';
import { add, DomainError, integer, tick } from '../core/values';
import type { GameState } from '../state/game-state';
import type { Range } from '../state/content';
import { record } from '../state/plain';
export interface Floor {id:string;level:number;constructedRanges:Range[]}
export interface Tower {id:string;floors:Floor[];lobby:{id:string;definitionId:string;floor:number;x:number;width:number;entranceX2:number}}
/** Allocate stable world identities and copy the configured permanent base and lobby. */
export function createTower(state:GameState):Tower {
  const {world,content}=state.scenario;if(!world || !content)throw new DomainError('invalidState','Playable content required');
  const definition=content.definitions.find(d=>d.typeId===world.lobbyDefinitionId)!;
  return {id:allocateId('tower',state.ids.entity),floors:[{id:allocateId('floor',state.ids.entity),level:world.groundFloor,constructedRanges:world.initialConstructedRanges.map(r=>({...r}))}],
    lobby:{id:allocateId('facility',state.ids.entity),definitionId:definition.typeId,floor:world.groundFloor,x:world.lobbyX,width:definition.footprint.width,entranceX2:world.lobbyX*2+definition.entranceOffsetX2}};
}
/** Enforce persisted geometry, immutable lobby, normalized support, and global identity bounds. */
export function assertTower(state:GameState):void {
  /** Reject inconsistent persisted geometry with an explicit invalid-state reason. */
  const fail=(condition:unknown,message:string)=>{if(!condition)throw new DomainError('invalidState',message);};
  const {world,content}=state.scenario;const t=state.tower;
  if(!world || !content){fail(t===null,'Kernel cannot contain world geometry');return;}
  fail(t!==null,'Playable state needs tower');if(!t)return;
  record(t,['id','floors','lobby']);record(t.lobby,['id','definitionId','floor','x','width','entranceX2']);
  const seen=new Set<number>();
  /** Enforce each world record kind, global ordinal uniqueness and the durable allocation ceiling. */
  const identity=(id:string,kind:string)=>{const parsed=parseId(id);fail(parsed.kind===kind && parsed.ordinal<state.ids.entity.next && !seen.has(parsed.ordinal),'Invalid world identity');seen.add(parsed.ordinal);};
  identity(t.id,'tower');identity(t.lobby.id,'facility');
  const d=content.definitions.find(d=>d.typeId===world.lobbyDefinitionId)!;
  fail(t.lobby.definitionId===d.typeId && t.lobby.floor===world.groundFloor && t.lobby.x===world.lobbyX && t.lobby.width===d.footprint.width && t.lobby.entranceX2===world.lobbyX*2+d.entranceOffsetX2,'Changed permanent lobby');
  fail(Array.isArray(t.floors),'Missing floors');let previous=world.minFloor-1;
  for(const floor of t.floors){
    record(floor,['id','level','constructedRanges']);identity(floor.id,'floor');integer(floor.level);
    fail(floor.level>previous && floor.level>=world.minFloor && floor.level<=world.maxFloor,'Unordered or out-of-bounds floor');previous=floor.level;
    fail(Array.isArray(floor.constructedRanges) && floor.constructedRanges.length>0,'Empty floor');let end=-1;
    for(const r of floor.constructedRanges){record(r,['startX','endXExclusive']);tick(r.startX);integer(r.endXExclusive);fail(r.startX>end && r.endXExclusive>r.startX && r.endXExclusive<=world.widthCells,'Invalid constructed range');end=r.endXExclusive;
      if(floor.level>world.groundFloor)fail(t.floors.find(f=>f.level===floor.level-1)?.constructedRanges.some(b=>b.startX<=r.startX && b.endXExclusive>=r.endXExclusive),'Unsupported upper floor');
    }
  }
  const base=t.floors.find(f=>f.level===world.groundFloor);
  for(const range of world.initialConstructedRanges)fail(base?.constructedRanges.some(r=>r.startX<=range.startX && r.endXExclusive>=range.endXExclusive),'Removed protected base');
  add(t.lobby.x,t.lobby.width);
}
