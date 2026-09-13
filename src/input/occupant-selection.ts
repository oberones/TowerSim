import type { Point,Camera } from '../rendering/camera/camera';
import type { WorldView } from '../app/game/queries';
import { OCCUPANT_HIT_RADIUS } from '../rendering/layers/occupant-marker';
/** Pick the nearest visible person with a stable ID tie, leaving dormant selection to its existing inspector. */
export function selectOccupant(view:WorldView,camera:Camera,point:Point):string|null {const hits=view.occupants.map(p=>{const pos=camera.worldToScreen({x:p.at.x2/2,y:p.at.floor+0.18});return {id:p.id,distance:Math.hypot(point.x-pos.x,point.y-pos.y)};}).filter(p=>p.distance<=OCCUPANT_HIT_RADIUS).sort((a,b)=>a.distance-b.distance||a.id.localeCompare(b.id));return hits[0]?.id??null;}
