import type {Camera,Point} from '../rendering/camera/camera';
import {pointerWorld} from './pointer';
export interface PlacementBounds {floor:number;x:number;width:number;height:number}
/** Drag a pending object in logical cells, intercepting its gesture before the camera can pan. */
export function bindPlacementDrag(canvas:HTMLCanvasElement,handle:HTMLElement,camera:Camera,current:()=>PlacementBounds|null,move:(floor:number,x:number)=>void,signal:AbortSignal):void {
 let drag:{id:number;target:HTMLElement;start:Point;bounds:PlacementBounds}|null=null;
 /** Preserve the grab offset so grabbing the middle never snaps the object to its left edge. */
 function start(event:PointerEvent,fromHandle:boolean):void {
  const bounds=current();if(!bounds||event.button!==0||event.shiftKey)return;
  const at=pointerWorld(camera,{x:event.clientX,y:event.clientY},canvas.getBoundingClientRect());
  if(!fromHandle&&(at.x<bounds.x||at.x>=bounds.x+bounds.width||at.y<bounds.floor||at.y>=bounds.floor+bounds.height))return;
  event.preventDefault();event.stopImmediatePropagation();const target=fromHandle?handle:canvas;target.focus({preventScroll:true});target.setPointerCapture(event.pointerId);drag={id:event.pointerId,target,start:at,bounds};
 }
 /** Apply whole-cell deltas to the original footprint without changing its dimensions. */
 function update(event:PointerEvent):void {
  if(!drag||drag.id!==event.pointerId)return;event.preventDefault();event.stopImmediatePropagation();
  if(!current()){finish(event);return;}const at=pointerWorld(camera,{x:event.clientX,y:event.clientY},canvas.getBoundingClientRect());
  move(drag.bounds.floor+Math.round(at.y-drag.start.y),drag.bounds.x+Math.round(at.x-drag.start.x));
 }
 /** Release capture on completion or cancellation; never issue a construction command. */
 function finish(event:PointerEvent):void {if(!drag||drag.id!==event.pointerId)return;event.preventDefault();event.stopImmediatePropagation();const previous=drag;drag=null;if(previous.target.hasPointerCapture(event.pointerId))previous.target.releasePointerCapture(event.pointerId);}
 canvas.addEventListener('pointerdown',event=>start(event,false),{signal,capture:true});handle.addEventListener('pointerdown',event=>start(event,true),{signal});
 for(const target of [canvas,handle]){target.addEventListener('pointermove',update,{signal,capture:true});target.addEventListener('pointerup',event=>{update(event);finish(event);},{signal,capture:true});target.addEventListener('pointercancel',finish,{signal,capture:true});}
 handle.addEventListener('keydown',event=>{const bounds=current(),delta=({ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]} as Record<string,[number,number]>)[event.key];if(!bounds||!delta)return;event.preventDefault();event.stopPropagation();move(bounds.floor+delta[1],bounds.x+delta[0]);},{signal});
 signal.addEventListener('abort',()=>{if(drag?.target.hasPointerCapture(drag.id))drag.target.releasePointerCapture(drag.id);drag=null;},{once:true});
}
