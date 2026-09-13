import type { Camera, Point } from '../rendering/camera/camera';
import { pointerWorld } from './pointer';
/** Deliver only primary clicks, retaining the world anchor from before any camera pan. */
export function bindCanvasClick(canvas:HTMLCanvasElement,camera:Camera,select:(world:Point,screen:Point)=>void,signal:AbortSignal):void {
 let down:{id:number;client:Point;world:Point;moved:boolean}|null=null;
 canvas.addEventListener('pointerdown',event=>{
  down=event.button===0&&!event.shiftKey?{id:event.pointerId,client:{x:event.clientX,y:event.clientY},world:pointerWorld(camera,{x:event.clientX,y:event.clientY},canvas.getBoundingClientRect()),moved:false}:null;
 },{signal});
 canvas.addEventListener('pointermove',event=>{if(down&&down.id===event.pointerId&&(event.shiftKey||Math.hypot(event.clientX-down.client.x,event.clientY-down.client.y)>=4))down.moved=true;},{signal});
 canvas.addEventListener('pointerup',event=>{
  const start=down;down=null;if(!start||start.id!==event.pointerId||start.moved||event.button!==0||event.shiftKey||Math.hypot(event.clientX-start.client.x,event.clientY-start.client.y)>=4)return;
  const rect=canvas.getBoundingClientRect();select(start.world,{x:event.clientX-rect.left,y:event.clientY-rect.top});
 },{signal});
 canvas.addEventListener('pointercancel',()=>{down=null;},{signal});
}
