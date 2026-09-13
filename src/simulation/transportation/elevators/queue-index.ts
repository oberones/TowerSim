import type { GameState } from '../../state/game-state';
import type { ElevatorQueue, QueueEntry } from './types';
import { add, multiply } from '../../core/values';
import {draftOriginal,draftArray} from '../../state/draft';
type Membership={queue:ElevatorQueue;entry:QueueEntry;position:number};
type Locator={queueId:string;entryId:string;occupantId:string;joinedTick:number;position:number};
/** Reconstructible lookup and timestamp sums; no queue aging work occurs on ordinary ticks. */
export class QueueIndex {
 private entries=new Map<string,Locator>();
 private people=new Map<string,Locator>();
 private sums=new Map<string,{count:number;joined:number}>();
 entriesVisited=0;
 /** Index a completed boundary in FIFO order without changing persistent records. */
 constructor(private queues:GameState['queues']) {for(const q of Object.values(queues))for(const [position,e] of q.entries.entries()){this.entriesVisited++;this.add(q,e,position);}}
 /** Fork scalar lookup metadata without revisiting every proxied passenger record. */
 fork(queues:GameState['queues']):QueueIndex {const result=new QueueIndex({});result.queues=queues;for(const [id,entry] of this.entries){const copy={...entry};result.entries.set(id,copy);result.people.set(copy.occupantId,copy);}for(const [id,sum] of this.sums)result.sums.set(id,{...sum});return result;}
 /** Rebind an unpublished index after commit; locators contain no transient draft references. */
 publish(queues:GameState['queues']):void {this.queues=queues;}
 /** Resolve one scalar locator against the current owned records only when requested. */
 private membership(found:Locator|undefined):Membership|undefined {if(!found)return;const queue=this.queues[found.queueId]!;return {queue,entry:queue.entries[found.position]!,position:found.position};}
 /** Add one already ordered admission and update its queue's waiting-time sufficient statistics. */
 add(queue:ElevatorQueue,entry:QueueEntry,position=queue.entries.length):void {
  if(this.entries.has(entry.id)||this.people.has(entry.occupantId))throw Error('Duplicate queue membership');
  const sum=this.sums.get(queue.id)??{count:0,joined:0};const joined=add(sum.joined,entry.joinedTick);
  const locator={queueId:queue.id,entryId:entry.id,occupantId:entry.occupantId,joinedTick:entry.joinedTick,position};this.entries.set(entry.id,locator);this.people.set(entry.occupantId,locator);this.sums.set(queue.id,{count:sum.count+1,joined});
 }
 /** Remove one live membership while preserving the order of remaining persistent entries. */
 remove(entryId:string):Membership|undefined {const found=this.entry(entryId);if(!found)return;const sum=this.sums.get(found.queue.id)!;sum.count--;sum.joined-=found.entry.joinedTick;this.entries.delete(entryId);this.people.delete(found.entry.occupantId);const remaining=draftArray(found.queue.entries).slice();remaining.splice(found.position,1);found.queue.entries=remaining;for(let i=found.position;i<remaining.length;i++)this.entries.get(remaining[i]!.id)!.position=i;return found;}
 /** Find a request directly rather than searching each queue for its identity. */
 entry(id:string):Membership|undefined {return this.membership(this.entries.get(id));}
 /** Detect conflicting membership directly by immutable occupant identity. */
  person(id:string):Membership|undefined {return this.membership(this.people.get(id));}
 /** Read cardinality for route costs without resolving passenger records or calculating queue age. */
 count(id:string):number {return this.sums.get(id)?.count??0;}
 /** Derive aggregate age at any tick from count and sum of joined ticks in constant work. */
 total(id:string,atTick:number):{count:number;waitingTicks:number} {const sum=this.sums.get(id)??{count:0,joined:0};return {count:sum.count,waitingTicks:add(multiply(sum.count,atTick),-sum.joined)};}
}
const indices=new WeakMap<GameState['queues'],QueueIndex>();
/** Reuse an index only for its owned queue map; cloned or loaded boundaries rebuild deterministically. */
export function queueIndex(s:GameState):QueueIndex {let index=indices.get(s.queues);if(!index){const original=draftOriginal(s.queues),inherited=original===s.queues?undefined:indices.get(original);index=inherited?inherited.fork(s.queues):new QueueIndex(s.queues);indices.set(s.queues,index);}return index;}
/** Publish only successful index updates; an abandoned draft cannot alter the preceding boundary's index. */
export function publishQueueIndex(draft:GameState['queues'],completed:GameState['queues']):void {const index=indices.get(draft);if(index){index.publish(completed);indices.set(completed,index);}}

/** Drop derived membership when a validated external state becomes newly owned. */
export function invalidateQueueIndex(queues:GameState['queues']):void {indices.delete(queues);}
