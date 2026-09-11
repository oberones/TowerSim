import type { GameState } from './game-state';
import type { Occupant,Anchor } from '../occupants/occupant';
import { record } from './plain';
import { integer,tick,positive } from '../core/values';
import { modePreference } from '../navigation/route';
import { hasWalkingPath } from '../world/walking-space';
/** Reject malformed persisted route choices instead of recomputing different choices on load. */
function check(condition:unknown,message:string):asserts condition {if(!condition)throw Error(message);}
/** Check the shape and safe logical values of a saved semantic endpoint. */
function anchor(a:Anchor):void {record(a,['floor','x2']);integer(a.floor);tick(a.x2);}
/** Match exact physical endpoints, including half-cell horizontal positions. */
function same(a:Anchor,b:Anchor):boolean {return a.floor===b.floor&&a.x2===b.x2;}
/** Validate future semantic legs separately from protected active segments and pending replans. */
export function assertJourney(s:GameState,p:Occupant):void {
 const j=p.journey;if(j===null){check(p.state==='outside'||p.state==='insideFacility'||p.replanAfterCurrentLeg,'Missing active journey');return;}
 record(j,['origin','destination','preference','legs','topologyVersion']);anchor(j.origin);anchor(j.destination);tick(j.topologyVersion);check(j.topologyVersion<=s.navigation.topologyVersion&&j.preference===modePreference(j.origin,j.destination)&&Array.isArray(j.legs),'Invalid journey origin preference');
 const office=p.goal.kind==='office'?s.offices[p.goal.facilityId]:null,lobby=s.tower!.lobby,destination=office?{floor:office.floor,x2:office.entranceX2}:{floor:lobby.floor,x2:lobby.entranceX2};check(same(j.destination,destination),'Journey destination disagrees with live goal');
 if(p.replanAfterCurrentLeg){check(j.legs.length===0,'Pending replan retains future legs');return;}
 check(j.topologyVersion===s.navigation.topologyVersion,'Stale route without pending replan');
 let at:Anchor|null=null;const l=p.location;if(l.kind==='walkEdge'||l.kind==='stair')at=l.to;else if(l.kind==='anchor')at=l.at;else if(l.kind==='car'){const stop=s.stops[l.unloadStopId]!;at={floor:stop.floor,x2:stop.anchorX2};}else if(l.kind==='queue'){const entry=s.queues[l.queueId]!.entries.find(e=>e.id===l.entryId)!,stop=s.stops[entry.unloadStopId]!;at={floor:stop.floor,x2:stop.anchorX2};}
 check(at!==null,'Dormant occupant retains a journey');
 for(const leg of j.legs){record(leg,leg.kind==='walk'?['kind','from','to','durationTicks']:leg.kind==='stair'?['kind','stairId','from','to','durationTicks']:['kind','serviceId','boardingStopId','unloadStopId','from','to','durationTicks']);anchor(leg.from);anchor(leg.to);positive(leg.durationTicks);check(same(at,leg.from),'Disconnected route suffix');
 if(leg.kind==='walk')check(leg.from.floor===leg.to.floor&&hasWalkingPath(s.tower!,leg.from.floor,leg.from.x2,leg.to.x2)&&leg.durationTicks===Math.ceil(Math.abs(leg.to.x2-leg.from.x2)*s.scenario.content!.walkingTicksPerCell/2),'Unsupported future walk');
 else if(leg.kind==='stair'){const stair=s.stairs[leg.stairId];check(!!stair&&leg.durationTicks===stair.traversalTicks&&(same(leg.from,stair.lowerAnchor)&&same(leg.to,stair.upperAnchor)||same(leg.from,stair.upperAnchor)&&same(leg.to,stair.lowerAnchor)),'Missing future stair');}
 else{check(leg.kind==='elevator','Unknown route leg');const a=s.stops[leg.boardingStopId],b=s.stops[leg.unloadStopId];check(!!a&&!!b&&a.serviceId===leg.serviceId&&b.serviceId===leg.serviceId&&a.floor!==b.floor&&same(leg.from,{floor:a.floor,x2:a.anchorX2})&&same(leg.to,{floor:b.floor,x2:b.anchorX2})&&leg.durationTicks===Math.abs(a.floor-b.floor)*s.scenario.content!.elevatorTiming.floorTicks,'Invalid future elevator leg');}
 at=leg.to;
 }
 check(p.state==='stranded'||same(at,j.destination),'Incomplete route suffix');
}
