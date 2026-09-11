import {expect,it} from 'vitest';
import {upperOffice,elevator,arrival} from '../fixtures/transport';
import {command,until} from '../fixtures/one-worker';
import {captureState} from '../../src/simulation';
it('protects future cells of an active walk and allows safe unused upper-floor removal',()=>{const s=elevator(upperOffice(3),3),id=arrival(s);for(let i=0;i<1500&&!(s.occupants[id]!.state==='walking'&&s.occupants[id]!.location.kind==='walkEdge'&&s.occupants[id]!.location.from.floor===3);i++)until(s,s.clock.tick+1);const p=s.occupants[id]!;expect(p.state).toBe('walking');const before=captureState(s);expect(command(s,{kind:'demolishFloorRange',payload:{floor:3,startX:21,endXExclusive:22}}).ok).toBe(false);expect({...s,lastCommandSequence:0}).toEqual({...before,lastCommandSequence:0});expect(command(s,{kind:'demolishFloorRange',payload:{floor:3,startX:40,endXExclusive:48}}).ok).toBe(true);expect(s.occupants[id]!.location).toEqual(p.location);captureState(s);});
