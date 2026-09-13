import type {Camera} from '../rendering/camera/camera';
import type {PlacementBounds} from '../input/placement-drag';
import {pointerWorld} from '../input/pointer';
import {element} from './elements';
/** Expose draggable grips directly on each floor edge, with keyboard nudges for precise adjustment. */
export function createFloorBoundaries(canvas:HTMLCanvasElement,camera:Camera,current:()=>PlacementBounds|null,resize:(x:number,width:number)=>void,signal:AbortSignal){
 const nodes:HTMLElement[]=[];
 for(const side of ['left','right'] as const){
  const node=element('div','','floor-edge');node.hidden=true;node.tabIndex=0;node.setAttribute('role','separator');node.setAttribute('aria-orientation','vertical');node.setAttribute('aria-label',`${side==='left'?'Left':'Right'} floor edge`);node.title='Drag to resize this edge; left/right arrow keys adjust one cell';nodes.push(node);canvas.parentElement!.append(node);
  let drag:{id:number;clientX:number;worldX:number;bounds:PlacementBounds;moved:boolean}|null=null;
  /** Move only this edge, keeping the opposite edge fixed and retaining at least one cell. */
  function adjust(bounds:PlacementBounds,delta:number):void {
   const end=bounds.x+bounds.width;
   if(side==='left'){const x=Math.min(end-1,bounds.x+delta);resize(x,end-x);}else resize(bounds.x,Math.max(1,bounds.width+delta));
  }
  node.addEventListener('pointerdown',event=>{const bounds=current();if(!bounds||event.button!==0||event.shiftKey)return;event.preventDefault();event.stopPropagation();node.focus({preventScroll:true});node.setPointerCapture(event.pointerId);drag={id:event.pointerId,clientX:event.clientX,worldX:pointerWorld(camera,{x:event.clientX,y:event.clientY},canvas.getBoundingClientRect()).x,bounds,moved:false};},{signal});
  /** Recompute from the original edge so repeated pointer events never accumulate rounding errors. */
  function update(event:PointerEvent):void {if(!drag||drag.id!==event.pointerId)return;event.preventDefault();event.stopPropagation();if(!current()){finish(event);return;}if(Math.abs(event.clientX-drag.clientX)>=4)drag.moved=true;if(drag.moved){const x=pointerWorld(camera,{x:event.clientX,y:event.clientY},canvas.getBoundingClientRect()).x;adjust(drag.bounds,Math.round(x-drag.worldX));}}
  /** Release capture without applying an extra change when the pointer is released or canceled. */
  function finish(event:PointerEvent):void {if(!drag||drag.id!==event.pointerId)return;drag=null;if(node.hasPointerCapture(event.pointerId))node.releasePointerCapture(event.pointerId);}
  node.addEventListener('pointermove',update,{signal});node.addEventListener('pointerup',event=>{update(event);finish(event);},{signal});node.addEventListener('pointercancel',finish,{signal});
  node.addEventListener('keydown',event=>{if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;const bounds=current();if(!bounds)return;event.preventDefault();event.stopPropagation();adjust(bounds,event.key==='ArrowLeft'?-1:1);},{signal});
  signal.addEventListener('abort',()=>{if(drag&&node.hasPointerCapture(drag.id))node.releasePointerCapture(drag.id);drag=null;},{once:true});
 }
 /** Align grips with the actual edges, including after moving, zooming or resizing the preview. */
 function draw(visible:boolean):void {
  const bounds=current();for(const [index,node] of nodes.entries()){node.hidden=!visible||!bounds;if(node.hidden||!bounds)continue;const cell=bounds.x+(index===0?0:bounds.width),at=camera.worldToScreen({x:cell,y:bounds.floor+1}),bottom=camera.worldToScreen({x:cell,y:bounds.floor});node.style.width=`${Math.min(14,bounds.width*camera.cellPixels*camera.zoom)}px`;node.style.height=`${bottom.y-at.y}px`;node.style.left=`${at.x}px`;node.style.top=`${at.y}px`;node.setAttribute('aria-valuenow',String(cell));node.setAttribute('aria-valuetext',`Cell ${cell}`);}
 }
 return {draw};
}
