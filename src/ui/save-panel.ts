import type { GameSession } from '../app/game/session';
import type { SaveRepository } from '../app/ports/save-repository';
import { SaveWorkflow } from '../app/game/save-workflow';
import { element,button } from './elements';
/** Connect explicit storage actions and a validated-candidate replacement dialog to the application workflow. */
export function createSavePanel(session:GameSession,repository:SaveRepository,replaced:()=>void){const workflow=new SaveWorkflow(session,repository),node=element('section'),status=element('p'),dialog=element('dialog'),description=element('p');status.setAttribute('role','status');dialog.setAttribute('aria-label','Replace tower with local save');let answer:((value:boolean)=>void)|null=null;if(!session.hud().unsaved)workflow.message=`Loaded tick ${session.hud().tick}, paused. Resume when ready.`;
 /** Resolve each replacement choice once; Escape and Cancel keep the current tower. */
 function decide(value:boolean):void {dialog.close();const resolve=answer;answer=null;resolve?.(value);}
 const cancel=button('Cancel load',()=>decide(false)),replace=button('Discard unsaved progress & load',()=>decide(true));dialog.append(element('h2','Load saved tower?'),description,cancel,replace);dialog.addEventListener('cancel',event=>{event.preventDefault();decide(false);});
 /** Pause only after successful validation, so the replacement choice describes a stable revision. */
 function confirm(tick:number):Promise<boolean> {session.setSpeed(0);description.textContent=`Replace unsaved progress with saved tick ${tick}? Your local save will be left intact.`;return new Promise(resolve=>{answer=resolve;dialog.showModal();cancel.focus();});}
 const save=button('Save',()=>{void workflow.save().then(draw);draw();}),load=button('Load',()=>{void workflow.load(confirm).then(loaded=>{if(loaded)replaced();draw();});draw();});node.append(save,load,status,dialog);
 /** Refresh operation status without blocking ordinary play, controls, or subsequent retries. */
 function draw():void {save.disabled=workflow.busy;load.disabled=workflow.busy;status.textContent=workflow.message;}
 draw();return {node,draw,get busy(){return workflow.busy;},dispose:()=>decide(false)};}
