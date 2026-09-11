import {test} from 'vitest';
import {createHash} from 'node:crypto';
import {runBenchmark} from './harness';
import {congestion} from '../fixtures/congestion';
import {until} from '../fixtures/one-worker';
import {elevator} from '../fixtures/transport';
import {encodeState,decodeState} from '../../src/simulation';
/** Hash authoritative edit results independently of disposable graph and queue indices. */
function digest(s:ReturnType<typeof congestion>){return createHash('sha256').update(encodeState(s)).digest('hex');}
test('mid-rush construction, topology rebuild and waiter reconciliation',()=>{const s=congestion();until(s,29700);const encoded=encodeState(s);runBenchmark({name:'transport-edits',seed:s.rng.seed,contentId:s.contentVersion,rulesId:s.rulesetId,fixtureHash:digest(s),ticks:0,restore:()=>decodeState(encoded),run:s=>{elevator(s,5,14);},digest,counters:s=>({people:Object.keys(s.occupants).length,waiting:Object.values(s.queues).reduce((n,q)=>n+q.entries.length,0),walking:Object.values(s.occupants).filter(p=>p.state==='walking').length})});});
