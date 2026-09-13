import {countWork} from '../core/work-counters';

type PlainObject=Record<PropertyKey,unknown>;
const originals=new WeakMap<object,object>();
const readers=new WeakMap<object,()=>object>();
/** Read current records without enrolling untouched descendants in a draft; use only until the next write and never mutate the view. */
export function draftRead<T extends object>(value:T):T {return (readers.get(value)?.()??value) as T;}
const arrays=new WeakMap<object,()=>readonly unknown[]>();
/** Read array slots for bulk structural copies; mutable child fields must still be read through the draft. */
export function draftArray<T>(value:T[]):readonly T[] {return (arrays.get(value)?.()??value) as readonly T[];}
/** Identify the immutable source of a private draft for reconstructible-index inheritance. */
export function draftOriginal<T extends object>(value:T):T {return (originals.get(value)??value) as T;}
interface DraftNode {base:PlainObject;copy:PlainObject|null;proxy:PlainObject;parents:Map<DraftNode,Set<PropertyKey>>;written:Set<PropertyKey>;owned:boolean;mutable:boolean}
/** Stage writes to validated JSON records, copying only changed containers and their ancestors.
 * Callers own new assigned records. Published records remain read-only to the transaction;
 * finish removes all draft references, and abandoning the transaction publishes nothing.
 */
export function createDraft<T extends object>(base:T,immutable:readonly object[]=[],mutable:readonly object[]=[]):{value:T;finish:()=>T;abort:()=>void} {
 const nodes=new WeakMap<object,DraftNode>(),proxies=new WeakMap<object,DraftNode>(),assigned=new WeakSet<object>();
 const shared=new Set(immutable);
 const privateMaps=new Set(mutable),undo=new Map<DraftNode,Map<PropertyKey,{present:boolean;value:unknown}>>();
 const revocations:(()=>void)[]=[];
 /** Lazily detach a modified container, propagating dirtiness through its accessed parents. */
 function change(node:DraftNode):void {
  if(node.copy)return;
  if(node.mutable)node.copy=node.base;
  else if(Array.isArray(node.base)){node.copy=node.base.slice() as unknown as PlainObject;countWork('draftCopiedSlots',node.base.length);}
  else{node.copy={};let slots=0;for(const key in node.base)if(Object.hasOwn(node.base,key)){node.copy[key]=node.base[key];slots++;}countWork('draftCopiedSlots',slots);}
  if(!node.mutable)countWork('draftContainersCopied');
  for(const [parent,keys] of node.parents){for(const key of keys)parent.written.add(key);change(parent);}
 }
 /** Journal a private collection slot before editing it; entity records still use ordinary copy-on-write. */
 function remember(node:DraftNode,key:PropertyKey):void {if(!node.mutable)return;let entries=undo.get(node);if(!entries){entries=new Map();undo.set(node,entries);}if(!entries.has(key))entries.set(key,{present:Object.hasOwn(node.base,key),value:node.base[key]});}
 /** Return one stable proxy per record so repeated references see the same pending writes. */
 function wrap(value:object,parent?:DraftNode,key?:PropertyKey):PlainObject {
  if(shared.has(value))return value as PlainObject;
  let node=proxies.get(value)??nodes.get(value);
  if(node){if(parent&&key!==undefined){let keys=node.parents.get(parent);if(!keys){keys=new Set();node.parents.set(parent,keys);}keys.add(key);if(node.copy){parent.written.add(key);change(parent);}}return node.proxy;}
  node={base:value as PlainObject,copy:null,proxy:{} as PlainObject,parents:new Map(parent&&key!==undefined?[[parent,new Set([key])]]:[]),written:new Set(),owned:assigned.has(value)||!!parent?.owned,mutable:privateMaps.has(value)};
  const current=node;
  const {proxy,revoke}=Proxy.revocable(Array.isArray(value)?[]:{},{
   get:(_target,key)=>{const child=(current.copy??current.base)[key];return child&&typeof child==='object'?wrap(child,current,key):child;},
   set:(_target,key,child)=>{const source=current.copy??current.base;if(Object.is(source[key],child)&&Object.hasOwn(source,key))return true;remember(current,key);current.written.add(key);change(current);if(child&&typeof child==='object'&&!nodes.has(child)&&!proxies.has(child))assigned.add(child);current.copy![key]=child;return true;},
   deleteProperty:(_target,key)=>{if(Object.hasOwn(current.copy??current.base,key)){remember(current,key);current.written.add(key);change(current);delete current.copy![key];}return true;},
   has:(_target,key)=>key in (current.copy??current.base),
   ownKeys:()=>Reflect.ownKeys(current.copy??current.base),
   getOwnPropertyDescriptor:(_target,key)=>{const descriptor=Object.getOwnPropertyDescriptor(current.copy??current.base,key);return descriptor?{...descriptor,configurable:key!=='length'||!Array.isArray(current.base)}:undefined;},
  });
  readers.set(proxy,()=>readCurrent(proxy,new WeakMap()) as object);
  current.proxy=proxy as PlainObject;nodes.set(value,current);proxies.set(proxy,current);originals.set(proxy,value);revocations.push(revoke);
  if(Array.isArray(value))arrays.set(proxy,()=>(current.copy??current.base) as unknown as readonly unknown[]);
  return current.proxy;
 }
 /** Materialize only dirty paths for bulk read-only scans, without publishing or tracking thousands of unchanged descendants. */
 function readCurrent(value:unknown,seen:WeakMap<object,unknown>):unknown {
  if(!value||typeof value!=='object')return value;
  if(seen.has(value))return seen.get(value);
  const node=proxies.get(value)??nodes.get(value);
  if(node&&!node.copy&&!node.owned)return node.base;
  const source=node?.copy??node?.base??value as PlainObject;let result=source;seen.set(value,result);
  for(const key of node&&!node.owned?node.written:Object.keys(source)){
   if(!Object.hasOwn(source,key))continue;const child=source[key];
   if(node&&!node.mutable&&!node.owned&&child===node.base[key]&&(!child||typeof child!=='object'||!nodes.get(child)?.copy))continue;
   const next=readCurrent(child,seen);
   if(next!==child){if(result===source){result=(Array.isArray(source)?source.slice():{...source}) as PlainObject;seen.set(value,result);}result[key]=next;}
  }
  return result;
 }
 const value=wrap(base) as T;
 /** Resolve changed nodes and newly assigned containers without walking untouched state subtrees. */
 function finalize(value:unknown,resolved:WeakMap<object,unknown>):unknown {
  if(!value||typeof value!=='object')return value;
  if(resolved.has(value))return resolved.get(value);
  const node=proxies.get(value)??nodes.get(value);
  if(node&&!node.copy&&!node.owned)return node.base;
  const source=node?.copy??node?.base??value as PlainObject;
  let result=source;
  resolved.set(value,result);
  for(const key of node&&!node.owned?node.written:Object.keys(source)){
   if(!Object.hasOwn(source,key))continue;
   const child=source[key];
   // Shallow copies still point at untouched records that were never read through a proxy.
   // Their identity proves that this transaction cannot have modified their descendants.
   if(node&&!node.mutable&&!node.owned&&child===node.base[key]&&(!child||typeof child!=='object'||!nodes.get(child)?.copy))continue;
   const next=finalize(child,resolved);
   if(next!==child){if(result===source&&!node?.copy){result=(Array.isArray(source)?source.slice():{...source}) as PlainObject;resolved.set(value,result);}if(node)remember(node,key);result[key]=next;}
  }
  return result;
 }
 /** Publish plain records once and invalidate every private proxy retained by transient indices. */
 function finish():T {try{return finalize(value,new WeakMap()) as T;}catch(error){abort();throw error;}finally{for(const revoke of revocations)revoke();}}
 /** Restore only this unfinished boundary's private-map edits, retaining earlier completed boundaries. */
 function abort():void {for(const [node,entries] of undo)for(const [key,entry] of entries){if(entry.present)node.base[key]=entry.value;else delete node.base[key];}for(const revoke of revocations)revoke();}
 return {value,finish,abort};
}
