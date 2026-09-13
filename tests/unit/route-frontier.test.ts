import {expect,test} from 'vitest';
import {RouteFrontier} from '../../src/simulation/navigation/route-frontier';
test('decrease-key and equal costs retain exactly the sorted-Set frontier order',()=>{
 const scores=new Map<number,number>(),pending=new Set<number>(),heap=new RouteFrontier((a,b)=>scores.get(a)!-scores.get(b)!,100);
 for(let n=0;n<100;n++){const key=n;scores.set(key,n%7);pending.add(key);heap.add(key);}
 for(let n=90;n>=0;n-=3){scores.set(n,-1);heap.add(n);}
 while(pending.size){const expected=[...pending].sort((a,b)=>scores.get(a)!-scores.get(b)!)[0]!;expect(heap.pop()).toBe(expected);pending.delete(expected);}
 expect(heap.size).toBe(0);
});
