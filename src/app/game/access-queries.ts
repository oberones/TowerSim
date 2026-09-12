import type { GameState } from '../../simulation';
import { accessReason } from '../../simulation/navigation/access-reasons';
import { freezeDeep } from '../../simulation/state/plain';
/** Project immediate two-way facility access together with real stranded identities and affected floors. */
export function accessQuery(state:GameState,facilityId:string){const office=state.offices[facilityId]??state.restaurants[facilityId];if(!office)return null;const stranded=Object.values(state.occupants).filter(p=>p.state==='stranded').map(p=>({id:p.id,floor:p.location.kind==='anchor'?p.location.at.floor:office.floor}));return freezeDeep({...accessReason(state,office.floor,office.entranceX2),floor:office.floor,stranded,affectedFloors:[...new Set(stranded.map(p=>p.floor))].sort((a,b)=>a-b)});}
