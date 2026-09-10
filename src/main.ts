import { GameSession } from './app/game/session';
import { MVP_DEFAULT } from './content/scenarios/mvp-default';
import type { ClockPort, FramePort } from './app/ports/clock';
import { browserClock, FrameDriver } from './platform/frame-driver';
import { newSeed } from './platform/seed';
import { createGameView } from './ui/game-view';
import type { GameView } from './ui/game-view';
import './styles.css';
export interface MountOptions {scenario?:unknown;seed?:string;state?:unknown;clock?:ClockPort;driver?:FramePort;view?:(root:HTMLElement,session:GameSession)=>GameView}
const mounted=new WeakSet<HTMLElement>();
/** Shared composition entry: validate before mounting, own one session/runner, and dispose idempotently. */
export function mountGame(root:HTMLElement,options:MountOptions={}):()=>void {
  if(mounted.has(root))throw Error('This root already owns a game');
  const clock=options.clock??browserClock();const session=new GameSession('state' in options?{state:options.state}:{scenario:options.scenario??MVP_DEFAULT,seed:options.seed??newSeed()},clock,options.driver??new FrameDriver(clock));
  mounted.add(root);let view:GameView;
  try{view=(options.view??createGameView)(root,session);session.start(view.draw);}catch(error){session.dispose();mounted.delete(root);throw error;}
  let disposed=false;
  return ()=>{if(disposed)return;disposed=true;session.dispose();view.dispose();mounted.delete(root);};
}
