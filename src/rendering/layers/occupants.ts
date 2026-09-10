import type { WorldView } from '../../app/game/queries';
import type { Camera } from '../camera/camera';
import { OCCUPANT_MARKER_WIDTH,OCCUPANT_MARKER_HEIGHT } from './occupant-marker';
/** Draw readable screen-sized silhouettes at real positions, with contrasting outlines at every zoom. */
export function drawOccupants(ctx:CanvasRenderingContext2D,view:WorldView,camera:Camera):void {
 for(const p of view.occupants){
  const at=camera.worldToScreen({x:p.at.x2/2,y:p.at.floor+0.18});
  ctx.fillStyle='#081119';
  ctx.fillRect(at.x-OCCUPANT_MARKER_WIDTH/2,at.y-11,OCCUPANT_MARKER_WIDTH,OCCUPANT_MARKER_HEIGHT);
  ctx.fillStyle=p.state==='stranded'?'#ff997d':'#ffdc80';
  ctx.fillRect(at.x-3,at.y-10,6,5);
  ctx.fillRect(at.x-4,at.y-3,8,9);
 }
}
