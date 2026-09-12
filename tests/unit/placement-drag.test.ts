import {expect,test} from 'vitest';
import {bindPlacementDrag} from '../../src/input/placement-drag';
import {Camera} from '../../src/rendering/camera/camera';
import {UiElement} from '../fixtures/ui-element';
/** Drive pointer handlers using CSS-pixel coordinates. */
function pointer(target:UiElement,type:string,x:number,y:number,extra:Record<string,unknown>={}):Event {const event=new Event(type,{cancelable:true});Object.assign(event,{pointerId:1,button:0,shiftKey:false,clientX:x,clientY:y,...extra});target.dispatchEvent(event);return event;}
/** Bind a pending object and its handle without any authoritative state to mutate. */
function setup(){const canvas=new UiElement('canvas'),handle=new UiElement('button'),camera=new Camera(900,600,2),controller=new AbortController();let bounds={floor:2,x:20,width:16,height:4};bindPlacementDrag(canvas as unknown as HTMLCanvasElement,handle as unknown as HTMLElement,camera,()=>bounds,(floor,x)=>{bounds={...bounds,floor,x};},controller.signal);return {canvas,handle,camera,controller,current:()=>bounds};}
test('dragging a preview preserves its grab offset and dimensions at different zoom levels',()=>{
 for(const zoom of [0.5,1,2]){const s=setup();s.camera.zoom=zoom;const at=s.camera.worldToScreen({x:25,y:3});pointer(s.canvas,'pointerdown',at.x,at.y);pointer(s.canvas,'pointermove',at.x+3*9*zoom,at.y-2*38*zoom);pointer(s.canvas,'pointerup',at.x+3*9*zoom,at.y-2*38*zoom);expect(s.current()).toEqual({floor:4,x:23,width:16,height:4});expect(s.canvas.hasPointerCapture(1)).toBe(false);}
});
test('Move handle drags from outside the footprint and supports exact keyboard nudges',()=>{
 const s=setup();pointer(s.handle,'pointerdown',600,200);pointer(s.handle,'pointerup',618,238);expect(s.current()).toEqual({floor:1,x:22,width:16,height:4});
 const key=new Event('keydown',{cancelable:true});Object.assign(key,{key:'ArrowLeft'});s.handle.dispatchEvent(key);expect(s.current().x).toBe(21);expect(key.defaultPrevented).toBe(true);
});
test('outside and modified drags remain camera gestures; canceled and disposed drags stop moving',()=>{
 const s=setup();pointer(s.canvas,'pointerdown',0,0);pointer(s.canvas,'pointermove',100,100);expect(s.current().x).toBe(20);
 const at=s.camera.worldToScreen({x:22,y:3});expect(pointer(s.canvas,'pointerdown',at.x,at.y,{shiftKey:true}).defaultPrevented).toBe(false);
 pointer(s.handle,'pointerdown',600,200);pointer(s.handle,'pointercancel',600,200);pointer(s.handle,'pointermove',700,300);expect(s.current().x).toBe(20);
 pointer(s.handle,'pointerdown',600,200);s.controller.abort();expect(s.handle.hasPointerCapture(1)).toBe(false);pointer(s.handle,'pointermove',700,300);expect(s.current().x).toBe(20);
});
