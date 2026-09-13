import { add, positive, DomainError } from '../values';
import type { Counter } from '../ids/allocator';
import { compareEvents, validateEvent } from './event';
import type { EventRecord } from './event';
/** Detach a plain event so callers cannot mutate records retained by the scheduler. */
const copy = <E extends EventRecord>(event: E): E => JSON.parse(JSON.stringify(event)) as E;
/** Derived indexed heap; owners and sequence indices are physically removed with entries. */
export class Scheduler<E extends EventRecord = EventRecord> {
  private heap: E[] = [];
  private highestSequence = 0;
  private indices = new Map<string,number>();
  private sequences = new Set<number>();
  private owners = new Map<string,Set<string>>();
  private snapshot:E[]|null=null;private added=new Map<string,E>();private removed=new Set<string>();
  /** Reconstruct the indexed heap from validated future events without consuming new identities. */
  constructor(events: readonly E[], currentTick: number) { for (const event of events) this.insert(event,currentTick);this.ownedSnapshot(); }
  /** Reconstruct from already validated owned records; pending event records are never edited in place. */
  static fromOwned<E extends EventRecord>(events:readonly E[],currentTick:number):Scheduler<E> {const scheduler=new Scheduler<E>([],currentTick);for(const event of events)scheduler.insertRecord(event);scheduler.ownedSnapshot();return scheduler;}
  /** Report physical heap occupancy, including no canceled-event tombstones. */
  get size(): number { return this.heap.length; }
  /** Return a detached next event without removing or changing the heap. */
  peek(): E | undefined { const event=this.heap[0]; return event && copy(event); }
  /** Validate and index one uniquely identified future event, then restore min-heap ordering. */
  insert(event: E, currentTick: number): void {
    validateEvent(event,currentTick);
    this.insertRecord(copy(event));
  }
  /** Maintain the physical heap and insertion delta after the caller establishes event ownership. */
  private insertRecord(owned:E):void {
    const event=owned;
    if(this.indices.has(event.id) || this.sequences.has(event.sequence)) throw new DomainError('invalidState','Duplicate event ID/sequence');
    const index=this.heap.length;
    this.heap.push(owned); this.indices.set(owned.id,index); this.sequences.add(owned.sequence);
    let ids=this.owners.get(owned.targetId); if(!ids) {ids=new Set();this.owners.set(owned.targetId,ids);} ids.add(owned.id);
    this.highestSequence=Math.max(this.highestSequence,event.sequence);
    this.added.set(owned.id,owned);
    this.up(index);
  }
  /** Exchange heap positions and update both reverse identity indices together. */
  private swap(a:number,b:number): void {
    const left=this.heap[a]!; this.heap[a]=this.heap[b]!;this.heap[b]=left;
    this.indices.set(this.heap[a]!.id,a);this.indices.set(left.id,b);
  }
  /** Bubble a displaced entry toward its ordered parent and return its final position. */
  private up(index:number): number {
    while(index>0) {const parent=Math.floor((index-1)/2);if(compareEvents(this.heap[parent]!,this.heap[index]!)<=0) break;this.swap(parent,index);index=parent;} return index;
  }
  /** Sink a displaced entry beneath its earliest child until the heap property is restored. */
  private down(index:number): void {
    while(index*2+1<this.heap.length) {
      let child=index*2+1;
      if(child+1<this.heap.length && compareEvents(this.heap[child+1]!,this.heap[child]!)<0) child++;
      if(compareEvents(this.heap[index]!,this.heap[child]!)<=0) break;
      this.swap(index,child);index=child;
    }
  }
  /** Physically remove an event and all owner/sequence indices, repairing the displaced heap entry. */
  cancel(id:string): boolean {
    const index=this.indices.get(id);if(index===undefined)return false;
    const removed=this.heap[index]!; const last=this.heap.pop()!;
    if(!this.added.delete(id))this.removed.add(id);
    this.indices.delete(id);this.sequences.delete(removed.sequence);
    const owners=this.owners.get(removed.targetId)!;owners.delete(id);if(!owners.size)this.owners.delete(removed.targetId);
    if(index<this.heap.length) {this.heap[index]=last;this.indices.set(last.id,index);this.down(this.up(index));}return true;
  }
  /** Remove every pending event belonging to one owner without retaining cancellation tombstones. */
  cancelOwner(owner:string): number {const ids=[...(this.owners.get(owner)??[])];for(const id of ids)this.cancel(id);return ids.length;}
  /** Detach and physically remove the earliest event if the heap is nonempty. */
  pop(): E | undefined {const event=this.peek();if(event)this.cancel(event.id);return event;}
  /** Discard obsolete owner generations until the earliest still-live event is found. */
  popCurrent(generation:(owner:string)=>number|undefined): E | undefined {
    while(this.size) {const event=this.pop()!;if(generation(event.targetId)===event.targetGeneration)return event;}return undefined;
  }
  /** Validate a fresh insertion ordinal and future time before replacing the event atomically. */
  reschedule(id:string,dueTick:number,currentTick:number,counter:Counter): void {
    const index=this.indices.get(id);if(index===undefined)throw new DomainError('invalidState','Unknown event');
    const sequence=positive(counter.next);const next=add(sequence,1);
    const event={...this.heap[index]!,dueTick,sequence};validateEvent(event,currentTick);
    if(this.sequences.has(sequence) || sequence <= this.highestSequence)throw new DomainError('invalidState','Reschedule requires fresh sequence');
    this.cancel(id);this.insert(event,currentTick);counter.next=next;
  }
  /** Export detached pending records in canonical due/phase/sequence order. */
  exportSorted(): E[] {return this.ownedSnapshot().map(copy);}
  /** Share stable event records only with an owned simulation transaction; heap operations never mutate them. */
  ownedSnapshot(): E[] {
    if(this.snapshot===null)this.snapshot=[...this.heap].sort(compareEvents);
    else if(this.added.size||this.removed.size){
      const added=[...this.added.values()].sort(compareEvents),next:E[]=[];let index=0;
      for(const event of this.snapshot){if(this.removed.has(event.id))continue;while(index<added.length&&compareEvents(added[index]!,event)<0)next.push(added[index++]!);next.push(event);}
      while(index<added.length)next.push(added[index++]!);this.snapshot=next;
    }
    this.added.clear();this.removed.clear();return this.snapshot;
  }
  /** Cancel a typed lifecycle wakeup through the owner index, avoiding a full pending-event scan. */
  cancelKind(owner:string,kind?:string):void {for(const id of [...(this.owners.get(owner)??[])]){const event=this.heap[this.indices.get(id)!]!;if(kind===undefined||event.kind===kind)this.cancel(id);}}
  /** Report physical index sizes for bounded-storage tests and benchmark evidence. */
  storageCounts() {return {heap:this.heap.length,ids:this.indices.size,sequences:this.sequences.size,owners:this.owners.size};}
  /** Verify heap ordering and exact correspondence among event, sequence and owner indices. */
  assertConsistent(): void {
    if(this.indices.size!==this.size || this.sequences.size!==this.size)throw new DomainError('invalidState','Heap index size mismatch');
    let owners=0;for(const ids of this.owners.values())owners+=ids.size;
    if(owners!==this.size)throw new DomainError('invalidState','Owner index mismatch');
    for(let i=0;i<this.size;i++) {const e=this.heap[i]!;
      if(this.indices.get(e.id)!==i || !this.sequences.has(e.sequence) || !this.owners.get(e.targetId)?.has(e.id) || (i>0 && compareEvents(this.heap[Math.floor((i-1)/2)]!,e)>0))throw new DomainError('invalidState','Heap invariant failure');
    }
  }
}
