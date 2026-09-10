import type { Camera } from '../camera/camera';
import type { ToolState } from '../../input/build-tool';
import type { FloorInspection } from '../../app/game/queries';
/** Draw the selected spans and the unchanged logical proposal above the cached static layer. */
export function drawPreview(ctx:CanvasRenderingContext2D,camera:Camera,tool:ToolState,selection:FloorInspection|null):void {
  ctx.save();ctx.lineWidth=2;
  if(selection){ctx.strokeStyle='#e9cd83';for(const span of selection.spans){const a=camera.worldToScreen({x:span.startX,y:selection.level+1}),b=camera.worldToScreen({x:span.endXExclusive,y:selection.level});ctx.strokeRect(a.x,a.y+4,b.x-a.x,b.y-a.y-5);}}
  if(tool.kind==='preview'){
    const p=tool.proposal;const a=camera.worldToScreen({x:p.startX,y:p.floor+1}),b=camera.worldToScreen({x:p.endXExclusive,y:p.floor});const valid=tool.quote.ok;
    ctx.fillStyle=valid?'#62dfac38':'#fb90743b';ctx.strokeStyle=valid?'#85f4c5':'#ffae97';ctx.setLineDash(valid?[]:[5,4]);ctx.fillRect(a.x,a.y+4,b.x-a.x,b.y-a.y-5);ctx.strokeRect(a.x,a.y+4,b.x-a.x,b.y-a.y-5);
    ctx.fillStyle='#f1f5ed';ctx.font='bold 12px system-ui';ctx.fillText(valid?'VALID':'INVALID',a.x+4,a.y-6);
  }
  ctx.restore();
}
