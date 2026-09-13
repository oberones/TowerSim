import { createServer } from 'vite';
import { Session } from 'node:inspector/promises';
import { writeFileSync } from 'node:fs';
import {createHash} from 'node:crypto';
import { performance } from 'node:perf_hooks';
const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom'});
try {
 const {referenceTower}=await server.ssrLoadModule('/tests/fixtures/reference-tower.ts');
 const {createRunner}=await server.ssrLoadModule('/src/simulation/core/clock/advance.ts');
 const {command}=await server.ssrLoadModule('/tests/fixtures/one-worker.ts');
 const {encodeState}=await server.ssrLoadModule('/src/simulation/index.ts');
 const state=referenceTower(),runner=createRunner(state),session=new Session(),evening=process.argv.includes('--evening'),edit=process.argv.includes('--edit');
 if(evening){const prepared=runner.advance(61200-state.clock.tick);if(!prepared.ok)throw Error(JSON.stringify(prepared));}
 const startTick=state.clock.tick;session.connect();
 await session.post('Profiler.enable');await session.post('Profiler.start');
 const start=performance.now(),result=edit?command(state,{kind:'buildElevatorShaft',payload:{definitionId:'elevator.standard',x:22,minFloor:0,maxFloor:12,servedMinFloor:0,servedMaxFloor:12}}):runner.advance(evening?300:30),elapsedMs=performance.now()-start;
 const {profile}=await session.post('Profiler.stop');session.disconnect();
 const profilePath=`/private/tmp/towersim-reference-${edit?'edit':evening?'evening':'rush'}.cpuprofile`;writeFileSync(profilePath,JSON.stringify(profile));
 console.log(JSON.stringify({result,elapsedMs,startTick,profilePath,finalDigest:createHash('sha256').update(encodeState(state)).digest('hex')}));
 const samples=new Map();for(const id of profile.samples??[])samples.set(id,(samples.get(id)??0)+1);
 console.table(profile.nodes.map(n=>({function:n.callFrame.functionName,file:n.callFrame.url.split('/').slice(-2).join('/'),samples:samples.get(n.id)??0})).sort((a,b)=>b.samples-a.samples).slice(0,15));
} finally {await server.close();}
