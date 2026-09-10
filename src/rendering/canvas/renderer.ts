import { drawFacilities } from '../layers/facilities';
import { drawOccupants } from '../layers/occupants';
import type { WorldView } from '../../app/game/queries';
import type { Camera } from '../camera/camera';
import { drawStructure } from '../layers/structure';
/** Cache a viewport-sized static layer and redraw only when geometry or camera changes. */
export class Renderer {
  private readonly context:CanvasRenderingContext2D;private readonly cache:HTMLCanvasElement;private readonly cached:CanvasRenderingContext2D;private key='';staticDraws=0;
  /** Allocate one visible surface and one viewport-sized cache, never a world-sized bitmap. */
  constructor(private readonly canvas:HTMLCanvasElement,private readonly camera:Camera){
    const ctx=canvas.getContext('2d');this.cache=canvas.ownerDocument.createElement('canvas');const cached=this.cache.getContext('2d');
    if(!ctx || !cached)throw Error('Canvas 2D is unavailable');this.context=ctx;this.cached=cached;
  }
  /** Refresh the cached structure only for relevant world or presentation changes. */
  draw(view:WorldView):void {
    const c=this.camera;const key=[view.topologyVersion,view.lobby.id,view.bounds.widthCells,view.bounds.groundFloor,c.width,c.height,c.dpr,c.panX,c.panY,c.zoom].join(':');
    if(key!==this.key){this.key=key;for(const canvas of [this.canvas,this.cache]){canvas.width=Math.round(c.width*c.dpr);canvas.height=Math.round(c.height*c.dpr);}this.cached.setTransform(c.dpr,0,0,c.dpr,0,0);drawStructure(this.cached,view,c);drawFacilities(this.cached,view,c);this.staticDraws++;}
    this.context.setTransform(1,0,0,1,0,0);this.context.clearRect(0,0,this.canvas.width,this.canvas.height);this.context.drawImage(this.cache,0,0);this.context.setTransform(c.dpr,0,0,c.dpr,0,0);drawOccupants(this.context,view,c);
  }
  /** Expose only the presentation context to later preview layers. */
  overlayContext():CanvasRenderingContext2D {return this.context;}
  /** Invalidate on session replacement even when both worlds have revision zero. */
  invalidate():void {this.key='';}
}
