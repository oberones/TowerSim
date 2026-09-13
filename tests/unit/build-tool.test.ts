import { expect, test } from 'vitest';
import { BuildTool } from '../../src/input/build-tool';
import { pointerProposal } from '../../src/input/pointer';
import { Camera } from '../../src/rendering/camera/camera';
import { GameSession } from '../../src/app/game/session';
import { FrameDriver } from '../../src/platform/frame-driver';
import { FakeClock } from '../fixtures/clock';
import { MVP_DEFAULT } from '../../src/content/scenarios/mvp-default';
import { SEEDS } from '../fixtures/seeds';

/** Build a test application whose edits still pass through production ingress. */
function setup(){const clock=new FakeClock();const session=new GameSession({scenario:MVP_DEFAULT,seed:SEEDS[0]},clock,new FrameDriver(clock));return {session,tool:new BuildTool(session)};}
test('logical drag span survives pan/zoom/resize and Escape cancellation consumes nothing',()=>{
  const {session,tool}=setup();const camera=new Camera(900,600,2);const start={x:4.2,y:1.2},end={x:12.3,y:1.4};
  const proposal=pointerProposal(start,end);expect(proposal).toEqual({floor:1,startX:4,endXExclusive:13});
  tool.choose('constructFloorRange');tool.propose(proposal);const before=tool.current();const state=session.capture();
  camera.panBy(20,60);camera.zoomAt(2,{x:300,y:100});camera.resize(700,500,1);expect(tool.current()).toEqual(before);
  tool.cancel();expect(tool.current().kind).toBe('inactive');expect(session.capture()).toEqual(state);
});
test('commit revalidates stale quotes through current ingress, never charging invalid overlap',()=>{
  const {session,tool}=setup();tool.choose('constructFloorRange');tool.propose({floor:1,startX:0,endXExclusive:10});expect(tool.current()).toMatchObject({kind:'preview',quote:{ok:true}});
  session.dispatch({kind:'constructFloorRange',payload:{floor:1,startX:0,endXExclusive:5}});const cash=session.hud().cashMinor;
  expect(tool.commit()).toMatchObject({ok:false,code:'overlap'});expect(session.hud().cashMinor).toBe(cash);expect(tool.current()).toMatchObject({kind:'preview',quote:{ok:false,code:'overlap'}});
});
