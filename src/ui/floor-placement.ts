import type {GameSession} from '../app/game/session';
import type {Camera} from '../rendering/camera/camera';
import type {Renderer} from '../rendering/canvas/renderer';
import type {Command} from '../simulation';
import {createObjectPlacement} from './object-placement';
export const DEFAULT_FLOOR_WIDTH=24;
/** Adapt movable, adjustable floor spans to the same validated confirmation flow as other objects. */
export function createFloorPlacement(session:GameSession,canvas:HTMLCanvasElement,camera:Camera,renderer:Renderer,tools:Map<string,HTMLButtonElement>,redraw:()=>void,signal:AbortSignal){
 let proposal:Command|null=null;
 return createObjectPlacement(canvas,camera,renderer,tools,'floor','Floor',DEFAULT_FLOOR_WIDTH,{
  propose:(floor,x,_height,width)=>{proposal={kind:'constructFloorRange',payload:{floor,startX:x,endXExclusive:x+width}};return session.preview(proposal);},
  preview:()=>proposal?session.preview(proposal):null,
  commit:()=>proposal?session.dispatch(proposal):{ok:false,code:'invalidCommand'},
  cancel:()=>{proposal=null;},
 },redraw,signal,1,false,true);
}
