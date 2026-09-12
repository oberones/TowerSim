import { createServer } from 'vite';
import { Session } from 'node:inspector/promises';
import { writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom'});
try {
 const {referenceTower}=await server.ssrLoadModule('/tests/fixtures/reference-tower.ts');
 const {createRunner}=await server.ssrLoadModule('/src/simulation/core/clock/advance.ts');
 const state=referenceTower(),runner=createRunner(state),session=new Session();session.connect();
 await session.post('Profiler.enable');await session.post('Profiler.start');
 const start=performance.now(),result=runner.advance(30),elapsedMs=performance.now()-start;
 const {profile}=await session.post('Profiler.stop');session.disconnect();
 writeFileSync('/private/tmp/towersim-reference.cpuprofile',JSON.stringify(profile));
 console.log(JSON.stringify({result,elapsedMs}));
 const samples=new Map();for(const id of profile.samples??[])samples.set(id,(samples.get(id)??0)+1);
 console.table(profile.nodes.map(n=>({function:n.callFrame.functionName,file:n.callFrame.url.split('/').slice(-2).join('/'),samples:samples.get(n.id)??0})).sort((a,b)=>b.samples-a.samples).slice(0,15));
} finally {await server.close();}
