import type { WorldView } from '../../app/game/queries';
import type { Camera } from '../camera/camera';
/** Label waiting hotspots with measured age so congestion remains understandable without color alone. */
export function drawTraffic(ctx:CanvasRenderingContext2D,view:WorldView,camera:Camera):void {
 ctx.font='11px system-ui';ctx.fillStyle='#ffe19a';
 for(const q of view.queues)if(q.count){const at=camera.worldToScreen({x:q.x2/2,y:q.floor+0.7});ctx.fillText(`${q.direction==='up'?'↑':'↓'} wait ${Math.floor(q.oldestWaitTicks/60)}m ${q.oldestWaitTicks%60}s`,at.x+12,at.y+(q.direction==='down'?14:0));}
}
