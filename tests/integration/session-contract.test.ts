import { expect, test } from 'vitest';
import { GameSession } from '../../src/app/game/session';
import { FrameDriver } from '../../src/platform/frame-driver';
import { MVP_DEFAULT } from '../../src/content/scenarios/mvp-default';
import { FakeClock } from '../fixtures/clock';
import { SEEDS } from '../fixtures/seeds';
import { mountGame } from '../../src/main';

/** Compose one session with a fully injected scheduling port. */
function setup() { const clock=new FakeClock(); return {clock, session:new GameSession({scenario:MVP_DEFAULT,seed:SEEDS[0]},clock,new FrameDriver(clock))}; }
test('session starts paused, exposes immutable projections and orders rejected ingress without aging time', () => {
  const {session}=setup(); const before=session.capture();
  expect(session.hud().speed).toBe(0); const view=session.world();
  expect(()=>{(view.floors as any).push({});}).toThrow();
  expect(session.dispatch({kind:'placeFacility',payload:{definitionId:'office.small',floor:0,x:24}}).ok).toBe(false);
  expect(session.capture()).toEqual({...before,lastCommandSequence:1});
  expect(session.hud().unsaved).toBe(true);
});
test('one runner, explicit resume, cancel/discard and replacement-only debt reset', () => {
  const {clock,session}=setup(); session.start(()=>{}); session.start(()=>{}); expect(clock.pending.size).toBe(1);
  session.setSpeed(8); clock.fire(1000); expect(session.hud().tick).toBeGreaterThan(21600);
  session.visibility(false); const before=session.capture(); const debt=session.pacingStatus().debt;
  clock.fire(100000); session.visibility(true); expect(session.capture()).toEqual(before);
  expect(session.replace({scenario:MVP_DEFAULT,seed:SEEDS[1]},false)).toBe(false);
  expect(session.capture()).toEqual(before); expect(session.pacingStatus().debt).toBe(debt);
  expect(session.replace({scenario:MVP_DEFAULT,seed:SEEDS[1]},true)).toBe(true);
  expect(session.hud()).toMatchObject({tick:21600,speed:0,seed:SEEDS[1],unsaved:true});
  expect(session.pacingStatus().debt).toBe(0); expect(clock.pending.size).toBe(1);
  session.dispose(); expect(clock.pending.size).toBe(0);
});
test('invalid prepared states reject before replacement and mounting starts only once per root', () => {
  const {clock,session}=setup(); const before=session.capture();
  expect(()=>session.replace({state:{...before,clock:{tick:-1}}},true)).toThrow();
  expect(session.capture()).toEqual(before);
  const root={} as HTMLElement; let mounted=0; let removed=0;
  const options={scenario:MVP_DEFAULT,seed:SEEDS[0],clock,driver:new FrameDriver(clock),
    view:()=>{mounted++;return {draw:()=>{},dispose:()=>{removed++;}};}};
  expect(()=>mountGame(root,{...options,state:{bad:true}})).toThrow(); expect(mounted).toBe(0);
  const stop=mountGame(root,options); expect(()=>mountGame(root,options)).toThrow();
  expect(mounted).toBe(1); expect(clock.pending.size).toBe(1); stop(); stop(); expect(removed).toBe(1);
  expect(clock.pending.size).toBe(0);
});
test('a queued RAF timestamp predating a control event cannot stop the runner',()=>{
  const {clock,session}=setup();session.start(()=>{});clock.time=50;session.setSpeed(1);
  const callback=clock.callback!;clock.time=100;callback(40);
  expect(session.hud().tick).toBe(21606);expect(clock.pending.size).toBeGreaterThan(0);session.dispose();
});
test('bounded frame batches retain foreground debt until every owed tick is processed',()=>{
  const {clock,session}=setup();session.start(()=>{});session.setSpeed(8);clock.fire(1000);
  expect(session.hud().tick).toBe(21840);expect(session.pacingStatus().debt).toBe(720);
  for(let batch=0;batch<3;batch++)clock.fire(1000);
  expect(session.hud().tick).toBe(22560);expect(session.pacingStatus().debt).toBe(0);session.dispose();
});
