import type { WorldView } from '../../app/game/queries';
import type { Camera } from '../camera/camera';
/** Draw the two real landings and a stepped connection in logical world coordinates. */
export function drawStairs(ctx:CanvasRenderingContext2D,view:WorldView,camera:Camera):void {ctx.strokeStyle='#dfbb72';ctx.lineWidth=2;for(const s of view.stairs){ctx.beginPath();const bottom=camera.worldToScreen({x:s.x,y:s.lowerFloor+0.12});ctx.moveTo(bottom.x,bottom.y);for(let i=1;i<=6;i++){const a=camera.worldToScreen({x:s.x+s.width*i/6,y:s.lowerFloor+0.12+(i-1)/6}),b=camera.worldToScreen({x:s.x+s.width*i/6,y:s.lowerFloor+0.12+i/6});ctx.lineTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();}}
