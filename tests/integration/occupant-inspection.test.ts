import {test,expect} from 'vitest';
import {leasedWorker,until} from '../fixtures/one-worker';
import {inspectOccupant} from '../../src/app/game/occupant-queries';
import {getWorldView} from '../../src/app/game/queries';
import {selectOccupant} from '../../src/input/occupant-selection';
import {Camera} from '../../src/rendering/camera/camera';
import {advance} from '../../src/simulation';
test('canvas selection retains identity across pause, walking, indoor work and dormant departure; queries cannot mutate',()=>{const {s,id}=leasedWorker(),q=s.occupants[id]!.schedule!,camera=new Camera(900,600,1);until(s,q.arrivalTick+10);const before=JSON.stringify(s),view=getWorldView(s),p=view.occupants[0]!;expect(selectOccupant(view,camera,camera.worldToScreen({x:p.at.x2/2,y:p.at.floor+0.18}))).toBe(id);expect(inspectOccupant(s,id)).toMatchObject({id,kind:'worker',state:'walking',goal:{kind:'office'}});advance(s,0);expect(JSON.stringify(s)).toBe(before);until(s,q.arrivalTick+28);expect(getWorldView(s).occupants).toHaveLength(0);expect(inspectOccupant(s,id)?.state).toBe('insideFacility');until(s,q.departureTick);expect(inspectOccupant(s,id)?.goal.kind).toBe('exit');until(s,q.departureTick+28);expect(inspectOccupant(s,id)?.state).toBe('outside');});
