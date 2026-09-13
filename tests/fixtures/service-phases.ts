import { nineAtBoarding } from './nine-passengers';
import { createRunner } from '../../src/simulation/core/clock/advance';
/** Capture real partial multi-person exchange or repeated denial boundaries for deterministic continuation. */
export function servicePhase(kind:'boarding'|'unloading'|'denied') {
 const s=nineAtBoarding(17),runner=createRunner(s);
 for(let i=0;i<2000;i++){const c=Object.values(s.cars)[0]!;
  if(kind==='boarding'&&c.visit?.boardCursor===3||kind==='unloading'&&c.visit?.unloadCursor===3||kind==='denied'&&Object.values(s.trips).some(t=>t.deniedBoardingCount===2))return s;
  const r=runner.advance(1);if(!r.ok)throw Error(r.code);
 }throw Error('Service phase missing');
}
