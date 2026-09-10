import type { GameSession } from '../app/game/session';
import { element, money } from './elements';
/** Keep a small stable HUD projection; callers throttle text refresh independently of simulation. */
export function createHud(session:GameSession){
  const node=element('section','','hud');node.setAttribute('aria-label','Tower status');const summary=element('p'),seed=element('p','','seed');node.append(summary,seed);
  /** Refresh scalar cash/time/level/speed text without reconstructing the game state. */
  const update=()=>{const h=session.hud();summary.textContent=`Day ${h.day} · ${h.time} · Level ${h.level} · ${money(h.cashMinor)} · ${h.speed===0?'Paused':`${h.speed}× speed`} · ${h.unsaved?'Unsaved tower':'Saved'}`;seed.textContent=`Seed ${h.seed}`;summary.classList.toggle('warning',h.cashMinor<0);};
  update();return {node,update};
}
