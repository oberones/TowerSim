import type { GameSession } from '../app/game/session';
import type { Camera } from '../rendering/camera/camera';
import type { Renderer } from '../rendering/canvas/renderer';
import { createRoomPlacement } from './room-placement';
import { bindCanvasClick } from '../input/canvas-click';
import { element,button,money,timeOfDay } from './elements';
import { accessStatus } from './access-status';
/** Bind room placement and inspection to the same validated commands and physical customer queries as headless play. */
export function createRestaurantPanel(session:GameSession,canvas:HTMLCanvasElement,camera:Camera,renderer:Renderer,tools:Map<string,HTMLButtonElement>,redraw:()=>void,signal:AbortSignal,onInspect:()=>void=()=>{}){
 const node=element('section','','construction-panel'),select=element('select'),quote=element('p'),info=element('p');let selected='',revision=-1,last=-Infinity;
 node.append(element('h2','Restaurant'));select.setAttribute('aria-label','Selected restaurant');
 const placement=createRoomPlacement(session,canvas,camera,renderer,tools,'restaurant.small','Restaurant',redraw,signal);
 const remove=button('Remove selected restaurant',()=>{if(!selected)return;const r=session.dispatch({kind:'demolishEntity',payload:{entityId:selected}});quote.textContent=r.ok?'Room removed; customers attempt a real exit. Earned payments are retained.':r.message??r.code;if(r.ok){selected='';placement.reset();}redraw();});node.append(select,info,remove,quote);
 select.addEventListener('change',()=>{selected=select.value;last=-Infinity;redraw();},{signal});
 bindCanvasClick(canvas,camera,at=>{if(tools.get('inspect')!.getAttribute('aria-pressed')!=='true')return;const room=session.world(camera.bounds()).restaurants.find(r=>r.floor===Math.floor(at.y)&&at.x>=r.x&&at.x<r.x+r.width);if(room){selected=room.id;onInspect();last=-Infinity;redraw();}},signal);
 /** Refresh selected-room counts at a bounded cadence and keep construction quotes current. */
 function draw():void {placement.draw();
 const now=performance.now(),next=session.topologyRevision();if(next!==revision){select.replaceChildren();const none=element('option','Choose a restaurant');none.value='';select.append(none);for(const r of session.world().restaurants){const option=element('option',`${r.id} · floor ${r.floor}`);option.value=r.id;select.append(option);}revision=next;last=-Infinity;}select.value=selected;
 if(now-last<100)return;last=now;const r=selected?session.inspectRestaurant(selected):null;remove.disabled=!r;
 info.textContent=r?`${r.id} · Expected ${r.expected}; remaining requests ${r.remaining}; incoming ${r.incoming}; inside ${r.inside}. Visits today ${r.todayVisits}, lifetime ${r.visits}; earned revenue ${money(r.revenueMinor)} at ${money(r.visitPriceMinor)} per admission. ${accessStatus(r.access)} Cost ${money(r.operatingMinorPerDay)}/day; pending ${money(r.accrued.costMinor)}. ${r.awaitingReview?'No customers allocated to this room today. ':''}All restaurants share ${r.allowance} daily customers; adding a room does not increase demand. Next review day ${Math.floor(r.nextReviewTick/86400)+1} ${timeOfDay(r.nextReviewTick%86400)}. Meal requests ${timeOfDay(r.meal.mealStart)}–${timeOfDay(r.meal.mealEnd)} (${r.meal.mealShareBasisPoints/100}%); visits last ${r.meal.visitMinTicks/60}–${r.meal.visitMaxTicks/60} minutes after admission. Free removal settles ${money(-r.accrued.costMinor)}.`:'Choose or click a restaurant to inspect customers and payments.';
 }
 /** Clear stale selection and proposals after replacing the active game. */
 function reset():void {placement.reset();selected='';revision=-1;last=-Infinity;}
 return {node,draw,reset};
}
