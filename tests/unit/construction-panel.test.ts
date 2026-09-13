import {afterEach,expect,test,vi} from 'vitest';
import {createConstructionPanel} from '../../src/ui/construction-panel';
import {Camera} from '../../src/rendering/camera/camera';
import {GameSession} from '../../src/app/game/session';
import {MVP_DEFAULT} from '../../src/content/scenarios/mvp-default';
import {UiElement,uiDocument} from '../fixtures/ui-element';
import type {Renderer} from '../../src/rendering/canvas/renderer';
import {WALKER_SEED} from '../fixtures/one-worker';
import {FakeClock} from '../fixtures/clock';
afterEach(()=>vi.unstubAllGlobals());

test('construction mounts its real placement adapter before reset and resets an active preview without spending',()=>{
 vi.stubGlobal('document',uiDocument);
 const session=new GameSession({scenario:MVP_DEFAULT,seed:WALKER_SEED},new FakeClock(),{start:()=>()=>{}});
 const root=new UiElement('main'),viewport=new UiElement('div'),canvas=new UiElement('canvas');viewport.append(canvas);root.append(viewport);
 const camera=new Camera(900,600,1),status=new UiElement('p'),redraw=vi.fn();
 const tools=new Map(['inspect','floor','demolish'].map(id=>[id,new UiElement('button') as unknown as HTMLButtonElement]));
 const renderer={overlayContext:()=>({save(){},restore(){},fillRect(){},strokeRect(){}})} as unknown as Renderer;
 const controller=new AbortController(),before=session.capture();
 const panel=createConstructionPanel(root as unknown as HTMLElement,session,canvas as unknown as HTMLCanvasElement,camera,renderer,tools,status as unknown as HTMLElement,redraw,controller.signal);
 expect(tools.get('inspect')!.getAttribute('aria-pressed')).toBe('true');
 tools.get('floor')!.click();
 const at=camera.worldToScreen({x:24.5,y:1.5});
 for(const type of ['pointerdown','pointerup']){const event=new Event(type);Object.assign(event,{pointerId:1,button:0,shiftKey:false,clientX:at.x,clientY:at.y});canvas.dispatchEvent(event);}
 panel.draw();expect(viewport.children[1]!.hidden).toBe(false);
 panel.reset();panel.draw();expect(viewport.children[1]!.hidden).toBe(true);
 expect(tools.get('inspect')!.getAttribute('aria-pressed')).toBe('true');expect(session.capture()).toEqual(before);
 controller.abort();
});
