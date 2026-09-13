import { expect, test, vi } from 'vitest';
import { Renderer } from '../../src/rendering/canvas/renderer';
import { Camera } from '../../src/rendering/camera/camera';
import { getWorldView } from '../../src/app/game/queries';
import { tower, floor } from '../fixtures/tower';

/** Supply a minimal Canvas port to inspect cache ownership without claiming raster/browser qualification. */
function surface():HTMLCanvasElement {
  const ctx={fillRect:vi.fn(),strokeRect:vi.fn(),clearRect:vi.fn(),setTransform:vi.fn(),drawImage:vi.fn(),beginPath:vi.fn(),moveTo:vi.fn(),lineTo:vi.fn(),stroke:vi.fn(),fillText:vi.fn()};
  return {width:0,height:0,getContext:()=>ctx,ownerDocument:{createElement:()=>surface()}} as unknown as HTMLCanvasElement;
}
test('static structure cache tracks geometry/camera invalidation and stays viewport sized',()=>{
  const s=tower(),canvas=surface(),camera=new Camera(800,500,2),renderer=new Renderer(canvas,camera);
  for(let frame=0;frame<20;frame++)renderer.draw(getWorldView(s,camera.bounds()));
  expect(renderer.staticDraws).toBe(1);expect([canvas.width,canvas.height]).toEqual([1600,1000]);
  floor(s,1,0,20);renderer.draw(getWorldView(s,camera.bounds()));expect(renderer.staticDraws).toBe(2);
  camera.panBy(10,10);renderer.draw(getWorldView(s,camera.bounds()));expect(renderer.staticDraws).toBe(3);
  camera.resize(400,300,1);renderer.draw(getWorldView(s,camera.bounds()));expect([canvas.width,canvas.height]).toEqual([400,300]);
  renderer.invalidate();renderer.draw(getWorldView(s,camera.bounds()));expect(renderer.staticDraws).toBe(5);
});
