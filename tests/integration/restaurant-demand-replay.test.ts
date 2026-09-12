import { expect,test } from 'vitest';
import { restaurantTower } from '../fixtures/restaurant';
import { command,until } from '../fixtures/one-worker';
import { createGame,decodeState,encodeState } from '../../src/simulation';
import { createRunner } from '../../src/simulation/core/clock/advance';
import { GameSession } from '../../src/app/game/session';
import { Xoshiro128 } from '../../src/simulation/core/random/xoshiro128';
test.each(['00000001000000020000000300000004','11111111222222223333333344444444','deadbeef0123456789abcdef13579bdf'])('three-day meal replay across batches and occupied continuation (%s)',seed=>{
 const s=restaurantTower(0,8);s.rng=new Xoshiro128(seed).export();command(s,{kind:'placeFacility',payload:{definitionId:'restaurant.small',floor:0,x:48}});const initial=encodeState(s);until(s,21601);
 const request=s.restaurantDays[0]!.visits[0]!;until(s,request.arrivalTick+900);expect(Object.values(s.occupants).some(p=>p.state==='insideFacility')).toBe(true);const resumed=decodeState(encodeState(s));const batched=decodeState(initial),runner=createRunner(batched),end=3*86400;
 for(const size of [120,480,960]){const copy=decodeState(initial),r=createRunner(copy);while(copy.clock.tick<end)expect(r.advance(Math.min(size,end-copy.clock.tick)).ok).toBe(true);until(resumed,end);expect(encodeState(copy)).toBe(encodeState(resumed));}
 while(batched.clock.tick<end)expect(runner.advance(Math.min(377,end-batched.clock.tick)).ok).toBe(true);until(s,end);expect(encodeState(batched)).toBe(encodeState(s));expect(encodeState(resumed)).toBe(encodeState(s));
});

test.each([1,4,8] as const)('real application pacing at %sx preserves customer demand, payments and pause boundaries',speed=>{const initial=restaurantTower(0,4);let now=0;const session=new GameSession({state:initial},{now:()=>now,requestFrame:()=>0,cancelFrame:()=>{}},{start:()=>()=>{}});session.setSpeed(speed);session.frame(0);let frames=0;while(session.hud().tick<86400){now+=Math.min(100,(86400-session.hud().tick)*1000/(120*speed));session.frame(now);if(session.error)throw Error(session.error);if(++frames%317===0){session.setSpeed(0);const before=encodeState(session.capture());now+=500;session.frame(now);expect(encodeState(session.capture())).toBe(before);session.setSpeed(speed);}}until(initial,86400);expect(encodeState(session.capture())).toBe(encodeState(initial));session.dispose();});
