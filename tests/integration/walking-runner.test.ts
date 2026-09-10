import {test,expect} from 'vitest';
import {createRunner} from '../../src/simulation/core/clock/advance';
import {oneWorker,until,place} from '../fixtures/one-worker';
import {encodeState} from '../../src/simulation';

test('owned runner, single ticks and batched advancement retain identical schedules, walking, finance and command results',()=>{
 const whole=oneWorker(),stepped=oneWorker(),runner=createRunner(stepped);
 // Validate the application path after both an idle cached interval and a topology edit.
 runner.advance(1);runner.advance(1);until(whole,21602);place(whole,48);place(stepped,48);
 for(let i=0;i<70000;i++)expect(runner.advance(1).ok).toBe(true);
 until(whole,91602);expect(encodeState(stepped)).toBe(encodeState(whole));
});
