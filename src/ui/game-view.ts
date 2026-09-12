import { createManagementPanel } from './management-panel';
import { bindCameraNavigation } from '../input/camera-navigation';
import { bindKeyboard } from '../input/keyboard';
import { createOnboarding } from './onboarding';
import { createSavePanel } from './save-panel';
import type { SaveRepository } from '../app/ports/save-repository';
import { createProgressionPanel } from './progression-panel';
import { createRestaurantPanel } from './restaurant-inspector';
import { createFinancePanel } from './finance-panel';
import { createTrafficPanel } from './traffic-panel';
import { createTransportPanel } from './transport-panel';
import { createOfficePanel } from './office-inspector';
import { createConstructionPanel } from './construction-panel';
import type { GameSession } from '../app/game/session';
import type { PlayableScenario } from '../simulation';
import type { Speed } from '../app/game/pacing';
import { Camera } from '../rendering/camera/camera';
import { Renderer } from '../rendering/canvas/renderer';
import { createHud } from './hud';
import { createToolbar } from './toolbar';
import { element, button, money, timeOfDay } from './elements';
import { newSeed } from '../platform/seed';
export interface GameView {draw:()=>void;dispose:()=>void}
/** Compose the ordinary player UI; all commands go through the application session. */
export function createGameView(root:HTMLElement,session:GameSession,repository:SaveRepository,onReplaced:()=>void):GameView {
  const scenario=session.capture().scenario as PlayableScenario;const controller=new AbortController();const signal=controller.signal;
  const header=element('header'),brand=element('div');brand.append(element('p','A VERTICAL CITY IN THE MAKING','eyebrow'),element('h1','TowerSim'));
  const hud=createHud(session);header.append(brand,hud.node);
  const workspace=element('div','','workspace'),aside=element('aside'),stage=element('section','','stage');stage.setAttribute('aria-label','Tower view');
  const toolbar=createToolbar(scenario);aside.append(toolbar.node);
  const controls=element('nav','','time-controls');controls.setAttribute('aria-label','Time controls');const speedButtons=new Map<Speed,HTMLButtonElement>();
  for(const [speed,label] of [[0,'Pause'],[1,'Normal 1×'],[4,'Fast 4×'],[8,'Very fast 8×']] as const){const b=button(label,()=>{session.setSpeed(speed);refresh();});speedButtons.set(speed,b);controls.append(b);}
  const canvas=element('canvas');canvas.tabIndex=0;canvas.setAttribute('aria-label','Tower site. Select Floor and drag a span, then Commit span. Shift-drag or scroll to pan vertically; use the Zoom in and Zoom out buttons to zoom. Rooms and connections: click the tower, drag the preview into position, then confirm.');
  const viewport=element('div','','viewport');viewport.append(canvas);
  const status=element('p',`Tower ready, paused at ${session.hud().time}.`,'status');status.setAttribute('role','status');
  const navigation=element('div','','camera-controls');
  const camera=new Camera(900,600,1),renderer=new Renderer(canvas,camera);
  navigation.append(button('Zoom in',()=>{camera.zoomAt(1.25,{x:camera.width/2,y:camera.height/2});draw();}),button('Zoom out',()=>{camera.zoomAt(0.8,{x:camera.width/2,y:camera.height/2});draw();}),button('Reset view',()=>{camera.fit(scenario.world.widthCells,scenario.world.groundFloor);draw();}));
  const instructions=element('p','F: Floor · D: Demolish · I: Inspect · Esc: Cancel · Drag to choose span · Shift-drag / scroll: vertical pan · Up/down arrows: vertical pan · Zoom with buttons','muted');
  stage.append(controls,viewport,navigation,status,instructions);workspace.append(aside,stage);
  const info=element('details'),details=element('div'),seed=element('p','','seed');details.append(seed);info.append(element('summary','Scenario prices, schedules & targets'),details);
  details.append(element('p',`Site: ${scenario.world.widthCells} cells · floors ${scenario.world.minFloor}–${scenario.world.maxFloor}. Starting funds ${money(scenario.startingFundsMinor)}. Normal time: 120 simulated seconds per real second.`));
  for(const d of scenario.content.definitions)details.append(element('p',`${d.displayName}: width ${d.footprint.width}, build ${money(d.constructionCostMinor)}${d.perFloorCostMinor?` + ${money(d.perFloorCostMinor)} per floor`:''}, operation ${money(d.operatingMinorPerDay)}/day${d.rentMinorPerDay?`, rent ${money(d.rentMinorPerDay)}/day`:''}${d.visitPriceMinor?`, ${money(d.visitPriceMinor)} per admitted visit`:''}.`));
  details.append(element('p',`Daily demand: ${scenario.content.officeMarketWorkers} office workers, ${scenario.content.restaurantDailyCustomers} restaurant customers/day. Office arrivals ${timeOfDay(scenario.content.schedules.office.arrivalStart)}–${timeOfDay(scenario.content.schedules.office.arrivalEnd)}, departures ${timeOfDay(scenario.content.schedules.office.departureStart)}–${timeOfDay(scenario.content.schedules.office.departureEnd)}. Restaurant meal wave ${timeOfDay(scenario.content.schedules.restaurant.mealStart)}–${timeOfDay(scenario.content.schedules.restaurant.mealEnd)} (${scenario.content.schedules.restaurant.mealShareBasisPoints/100}% of requests); visits ${scenario.content.schedules.restaurant.visitMinTicks/60}–${scenario.content.schedules.restaurant.visitMaxTicks/60} minutes.`));
  details.append(element('p',`Level 2 target: ${scenario.content.level2.offices} accessible leased offices, ${scenario.content.level2.workers} workers for a full day; ${scenario.content.level2.restaurants} accessible restaurant, ${scenario.content.level2.visits} visits; cash ≥ ${money(scenario.content.level2.minimumCashMinor)}, positive operating net, quality ≥ ${scenario.content.level2.quality}, ${scenario.content.level2.completedOfficeArrivals} completed arrivals and no stranded people or unresolved prior-day trips.`));
  const actions=element('section','','session-actions');const newGame=button('New Game',()=>{dialog.showModal();cancel.focus();});
  const saves=createSavePanel(session,repository,onReplaced);actions.append(newGame,saves.node);
  const dialog=element('dialog');dialog.setAttribute('aria-label','Start a new tower');dialog.append(element('h2','Start a new tower?'),element('p','Discard this unsaved tower and start paused at 06:00. Your local save will be left alone.'));
  dialog.addEventListener('close',()=>newGame.focus(),{signal});
  const cancel=button('Cancel',()=>dialog.close());const discard=button('Discard & start',()=>{session.replace({scenario,seed:newSeed()},true);renderer.invalidate();construction.reset();offices.reset();restaurants.reset();transport.reset();traffic.reset();camera.fit(scenario.world.widthCells,scenario.world.groundFloor);dialog.close();status.textContent='New tower started, paused at 06:00.';refresh();});dialog.append(cancel,discard);
  root.replaceChildren(header,createOnboarding(),workspace,actions,info,dialog);
  let lastHud=-Infinity;
  const construction=createConstructionPanel(root,session,canvas,camera,renderer,toolbar.tools,status,refresh,signal,()=>management.open('build'));
  const offices=createOfficePanel(session,canvas,camera,renderer,toolbar.tools,refresh,signal,()=>management.open('offices'));
  const transport=createTransportPanel(session,canvas,camera,renderer,toolbar.tools,refresh,signal,()=>management.open('connections'));
  const restaurants=createRestaurantPanel(session,canvas,camera,renderer,toolbar.tools,refresh,signal,()=>management.open('restaurants'));
  const progression=createProgressionPanel(session);
  const finance=createFinancePanel(session);
  const traffic=createTrafficPanel(session,renderer,refresh);
  const management=createManagementPanel([{id:'build',label:'Floors',node:construction.node},{id:'offices',label:'Offices & people',node:offices.node},{id:'connections',label:'Connections',node:transport.node},{id:'restaurants',label:'Restaurants',node:restaurants.node},{id:'progression',label:'Level 2',node:progression.node},{id:'finance',label:'Finances',node:finance.node},{id:'traffic',label:'Traffic',node:traffic.node}],refresh);
  controls.append(management.toggle);stage.append(management.node);
  for(const [id,b] of toolbar.tools)b.addEventListener('click',()=>{if(id==='floor'||id==='demolish')management.open('build');else management.close();},{signal});

  bindKeyboard(root,toolbar.tools,value=>{session.setSpeed(value??(session.hud().speed===0?1:0));refresh();},()=>{construction.cancel();canvas.focus();refresh();},signal);
  /** Draw the current visible world; HUD text has its own bounded refresh cadence. */
  function draw():void {renderer.draw(session.world(camera.bounds()));construction.draw();offices.draw();restaurants.draw();transport.draw();traffic.draw();finance.draw();const now=performance.now();if(now-lastHud>=100){refreshHud();lastHud=now;}}
  /** Refresh named mode buttons and small status labels without replacing focused controls. */
  function refreshHud():void {hud.update();seed.textContent=`Seed ${session.hud().seed}`;progression.draw();saves.draw();newGame.disabled=saves.busy;for(const [speed,b] of speedButtons)b.setAttribute('aria-pressed',String(speed===session.hud().speed));if(session.error)status.textContent=session.error;}
  /** Deliver immediate command feedback and render an updated scene. */
  function refresh():void {refreshHud();draw();}
  /** Match backing pixels to the observed viewport while preserving logical camera/proposals. */
  function resize():void {const rect=viewport.getBoundingClientRect();camera.resize(Math.max(1,rect.width),Math.max(1,rect.height),window.devicePixelRatio||1);draw();}
  bindCameraNavigation(canvas,camera,draw,signal);
  document.addEventListener('visibilitychange',()=>{session.visibility(!document.hidden);refresh();},{signal});
  window.addEventListener('resize',resize,{signal});const observer=new ResizeObserver(resize);observer.observe(viewport);resize();camera.fit(scenario.world.widthCells,scenario.world.groundFloor);session.visibility(!document.hidden);refresh();
  return {draw,dispose:()=>{controller.abort();saves.dispose();observer.disconnect();root.replaceChildren();}};
}
