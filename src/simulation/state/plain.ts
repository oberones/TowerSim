import { DomainError } from '../core/values';
/** Reject non-JSON values, prototypes, getters, hidden fields, sparse arrays, cycles and excessive nesting. */
export function assertPlain(value: unknown, ancestors = new Set<object>(), depth=0): void {
  if(depth>100)throw new DomainError('invalidState','Data nesting exceeds 100');
  if(value===null || typeof value==='string' || typeof value==='boolean')return;
  if(typeof value==='number' && Number.isFinite(value))return;
  if(typeof value!=='object' || ancestors.has(value))throw new DomainError('invalidState','Non-JSON value or cycle');
  const array=Array.isArray(value);
  if(Object.getPrototypeOf(value)!==(array ? Array.prototype : Object.prototype))throw new DomainError('invalidState','Non-plain prototype');
  if(Object.getOwnPropertySymbols(value).length)throw new DomainError('invalidState','Symbol keys');
  const descriptors=Object.getOwnPropertyDescriptors(value);
  if(array && (Object.keys(value).length!==value.length || Object.keys(value).some((key,index)=>key!==String(index))))throw new DomainError('invalidState','Sparse or extended array');
  ancestors.add(value);
  for(const [key,descriptor] of Object.entries(descriptors)) {
    if(array && key==='length')continue;
    if(!descriptor.enumerable || !('value' in descriptor) || ['__proto__','constructor','prototype'].includes(key))throw new DomainError('invalidState','Unsupported property');
    assertPlain(descriptor.value,ancestors,depth+1);
  }
  ancestors.delete(value);
}
/** Require precisely the supported own keys of a closed plain-data record. */
export function record(value: unknown, keys: readonly string[]): Record<string,unknown> {
  if(!value || typeof value!=='object' || Array.isArray(value))throw new DomainError('invalidState','Expected record');
  const names=Object.keys(value);
  if(names.length!==keys.length || names.some(key=>!keys.includes(key)))throw new DomainError('invalidState','Unknown or missing field');
  return value as Record<string,unknown>;
}
/** Validate and deeply detach JSON-compatible state without sharing mutable references. */
export function clonePlain<T>(value:T):T {assertPlain(value);return JSON.parse(JSON.stringify(value)) as T;}
/** Recursively freeze validated configuration or presentation data against external mutation. */
export function freezeDeep<T>(value:T):T {
  if(value && typeof value==='object') {for(const child of Object.values(value))freezeDeep(child);Object.freeze(value);}return value;
}
