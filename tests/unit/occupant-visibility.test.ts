import {test,expect,vi} from 'vitest';
import {leasedWorker,until} from '../fixtures/one-worker';
import {getWorldView} from '../../src/app/game/queries';
import {Camera} from '../../src/rendering/camera/camera';
import {drawOccupants} from '../../src/rendering/layers/occupants';
import {selectOccupant} from '../../src/input/occupant-selection';

test.each([0.25,1,4])('person silhouettes remain readable and their upper edge selectable at zoom %s',zoom=>{
 const {s,id}=leasedWorker();until(s,s.occupants[id]!.schedule!.arrivalTick+10);
 const view=getWorldView(s),person=view.occupants[0]!,camera=new Camera(900,600,1);camera.zoom=zoom;
 const fillRect=vi.fn(),ctx={fillRect,fillStyle:''} as unknown as CanvasRenderingContext2D;
 const before=JSON.stringify(s);drawOccupants(ctx,view,camera);
 const outline=fillRect.mock.calls[0]!;expect(outline[2]).toBeGreaterThanOrEqual(10);expect(outline[3]).toBeGreaterThanOrEqual(16);
 const anchor=camera.worldToScreen({x:person.at.x2/2,y:person.at.floor+0.18});
 expect(selectOccupant(view,camera,{x:anchor.x,y:anchor.y-11})).toBe(id);
 expect(selectOccupant(view,camera,{x:anchor.x+30,y:anchor.y})).toBeNull();
 expect(JSON.stringify(s)).toBe(before);
});
