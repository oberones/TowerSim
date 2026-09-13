import { element } from './elements';
/** Explain a complete affordable default journey, with observable access, capacity and continuation decisions. */
export function createOnboarding(){
 const node=element('details','','onboarding');node.append(element('summary','Start here — build a thriving tower'));
 const steps=element('ol');
 for(const text of [
  'Build while paused. Choose Floor and click floor 1 for a 24-cell preview. Move it to cell 0, drag the right edge to end at cell 96, then Place floor. Repeat on floors 2–5 in order. Adjacent built space already includes a hallway.',
  'Connect the lobby. Choose Elevator, click floor 0 at cell 10, set Elevator top floor to 5, and confirm on the shaft. Build stairs from 0 to 1 at cell 80, then 1 to 2 at cell 84. Each elevator carries eight people.',
  'Choose Office, click floor space on floors 3, 4 and 5, drag each preview into position, and confirm on the tower. Choose Restaurant and do the same on floor 1. Room sizes are automatic. Normal starts the first 06:00 leasing review; rooms built later wait for the next review. Assigned workers arrive physically during the morning rush.',
  'Watch and diagnose. Pause near 08:00. Inspect a person or elevator and open Tower details → Traffic. Missing access needs a connected route. A reachable office with waiting people and repeated boarding denials needs more elevator service.',
  'Improve service. Reserve cell 14 for a second elevator serving floors 0–5. Compare the latest and previous morning reports after complete arrivals: wait, peak queue, quality and sample counts. Adding restaurants shares the existing daily customer allowance.',
  'Earn Level 2. Open Tower details → Level 2 or Finances. Keep the required offices and restaurant accessible throughout a full midnight-to-midnight day. Improve transport and let customers enter. The first partial day cannot qualify.',
  'Continue later. Save active traffic and wait for success before leaving. Load starts paused at that saved moment. Keep the same site address and browser profile. New Game leaves the local save alone.'
 ]){steps.append(element('li',text));}
 node.append(steps,element('p','Keys: F floor · O office · R restaurant · S stairs · E elevator · D demolish · I inspect · Esc cancel tool · Space pause/resume · 0 pause / 1 normal / 2 fast / 3 very fast. Shortcuts leave text fields and dialogs alone.','muted'));
 return node;
}
