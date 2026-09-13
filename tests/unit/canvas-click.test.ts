import {expect,test} from 'vitest';
import {bindCanvasClick} from '../../src/input/canvas-click';
import {Camera} from '../../src/rendering/camera/camera';
import type {Point} from '../../src/rendering/camera/camera';
/** Dispatch a browser-shaped pointer event through the real input listeners. */
function pointer(target:EventTarget,type:string,fields:Record<string,unknown>={}):void {const event=new Event(type);Object.assign(event,{pointerId:1,button:0,shiftKey:false,clientX:200,clientY:300},fields);target.dispatchEvent(event);}
/** Provide only the canvas geometry needed by input, without a browser dependency. */
function setup(){const target=Object.assign(new EventTarget(),{getBoundingClientRect:()=>({left:20,top:40})}),camera=new Camera(900,600,2),controller=new AbortController(),hits:{world:Point;screen:Point}[]=[];bindCanvasClick(target as HTMLCanvasElement,camera,(world,screen)=>hits.push({world,screen}),controller.signal);return {target,camera,controller,hits};}
test('room clicks keep the pointer-down world anchor across camera changes',()=>{
 const {target,camera,hits}=setup(),expected=camera.screenToWorld({x:180,y:260});pointer(target,'pointerdown');camera.panBy(0,2);pointer(target,'pointerup',{clientY:302});expect(hits).toEqual([{world:expected,screen:{x:180,y:262}}]);
});
test('panning, modified clicks, canceled gestures and stray releases never propose a room',()=>{
 const {target,hits}=setup();
 pointer(target,'pointerup');
 pointer(target,'pointerdown');pointer(target,'pointermove',{clientY:330});pointer(target,'pointermove');pointer(target,'pointerup');
 pointer(target,'pointerdown',{shiftKey:true});pointer(target,'pointerup');
 pointer(target,'pointerdown',{button:2});pointer(target,'pointerup',{button:2});
 pointer(target,'pointerdown');pointer(target,'pointercancel');pointer(target,'pointerup');
 pointer(target,'pointerdown');pointer(target,'pointerup',{pointerId:2});
 expect(hits).toEqual([]);
});
test('disposed view removes room input handlers',()=>{const {target,controller,hits}=setup();controller.abort();pointer(target,'pointerdown');pointer(target,'pointerup');expect(hits).toEqual([]);});
