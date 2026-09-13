import type { GameSession } from '../app/game/session';
import type { Renderer } from '../rendering/canvas/renderer';
import { createOccupantInspector } from './occupant-inspector';
import { element,timeOfDay } from './elements';
/** Explain current queues and measured report scopes using one reusable person selector and inspector. */
export function createTrafficPanel(session:GameSession,renderer:Renderer,redraw:()=>void) {
 const node=element('details'),scope=element('select'),summary=element('p'),queues=element('p'),causes=element('p'),people=element('select'),person=createOccupantInspector(),overlay=element('input');
 node.append(element('summary','Traffic reports'));scope.setAttribute('aria-label','Traffic report period');people.setAttribute('aria-label','Inspect traffic person');overlay.type='checkbox';
 for(const [value,label] of [['live','Live · last 60 minutes + unfinished'],['morning','Latest morning cohort'],['previousMorning','Previous morning cohort'],['previousDay','Previous completed day']]){const option=element('option',label);option.value=value!;scope.append(option);}
 const overlayLabel=element('label');overlayLabel.append(overlay,element('span','Show waiting-time overlay'));node.append(scope,summary,queues,causes,overlayLabel,people,person.node);
 let lastTick=-1,lastTopology=-1,lastPeople='',lastUpdate=-Infinity;
 scope.addEventListener('change',()=>{lastTick=-1;redraw();});people.addEventListener('change',()=>{lastTick=-1;redraw();});overlay.addEventListener('change',()=>{renderer.trafficOverlay=overlay.checked;redraw();});node.addEventListener('toggle',()=>{lastTick=-1;redraw();});
 /** Refresh bounded text only when visible; preserve selected identity through sleeping and exit transitions. */
 function draw():void {
  if(!node.open)return;const h=session.hud(),topology=session.topologyRevision(),now=performance.now();if(lastTick===h.tick&&lastTopology===topology||now-lastUpdate<100&&lastTick!==-1)return;lastTick=h.tick;lastTopology=topology;lastUpdate=now;
  const q=session.transport(),selected=scope.value as 'live'|'morning'|'previousMorning'|'previousDay',r=q[selected];
  const period=r&&'day' in r?`Day ${r.day+1}`:r&&'startTick' in r?`${timeOfDay(r.startTick%86400)}–${timeOfDay(r.endTick%86400)} + all unfinished`:'';
  summary.textContent=r?`${period}. ${r.samples===0?'No trips yet':`Quality ${r.quality===null?'not yet measured':r.quality.toFixed(2)+' / 100'}. Samples ${r.samples}; completed ${r.completed}, abandoned ${r.abandoned}, unresolved ${r.unresolved}, stranded ${r.stranded}. Mean waiting ${r.meanWaitingTicks?.toFixed(1)??'—'}s. Walking ${r.totals.walking}s, stairs ${r.totals.stair}s, waiting ${r.totals.waiting}s, riding ${r.totals.riding}s, stranded ${r.totals.stranded}s. Denials ${r.denials}; transfers ${r.transfers}.`}${'peakQueue' in r?` Peak unique queued ${r.peakQueue}; failed ${r.failed}; ${r.completeBeforeDeadline?'all arrived before departure':'cohort not fully successful'}.`:''}`:'No completed report for this period yet.';
  queues.textContent=`Waiting now: ${q.waiting}. ${q.hotspot?`Longest wait: floor ${q.hotspot.floor} ${q.hotspot.direction}, ${q.hotspot.oldestWaitTicks}s; ${q.hotspot.count} people. Capacity delays do not mean missing access.`:'No active queues.'} ${q.stops.map(stop=>`Floor ${stop.floor} ${stop.direction}: ${stop.count}`).join(' · ')}`;
  const c=q.coefficients!;causes.textContent=`Quality model v${c.version}: each minute waiting or stranded costs ${c.waitingBasisPointsPerMinute/100} / ${c.strandedBasisPointsPerMinute/100} points; riding ${c.ridingBasisPointsPerMinute/100}; walking/stairs ${c.walkingBasisPointsPerMinute/100}. Each denial costs ${c.denialBasisPoints/100}, each additional elevator transfer ${c.transferBasisPoints/100}. Unfinished and abandoned trips remain included. Missing routes appear as stranded people.`;
  const ids=q.people.map(p=>p.id).join(':');if(ids!==lastPeople){const selectedId=people.value;people.replaceChildren(element('option','Choose a person'));people.options[0]!.value='';for(const p of q.people){const option=element('option');option.value=p.id;people.append(option);}people.value=selectedId;lastPeople=ids;}
  for(const [i,p] of q.people.entries())people.options[i+1]!.textContent=`${p.id} · ${p.kind} · ${p.state}`;
  person.update(people.value?session.inspectOccupant(people.value):null);
 }
 /** Clear report caches after replacing a session while keeping controls usable. */
 function reset():void {lastTick=-1;lastPeople='';people.value='';}
 return {node,draw,reset};
}
