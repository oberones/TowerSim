import type { GameSession } from '../app/game/session';
import { diagnosticQuery } from '../app/game/diagnostic-queries';
import { PerformanceCounters } from '../platform/performance-counters';
import { element } from './elements';
/** Mount opt-in development diagnostics; the production composition never imports this module. */
export function mountDiagnostics(root:HTMLElement,session:GameSession) {
 const panel=element('details','','diagnostics'),output=element('pre'),rates=new PerformanceCounters();panel.append(element('summary','Development diagnostics'),output);root.append(panel);
 let disposed=false;
 /** Sample delivered frames continuously while open, refreshing the expensive detached query once per second. */
 function draw():void {if(disposed)return;if(panel.open&&!document.hidden){const h=session.hud(),p=session.pacingStatus(),rate=rates.sample(performance.now(),h.tick,h.speed,p.generation);if(rate)output.textContent=JSON.stringify({rate,pacing:p,...diagnosticQuery(session.capture())},null,2);}else rates.reset();}
 return {draw,dispose:()=>{disposed=true;panel.remove();}};
}
