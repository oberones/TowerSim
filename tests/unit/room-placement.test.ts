import {afterEach,expect,test,vi} from 'vitest';
import {createRoomPlacement} from '../../src/ui/room-placement';
import {Camera} from '../../src/rendering/camera/camera';
import {UiElement,uiDocument} from '../fixtures/ui-element';
import {MVP_DEFAULT} from '../../src/content/scenarios/mvp-default';
import type {GameSession} from '../../src/app/game/session';
import type {Renderer} from '../../src/rendering/canvas/renderer';
afterEach(()=>vi.unstubAllGlobals());
/** Exercise the two-click flow through actual control listeners and application command boundaries. */
function setup(){
 vi.stubGlobal('document',uiDocument);const viewport=new UiElement('div'),canvas=new UiElement('canvas');viewport.append(canvas);
 const tools=new Map(['inspect','office.small','restaurant.small','floor'].map(id=>[id,new UiElement('button') as unknown as HTMLButtonElement]));
 const preview=vi.fn(()=>({ok:true,code:'ok',quote:{constructionCostMinor:60000}})),dispatch=vi.fn(()=>({ok:true,code:'ok'}));
 const session={preview,dispatch,capture:()=>({scenario:MVP_DEFAULT})} as unknown as GameSession,camera=new Camera(900,600,1),renderer={overlayContext:()=>({save(){},restore(){},fillRect(){},strokeRect(){}})} as unknown as Renderer,controller=new AbortController();
 const office=createRoomPlacement(session,canvas as unknown as HTMLCanvasElement,camera,renderer,tools,'office.small','Office',()=>{},controller.signal);
 const restaurant=createRoomPlacement(session,canvas as unknown as HTMLCanvasElement,camera,renderer,tools,'restaurant.small','Restaurant',()=>{},controller.signal);
 /** Send one primary click to the tower surface. */
 function click():void {for(const type of ['pointerdown','pointerup']){const event=new Event(type);Object.assign(event,{pointerId:1,button:0,shiftKey:false,clientX:400,clientY:500});canvas.dispatchEvent(event);}office.draw();restaurant.draw();}
 return {tools,preview,dispatch,click,office,restaurant,popup:viewport.children[1]!,otherPopup:viewport.children[2]!,camera};
}
test('rooms require a canvas click and explicit confirmation, with no repeated submission',()=>{
 const s=setup();s.tools.get('office.small')!.click();s.office.draw();expect(s.popup.hidden).toBe(true);expect(s.preview).not.toHaveBeenCalled();
 s.click();expect(s.popup.hidden).toBe(false);expect(s.dispatch).not.toHaveBeenCalled();const proposed=s.preview.mock.calls.at(-1);
 s.camera.zoomAt(1.25,{x:300,y:200});s.office.draw();expect(s.preview.mock.calls.at(-1)).toEqual(proposed);
 s.popup.children[1]!.click();expect(s.dispatch).toHaveBeenCalledTimes(1);expect(s.popup.hidden).toBe(true);s.popup.children[1]!.click();expect(s.dispatch).toHaveBeenCalledTimes(1);
});
test('tool switches and cancellation discard uncommitted rooms without charging',()=>{
 const s=setup();s.tools.get('office.small')!.click();s.click();s.tools.get('restaurant.small')!.click();expect(s.popup.hidden).toBe(true);s.click();expect(s.otherPopup.hidden).toBe(false);s.otherPopup.children[2]!.click();expect(s.otherPopup.hidden).toBe(true);expect(s.dispatch).not.toHaveBeenCalled();
 s.tools.get('office.small')!.click();s.click();s.tools.get('floor')!.click();expect(s.popup.hidden).toBe(true);expect(s.dispatch).not.toHaveBeenCalled();
});
test('a newly blocked placement disables confirmation and retains the reason',()=>{
 const s=setup();s.tools.get('office.small')!.click();s.click();s.preview.mockReturnValue({ok:false,code:'overlap',quote:{constructionCostMinor:60000}});s.office.draw();expect(s.popup.children[1]!.disabled).toBe(true);expect(s.popup.children[0]!.textContent).toContain('overlap');s.popup.children[1]!.click();expect(s.dispatch).not.toHaveBeenCalled();
});
