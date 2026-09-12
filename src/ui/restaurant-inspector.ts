import type { GameSession } from '../app/game/session';
import type { Camera } from '../rendering/camera/camera';
import type { Renderer } from '../rendering/canvas/renderer';
import { FacilityTool } from '../input/facility-tool';
import { element,button,money,timeOfDay } from './elements';
import { accessStatus } from './access-status';
import { constructionQuote } from './construction-quote';
/** Bind room placement and inspection to the same validated commands and physical customer queries as headless play. */
export function createRestaurantPanel(session:GameSession,canvas:HTMLCanvasElement,camera:Camera,renderer:Renderer,tools:Map<string,HTMLButtonElement>,redraw:()=>void,signal:AbortSignal){
 const node=element('section','','construction-panel'),tool=new FacilityTool(session,'restaurant.small'),floor=element('input'),x=element('input'),select=element('select'),quote=element('p'),info=element('p');let enabled=false,selected='',revision=-1,last=-Infinity;
 node.append(element('h2','Restaurant'));floor.type=x.type='number';floor.step=x.step='1';floor.value='0';x.value='48';select.setAttribute('aria-label','Selected restaurant');
 for(const [name,input] of [['Restaurant floor',floor],['Restaurant start cell',x]] as const){const label=element('label','','form-field');label.append(element('span',name),input);node.append(label);input.addEventListener('input',()=>{if(enabled)tool.propose(floor.valueAsNumber,x.valueAsNumber);redraw();},{signal});}
 const commit=button('Place restaurant',()=>{const r=tool.commit();quote.textContent=r.ok?'Restaurant built. Customer allocation begins at the next 06:00 review.':r.message??r.code;resetProposal();redraw();});
 const remove=button('Remove selected restaurant',()=>{if(!selected)return;const r=session.dispatch({kind:'demolishEntity',payload:{entityId:selected}});quote.textContent=r.ok?'Room removed; customers attempt a real exit. Earned payments are retained.':r.message??r.code;if(r.ok){selected='';resetProposal();}redraw();});node.append(quote,commit,select,info,remove);
 /** Cancel the logical proposal while retaining selection and physical state. */
 function resetProposal():void {enabled=false;tool.cancel();tools.get('restaurant.small')!.setAttribute('aria-pressed','false');tools.get('inspect')!.setAttribute('aria-pressed','true');}
 const b=tools.get('restaurant.small')!;b.disabled=false;b.title='Build a restaurant with finite daily meal demand';b.addEventListener('click',()=>{tools.get('inspect')!.click();enabled=true;b.setAttribute('aria-pressed','true');tools.get('inspect')!.setAttribute('aria-pressed','false');tool.propose(floor.valueAsNumber,x.valueAsNumber);redraw();},{signal});
 for(const id of ['floor','demolish','inspect','office.small','stairs.basic','elevator.standard'])tools.get(id)!.addEventListener('click',()=>{enabled=false;tool.cancel();b.setAttribute('aria-pressed','false');},{signal});
 select.addEventListener('change',()=>{selected=select.value;last=-Infinity;redraw();},{signal});
 canvas.addEventListener('pointerup',e=>{if(e.shiftKey||e.button!==0)return;const rect=canvas.getBoundingClientRect(),at=camera.screenToWorld({x:e.clientX-rect.left,y:e.clientY-rect.top});if(enabled){floor.value=String(Math.floor(at.y));x.value=String(Math.floor(at.x));tool.propose(floor.valueAsNumber,x.valueAsNumber);}else if(tools.get('inspect')!.getAttribute('aria-pressed')==='true')selected=session.world(camera.bounds()).restaurants.find(r=>r.floor===Math.floor(at.y)&&at.x>=r.x&&at.x<r.x+r.width)?.id??selected;last=-Infinity;redraw();},{signal});
 /** Refresh selected-room counts at a bounded cadence and keep construction quotes current. */
 function draw():void {const q=tool.preview();commit.disabled=!enabled||!q?.ok;if(enabled&&q){quote.textContent=`${q.ok?'Valid restaurant':q.message??q.code} · ${q.quote?constructionQuote(q.quote):''}`;const f=q.quote?.footprint;if(f){const a=camera.worldToScreen({x:f.startX,y:f.floor}),b=camera.worldToScreen({x:f.endXExclusive,y:f.floor+1}),ctx=renderer.overlayContext();ctx.strokeStyle=q.ok?'#80efc0':'#ff997d';ctx.strokeRect(a.x,b.y,b.x-a.x,a.y-b.y);}}
 const now=performance.now(),next=session.topologyRevision();if(next!==revision){select.replaceChildren();const none=element('option','Choose a restaurant');none.value='';select.append(none);for(const r of session.world().restaurants){const option=element('option',`${r.id} · floor ${r.floor}`);option.value=r.id;select.append(option);}revision=next;last=-Infinity;}select.value=selected;
 if(now-last<100)return;last=now;const r=selected?session.inspectRestaurant(selected):null;remove.disabled=!r;
 info.textContent=r?`${r.id} · Expected ${r.expected}; remaining requests ${r.remaining}; incoming ${r.incoming}; inside ${r.inside}. Visits today ${r.todayVisits}, lifetime ${r.visits}; earned revenue ${money(r.revenueMinor)} at ${money(r.visitPriceMinor)} per admission. ${accessStatus(r.access)} Cost ${money(r.operatingMinorPerDay)}/day; pending ${money(r.accrued.costMinor)}. ${r.awaitingReview?'No customers allocated to this room today. ':''}All restaurants share ${r.allowance} daily customers; adding a room does not increase demand. Next review day ${Math.floor(r.nextReviewTick/86400)+1} ${timeOfDay(r.nextReviewTick%86400)}. Meal requests ${timeOfDay(r.meal.mealStart)}–${timeOfDay(r.meal.mealEnd)} (${r.meal.mealShareBasisPoints/100}%); visits last ${r.meal.visitMinTicks/60}–${r.meal.visitMaxTicks/60} minutes after admission. Free removal settles ${money(-r.accrued.costMinor)}.`:'Choose or click a restaurant to inspect customers and payments.';
 }
 /** Clear stale selection and proposals after replacing the active game. */
 function reset():void {resetProposal();selected='';revision=-1;last=-Infinity;}
 return {node,draw,reset};
}
