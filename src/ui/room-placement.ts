import type {GameSession} from '../app/game/session';
import type {Camera} from '../rendering/camera/camera';
import type {Renderer} from '../rendering/canvas/renderer';
import {FacilityTool} from '../input/facility-tool';
import {createObjectPlacement} from './object-placement';
/** Adapt fixed-size rooms to the shared movable placement preview and confirmation. */
export function createRoomPlacement(session:GameSession,canvas:HTMLCanvasElement,camera:Camera,renderer:Renderer,tools:Map<string,HTMLButtonElement>,definitionId:string,label:string,redraw:()=>void,signal:AbortSignal){
 const definition=session.capture().scenario.content!.definitions.find(d=>d.typeId===definitionId)!;
 return createObjectPlacement(canvas,camera,renderer,tools,definitionId,label,definition.footprint.width,new FacilityTool(session,definitionId),redraw,signal);
}
