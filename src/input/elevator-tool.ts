import type { GameSession } from '../app/game/session';
import type { Command,CommandResult } from '../simulation';
/** Keep aligned shaft and contiguous service proposals outside authoritative simulation state. */
export class ElevatorTool {
 private proposal:Command|null=null;
 /** Use the same application preview and ingress boundary for all elevator actions. */
 constructor(private session:Pick<GameSession,'preview'|'dispatch'>){}
 /** Quote a standard shaft serving every landing in the proposed full extent. */
 propose(minFloor:number,maxFloor:number,x:number):CommandResult {this.proposal={kind:'buildElevatorShaft',payload:{definitionId:'elevator.standard',x,minFloor,maxFloor,servedMinFloor:minFloor,servedMaxFloor:maxFloor}};return this.session.preview(this.proposal);}
 /** Requote the pending full geometry against current cash and transport commitments. */
 preview():CommandResult|null {return this.proposal?this.session.preview(this.proposal):null;}
 /** Commit the exact current proposal with fresh command sequencing and validation. */
 commit():CommandResult {return this.proposal?this.session.dispatch(this.proposal):{ok:false,code:'invalidCommand'};}
 /** Change a selected shaft's contiguous service only through domain safety guards. */
 setService(shaftId:string,minFloor:number,maxFloor:number):CommandResult {return this.session.dispatch({kind:'setElevatorServiceRange',payload:{shaftId,minFloor,maxFloor}});}
 /** Discard only the presentation-owned pending shaft proposal. */
 cancel():void {this.proposal=null;}
}
