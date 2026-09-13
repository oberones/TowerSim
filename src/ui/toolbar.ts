import type { PlayableScenario } from '../simulation';
import { element } from './elements';
import { money } from './elements';
/** Show all planned tools and their actual content prices, with unavailable handlers labeled honestly. */
export function createToolbar(scenario:PlayableScenario){
  const node=element('section','','palette');node.append(element('h2','Build your tower'));
  const tools=new Map<string,HTMLButtonElement>();
  const entries=[['inspect','Inspect','Select built floor space'],['floor','Floor',`${money(scenario.content.floorCostMinorPerCell)} / cell`],...scenario.content.definitions.filter(d=>d.typeId!=='lobby.basic').map(d=>[d.typeId,d.displayName,`${money(d.constructionCostMinor)}${d.perFloorCostMinor?` + ${money(d.perFloorCostMinor)} / floor`:''}`]),['demolish','Demolish','Free · no refund']];
  for(const [id,label,price] of entries){const b=element('button',`${label} — ${price}`);b.type='button';b.disabled=true;b.title='Available in a later phase';tools.set(id!,b);node.append(b);}
  node.append(element('p','Offices lease at 06:00 when accessible. Stairs connect adjacent floors; elevators serve a contiguous range. Restaurants share finite daily customers allocated at 06:00.','muted'));return {node,tools};
}
