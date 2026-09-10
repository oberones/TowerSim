import type { WorldView } from '../../app/game/queries';
import type { Camera } from '../camera/camera';
/** Render active people along the hallway without sprites owning movement or attendance rules. */
export function drawOccupants(ctx:CanvasRenderingContext2D,view:WorldView,camera:Camera):void {for(const p of view.occupants){const at=camera.worldToScreen({x:p.at.x2/2,y:p.at.floor+0.18});ctx.fillStyle=p.state==='stranded'?'#ff997d':'#ffdc80';ctx.fillRect(at.x-3,at.y-6,6,9);}}
