import type { WorldView } from '../app/game/queries';
import type { Point } from '../rendering/camera/camera';
/** Select a transport footprint from the logical pointer-down anchor, independent of later layout changes. */
export function selectTransport(view:Pick<WorldView,'elevators'|'stairs'>,at:Point):string|null {return view.elevators.find(s=>at.x>=s.x&&at.x<s.x+s.width&&Math.floor(at.y)>=s.minFloor&&Math.floor(at.y)<=s.maxFloor)?.id??view.stairs.find(s=>at.x>=s.x&&at.x<s.x+s.width&&Math.floor(at.y)>=s.lowerFloor&&Math.floor(at.y)<=s.lowerFloor+1)?.id??null;}
