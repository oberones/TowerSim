import type { WorldView } from '../../app/game/queries';
import type { Camera } from '../camera/camera';
/** Draw only visible logical spans and the permanent lobby using original Canvas shapes. */
export function drawStructure(ctx:CanvasRenderingContext2D,view:WorldView,camera:Camera):void {
  ctx.fillStyle='#101c27';ctx.fillRect(0,0,camera.width,camera.height);
  const min=Math.max(view.bounds.minFloor,camera.bounds().minFloor),max=Math.min(view.bounds.maxFloor,camera.bounds().maxFloor);
  ctx.font='12px system-ui';ctx.textBaseline='middle';
  for(let level=min;level<=max;level++){
    const left=camera.worldToScreen({x:0,y:level}),right=camera.worldToScreen({x:view.bounds.widthCells,y:level});
    ctx.strokeStyle='#233440';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(left.x,left.y);ctx.lineTo(right.x,right.y);ctx.stroke();ctx.fillStyle='#8babb9';ctx.fillText(String(level),Math.max(8,left.x-25),left.y-12);
  }
  for(const floor of view.floors)for(const r of floor.constructedRanges){
    const a=camera.worldToScreen({x:r.startX,y:floor.level}),b=camera.worldToScreen({x:r.endXExclusive,y:floor.level+1});
    const x=Math.max(-2,a.x),end=Math.min(camera.width+2,b.x);if(end<=x)continue;
    ctx.fillStyle='#203746';ctx.fillRect(x,b.y+5,end-x,a.y-b.y-5);ctx.fillStyle='#a8c1c7';ctx.fillRect(x,a.y-4,end-x,4);
    ctx.strokeStyle='#315161';ctx.strokeRect(x,b.y+5,end-x,a.y-b.y-9);
  }
  const lobby=view.lobby,a=camera.worldToScreen({x:lobby.x,y:lobby.floor}),b=camera.worldToScreen({x:lobby.x+lobby.width,y:lobby.floor+1});
  ctx.fillStyle='#347b71';ctx.fillRect(a.x,b.y+5,b.x-a.x,a.y-b.y-9);ctx.fillStyle='#e3fff4';ctx.font='bold 11px system-ui';ctx.fillText('LOBBY',a.x+5,(a.y+b.y)/2);
}
