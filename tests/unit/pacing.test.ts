import { expect, test } from 'vitest';
import { Pacing } from '../../src/app/game/pacing';
import { FrameDriver } from '../../src/platform/frame-driver';
import { FakeClock } from '../fixtures/clock';

for (const [speed, rate] of [[1,120],[4,480],[8,960]] as const) test(`speed ${speed} owes exactly ${rate} ticks per second`, () => {
  const p = new Pacing(); p.setSpeed(speed, 0); p.accumulate(1000);
  let total=0; while(p.wholeTicks > 0) total += p.take(31);
  expect(total).toBe(rate); expect(p.debt).toBe(0);
});
test('fractional debt, bounded batches, speed changes and pause preserve foreground time', () => {
  const p = new Pacing(); p.setSpeed(1, 0); p.accumulate(12.5);
  expect(p.take(1)).toBe(1); expect(p.debt).toBeCloseTo(0.5);
  p.setSpeed(4, 25); expect(p.debt).toBeCloseTo(2);
  p.setSpeed(0, 1025); const debt=p.debt;
  p.accumulate(9000); expect(p.take(100)).toBe(0); expect(p.debt).toBe(debt);
  p.setSpeed(1,9000); expect(p.take(10)).toBe(10); expect(p.debt).toBe(debt-10);
});
test('visibility retains earned debt, auto-pauses and requires explicit resume without catch-up', () => {
  const p = new Pacing(); p.setSpeed(8,0); p.setVisible(false,1000);
  expect(p.debt).toBe(960); expect(p.speed).toBe(0);
  p.setVisible(true,100000); p.accumulate(100001); expect(p.take(960)).toBe(0);
  p.setSpeed(1,100001); expect(p.take(960)).toBe(960); expect(p.debt).toBe(0);
});
test('a generation-owned driver ignores stale callbacks and starts only one loop', () => {
  const clock=new FakeClock(); const driver=new FrameDriver(clock); let draws=0;
  const stop=driver.start(()=>draws++); const stale=clock.callback!;
  expect(()=>driver.start(()=>draws++)).toThrow(); clock.fire(1); expect(draws).toBe(1);
  stop(); driver.start(()=>draws++); stale(2); expect(draws).toBe(1);
  clock.fire(3); expect(draws).toBe(2); expect(clock.pending.size).toBe(1);
});

test('session yields between individual completed ticks when its frame work budget is exhausted',async()=>{
 const {GameSession}=await import('../../src/app/game/session');
 const {MVP_DEFAULT}=await import('../../src/content/scenarios/mvp-default');
 let now=0;const clock={now:()=>++now,requestFrame:()=>1,cancelFrame:()=>{}};
 const session=new GameSession({scenario:MVP_DEFAULT,seed:'00000001000000020000000300000004'},clock,{start:()=>()=>{}});
 session.setSpeed(8);session.frame(1001);
 expect(session.hud().tick-MVP_DEFAULT.initialTick).toBeLessThanOrEqual(4);
 expect(session.hud().tick).toBeGreaterThan(MVP_DEFAULT.initialTick);
 expect(session.pacingStatus().debt).toBeGreaterThan(900);session.dispose();
});
