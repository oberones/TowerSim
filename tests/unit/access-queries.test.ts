import {expect,it} from 'vitest';
import {upperOffice,elevator} from '../fixtures/transport';
import {accessQuery} from '../../src/app/game/access-queries';
import {command} from '../fixtures/one-worker';
it('explains missing connections and unserved destinations, updating immediately after repairs',()=>{const s=upperOffice(3),id=Object.keys(s.offices)[0]!;expect(accessQuery(s,id)!.reason).toMatch(/stairs|elevator/i);elevator(s,3);expect(accessQuery(s,id)!.accessible).toBe(true);expect(command(s,{kind:'setElevatorServiceRange',payload:{shaftId:Object.keys(s.shafts)[0]!,minFloor:0,maxFloor:2}}).ok).toBe(true);expect(accessQuery(s,id)!.reason).toMatch(/serve.*3/i);});
it('identifies missing landing spans and leaves connected destinations accessible despite congestion',()=>{const s=upperOffice(3),id=Object.keys(s.offices)[0]!;elevator(s,3);const before=JSON.stringify(s);expect(accessQuery(s,id)!.reason).toContain('capacity delays');expect(accessQuery(s,id)!.stranded).toEqual([]);expect(JSON.stringify(s)).toBe(before);});
