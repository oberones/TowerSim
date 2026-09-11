import { test,expect } from 'vitest';
import { nineAtBoarding } from '../fixtures/nine-passengers';
import { GameSession } from '../../src/app/game/session';
import { createRunner } from '../../src/simulation/core/clock/advance';
import { encodeState,decodeState } from '../../src/simulation';
import { command } from '../fixtures/one-worker';
const edit={kind:'constructFloorRange',payload:{floor:1,startX:48,endXExclusive:50}} as const;
test('30/60/120 callbacks, all speeds and inserted pauses retain identical full-day traffic and timed edits',()=>{
 const start=nineAtBoarding(),editTick=start.clock.tick+120,end=86400,expected=decodeState(encodeState(start)),runner=createRunner(expected);runner.advance(120);command(expected,edit);runner.advance(end-expected.clock.tick);const digest=encodeState(expected);
 for(const fps of [30,60,120])for(const speed of [1,4,8] as const){let now=0;const session=new GameSession({state:start},{now:()=>now,requestFrame:()=>0,cancelFrame:()=>{}},{start:()=>()=>{}});session.setSpeed(speed);session.frame(now);
  for(const target of [editTick,end]){while(session.hud().tick<target){const step=Math.min(1/fps,(target-session.hud().tick)/(120*speed));now+=step*1000;session.frame(now);if(session.error)throw Error(session.error);}
   session.setSpeed(0);const paused=encodeState(session.capture());now+=1000;session.frame(now);expect(encodeState(session.capture())).toBe(paused);
   if(target===editTick)expect(session.dispatch(edit).ok).toBe(true);session.setSpeed(speed);
  }expect(encodeState(session.capture())).toBe(digest);session.dispose();
 }
},30000);
