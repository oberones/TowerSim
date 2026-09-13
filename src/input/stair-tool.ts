import type { GameSession } from '../app/game/session';
import type { Command,CommandResult } from '../simulation';
/** Hold an adjacent stair proposal in presentation state and revalidate at commit. */
export class StairTool {
 private proposal:Command|null=null;
 /** Bind the same immutable proposal to application preview and command ingress. */
 constructor(private session:Pick<GameSession,'preview'|'dispatch'>){}
 /** Quote the full pair of adjacent landings without consuming domain identities. */
 propose(lowerFloor:number,x:number):CommandResult {this.proposal={kind:'buildStair',payload:{definitionId:'stairs.basic',lowerFloor,x}};return this.session.preview(this.proposal);}
 /** Requote against current cash, reservations and constructed floor space. */
 preview():CommandResult|null {return this.proposal?this.session.preview(this.proposal):null;}
 /** Send the complete placement through fresh ordered application ingress. */
 commit():CommandResult {return this.proposal?this.session.dispatch(this.proposal):{ok:false,code:'invalidCommand'};}
 /** Discard only the pending presentation placement intent. */
 cancel():void {this.proposal=null;}
}
