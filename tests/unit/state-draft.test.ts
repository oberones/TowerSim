import {expect,test} from 'vitest';
import {createDraft,draftArray} from '../../src/simulation/state/draft';

test('drafts copy changed ancestors and preserve untouched records and the preceding boundary',()=>{
 const base={people:{a:{value:1},b:{value:2}},events:[{id:1},{id:2}]};
 const transaction=createDraft(base),draft=transaction.value;
 draft.people.a.value=3;draft.events.splice(0,1);draft.events.push({id:3});
 expect(base).toEqual({people:{a:{value:1},b:{value:2}},events:[{id:1},{id:2}]});
 const result=transaction.finish();
 expect(result).toEqual({people:{a:{value:3},b:{value:2}},events:[{id:2},{id:3}]});
 expect(result.people.b).toBe(base.people.b);expect(result.people.a).not.toBe(base.people.a);
 expect(JSON.parse(JSON.stringify(result))).toEqual(result);
});

test('replacement containers, nested draft references, deletion and repeated writes finalize without proxies',()=>{
 const base={records:{a:{value:1},b:{value:2}},selected:null as null|{value:number},list:[{value:0}]};
 const tx=createDraft(base),d=tx.value;
 d.selected=d.records.a;d.records.a.value=4;d.list=[d.records.a,{value:5}];d.list[1]!.value=6;
 delete (d.records as Partial<typeof d.records>).b;
 const result=tx.finish();
 expect(result).toEqual({records:{a:{value:4}},selected:{value:4},list:[{value:4},{value:6}]});
 expect(base.records.a.value).toBe(1);expect(base.records.b.value).toBe(2);
 expect(()=>JSON.stringify(result)).not.toThrow();
});

test('abandoned nested/array writes cannot escape, and an unused draft retains identity',()=>{
 const base={list:[{value:1}],nested:{value:2}};const tx=createDraft(base);
 tx.value.list[0]!.value=8;tx.value.list.length=0;tx.value.nested={value:9};
 expect(base).toEqual({list:[{value:1}],nested:{value:2}});
 expect(createDraft(base).finish()).toBe(base);
});

test('new lifecycle records containing existing draft anchors publish plain data with no revoked references',()=>{
 const base={anchor:{x:1},journey:null as null|{from:{x:number};legs:{from:{x:number}}[]}};
 const tx=createDraft(base);tx.value.journey={from:tx.value.anchor,legs:[{from:tx.value.anchor}]};
 expect(tx.value.journey.legs[0]!.from.x).toBe(1);
 const result=tx.finish();expect(JSON.parse(JSON.stringify(result))).toEqual({anchor:{x:1},journey:{from:{x:1},legs:[{from:{x:1}}]}});
});

test('private collection journals restore deleted/new slots while retaining prior committed records',()=>{
 const records:Record<string,{value:number}>={a:{value:1},b:{value:2}},base={records};
 const committed=createDraft(base,[],[records]);committed.value.records.a!.value=3;const current=committed.finish();
 const before=JSON.stringify(current),failed=createDraft(current,[],[records]);
 failed.value.records.a!.value=4;delete failed.value.records.b;failed.value.records.c={value:5};failed.abort();
 expect(JSON.stringify(current)).toBe(before);expect(current.records.a!.value).toBe(3);
});

test('bulk array replacement retains pending child changes and cannot modify the previous array',()=>{
 const base={list:[{id:1,value:1},{id:2,value:2}]},tx=createDraft(base);tx.value.list[1]!.value=7;
 tx.value.list=draftArray(tx.value.list).slice(1);
 expect(tx.finish()).toEqual({list:[{id:2,value:7}]});expect(base.list).toEqual([{id:1,value:1},{id:2,value:2}]);
});


test('bulk read views include pending descendants and assigned containers without publishing or breaking later writes',async()=>{
 const {draftRead}=await import('../../src/simulation/state/draft');
 const base={people:{a:{state:'walking',journey:{legs:[{kind:'elevator'}]}},b:{state:'inside',journey:{legs:[] as {kind:string}[]}}}};
 const before=JSON.stringify(base),draft=createDraft(base),person=draft.value.people.a;
 person.state='waiting';person.journey.legs[0]!.kind='walk';draft.value.people.b.journey={legs:[person.journey.legs[0]!]};
 const view=draftRead(draft.value.people);expect(view.a.state).toBe('waiting');expect(view.b.journey.legs[0]!.kind).toBe('walk');expect(JSON.stringify(base)).toBe(before);
 person.state='riding';expect(draft.value.people.a.state).toBe('riding');const completed=draft.finish();expect(completed.people.a.state).toBe('riding');expect(completed.people.b.journey.legs[0]!.kind).toBe('walk');expect(JSON.stringify(base)).toBe(before);
});
