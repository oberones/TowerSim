import {expect,test} from 'vitest';
import {createHash} from 'node:crypto';
import {referenceTower} from '../fixtures/reference-tower';
import {command} from '../fixtures/one-worker';
import {createRunner} from '../../src/simulation/core/clock/advance';
import {decodeState,encodeState} from '../../src/simulation';
import type {GameState} from '../../src/simulation';
/** Compare the entire authoritative state against the fresh pre-remediation PR-head benchmark captures. */
function hash(state:GameState):string {return createHash('sha256').update(encodeState(state)).digest('hex');}
test('PR #1 reference rush and active edit retain the pre-remediation authoritative digests',()=>{
 const state=referenceTower(),copy=decodeState(encodeState(state));
 expect(hash(state)).toBe('7d62ed408bac8e9ff6a758f0d28d986960f688ac30492845d47120da04b71e7a');
 expect(createRunner(state).advance(30).ok).toBe(true);expect(hash(state)).toBe('e51fc1bbdca59a7406c4a60501363a257cc89572c09aefa67f802de6811f53c4');
 expect(command(copy,{kind:'buildElevatorShaft',payload:{definitionId:'elevator.standard',x:22,minFloor:0,maxFloor:12,servedMinFloor:0,servedMaxFloor:12}}).ok).toBe(true);
 expect(hash(copy)).toBe('d83ebf7ac4560e40789f3fb61ab0c5840f23c9f9439bc51bd4c7a4b7acae7aa8');
},600000);
