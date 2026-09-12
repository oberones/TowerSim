import { expect,test } from 'vitest';
import { Camera } from '../../src/rendering/camera/camera';
import { bindCameraNavigation } from '../../src/input/camera-navigation';

/** Dispatch browser-shaped input through a real event target without requiring a DOM renderer. */
function input(target:EventTarget,type:string,fields:Record<string,unknown>):Event {
 const event=new Event(type,{cancelable:true});Object.assign(event,fields);target.dispatchEvent(event);return event;
}
test('wheel navigation changes only vertical position and ignores pinch zoom',()=>{
 const target=new EventTarget(),camera=new Camera(900,600,1),controller=new AbortController();
 bindCameraNavigation(target as HTMLCanvasElement,camera,()=>{},controller.signal);
 const x=camera.panX,y=camera.panY,zoom=camera.zoom;
 expect(input(target,'wheel',{deltaX:90,deltaY:38,deltaMode:0,ctrlKey:false}).defaultPrevented).toBe(true);
 expect(camera.panX).toBe(x);expect(camera.panY).toBe(y-1);expect(camera.zoom).toBe(zoom);
 input(target,'wheel',{deltaX:0,deltaY:200,deltaMode:0,ctrlKey:true});
 expect(camera.panY).toBe(y-1);expect(camera.zoom).toBe(zoom);
 controller.abort();input(target,'wheel',{deltaY:38,deltaMode:0});expect(camera.panY).toBe(y-1);
});
test('keyboard navigation pans vertically without horizontal movement or zoom shortcuts',()=>{
 const target=new EventTarget(),camera=new Camera(900,600,1),controller=new AbortController();
 bindCameraNavigation(target as HTMLCanvasElement,camera,()=>{},controller.signal);
 const before={x:camera.panX,y:camera.panY,zoom:camera.zoom};
 for(const key of ['ArrowLeft','ArrowRight','+','=','-'])input(target,'keydown',{key});
 expect({x:camera.panX,y:camera.panY,zoom:camera.zoom}).toEqual(before);
 expect(input(target,'keydown',{key:'ArrowUp'}).defaultPrevented).toBe(true);expect(camera.panY).toBeGreaterThan(before.y);
 input(target,'keydown',{key:'ArrowDown'});expect(camera.panY).toBeCloseTo(before.y);
 expect(camera.panX).toBe(before.x);expect(camera.zoom).toBe(before.zoom);
});
