import {afterEach,expect,test,vi} from 'vitest';
import {createManagementPanel} from '../../src/ui/management-panel';
import {UiElement,uiDocument} from '../fixtures/ui-element';
afterEach(()=>vi.unstubAllGlobals());
test('reports start hidden, display one tab at a time, and retain their active tab after dismissal',()=>{
 vi.stubGlobal('document',uiDocument);const finance=new UiElement('details'),traffic=new UiElement('details'),refresh=vi.fn();
 const panel=createManagementPanel([{id:'finance',label:'Finances',node:finance as unknown as HTMLElement},{id:'traffic',label:'Traffic',node:traffic as unknown as HTMLElement}],refresh);
 expect(panel.node.hidden).toBe(true);panel.toggle.click();expect(panel.node.hidden).toBe(false);expect(finance.open).toBe(true);expect(traffic.parentElement!.hidden).toBe(true);
 panel.open('traffic',true);expect(finance.open).toBe(false);expect(finance.parentElement!.hidden).toBe(true);expect(traffic.open).toBe(true);
 panel.close();expect(panel.node.hidden).toBe(true);expect(traffic.open).toBe(false);expect(uiDocument.activeElement).toBe(panel.toggle);
 panel.toggle.click();expect(traffic.open).toBe(true);expect(finance.parentElement!.hidden).toBe(true);expect(refresh).toHaveBeenCalledTimes(3);
});
test('keyboard tab navigation and Escape retain native focus semantics',()=>{
 vi.stubGlobal('document',uiDocument);const panel=createManagementPanel(['finance','traffic'].map(id=>({id,label:id,node:new UiElement('section') as unknown as HTMLElement})),()=>{});
 panel.open('finance',true);const event=new Event('keydown',{cancelable:true});Object.assign(event,{key:'ArrowRight'});uiDocument.activeElement!.dispatchEvent(event);
 expect(uiDocument.activeElement!.id).toBe('tab-traffic');expect(event.defaultPrevented).toBe(true);
 const escape=new Event('keydown',{cancelable:true});Object.assign(escape,{key:'Escape'});panel.node.dispatchEvent(escape);expect(panel.node.hidden).toBe(true);expect(uiDocument.activeElement).toBe(panel.toggle);
});
