import type { Speed } from '../app/game/pacing';
export interface KeyContext {key:string;editable?:boolean;interactive?:boolean;dialog?:boolean;control?:boolean;repeat?:boolean}
export type KeyAction={kind:'tool';id:string}|{kind:'cancel'}|{kind:'togglePause'}|{kind:'speed';speed:Speed};
/** Resolve app shortcuts without stealing native editing, dialog, modifier or held-key behavior. */
export function keyboardAction(event:KeyContext):KeyAction|null {
 if(event.dialog||event.control||event.repeat)return null;
 if(event.key==='Escape')return {kind:'cancel'};
 if(event.editable)return null;
 const tools:Record<string,string>={f:'floor',d:'demolish',i:'inspect',o:'office.small',r:'restaurant.small',s:'stairs.basic',e:'elevator.standard'};
 const id=tools[event.key.toLowerCase()];if(id)return {kind:'tool',id};
 if(event.key===' '&&!event.interactive)return {kind:'togglePause'};
 const speeds:Record<string,Speed>={'0':0,'1':1,'2':4,'3':8};
 const speed=speeds[event.key];return speed===undefined?null:{kind:'speed',speed};
}
/** Route every tool shortcut through its ordinary button so all other tools cancel consistently. */
export function bindKeyboard(root:HTMLElement,tools:Map<string,HTMLButtonElement>,speed:(value:Speed|null)=>void,cancel:()=>void,signal:AbortSignal):void {
 root.addEventListener('keydown',event=>{
  const target=event.target instanceof Element?event.target:null;
  const action=keyboardAction({key:event.key,repeat:event.repeat,control:event.ctrlKey||event.metaKey||event.altKey,dialog:!!root.querySelector('dialog[open]'),editable:!!target?.closest('input,select,textarea,[contenteditable="true"]'),interactive:!!target?.closest('button,a,summary')});
  if(!action)return;event.preventDefault();
  if(action.kind==='tool')tools.get(action.id)?.click();
  else if(action.kind==='cancel')cancel();
  else speed(action.kind==='togglePause'?null:action.speed);
 },{signal});
}
