import type { FloorInspection } from '../app/game/queries';
import type { GameSession } from '../app/game/session';
import type { Camera, Point } from '../rendering/camera/camera';
import type { Renderer } from '../rendering/canvas/renderer';
import type { FloorKind, FloorPayload } from '../simulation/commands/types';
import { BuildTool } from '../input/build-tool';
import { pointerWorld, pointerProposal } from '../input/pointer';
import { drawPreview } from '../rendering/layers/preview';
import { createFloorInspector } from './floor-inspector';
import { element, button, money } from './elements';
/** Bind floor tools and inspection to ordinary numeric/pointer controls through application ingress. */
export function createConstructionPanel(root:HTMLElement,session:GameSession,canvas:HTMLCanvasElement,camera:Camera,renderer:Renderer,tools:Map<string,HTMLButtonElement>,status:HTMLElement,redraw:()=>void,signal:AbortSignal,onInspect:()=>void=()=>{}){
  const tool=new BuildTool(session);const node=element('section','','construction-panel');const inspector=createFloorInspector();let selected:number|null=null;let mode:FloorKind|null=null;let signature='';let inspection:FloorInspection|null=null;
  let drag:{start:Point;last:Point;world:Point;pan:boolean;id:number}|null=null;
  const inputs=new Map<string,HTMLInputElement>();
  for(const [name,label,value] of [['floor','Floor level','1'],['startX','Start cell','0'],['endXExclusive','End cell (exclusive)','24']]){
    const field=element('label','','form-field');field.append(element('span',label));const input=element('input');input.type='number';input.step='1';input.value=value!;input.name=name!;inputs.set(name!,input);field.append(input);node.append(field);input.addEventListener('input',()=>{if(mode)propose(read());},{signal});
  }
  const quote=element('p','Choose Floor or Demolish to preview a span.','muted');quote.setAttribute('aria-live','polite');
  const commit=button('Commit span',()=>{const result=tool.commit();status.textContent=result.ok?`Floor ${read().floor} updated. Charged ${money(result.quote?.constructionCostMinor??0)}.`:result.message??result.code;if(result.ok){selected=read().floor;if(mode)tool.choose(mode);}renderQuote();redraw();});commit.disabled=true;
  node.append(quote,commit,button('Cancel tool (Esc)',cancel),inspector.node);
  /** Read numeric form values; validation below rejects empty or fractional coordinates. */
  function read():FloorPayload {return {floor:inputs.get('floor')!.valueAsNumber,startX:inputs.get('startX')!.valueAsNumber,endXExclusive:inputs.get('endXExclusive')!.valueAsNumber};}
  /** Keep form labels synchronized with an actual logical pointer proposal. */
  function write(p:FloorPayload):void {for(const [key,value] of Object.entries(p))inputs.get(key)!.value=String(value);}
  /** Requote complete numeric inputs, clearing any obsolete preview when a field is incomplete. */
  function propose(p:FloorPayload):void {if(!mode)return;if(!Object.values(p).every(Number.isSafeInteger)){tool.choose(mode);quote.textContent='Enter whole numbers in every coordinate field.';commit.disabled=true;redraw();return;}tool.propose(p);renderQuote();redraw();}
  /** Display valid/invalid status, full charge and separate settlement before commitment. */
  function renderQuote():void {
    const current=tool.current();if(current.kind!=='preview'){quote.textContent=mode?'Set coordinates or drag a span, then commit.':'Choose Floor or Demolish to preview a span.';commit.disabled=true;return;}
    const q=current.quote;commit.disabled=!q.ok;const price=q.quote;
    quote.textContent=`Floor ${current.proposal.floor} · [${current.proposal.startX}, ${current.proposal.endXExclusive}) · ${q.ok?'Valid':`Invalid: ${q.message??q.code}`}${price?` · Build ${money(price.constructionCostMinor)} · Demolition ${money(price.demolitionCostMinor)} · Accrued settlement ${money(price.accruedSettlementMinor)}`:''}`;
  }
  /** Select one named mode without allowing UI handlers to edit the domain directly. */
  function choose(next:FloorKind|null):void {mode=next;tool.cancel();if(next){tool.choose(next);propose(read());}else renderQuote();for(const [id,b] of tools)b.setAttribute('aria-pressed',String(id===(next==='constructFloorRange'?'floor':next==='demolishFloorRange'?'demolish':'inspect')));redraw();}
  /** Cancel a pending drag/proposal without consuming IDs, finance or command metadata. */
  function cancel():void {drag=null;tools.get('inspect')!.click();status.textContent='Construction canceled.';}
  for(const [id,next] of [['floor','constructFloorRange'],['demolish','demolishFloorRange'],['inspect',null]] as const){const b=tools.get(id)!;b.disabled=false;b.title=id==='inspect'?'Click a built floor; drag to pan vertically':'Drag to choose a horizontal span, or enter coordinates';b.addEventListener('click',()=>choose(next),{signal});}
  canvas.addEventListener('contextmenu',e=>e.preventDefault(),{signal});
  canvas.addEventListener('pointerdown',e=>{canvas.focus();const client={x:e.clientX,y:e.clientY};drag={start:client,last:client,world:pointerWorld(camera,client,canvas.getBoundingClientRect()),pan:!mode||e.shiftKey||e.button!==0,id:e.pointerId};canvas.setPointerCapture(e.pointerId);if(!drag.pan){const p=pointerProposal(drag.world,drag.world);write(p);propose(p);}},{signal});
  canvas.addEventListener('pointermove',e=>{if(!drag || drag.id!==e.pointerId)return;const point={x:e.clientX,y:e.clientY};if(drag.pan)camera.panBy(0,point.y-drag.last.y);else{const p=pointerProposal(drag.world,pointerWorld(camera,point,canvas.getBoundingClientRect()));write(p);propose(p);}drag.last=point;redraw();},{signal});
  canvas.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;if(drag.pan&&!mode&&!e.shiftKey&&e.button===0&&tools.get('inspect')!.getAttribute('aria-pressed')==='true'&&Math.hypot(e.clientX-drag.start.x,e.clientY-drag.start.y)<4){selected=Math.floor(drag.world.y);if(session.inspectFloor(selected))onInspect();}drag=null;redraw();},{signal});
  canvas.addEventListener('pointercancel',()=>{drag=null;if(mode)tool.choose(mode);else tool.cancel();renderQuote();redraw();},{signal});
  /** Refresh quotes/inspector only when domain geometry or balance changes, then draw overlays. */
  function draw():void {
    const h=session.hud(),p=session.pacingStatus();const next=`${p.generation}:${session.topologyRevision()}:${h.cashMinor}:${selected}`;
    if(next!==signature){signature=next;tool.revalidate();renderQuote();inspection=selected===null?null:session.inspectFloor(selected);inspector.update(inspection);}
    drawPreview(renderer.overlayContext(),camera,tool.current(),inspection);
  }
  /** Reset transient tool and selection state when a different tower replaces the current one. */
  function reset():void {selected=null;drag=null;mode=null;tool.cancel();signature='';renderQuote();for(const [id,b] of tools)b.setAttribute('aria-pressed',String(id==='inspect'));}
  reset();return {node,draw,reset,cancel};
}
