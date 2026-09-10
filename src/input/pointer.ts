import type { Point, Camera } from '../rendering/camera/camera';
import type { FloorPayload } from '../simulation/commands/types';
/** Convert viewport pointer coordinates to logical world coordinates using CSS pixels only. */
export function pointerWorld(camera:Camera,client:Point,rect:{left:number;top:number}):Point {return camera.screenToWorld({x:client.x-rect.left,y:client.y-rect.top});}
/** Anchor a horizontal drag to its original floor; include both endpoint cells and permit either direction. */
export function pointerProposal(start:Point,end:Point):FloorPayload {return {floor:Math.floor(start.y),startX:Math.min(Math.floor(start.x),Math.floor(end.x)),endXExclusive:Math.max(Math.floor(start.x),Math.floor(end.x))+1};}
