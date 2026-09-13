import {expect,it} from 'vitest';
import {congestion,observeRush} from '../fixtures/congestion';
import {command,until} from '../fixtures/one-worker';
import {elevator} from '../fixtures/transport';
import {captureState} from '../../src/simulation';
it('an unserved shaft creates no assignment or quality bonus; useful mid-rush capacity carries real demand',()=>{const a=congestion(),b=captureState(a);expect(command(b,{kind:'constructFloorRange',payload:{floor:1,startX:60,endXExclusive:64}}).ok).toBe(true);expect(command(b,{kind:'buildElevatorShaft',payload:{definitionId:'elevator.standard',x:60,minFloor:0,maxFloor:1,servedMinFloor:0,servedMaxFloor:1}}).ok).toBe(true);const baseline=observeRush(a),useless=observeRush(b);expect(useless.report).toEqual(baseline.report);expect(useless.cars).toHaveLength(1);const mid=congestion();until(mid,29700);const workforce=captureState(mid);elevator(mid,5,14);expect(mid.rng).toEqual(workforce.rng);expect(mid.workforceDays).toEqual(workforce.workforceDays);expect(observeRush(mid).cars).toHaveLength(2);},30000);
