import {afterEach,expect,test,vi} from 'vitest';
import {createFloorPlacement} from '../../src/ui/floor-placement';
import {Camera} from '../../src/rendering/camera/camera';
import {validateCommand} from '../../src/simulation';
import {oneWorker,command} from '../fixtures/one-worker';
import {UiElement,uiDocument} from '../fixtures/ui-element';
import type {Renderer} from '../../src/rendering/canvas/renderer';
import type {GameSession} from '../../src/app/game/session';
import type {Command} from '../../src/simulation';
afterEach(()=>vi.unstubAllGlobals());
/** Exercise visible floor controls against actual preview and authoritative command validation. */
function setup(){
 vi.stubGlobal('document',uiDocument);const state=oneWorker(),dispatch=vi.fn((c:Command)=>command(state,c)),preview=vi.fn((c:Command)=>validateCommand(state,{...c,sequence:state.lastCommandSequence+1,atTick:state.clock.tick}));
 const session={dispatch,preview} as unknown as GameSession,canvas=new UiElement('canvas'),viewport=new UiElement('div');viewport.append(canvas);const camera=new Camera(900,600,2),tools=new Map(['inspect','floor','office.small','demolish'].map(id=>[id,new UiElement('button') as unknown as HTMLButtonElement]));
 const renderer={overlayContext:()=>({save(){},restore(){},fillRect(){},strokeRect(){}})} as unknown as Renderer,controller=new AbortController();
 const placement=createFloorPlacement(session,canvas as unknown as HTMLCanvasElement,camera,renderer,tools,()=>{},controller.signal),popup=viewport.children[1]!,left=viewport.children[2]!,right=viewport.children[3]!;
 /** Send one browser-shaped pointer event at a world location. */
 function pointer(target:UiElement,type:string,x:number,floor:number):void {const at=camera.worldToScreen({x,y:floor}),event=new Event(type,{cancelable:true});Object.assign(event,{pointerId:1,button:0,shiftKey:false,clientX:at.x,clientY:at.y});target.dispatchEvent(event);placement.draw();}
 /** Preview the unchanged default span without issuing a command. */
 function drop():void {tools.get('floor')!.click();pointer(canvas,'pointerdown',24.5,1.5);pointer(canvas,'pointerup',24.5,1.5);}
 return {state,dispatch,preview,tools,camera,controller,placement,popup,left,right,pointer,drop};
}
test('floor begins as a default 24-cell preview, with no command before explicit confirmation',()=>{
 const s=setup(),before=JSON.stringify(s.state);s.tools.get('floor')!.click();s.placement.draw();expect(s.popup.hidden).toBe(true);expect(s.preview).not.toHaveBeenCalled();s.drop();expect(s.popup.children[0]!.textContent).toContain('24 cells [24, 48)');expect(s.left.hidden).toBe(false);expect(s.right.hidden).toBe(false);expect(JSON.stringify(s.state)).toBe(before);
 s.popup.children[1]!.click();expect(s.dispatch.mock.calls[0]![0]).toEqual({kind:'constructFloorRange',payload:{floor:1,startX:24,endXExclusive:48}});expect(s.dispatch.mock.results[0]!.value.quote!.constructionCostMinor).toBe(2400);expect(s.popup.hidden).toBe(true);expect(s.left.hidden).toBe(true);expect(s.right.hidden).toBe(true);
});
test('each boundary moves independently and moving the floor keeps its resized width',()=>{
 const s=setup();s.drop();s.pointer(s.left,'pointerdown',24,1.5);s.pointer(s.left,'pointerup',23,1.5);s.pointer(s.right,'pointerdown',48,1.5);s.pointer(s.right,'pointerup',49,1.5);s.placement.draw();expect(s.popup.children[0]!.textContent).toContain('26 cells [23, 49)');
 s.pointer(s.popup.children[3]!,'pointerdown',30,1.5);s.pointer(s.popup.children[3]!,'pointerup',40,1.5);expect(s.popup.children[0]!.textContent).toContain('26 cells [33, 59)');expect(s.dispatch).not.toHaveBeenCalled();s.popup.children[1]!.click();expect(s.dispatch.mock.calls[0]![0].payload).toEqual({floor:1,startX:33,endXExclusive:59});expect(s.dispatch.mock.results[0]!.value.quote!.constructionCostMinor).toBe(2600);
});
test.each([0.5,1,2])('boundary dragging at zoom %s keeps the opposite edge fixed with no extra change on the trailing click',zoom=>{
 const s=setup();s.camera.zoom=zoom;s.drop();s.pointer(s.left,'pointerdown',24,1.5);s.pointer(s.left,'pointerup',20,1.5);s.left.click();s.placement.draw();expect(s.popup.children[0]!.textContent).toContain('28 cells [20, 48)');
 s.pointer(s.right,'pointerdown',48,1.5);s.pointer(s.right,'pointerup',55,1.5);s.right.click();s.placement.draw();expect(s.popup.children[0]!.textContent).toContain('35 cells [20, 55)');expect(s.dispatch).not.toHaveBeenCalled();
});
test('edges cannot cross, invalid bounds block confirmation, and restoring the span recovers',()=>{
 const s=setup();s.drop();s.pointer(s.left,'pointerdown',24,1.5);s.pointer(s.left,'pointerup',70,1.5);expect(s.popup.children[0]!.textContent).toContain('1 cells [47, 48)');
 s.pointer(s.right,'pointerdown',48,1.5);s.pointer(s.right,'pointerup',140,1.5);expect(s.popup.children[1]!.disabled).toBe(true);s.popup.children[1]!.click();expect(s.dispatch).not.toHaveBeenCalled();
 s.pointer(s.right,'pointerdown',140,1.5);s.pointer(s.right,'pointerup',55,1.5);expect(s.popup.children[1]!.disabled).toBe(false);s.popup.children[1]!.click();expect(s.dispatch.mock.results[0]!.value.ok).toBe(true);
});
test('canceling and tool switching discard the resized preview and the next floor starts at default width',()=>{
 const s=setup(),before=JSON.stringify(s.state);s.drop();s.pointer(s.right,'pointerdown',48,1.5);s.pointer(s.right,'pointerup',49,1.5);s.popup.children[2]!.click();expect(s.popup.hidden).toBe(true);expect(s.left.hidden).toBe(true);s.drop();expect(s.popup.children[0]!.textContent).toContain('24 cells');s.tools.get('office.small')!.click();expect(s.right.hidden).toBe(true);expect(JSON.stringify(s.state)).toBe(before);expect(s.dispatch).not.toHaveBeenCalled();
});
test('boundary keyboard nudges preserve the opposite edge; disposal releases an active resize gesture',()=>{
 const s=setup();s.drop();const key=new Event('keydown',{cancelable:true});Object.assign(key,{key:'ArrowRight'});s.left.dispatchEvent(key);s.placement.draw();expect(s.popup.children[0]!.textContent).toContain('23 cells [25, 48)');expect(key.defaultPrevented).toBe(true);
 s.pointer(s.right,'pointerdown',48,1.5);s.controller.abort();expect(s.right.hasPointerCapture(1)).toBe(false);s.pointer(s.right,'pointermove',80,1.5);expect(s.popup.children[0]!.textContent).toContain('23 cells [25, 48)');
});

test('grabbing an edge without dragging does not resize or spend money',()=>{
 const s=setup(),before=JSON.stringify(s.state);s.drop();s.pointer(s.left,'pointerdown',24,1.5);s.pointer(s.left,'pointerup',24,1.5);s.left.click();s.placement.draw();expect(s.popup.children[0]!.textContent).toContain('24 cells [24, 48)');expect(s.left.getAttribute('role')).toBe('separator');expect(s.left.getAttribute('aria-valuenow')).toBe('24');expect(JSON.stringify(s.state)).toBe(before);expect(s.dispatch).not.toHaveBeenCalled();
});
