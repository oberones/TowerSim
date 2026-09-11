import type { GameState } from '../../state/game-state';
import type { ElevatorQueue, QueueEntry } from './types';
import { add, multiply } from '../../core/values';
type Membership={queue:ElevatorQueue;entry:QueueEntry;position:number};
/** Reconstructible lookup and timestamp sums; no queue aging work occurs on ordinary ticks. */
export class QueueIndex {
 private entries=new Map<string,Membership>();
 private people=new Map<string,Membership>();
 private sums=new Map<string,{count:number;joined:number}>();
 entriesVisited=0;
 /** Index a completed boundary in FIFO order without changing persistent records. */
 constructor(queues:GameState['queues']) {for(const q of Object.values(queues))for(const [position,e] of q.entries.entries()){this.entriesVisited++;this.add(q,e,position);}}
 /** Add one already ordered admission and update its queue's waiting-time sufficient statistics. */
 add(queue:ElevatorQueue,entry:QueueEntry,position=queue.entries.length):void {
  if(this.entries.has(entry.id)||this.people.has(entry.occupantId))throw Error('Duplicate queue membership');
  const sum=this.sums.get(queue.id)??{count:0,joined:0};const joined=add(sum.joined,entry.joinedTick);
  this.entries.set(entry.id,{queue,entry,position});this.people.set(entry.occupantId,{queue,entry,position});this.sums.set(queue.id,{count:sum.count+1,joined});
 }
 /** Remove one live membership while preserving the order of remaining persistent entries. */
 remove(entryId:string):Membership|undefined {const found=this.entries.get(entryId);if(!found)return;const sum=this.sums.get(found.queue.id)!;sum.count--;sum.joined-=found.entry.joinedTick;this.entries.delete(entryId);this.people.delete(found.entry.occupantId);found.queue.entries.splice(found.position,1);for(let i=found.position;i<found.queue.entries.length;i++){const shifted=this.entries.get(found.queue.entries[i]!.id)!;shifted.position=i;this.people.get(shifted.entry.occupantId)!.position=i;}return found;}
 /** Find a request directly rather than searching each queue for its identity. */
 entry(id:string):Membership|undefined {return this.entries.get(id);}
 /** Detect conflicting membership directly by immutable occupant identity. */
 person(id:string):Membership|undefined {return this.people.get(id);}
 /** Derive aggregate age at any tick from count and sum of joined ticks in constant work. */
 total(id:string,atTick:number):{count:number;waitingTicks:number} {const sum=this.sums.get(id)??{count:0,joined:0};return {count:sum.count,waitingTicks:add(multiply(sum.count,atTick),-sum.joined)};}
}
const indices=new WeakMap<GameState['queues'],QueueIndex>();
/** Reuse an index only for its owned queue map; cloned or loaded boundaries rebuild deterministically. */
export function queueIndex(s:GameState):QueueIndex {let index=indices.get(s.queues);if(!index){index=new QueueIndex(s.queues);indices.set(s.queues,index);}return index;}
