import { expect, test } from 'vitest';
import { Camera } from '../../src/rendering/camera/camera';

test('camera transforms invert in CSS pixels across pan, anchored zoom, resize and DPR', () => {
  const c=new Camera(900,600,1); const world={x:27.5,y:8.25};
  for(const dpr of [1,1.25,2,3]) {
    c.resize(740,500,dpr); c.panBy(37,-19); const before=c.screenToWorld({x:333,y:222});
    c.zoomAt(1.7,{x:333,y:222}); const anchored=c.screenToWorld({x:333,y:222}); expect(anchored.x).toBeCloseTo(before.x,12); expect(anchored.y).toBeCloseTo(before.y,12);
    const back=c.screenToWorld(c.worldToScreen(world));
    expect(back.x).toBeCloseTo(world.x); expect(back.y).toBeCloseTo(world.y);
  }
});
