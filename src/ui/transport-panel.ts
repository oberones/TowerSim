import type { GameSession } from '../app/game/session';
import { selectTransport } from '../input/transport-selection';
import type { Point } from '../rendering/camera/camera';
import type { Camera } from '../rendering/camera/camera';
import type { Renderer } from '../rendering/canvas/renderer';
import { StairTool } from '../input/stair-tool';
import { ElevatorTool } from '../input/elevator-tool';
import { createElevatorInspector } from './elevator-inspector';
import { element,button,money } from './elements';
/** Bind ordinary stair, shaft, service-range and removal controls to domain-validated physical proposals. */
export function createTransportPanel(session:GameSession,canvas:HTMLCanvasElement,camera:Camera,renderer:Renderer,tools:Map<string,HTMLButtonElement>,redraw:()=>void,signal:AbortSignal){
 const node=element('section','','construction-panel'),stair=new StairTool(session),elevator=new ElevatorTool(session),inspector=createElevatorInspector();let mode:'stairs.basic'|'elevator.standard'|null=null,selected:string|null=null,lastInspection=-Infinity,lastRevision=-1,lastSelection='';
 node.append(element('h2','Vertical connections'));
 let pointer:{at:Point;client:Point}|null=null;
 const lower=element('input'),upper=element('input'),x=element('input');lower.type=upper.type=x.type='number';lower.step=upper.step=x.step='1';lower.value='0';upper.value='3';x.value='10';
 for(const [label,input] of [['Transport lower floor',lower],['Elevator upper floor',upper],['Transport start cell',x]] as const){const field=element('label','','form-field');field.append(element('span',label),input);node.append(field);input.addEventListener('input',()=>{propose();redraw();},{signal});}
 const quote=element('p','Choose Stairs for adjacent floors or Elevator for a contiguous range.'),info=element('p','Click a connection to inspect it.');quote.setAttribute('aria-live','polite');
 const select=element('select');select.setAttribute('aria-label','Selected connection');const selectionField=element('label','','form-field');selectionField.append(element('span','Selected connection'),select);select.addEventListener('change',()=>{selected=select.value||null;redraw();},{signal});
 const commit=button('Build connection',()=>{const r=mode==='stairs.basic'?stair.commit():elevator.commit();quote.textContent=r.ok?'Connection built. Facility access has been updated.':r.message??r.code;resetProposal();redraw();});
 const remove=button('Remove selected connection',()=>{if(!selected)return;const r=session.dispatch({kind:'demolishEntity',payload:{entityId:selected}});quote.textContent=r.ok?'Connection removed. Access has been updated.':r.message??r.code;if(r.ok)selected=null;redraw();});
 const service=button('Apply selected elevator service range',()=>{if(!selected)return;const r=elevator.setService(selected,lower.valueAsNumber,upper.valueAsNumber);quote.textContent=r.ok?'Elevator service range updated.':r.message??r.code;redraw();});
 node.append(quote,commit,selectionField,info,remove,service,inspector.node);
 /** Rebuild only the selected transport proposal from logical numeric controls. */
 function propose():void {if(mode==='stairs.basic')stair.propose(lower.valueAsNumber,x.valueAsNumber);else if(mode==='elevator.standard')elevator.propose(lower.valueAsNumber,upper.valueAsNumber,x.valueAsNumber);}
 /** Leave construction mode without changing authoritative tower geometry or simulation time. */
 function resetProposal():void {mode=null;stair.cancel();elevator.cancel();for(const id of ['stairs.basic','elevator.standard'])tools.get(id)!.setAttribute('aria-pressed','false');tools.get('inspect')!.setAttribute('aria-pressed','true');}
 for(const id of ['stairs.basic','elevator.standard'] as const){const b=tools.get(id)!;b.disabled=false;b.title=id==='stairs.basic'?'Connect two adjacent constructed landings':'Build one eight-person elevator serving contiguous floors';b.addEventListener('click',()=>{tools.get('inspect')!.click();mode=id;tools.get('inspect')!.setAttribute('aria-pressed','false');b.setAttribute('aria-pressed','true');if(id==='elevator.standard'&&x.value==='10')x.value='18';propose();redraw();},{signal});}
 for(const id of ['floor','demolish','inspect','office.small','restaurant.small'])tools.get(id)!.addEventListener('click',()=>{mode=null;stair.cancel();elevator.cancel();for(const id of ['stairs.basic','elevator.standard'])tools.get(id)!.setAttribute('aria-pressed','false');},{signal});
 canvas.addEventListener('pointerdown',e=>{if(e.shiftKey||e.button>0){pointer=null;return;}const r=canvas.getBoundingClientRect();pointer={at:camera.screenToWorld({x:e.clientX-r.left,y:e.clientY-r.top}),client:{x:e.clientX,y:e.clientY}};},{signal});
 canvas.addEventListener('click',e=>{const down=pointer;pointer=null;if(!down||Math.hypot(e.clientX-down.client.x,e.clientY-down.client.y)>=4)return;const at=down.at;if(mode){lower.value=String(Math.floor(at.y));x.value=String(Math.floor(at.x));propose();}else if(tools.get('inspect')!.getAttribute('aria-pressed')==='true')selected=selectTransport(session.world(camera.bounds()),at)??selected;redraw();},{signal});
 canvas.addEventListener('pointercancel',()=>{pointer=null;},{signal});
 canvas.ownerDocument.addEventListener('keydown',e=>{if(e.key==='Escape'){resetProposal();redraw();}},{signal});
 /** Draw the complete quoted footprint and refresh small selected-connection details at bounded cadence. */
 function draw():void {const q=mode==='stairs.basic'?stair.preview():elevator.preview();commit.disabled=!q?.ok;if(mode&&q){quote.textContent=`${q.ok?'Valid connection':q.message??q.code} · Build ${money(q.quote?.constructionCostMinor??0)}`;const f=q.quote?.footprint;if(f){const top=mode==='stairs.basic'?f.floor+2:upper.valueAsNumber+1,a=camera.worldToScreen({x:f.startX,y:f.floor}),b=camera.worldToScreen({x:f.endXExclusive,y:top}),ctx=renderer.overlayContext();ctx.strokeStyle=q.ok?'#80efc0':'#ff997d';ctx.strokeRect(a.x,b.y,b.x-a.x,a.y-b.y);}}
 const now=performance.now(),revision=session.topologyRevision();if(revision!==lastRevision){const view=session.world(),choices=[...view.stairs.map(s=>({id:s.id,label:`Stairs ${s.lowerFloor}–${s.lowerFloor+1} (${s.id})`})),...view.elevators.map(s=>({id:s.id,label:`Elevator ${s.minFloor}–${s.maxFloor} (${s.id})`}))];select.replaceChildren();const none=element('option','Choose a connection');none.value='';select.append(none);for(const choice of choices){const option=element('option',choice.label);option.value=choice.id;select.append(option);}}select.value=selected??'';if(now-lastInspection<100&&revision===lastRevision&&lastSelection===(selected??''))return;lastInspection=now;lastRevision=revision;lastSelection=selected??'';
 const car=selected?session.inspectElevator(selected):null,s=car?null:session.world().stairs.find(s=>s.id===selected);remove.disabled=!car&&!s;service.disabled=!car;inspector.update(car);info.textContent=s?`${s.id} · Stairs connect floors ${s.lowerFloor}–${s.lowerFloor+1}. No recurring cost. Removal is free and rejects while occupied.`:car?'Use the lower and upper floor fields to change this elevator’s service range.':'Click a stair connection or shaft to inspect it.';
 }
 /** Clear selected identities and construction intent after replacing the current session. */
 function reset():void {resetProposal();selected=null;lastInspection=-Infinity;lastRevision=-1;}
 return {node,draw,reset};
}
