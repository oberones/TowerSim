import {test,expect} from 'vitest';
import {FacilityTool} from '../../src/input/facility-tool';
import {validateCommand} from '../../src/simulation';
import {oneWorker,command,place} from '../fixtures/one-worker';

test('office preview remains pure, cancellation is free, and commit revalidates a stale accepted footprint',()=>{
 const s=oneWorker(),tool=new FacilityTool({preview:c=>validateCommand(s,{...c,sequence:s.lastCommandSequence+1,atTick:s.clock.tick}),dispatch:c=>command(s,c)}),before=JSON.stringify(s);
 expect(tool.propose(0,48).ok).toBe(true);expect(JSON.stringify(s)).toBe(before);tool.cancel();expect(tool.commit().ok).toBe(false);expect(JSON.stringify(s)).toBe(before);
 tool.propose(0,48);place(s,48);expect(tool.preview()?.code).toBe('overlap');expect(tool.commit().code).toBe('overlap');
});
