import { constructionQuote } from './construction-quote';
import { accessStatus } from './access-status';
import type { GameSession } from '../app/game/session';
import type { Camera } from '../rendering/camera/camera';
import type { Renderer } from '../rendering/canvas/renderer';
import { FacilityTool } from '../input/facility-tool';
import { selectOccupant } from '../input/occupant-selection';
import { createOccupantInspector } from './occupant-inspector';
import { element,button,money,timeOfDay } from './elements';
/** Bind office placement, free demolition and persistent person selection to ordinary application controls. */
export function createOfficePanel(session:GameSession,canvas:HTMLCanvasElement,camera:Camera,renderer:Renderer,tools:Map<string,HTMLButtonElement>,redraw:()=>void,signal:AbortSignal){
 let lastInspection=-Infinity,lastSelection='',lastTopology=-1,lastSpeed=-1;
 const node=element('section','','construction-panel'),tool=new FacilityTool(session),person=createOccupantInspector();let enabled=false,selected:string|null=null,selectedPerson:string|null=null;
 const floor=element('input'),x=element('input');floor.type=x.type='number';floor.step=x.step='1';floor.value='0';x.value='24';
 for(const [label,input] of [['Office floor',floor],['Office start cell',x]] as const){const field=element('label','','form-field');field.append(element('span',label),input);node.append(field);input.addEventListener('input',()=>{if(enabled)tool.propose(floor.valueAsNumber,x.valueAsNumber);redraw();},{signal});}
 const quote=element('p','Choose Office to place a room.'),info=element('p','Click an office to inspect tenancy and attendance.');quote.setAttribute('aria-live','polite');
 const commit=button('Place office',()=>{const r=tool.commit();quote.textContent=r.ok?'Office placed; leasing occurs at 06:00.':r.message??r.code;enabled=false;tool.cancel();tools.get('inspect')!.setAttribute('aria-pressed','true');tools.get('office.small')!.setAttribute('aria-pressed','false');redraw();});commit.disabled=true;
 const demolish=button('Remove selected office',()=>{if(!selected)return;const r=session.dispatch({kind:'demolishEntity',payload:{entityId:selected}});if(r.ok)selected=null;else quote.textContent=r.message??r.code;redraw();});demolish.disabled=true;
 node.append(quote,commit,element('h2','Office'),info,demolish,person.node);
 for(const id of ['floor','demolish','inspect','stairs.basic','elevator.standard','restaurant.small'])tools.get(id)!.addEventListener('click',()=>{enabled=false;tool.cancel();officeButton.setAttribute('aria-pressed','false');},{signal});
 const officeButton=tools.get('office.small')!;officeButton.disabled=false;officeButton.title='Place an office on constructed floor space';officeButton.addEventListener('click',()=>{tools.get('inspect')!.click();enabled=true;tools.get('inspect')!.setAttribute('aria-pressed','false');officeButton.setAttribute('aria-pressed','true');tool.propose(floor.valueAsNumber,x.valueAsNumber);redraw();},{signal});
 canvas.addEventListener('pointerup',e=>{if(e.shiftKey||e.button!==0)return;const rect=canvas.getBoundingClientRect(),point={x:e.clientX-rect.left,y:e.clientY-rect.top},world=camera.screenToWorld(point),view=session.world(camera.bounds());if(enabled){floor.value=String(Math.floor(world.y));x.value=String(Math.floor(world.x));tool.propose(floor.valueAsNumber,x.valueAsNumber);}else if(tools.get('inspect')!.getAttribute('aria-pressed')==='true'){const id=selectOccupant(view,camera,point);if(id)selectedPerson=id;else selected=view.offices.find(o=>o.floor===Math.floor(world.y)&&world.x>=o.x&&world.x<o.x+o.width)?.id??selected;}redraw();},{signal});
 canvas.ownerDocument.addEventListener('keydown',e=>{if(e.key==='Escape'){enabled=false;tool.cancel();tools.get('inspect')!.setAttribute('aria-pressed','true');tools.get('office.small')!.setAttribute('aria-pressed','false');redraw();}},{signal});
 /** Refresh truthful small projections and display the current logical quoted footprint. */
 function draw():void {const q=tool.preview();commit.disabled=!q?.ok;if(enabled&&q){quote.textContent=`${q.ok?'Valid office':q.message??q.code} · ${q.quote?constructionQuote(q.quote):''}`;const f=q.quote?.footprint;if(f){const a=camera.worldToScreen({x:f.startX,y:f.floor}),b=camera.worldToScreen({x:f.endXExclusive,y:f.floor+1}),ctx=renderer.overlayContext();ctx.strokeStyle=q.ok?'#80efc0':'#ff997d';ctx.lineWidth=2;ctx.strokeRect(a.x,b.y,b.x-a.x,a.y-b.y);}}
 const now=performance.now(),selection=`${selected}:${selectedPerson}`,topology=session.topologyRevision(),speed=session.hud().speed;
 if(now-lastInspection<100&&selection===lastSelection&&topology===lastTopology&&speed===lastSpeed)return;lastInspection=now;lastSelection=selection;lastTopology=topology;lastSpeed=speed;
 const o=selected?session.inspectOffice(selected):null;demolish.disabled=!o;info.textContent=o?`${o.id} · ${o.tenancy} · Assigned ${o.assigned} · Present ${o.present}. Scheduled ${o.workforce.scheduled}, skipped ${o.workforce.skipped}, canceled ${o.workforce.canceled}; completed arrivals ${o.workforce.completedArrivals}. Arrivals ${timeOfDay(o.workforce.windows!.arrivalStart)}–${timeOfDay(o.workforce.windows!.arrivalEnd)}; departures ${timeOfDay(o.workforce.windows!.departureStart)}–${timeOfDay(o.workforce.windows!.departureEnd)}. ${accessStatus(o.access)} ${o.rentSuspended?'Rent suspended.':o.vacancyReason+'.'} Rent ${money(o.rentMinorPerDay)}/day; cost ${money(o.operatingMinorPerDay)}/day. Accrued rent ${money(o.accrued.incomeMinor)}, costs ${money(o.accrued.costMinor)}. Recent rent ${money(o.recentIncomeMinor)}. Market ${o.availableMarket} workers; next review day ${Math.floor(o.nextReviewTick/86400)+1} ${timeOfDay(o.nextReviewTick%86400)}. Removal is free; settles ${money(o.accrued.incomeMinor-o.accrued.costMinor)}.`:'Click an office to inspect tenancy and attendance.';person.update(selectedPerson?session.inspectOccupant(selectedPerson):null);}
 /** Clear selections and proposals when a new session replaces the current tower. */
 function reset():void {enabled=false;selected=selectedPerson=null;tool.cancel();}
 return {node,draw,reset};
}
