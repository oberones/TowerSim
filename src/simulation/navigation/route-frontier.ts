/** Indexed minimum frontier preserving the former stable insertion-order tie break. */
export class RouteFrontier {
 private heap:number[]=[];private indices:Int32Array;private ordinals:Float64Array;private next=0;
 /** Compare current route scores; callers only decrease a pending key's score. */
 constructor(private score:(a:number,b:number)=>number,capacity:number){this.indices=new Int32Array(capacity).fill(-1);this.ordinals=new Float64Array(capacity);}
 /** Expose only the number of unsettled route states. */
 get size():number {return this.heap.length;}
 /** Match stable Set sorting when all route score components tie. */
 private compare(a:number,b:number):number {return this.score(a,b)||this.ordinals[a]!-this.ordinals[b]!;}
 /** Exchange entries while maintaining decrease-key positions. */
 private swap(a:number,b:number):void {const left=this.heap[a]!;this.heap[a]=this.heap[b]!;this.heap[b]=left;this.indices[left]=b;this.indices[this.heap[a]!]=a;}
 /** Insert or decrease an unsettled state without sorting the entire frontier. */
 add(key:number):void {
  let index:number=this.indices[key]!;
  if(index===-1){index=this.heap.length;this.heap.push(key);this.indices[key]=index;this.ordinals[key]=this.next++;}
  while(index>0){const parent:number=(index-1)>>>1;if(this.compare(this.heap[parent]!,key)<=0)break;this.swap(parent,index);index=parent;}
 }
 /** Settle the earliest route score and repair the remaining heap in logarithmic work. */
 pop():number {
  const first=this.heap[0]!,last=this.heap.pop()!;this.indices[first]=-1;
  if(this.heap.length){this.heap[0]=last;this.indices[last]=0;let index=0;
   while(index*2+1<this.heap.length){let child=index*2+1;if(child+1<this.heap.length&&this.compare(this.heap[child+1]!,this.heap[child]!)<0)child++;if(this.compare(this.heap[index]!,this.heap[child]!)<=0)break;this.swap(index,child);index=child;}
  }
  return first;
 }
}
