import { createRoomPlacement } from './room-placement';
import { bindCanvasClick } from '../input/canvas-click';
import { accessStatus } from './access-status';
import type { GameSession } from '../app/game/session';
import type { Camera } from '../rendering/camera/camera';
import type { Renderer } from '../rendering/canvas/renderer';
import { selectOccupant } from '../input/occupant-selection';
import { createOccupantInspector } from './occupant-inspector';
import { element,button,money,timeOfDay } from './elements';
/** Bind office placement, free demolition and persistent person selection to ordinary application controls. */
export function createOfficePanel(session:GameSession,canvas:HTMLCanvasElement,camera:Camera,renderer:Renderer,tools:Map<string,HTMLButtonElement>,redraw:()=>void,signal:AbortSignal,onInspect:()=>void=()=>{}){
 let lastInspection=-Infinity,lastSelection='',lastTopology=-1,lastSpeed=-1;
 const node=element('section','','construction-panel'),person=createOccupantInspector();let selected:string|null=null,selectedPerson:string|null=null;
 const select=element('select');select.setAttribute('aria-label','Selected office');let choiceRevision=-1;select.addEventListener('change',()=>{selected=select.value||null;lastInspection=-Infinity;redraw();},{signal});
 const totals=element('p'),quote=element('p'),info=element('p','Click an office to inspect tenancy and attendance.');
 const placement=createRoomPlacement(session,canvas,camera,renderer,tools,'office.small','Office',redraw,signal);
 const demolish=button('Remove selected office',()=>{if(!selected)return;const r=session.dispatch({kind:'demolishEntity',payload:{entityId:selected}});if(r.ok)selected=null;else quote.textContent=r.message??r.code;redraw();});demolish.disabled=true;
 node.append(element('h2','Office & people'),totals,select,info,demolish,quote,person.node);
 bindCanvasClick(canvas,camera,(world,point)=>{if(tools.get('inspect')!.getAttribute('aria-pressed')!=='true')return;const view=session.world(camera.bounds()),id=selectOccupant(view,camera,point),office=view.offices.find(o=>o.floor===Math.floor(world.y)&&world.x>=o.x&&world.x<o.x+o.width);if(id){selectedPerson=id;onInspect();}else if(office){selected=office.id;selectedPerson=null;onInspect();}redraw();},signal);
 /** Refresh truthful small projections and display the current logical quoted footprint. */
 function draw():void {if(choiceRevision!==session.topologyRevision()){choiceRevision=session.topologyRevision();select.replaceChildren();const none=element('option','Choose an office');none.value='';select.append(none);for(const office of session.world().offices){const option=element('option',`${office.id} · floor ${office.floor}`);option.value=office.id;select.append(option);}}select.value=selected??'';placement.draw();
 const now=performance.now(),selection=`${selected}:${selectedPerson}`,topology=session.topologyRevision(),speed=session.hud().speed;
 if(now-lastInspection<100&&selection===lastSelection&&topology===lastTopology&&speed===lastSpeed)return;lastInspection=now;lastSelection=selection;lastTopology=topology;lastSpeed=speed;
 const workforce=session.workforce();totals.textContent=`Tower workforce: ${workforce.assigned} assigned · ${workforce.present} present.`;const o=selected?session.inspectOffice(selected):null;demolish.disabled=!o;info.textContent=o?`${o.id} · ${o.tenancy} · Assigned ${o.assigned} · Present ${o.present}. Scheduled ${o.workforce.scheduled}, skipped ${o.workforce.skipped}, canceled ${o.workforce.canceled}; completed arrivals ${o.workforce.completedArrivals}. Arrivals ${timeOfDay(o.workforce.windows!.arrivalStart)}–${timeOfDay(o.workforce.windows!.arrivalEnd)}; departures ${timeOfDay(o.workforce.windows!.departureStart)}–${timeOfDay(o.workforce.windows!.departureEnd)}. ${accessStatus(o.access)} ${o.rentSuspended?'Rent suspended.':o.vacancyReason+'.'} Rent ${money(o.rentMinorPerDay)}/day; cost ${money(o.operatingMinorPerDay)}/day. Accrued rent ${money(o.accrued.incomeMinor)}, costs ${money(o.accrued.costMinor)}. Recent rent ${money(o.recentIncomeMinor)}. Market ${o.availableMarket} workers; next review day ${Math.floor(o.nextReviewTick/86400)+1} ${timeOfDay(o.nextReviewTick%86400)}. Removal is free; settles ${money(o.accrued.incomeMinor-o.accrued.costMinor)}.`:'Click an office to inspect tenancy and attendance.';person.update(selectedPerson?session.inspectOccupant(selectedPerson):null);}
 /** Clear selections and proposals when a new session replaces the current tower. */
 function reset():void {choiceRevision=-1;selected=selectedPerson=null;placement.reset();}
 return {node,draw,reset};
}
