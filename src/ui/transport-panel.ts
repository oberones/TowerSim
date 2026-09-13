import type { GameSession } from '../app/game/session';
import { selectTransport } from '../input/transport-selection';
import { bindCanvasClick } from '../input/canvas-click';
import { createObjectPlacement } from './object-placement';
import type { Camera } from '../rendering/camera/camera';
import type { Renderer } from '../rendering/canvas/renderer';
import { StairTool } from '../input/stair-tool';
import { ElevatorTool } from '../input/elevator-tool';
import { createElevatorInspector } from './elevator-inspector';
import { element,button } from './elements';
/** Bind ordinary stair, shaft, service-range and removal controls to domain-validated physical proposals. */
export function createTransportPanel(session:GameSession,canvas:HTMLCanvasElement,camera:Camera,renderer:Renderer,tools:Map<string,HTMLButtonElement>,redraw:()=>void,signal:AbortSignal,onInspect:()=>void=()=>{}){
 const node=element('section','','construction-panel'),stair=new StairTool(session),elevator=new ElevatorTool(session),inspector=createElevatorInspector();let selected:string|null=null,lastInspection=-Infinity,lastRevision=-1,lastSelection='';
 node.append(element('h2','Vertical connections'));
 const lower=element('input'),upper=element('input');lower.type=upper.type='number';lower.step=upper.step='1';lower.value='0';upper.value='3';
 for(const [label,input] of [['Transport lower floor',lower],['Elevator upper floor',upper]] as const){const field=element('label','','form-field');field.append(element('span',label),input);node.append(field);}
 const quote=element('p','Choose Stairs or Elevator, click the tower, reposition the preview, then confirm on the object.'),info=element('p','Click a connection to inspect it.');quote.setAttribute('aria-live','polite');
 const select=element('select');select.setAttribute('aria-label','Selected connection');const selectionField=element('label','','form-field');selectionField.append(element('span','Selected connection'),select);select.addEventListener('change',()=>{selected=select.value||null;redraw();},{signal});
 const remove=button('Remove selected connection',()=>{if(!selected)return;const r=session.dispatch({kind:'demolishEntity',payload:{entityId:selected}});quote.textContent=r.ok?'Connection removed. Access has been updated.':r.message??r.code;if(r.ok)selected=null;redraw();});
 const service=button('Apply selected elevator service range',()=>{if(!selected)return;const r=elevator.setService(selected,lower.valueAsNumber,upper.valueAsNumber);quote.textContent=r.ok?'Elevator service range updated.':r.message??r.code;redraw();});
 node.append(quote,selectionField,info,remove,service,inspector.node);
 const definitions=session.capture().scenario.content!.definitions;
 const stairsPlacement=createObjectPlacement(canvas,camera,renderer,tools,'stairs.basic','Stairs',definitions.find(d=>d.typeId==='stairs.basic')!.footprint.width,stair,redraw,signal,2);
 const elevatorPlacement=createObjectPlacement(canvas,camera,renderer,tools,'elevator.standard','Elevator',definitions.find(d=>d.typeId==='elevator.standard')!.footprint.width,{propose:(floor,x,height)=>elevator.propose(floor,floor+height-1,x),preview:()=>elevator.preview(),commit:()=>elevator.commit(),cancel:()=>elevator.cancel()},redraw,signal,4,true);
 bindCanvasClick(canvas,camera,at=>{if(tools.get('inspect')!.getAttribute('aria-pressed')!=='true')return;const hit=selectTransport(session.world(camera.bounds()),at);if(hit){selected=hit;onInspect();redraw();}},signal);
 /** Draw the complete quoted footprint and refresh small selected-connection details at bounded cadence. */
 function draw():void {stairsPlacement.draw();elevatorPlacement.draw();
 const now=performance.now(),revision=session.topologyRevision();if(revision!==lastRevision){const view=session.world(),choices=[...view.stairs.map(s=>({id:s.id,label:`Stairs ${s.lowerFloor}–${s.lowerFloor+1} (${s.id})`})),...view.elevators.map(s=>({id:s.id,label:`Elevator ${s.minFloor}–${s.maxFloor} (${s.id})`}))];select.replaceChildren();const none=element('option','Choose a connection');none.value='';select.append(none);for(const choice of choices){const option=element('option',choice.label);option.value=choice.id;select.append(option);}}select.value=selected??'';if(now-lastInspection<100&&revision===lastRevision&&lastSelection===(selected??''))return;const selectionChanged=lastSelection!==(selected??'');lastInspection=now;lastRevision=revision;lastSelection=selected??'';
 const car=selected?session.inspectElevator(selected):null,s=car?null:session.world().stairs.find(s=>s.id===selected);if(selectionChanged&&car){lower.value=String(car.servedMinFloor);upper.value=String(car.servedMaxFloor);}remove.disabled=!car&&!s;service.disabled=!car;inspector.update(car);info.textContent=s?`${s.id} · Stairs connect floors ${s.lowerFloor}–${s.lowerFloor+1}. No recurring cost. Removal is free and rejects while occupied.`:car?'Use the lower and upper floor fields to change this elevator’s service range.':'Click a stair connection or shaft to inspect it.';
 }
 /** Clear selected identities and construction intent after replacing the current session. */
 function reset():void {stairsPlacement.reset();elevatorPlacement.reset();selected=null;lastInspection=-Infinity;lastRevision=-1;}
 return {node,draw,reset};
}
