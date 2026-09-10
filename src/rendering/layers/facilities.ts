import type { WorldView } from '../../app/game/queries';
import type { Camera } from '../camera/camera';
/** Draw visible room footprints above the shared hallway, using original labeled rectangles. */
export function drawFacilities(ctx:CanvasRenderingContext2D,view:WorldView,camera:Camera):void {for(const o of view.offices){const a=camera.worldToScreen({x:o.x,y:o.floor+0.32}),b=camera.worldToScreen({x:o.x+o.width,y:o.floor+0.9});ctx.fillStyle='#47688b';ctx.fillRect(a.x,b.y,b.x-a.x,a.y-b.y);ctx.fillStyle='#eef4ff';ctx.font='11px system-ui';ctx.fillText('OFFICE',a.x+4,(a.y+b.y)/2+3);}}
