import { element,button } from './elements';
export interface ManagementEntry {id:string;label:string;node:HTMLElement}
/** Keep reports and inspectors out of the build palette until explicitly opened or selected on Canvas. */
export function createManagementPanel(entries:ManagementEntry[],redraw:()=>void){
 const node=element('section','','management-panel'),heading=element('h2','Tower details'),tabs=element('div','','management-tabs'),body=element('div','','management-body');
 node.hidden=true;node.id='tower-details';node.setAttribute('aria-label','Tower details');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Reports and inspectors');
 const toggle=button('Tower details',()=>{if(node.hidden)open(active,true);else close();});toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls',node.id);
 const dismiss=button('Close details',close);dismiss.className='close-details';node.append(heading,dismiss,tabs,body);let active=entries[0]!.id;
 const buttons=new Map<string,HTMLButtonElement>();
 for(const entry of entries){
  const tab=button(entry.label,()=>open(entry.id));tab.id=`tab-${entry.id}`;tab.setAttribute('role','tab');tab.setAttribute('aria-controls',`panel-${entry.id}`);buttons.set(entry.id,tab);tabs.append(tab);
  const wrapper=element('div');wrapper.id=`panel-${entry.id}`;wrapper.setAttribute('role','tabpanel');wrapper.setAttribute('aria-labelledby',tab.id);wrapper.hidden=true;wrapper.append(entry.node);body.append(wrapper);
  tab.addEventListener('keydown',event=>{const index=entries.indexOf(entry);let next:number;if(event.key==='ArrowRight')next=(index+1)%entries.length;else if(event.key==='ArrowLeft')next=(index+entries.length-1)%entries.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=entries.length-1;else return;event.preventDefault();open(entries[next]!.id,true);});
 }
 node.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}});
 /** Reveal exactly one tab and its existing live controls, preserving selections across dismissal. */
 function open(id:string,focus=false):void {
  if(!buttons.has(id))return;active=id;node.hidden=false;toggle.setAttribute('aria-expanded','true');
  for(const entry of entries){const selected=entry.id===id,tab=buttons.get(entry.id)!;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;entry.node.parentElement!.hidden=!selected;if(entry.node.tagName==='DETAILS')(entry.node as HTMLDetailsElement).open=selected;}
  if(focus)buttons.get(id)!.focus();redraw();
 }
 /** Hide the whole information surface and restore keyboard focus only when it was inside. */
 function close():void {const restore=node.contains(document.activeElement);node.hidden=true;toggle.setAttribute('aria-expanded','false');for(const entry of entries)if(entry.node.tagName==='DETAILS')(entry.node as HTMLDetailsElement).open=false;if(restore)toggle.focus();}
 return {node,toggle,open,close};
}
