import type { CommandResult } from '../simulation';
import { bindPlacementDrag } from '../input/placement-drag';
import type { Camera } from '../rendering/camera/camera';
import type { Renderer } from '../rendering/canvas/renderer';
import { bindCanvasClick } from '../input/canvas-click';
import { element,button,money } from './elements';
export interface PlacementTool {propose:(floor:number,x:number,height:number)=>CommandResult;preview:()=>CommandResult|null;commit:()=>CommandResult;cancel:()=>void}
/** Preview, reposition and confirm any room or connection through one consistent on-object control. */
export function createObjectPlacement(canvas:HTMLCanvasElement,camera:Camera,renderer:Renderer,tools:Map<string,HTMLButtonElement>,definitionId:string,label:string,width:number,tool:PlacementTool,redraw:()=>void,signal:AbortSignal,defaultHeight=1,resizable=false){
 const node=element('div','','room-confirmation'),quote=element('p');let enabled=false,anchor:{floor:number;x:number}|null=null,height=defaultHeight;
 node.hidden=true;node.setAttribute('role','dialog');node.setAttribute('aria-label',`Confirm ${label.toLowerCase()} placement`);quote.setAttribute('aria-live','polite');
 const confirm=button(`Place ${label.toLowerCase()}`,()=>{const result=tool.commit();if(result.ok){tools.get('inspect')!.click();canvas.focus();}else quote.textContent=result.message??result.code;redraw();});
 const cancel=button('Cancel',()=>{tools.get('inspect')!.click();canvas.focus();redraw();});const move=button('Move',()=>move.focus());move.className='placement-move';move.title='Drag to reposition; arrow keys move one cell or floor';
 node.append(quote,confirm,cancel,move,element('p','Drag the preview or Move to position. Arrow keys on Move adjust one cell.','muted'));canvas.parentElement!.append(node);
 const top=element('input');if(resizable){top.type='number';top.step='1';const field=element('label','','form-field');field.append(element('span','Elevator top floor'),top);node.append(field);top.addEventListener('input',()=>{if(!anchor)return;const next=top.valueAsNumber-anchor.floor+1;if(!Number.isSafeInteger(next)||next<2){confirm.disabled=true;quote.textContent='Choose a top floor above the bottom floor.';return;}height=next;reposition(anchor.floor,anchor.x);},{signal});}
 bindPlacementDrag(canvas,move,camera,()=>enabled&&anchor?{...anchor,width,height}:null,reposition,signal);
 /** Requote the moved footprint without committing or changing its size. */
 function reposition(floor:number,x:number):void {if(!enabled)return;anchor={floor,x};if(resizable)top.value=String(floor+height-1);tool.propose(floor,x,height);redraw();}

 const b=tools.get(definitionId)!;b.addEventListener('click',()=>tools.get('inspect')!.click(),{signal});
 for(const [id,b] of tools)b.addEventListener('click',()=>{reset();if(id===definitionId){enabled=true;b.setAttribute('aria-pressed','true');tools.get('inspect')!.setAttribute('aria-pressed','false');}redraw();},{signal});
 b.disabled=false;b.title=`Click to preview ${label.toLowerCase()}, drag to position, then confirm`;
 bindCanvasClick(canvas,camera,world=>{if(!enabled)return;anchor={floor:Math.floor(world.y),x:Math.floor(world.x)};reposition(anchor.floor,anchor.x);(confirm.disabled?cancel:confirm).focus({preventScroll:true});},signal);
 /** Revalidate price and footprint while positioning the confirmation after every camera change. */
 function draw():void {
  const result=tool.preview();node.hidden=!enabled||!anchor||!result;if(node.hidden||!anchor||!result)return;
  const validHeight=!resizable||(Number.isSafeInteger(top.valueAsNumber)&&top.valueAsNumber===anchor.floor+height-1);confirm.disabled=!result.ok||!validHeight;quote.textContent=!validHeight?'Choose a top floor above the bottom floor.':result.ok?`${label} · ${money(result.quote!.constructionCostMinor)} · Floor ${anchor.floor}, cell ${anchor.x}`:`Cannot place ${label.toLowerCase()}: ${result.message??result.code}`;
  const a=camera.worldToScreen({x:anchor.x,y:anchor.floor}),b=camera.worldToScreen({x:anchor.x+width,y:anchor.floor+height}),ctx=renderer.overlayContext();
  ctx.save();ctx.fillStyle=result.ok?'#62dfac38':'#fb90743b';ctx.strokeStyle=result.ok?'#80efc0':'#ff997d';ctx.lineWidth=2;ctx.fillRect(a.x,b.y,b.x-a.x,a.y-b.y);ctx.strokeRect(a.x,b.y,b.x-a.x,a.y-b.y);ctx.restore();
  const visible=b.x>=0&&a.x<=camera.width&&a.y>=0&&b.y<=camera.height;node.hidden=!visible;
  node.style.left=`${Math.max(8,Math.min(camera.width-node.offsetWidth-8,b.x+node.offsetWidth+16<camera.width?b.x+8:a.x-node.offsetWidth-8))}px`;
  node.style.top=`${Math.max(8,Math.min(camera.height-node.offsetHeight-8,a.y-camera.floorPixels*camera.zoom/2-node.offsetHeight/2))}px`;
 }
 /** Abandon the presentation proposal without issuing a command or retaining a stale confirmation. */
 function reset():void {enabled=false;anchor=null;height=defaultHeight;tool.cancel();node.hidden=true;b.setAttribute('aria-pressed','false');}
 return {draw,reset};
}
