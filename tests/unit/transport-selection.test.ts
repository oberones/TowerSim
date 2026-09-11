import { test,expect } from 'vitest';
import { getWorldView } from '../../src/app/game/queries';
import { selectTransport } from '../../src/input/transport-selection';
import { elevator,stairs,upperOffice } from '../fixtures/transport';
import { Camera } from '../../src/rendering/camera/camera';
test('transport selection uses the saved logical anchor across camera changes and respects footprint boundaries',()=>{const s=elevator(stairs(upperOffice(3)),3),view=getWorldView(s),shaft=Object.keys(s.shafts)[0]!,stair=Object.keys(s.stairs)[0]!,camera=new Camera(828,748,1);camera.fit(120,0);const screen=camera.worldToScreen({x:19,y:2.5}),at=camera.screenToWorld(screen);camera.panBy(100,0);expect(selectTransport(view,at)).toBe(shaft);expect(selectTransport(view,{x:11,y:1.5})).toBe(stair);expect(selectTransport(view,{x:20,y:2})).toBeNull();expect(selectTransport(view,{x:19,y:4})).toBeNull();});
