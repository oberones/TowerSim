import type { GameSession } from '../app/game/session';
import type { Command,CommandResult } from '../simulation';
/** Keep logical office proposals outside authoritative state and revalidate them on every commit. */
export class FacilityTool {
 private proposal:Command|null=null;
 /** Bind previews and commits to the same application ingress boundary. */
 constructor(private session:Pick<GameSession,'preview'|'dispatch'>,private definitionId='office.small'){}
 /** Store a complete proposal without consuming any authoritative allocation counters. */
 propose(floor:number,x:number):CommandResult {this.proposal={kind:'placeFacility',payload:{definitionId:this.definitionId,floor,x}};return this.session.preview(this.proposal);}
 /** Requote against current cash and geometry rather than retaining a stale acceptance. */
 preview():CommandResult|null {return this.proposal?this.session.preview(this.proposal):null;}
 /** Dispatch the unchanged logical placement with fresh sequence and current-tick validation. */
 commit():CommandResult {return this.proposal?this.session.dispatch(this.proposal):{ok:false,code:'invalidCommand'};}
 /** Cancel presentation intent without any command or money mutation. */
 cancel():void {this.proposal=null;}
}
