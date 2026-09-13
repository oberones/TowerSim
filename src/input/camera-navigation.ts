import type { Camera } from '../rendering/camera/camera';
/** Keep wheel and keyboard navigation vertical; magnification belongs to the visible zoom buttons. */
export function bindCameraNavigation(canvas:HTMLCanvasElement,camera:Camera,draw:()=>void,signal:AbortSignal):void {
 canvas.addEventListener('wheel',event=>{
  event.preventDefault();
  // Trackpad pinch gestures arrive as control-wheel events; consume them without changing the view.
  if(event.ctrlKey)return;
  const unit=event.deltaMode===1?16:event.deltaMode===2?camera.height:1;
  camera.panBy(0,-event.deltaY*unit);draw();
 },{signal,passive:false});
 canvas.addEventListener('keydown',event=>{
  if(event.key!=='ArrowUp'&&event.key!=='ArrowDown')return;
  event.preventDefault();camera.panBy(0,event.key==='ArrowUp'?50:-50);draw();
 },{signal});
}
