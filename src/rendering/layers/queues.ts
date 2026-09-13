import type { WorldView } from '../../app/game/queries';
import type { Camera } from '../camera/camera';
/** Draw exact directional group counts without implying selected boarders have entered the car. */
export function drawQueues(ctx:CanvasRenderingContext2D,view:WorldView,camera:Camera):void {
 ctx.font='bold 12px system-ui';
 for(const q of view.queues){if(!q.count)continue;const at=camera.worldToScreen({x:q.x2/2,y:q.floor+0.3});
  const label=`${q.direction==='up'?'↑':'↓'} ${q.count}`;const x=at.x+(q.direction==='up'?12:-44);
  ctx.fillStyle='#172c3e';ctx.fillRect(x-3,at.y-13,36,18);ctx.fillStyle='#ffe19a';ctx.fillText(label,x,at.y);
 }
}
