import {setMaxListeners} from 'node:events';
import {afterEach,expect,test,vi} from 'vitest';
import {createGameView} from '../../src/ui/game-view';
import {GameSession} from '../../src/app/game/session';
import {MVP_DEFAULT} from '../../src/content/scenarios/mvp-default';
import {UiElement,uiDocument} from '../fixtures/ui-element';
import {FakeClock} from '../fixtures/clock';
import {MemorySaveRepository} from '../fixtures/save-repository';
import {WALKER_SEED} from '../fixtures/one-worker';
vi.mock('../../src/rendering/canvas/renderer',()=>({Renderer:class {draw(){} invalidate(){} overlayContext(){return {save(){},restore(){},fillRect(){},strokeRect(){}};}}}));
afterEach(()=>vi.unstubAllGlobals());
/** Traverse the fixture DOM by visible text, keeping the complete production composition path active. */
function button(root:UiElement,text:string):UiElement {const nodes=[root];while(nodes.length){const node=nodes.shift()!;if(node.tagName==='BUTTON'&&node.textContent===text)return node;nodes.push(...node.children);}throw Error(`Missing button ${text}`);}
test('the complete game view mounts, draws, replaces a tower and disposes without initialization errors',()=>{
 const document=Object.assign(new EventTarget(),{createElement:(tag:string)=>{const element=uiDocument.createElement(tag);setMaxListeners(0,element);return element;},hidden:false});
 vi.stubGlobal('document',document);vi.stubGlobal('window',Object.assign(new EventTarget(),{devicePixelRatio:1}));
 vi.stubGlobal('ResizeObserver',class {observe(){} disconnect(){}});
 const root=new UiElement('main'),session=new GameSession({scenario:MVP_DEFAULT,seed:WALKER_SEED},new FakeClock(),{start:()=>()=>{}});
 const view=createGameView(root as unknown as HTMLElement,session,new MemorySaveRepository(),()=>{});
 expect(root.children.length).toBeGreaterThan(0);expect(()=>view.draw()).not.toThrow();
 const generation=session.pacingStatus().generation;button(root,'New Game').click();button(root,'Discard & start').click();
 expect(session.pacingStatus().generation).toBeGreaterThan(generation);expect(session.hud().speed).toBe(0);expect(()=>view.draw()).not.toThrow();
 view.dispose();expect(root.children).toEqual([]);
});
