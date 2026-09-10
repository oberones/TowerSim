export interface Point {x:number;y:number}
/** Transform logical cells/floors into CSS pixels; DPR affects backing pixels only. */
export class Camera {
  panX=-3;panY=-1;zoom=1;readonly cellPixels=9;readonly floorPixels=38;
  /** Store viewport dimensions separately from logical geometry. */
  constructor(public width:number,public height:number,public dpr:number) {}
  /** Resize the presentation surface without changing world anchors or proposals. */
  resize(width:number,height:number,dpr:number):void {if(![width,height,dpr].every(n=>Number.isFinite(n)&&n>0))throw Error('Invalid viewport');this.width=width;this.height=height;this.dpr=dpr;}
  /** Convert a world anchor to a CSS pixel coordinate with upward-positive floors. */
  worldToScreen(p:Point):Point {return {x:(p.x-this.panX)*this.cellPixels*this.zoom,y:this.height-(p.y-this.panY)*this.floorPixels*this.zoom};}
  /** Invert CSS pixel coordinates; device pixels never enter placement calculations. */
  screenToWorld(p:Point):Point {return {x:p.x/(this.cellPixels*this.zoom)+this.panX,y:(this.height-p.y)/(this.floorPixels*this.zoom)+this.panY};}
  /** Pan by CSS pixel deltas so dragging feels stable at every zoom. */
  panBy(dx:number,dy:number):void {this.panX-=dx/(this.cellPixels*this.zoom);this.panY+=dy/(this.floorPixels*this.zoom);}
  /** Keep the world point under the zoom anchor stationary while clamping magnification. */
  zoomAt(factor:number,anchor:Point):void {if(!Number.isFinite(factor)||factor<=0)return;const before=this.screenToWorld(anchor);this.zoom=Math.min(4,Math.max(0.25,this.zoom*factor));const after=this.screenToWorld(anchor);this.panX+=before.x-after.x;this.panY+=before.y-after.y;}
  /** Fit the default site width and leave several buildable upper floors in view. */
  fit(widthCells:number,groundFloor:number):void {this.zoom=Math.min(1.4,Math.max(0.25,(this.width-80)/(widthCells*this.cellPixels)));this.panX=-40/(this.cellPixels*this.zoom);this.panY=groundFloor-1.6;}
  /** Bound structure queries to the visible logical area with a one-floor drawing margin. */
  bounds(){const top=this.screenToWorld({x:0,y:0}),bottom=this.screenToWorld({x:this.width,y:this.height});return {minX:top.x,maxX:bottom.x,minFloor:Math.floor(bottom.y)-1,maxFloor:Math.ceil(top.y)+1};}
}
