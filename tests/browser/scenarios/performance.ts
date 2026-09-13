import { createGameView } from '../../../src/ui/game-view';
import type { MountOptions } from '../../../src/main';
import type { GameSession } from '../../../src/app/game/session';
import { FrameDriver,browserClock } from '../../../src/platform/frame-driver';
import { IndexedDbSaveRepository } from '../../../src/persistence/indexeddb-save-repository';

/** Observe ordinary rendered frames/actions without injecting commands, changing time or editing fixture state. */
export function performanceRecorder(root:HTMLElement):Pick<MountOptions,'driver'|'view'> {
 const clock=browserClock(),driver=new FrameDriver(clock),repository=new IndexedDbSaveRepository();let session:GameSession|null=null;
 const node=document.createElement('details'),summary=document.createElement('summary'),start=document.createElement('button'),stop=document.createElement('button'),output=document.createElement('textarea');
 summary.textContent='Prepared performance recorder — release qualification remains separate';start.textContent='Start 10-minute recording';stop.textContent='Stop and show JSON';output.setAttribute('aria-label','Performance observations JSON');output.rows=8;node.append(summary,start,stop,output);root.before(node);
 let started:number|null=null,windowStart=0,startTick=0,frames=0,speed=0,generation=0,hidden=0,overflow=false;
 const intervals:{elapsedMs:number;durationMs:number;fps:number;ticksPerSecond:number;speed:number;debt:number}[]=[],actions:{label:string;durationMs:number}[]=[],storage:{label:string;durationMs:number;result:string}[]=[];
 let pendingStorage:{label:string;at:number}|null=null;
 /** Finish with complete-window samples and explicit artifact/scope metadata, retaining no unbounded history. */
 function finish():void {if(started===null)return;const elapsedMs=clock.now()-started;started=null;const normal=intervals.filter(i=>i.speed===1);output.value=JSON.stringify({artifactKind:'prepared-production',userAgent:navigator.userAgent,viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},elapsedMs,hiddenInterruptions:hidden,overflow,intervals,actions,storage,normalFpsPassFraction:normal.length?normal.filter(i=>i.fps>=30).length/normal.length:null,qualification:'Unqualified: attach artifact hashes and hardware; repeat required release/same-origin exercise. UI response samples run from event capture to next delivered game draw.'},null,2);}
 start.addEventListener('click',()=>{if(!session)return;intervals.length=actions.length=storage.length=0;started=windowStart=clock.now();startTick=session.hud().tick;speed=session.hud().speed;generation=session.pacingStatus().generation;frames=hidden=0;overflow=false;});stop.addEventListener('click',finish);
 const pendingActions:{label:string;at:number}[]=[];
 root.addEventListener('click',event=>{if(started===null||!(event.target instanceof HTMLElement))return;const label=event.target.closest('button,select,summary,a')?.textContent?.slice(0,100);if(!label)return;if(actions.length+pendingActions.length<2000)pendingActions.push({label,at:clock.now()});else overflow=true;if(label==='Save'||label==='Load')pendingStorage={label,at:clock.now()};},{capture:true});
 const observer=new MutationObserver(()=>{if(started===null||!pendingStorage)return;const text=[...root.querySelectorAll('[role="status"]')].map(n=>n.textContent).join(' ');if(/Saved tick|Loaded tick|failed|Unable|canceled/i.test(text)){storage.push({...pendingStorage,durationMs:clock.now()-pendingStorage.at,result:text});pendingStorage=null;}});observer.observe(root,{subtree:true,childList:true,characterData:true});
 document.addEventListener('visibilitychange',()=>{if(started!==null){hidden++;windowStart=clock.now();frames=0;startTick=session?.hud().tick??0;}});
 return {view:(host,current,replaced)=>{session=current;return createGameView(host,current,repository,replaced);},driver:{start:callback=>driver.start(timestamp=>{
  callback(timestamp);if(started===null||!session)return;const now=clock.now(),hud=session.hud(),pacing=session.pacingStatus();
  for(const action of pendingActions.splice(0))actions.push({label:action.label,durationMs:now-action.at});
  if(speed!==hud.speed||generation!==pacing.generation){speed=hud.speed;generation=pacing.generation;windowStart=now;startTick=hud.tick;frames=0;return;}
  frames++;const durationMs=now-windowStart;if(durationMs>=1000&&!document.hidden){intervals.push({elapsedMs:now-started,durationMs,fps:frames*1000/durationMs,ticksPerSecond:(hud.tick-startTick)*1000/durationMs,speed,debt:pacing.debt});windowStart=now;startTick=hud.tick;frames=0;}
  if(now-started>=600000)finish();
 })}};
}
