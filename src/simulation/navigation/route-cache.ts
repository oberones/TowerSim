import { clonePlain } from '../state/plain';
import type { WalkRoute } from './find-route';
/** Keep disposable static route templates bounded and independent of save identity. */
export class RouteCache {
 private entries=new Map<string,WalkRoute|null>();
 /** Require a finite positive capacity for predictable eviction. */
 constructor(private capacity:number){if(!Number.isSafeInteger(capacity)||capacity<1)throw Error('Invalid cache limit');}
 /** Cache detached static routes by topology and endpoints; eviction never changes route semantics. */
 get(version:number,from:string,to:string,resolve:()=>WalkRoute|null):WalkRoute|null {const key=`${version}:${from}:${to}`;if(!this.entries.has(key)){if(this.entries.size>=this.capacity)this.entries.delete(this.entries.keys().next().value!);this.entries.set(key,resolve());}const r=this.entries.get(key)!;this.entries.delete(key);this.entries.set(key,r);return r?clonePlain(r):null;}
 /** Expose current bounded storage size for deterministic cache tests. */
 get size():number {return this.entries.size;}
}
