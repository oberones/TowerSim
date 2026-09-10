import type { OccupantInspection } from '../app/game/occupant-queries';
import { element } from './elements';
/** Reuse one textual inspector while a selected identity walks, sleeps and leaves. */
export function createOccupantInspector(){const node=element('section'),text=element('p','Click a walking person to inspect them.');node.append(element('h2','Person'),text);return {node,update:(p:OccupantInspection|null)=>{text.textContent=p?`${p.id} · ${p.kind} · ${p.state} · Goal: ${p.goal.kind==='office'?p.goal.facilityId:p.goal.kind}${p.schedule?` · Visit: ${p.schedule.status}`:''}${p.trip?` · Walking ${p.trip.elapsed.walking}s · Waiting ${p.trip.elapsed.waiting}s`:''}`:'Click a walking person to inspect them.';}};}
