import {afterEach,expect,test,vi} from 'vitest';
import {createObjectPlacement} from '../../src/ui/object-placement';
import {ElevatorTool} from '../../src/input/elevator-tool';
import {StairTool} from '../../src/input/stair-tool';
import {FacilityTool} from '../../src/input/facility-tool';
import {Camera} from '../../src/rendering/camera/camera';
import {validateCommand} from '../../src/simulation';
import {oneWorker,command} from '../fixtures/one-worker';
import {UiElement,uiDocument} from '../fixtures/ui-element';
import type {Renderer} from '../../src/rendering/canvas/renderer';
import type {Command} from '../../src/simulation';
afterEach(()=>vi.unstubAllGlobals());
/** Mount the ordinary placement controls against actual domain validation and command ingress. */
function setup(id:string){
 vi.stubGlobal('document',uiDocument);const state=oneWorker();for(let floor=1;floor<=4;floor++)expect(command(state,{kind:'constructFloorRange',payload:{floor,startX:0,endXExclusive:96}}).ok).toBe(true);
 const ingress={preview:(c:Command)=>validateCommand(state,{...c,sequence:state.lastCommandSequence+1,atTick:state.clock.tick}),dispatch:vi.fn((c:Command)=>command(state,c))};
 const canvas=new UiElement('canvas'),viewport=new UiElement('div');viewport.append(canvas);const camera=new Camera(900,600,1),tools=new Map(['inspect',id].map(id=>[id,new UiElement('button') as unknown as HTMLButtonElement]));
 const elevator=new ElevatorTool(ingress),tool=id==='elevator.standard'?{propose:(floor:number,x:number,height:number)=>elevator.propose(floor,floor+height-1,x),preview:()=>elevator.preview(),commit:()=>elevator.commit(),cancel:()=>elevator.cancel()}:id==='stairs.basic'?new StairTool(ingress):new FacilityTool(ingress,id);
 const definition=state.scenario.content!.definitions.find(d=>d.typeId===id)!,renderer={overlayContext:()=>({save(){},restore(){},fillRect(){},strokeRect(){}})} as unknown as Renderer;
 const placement=createObjectPlacement(canvas as unknown as HTMLCanvasElement,camera,renderer,tools,id,definition.displayName,definition.footprint.width,tool,()=>{},new AbortController().signal,id==='elevator.standard'?4:id==='stairs.basic'?2:1,id==='elevator.standard');
 const popup=viewport.children[1]!;
 /** Send one event from a logical tower location through the input adapter. */
 function pointer(target:UiElement,type:string,x:number,floor:number):void {const at=camera.worldToScreen({x,y:floor}),event=new Event(type,{cancelable:true});Object.assign(event,{pointerId:1,button:0,shiftKey:false,clientX:at.x,clientY:at.y});target.dispatchEvent(event);placement.draw();}
 tools.get(id)!.click();return {state,ingress,canvas,popup,placement,pointer};
}
test.each(['office.small','restaurant.small','stairs.basic','elevator.standard'])('%s previews at the click, moves by its grab offset, and commits only the final location',id=>{
 const s=setup(id),before=JSON.stringify(s.state);s.pointer(s.canvas,'pointerdown',48.5,0.5);s.pointer(s.canvas,'pointerup',48.5,0.5);expect(s.popup.hidden).toBe(false);expect(s.popup.children[0]!.textContent).toContain('Floor 0, cell 48');expect(JSON.stringify(s.state)).toBe(before);
 s.pointer(s.popup.children[3]!,'pointerdown',55,0.5);s.pointer(s.popup.children[3]!,'pointerup',58,1.5);expect(s.popup.children[0]!.textContent).toContain('Floor 1, cell 51');expect(s.ingress.dispatch).not.toHaveBeenCalled();expect(JSON.stringify(s.state)).toBe(before);
 s.popup.children[1]!.click();expect(s.ingress.dispatch).toHaveBeenCalledTimes(1);expect(s.ingress.dispatch.mock.results[0]!.value.ok).toBe(true);expect(s.ingress.dispatch.mock.calls[0]![0].payload).toMatchObject(id==='elevator.standard'?{x:51,minFloor:1,maxFloor:4}:id==='stairs.basic'?{x:51,lowerFloor:1}:{x:51,floor:1});expect(s.popup.hidden).toBe(true);
});
test('elevator height editing stays attached to the moved base and rejects incomplete input',()=>{
 const s=setup('elevator.standard');s.pointer(s.canvas,'pointerdown',48.5,0.5);s.pointer(s.canvas,'pointerup',48.5,0.5);const top=s.popup.children[5]!.children[1]!;
 top.value='';top.dispatchEvent(new Event('input'));s.placement.draw();expect(s.popup.children[1]!.disabled).toBe(true);s.popup.children[1]!.click();expect(s.ingress.dispatch).not.toHaveBeenCalled();
 top.value='2';top.dispatchEvent(new Event('input'));s.placement.draw();s.pointer(s.popup.children[3]!,'pointerdown',55,0.5);s.pointer(s.popup.children[3]!,'pointerup',55,1.5);expect(top.value).toBe('3');s.popup.children[1]!.click();expect(s.ingress.dispatch.mock.calls[0]![0].payload).toMatchObject({minFloor:1,maxFloor:3,servedMinFloor:1,servedMaxFloor:3});
});
test('moving into a collision prevents commitment until the preview is moved back to valid space',()=>{
 const s=setup('office.small');s.pointer(s.canvas,'pointerdown',48.5,0.5);s.pointer(s.canvas,'pointerup',48.5,0.5);s.pointer(s.popup.children[3]!,'pointerdown',55,0.5);s.pointer(s.popup.children[3]!,'pointerup',31,0.5);expect(s.popup.children[1]!.disabled).toBe(true);s.popup.children[1]!.click();expect(s.ingress.dispatch).not.toHaveBeenCalled();
 s.pointer(s.popup.children[3]!,'pointerdown',31,0.5);s.pointer(s.popup.children[3]!,'pointerup',55,0.5);expect(s.popup.children[1]!.disabled).toBe(false);s.popup.children[1]!.click();expect(s.ingress.dispatch).toHaveBeenCalledTimes(1);
});
