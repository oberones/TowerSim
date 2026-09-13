import type { FloorInspection } from '../app/game/queries';
import { element } from './elements';
/** Update one reusable textual floor inspector with built/free spans and explicit access causes. */
export function createFloorInspector(){
  const node=element('section','','inspector');node.setAttribute('aria-label','Floor inspector');const title=element('h2','Floor inspector'),body=element('p','Select a built floor to inspect its space and access.');node.append(title,body);
  /** Render the current selection without adding DOM nodes per cell or facility. */
  function update(floor:FloorInspection|null):void {title.textContent=floor?`Floor ${floor.level}`:'Floor inspector';body.textContent=floor?`${floor.builtCells} built cells · ${floor.freeCells} free cells. Built spans: ${floor.spans.map(r=>`[${r.startX}, ${r.endXExclusive}) — ${r.access.accessible?'Accessible':'Inaccessible'}: ${r.access.reason}`).join('; ')}. Free space: ${floor.freeRanges.map(r=>`[${r.startX}, ${r.endXExclusive})`).join(', ')||'none'}.`:'Select a built floor to inspect its space and access.';}
  return {node,update};
}
