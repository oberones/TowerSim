import { DomainError, add, integer, multiply, positive, tick } from '../core/values';
import { record } from './plain';
export interface Range { startX:number; endXExclusive:number }
export interface WorldConfig {
  readonly widthCells:number; readonly minFloor:number; readonly maxFloor:number; readonly groundFloor:number;
  readonly initialConstructedRanges:readonly Range[]; readonly lobbyX:number; readonly lobbyDefinitionId:'lobby.basic';
}
export interface FacilityDefinition {
  readonly typeId:string; readonly definitionVersion:1; readonly displayName:string;
  readonly footprint:{readonly width:number;readonly height:number}; readonly entranceOffsetX2:number;
  readonly constructionCostMinor:number; readonly operatingMinorPerDay:number; readonly capacity:number;
  readonly rentMinorPerDay:number; readonly visitPriceMinor:number; readonly perFloorCostMinor:number;
  readonly scheduleProfileId:string|null; readonly capabilities:readonly string[];
}
export interface Content {
  readonly definitions:readonly FacilityDefinition[];
  readonly floorCostMinorPerCell:number; readonly officeMarketWorkers:number; readonly restaurantDailyCustomers:number;
  readonly walkingTicksPerCell:number; readonly stairTicksPerFloor:number; readonly standardCarCapacity:8;
  readonly elevatorTiming:{startTicks:number;floorTicks:number;levelTicks:number;openTicks:number;closeTicks:number;boardTicks:number;unloadTicks:number;dwellTicks:number};
  readonly schedules:{office:{id:string;arrivalStart:number;arrivalEnd:number;departureStart:number;departureEnd:number};restaurant:{id:string;start:number;end:number;mealStart:number;mealEnd:number;mealShareBasisPoints:number;visitMinTicks:number;visitMaxTicks:number}};
  readonly level2:{id:string;offices:number;workers:number;restaurants:number;visits:number;minimumCashMinor:number;positiveOperatingNet:boolean;quality:number;completedOfficeArrivals:number;maximumStranded:number;maximumUnresolvedPriorDayTrips:number;fullDayRequired:boolean};
  readonly routing:{routeCacheEntries:number;nominalCycleTicks:number;transferPenaltyTicks:number;rerouteImprovementTicks:number};
  readonly metrics:{version:1;walkingBasisPointsPerMinute:number;waitingBasisPointsPerMinute:number;ridingBasisPointsPerMinute:number;denialBasisPoints:number;transferBasisPoints:number;strandedBasisPointsPerMinute:number};
  readonly historyLimits:{liveTicks:number;financeTicks:number;days:number};
}
const definitionCapabilities:Record<string,string>={'lobby.basic':'entrance','office.small':'officeLease','restaurant.small':'customerVisit','stairs.basic':'verticalStair','elevator.standard':'elevatorService'};
/** Reject unsupported closed content records before they enter a game or snapshot. */
function requireValue(condition:unknown,message:string):asserts condition { if(!condition) throw new DomainError('invalidState',message); }
/** Check named integer data fields without permitting omitted or unknown parameters. */
function numbers(value:unknown,keys:readonly string[],strictlyPositive=false):void {
  const object=record(value,keys); for(const number of Object.values(object)) { requireValue(typeof number==='number','Expected numeric content'); if(strictlyPositive)positive(number);else tick(number); }
}
/** Validate supported definitions, finite demand, schedules, timing and progression data. */
export function assertContent(c:Content):void {
  record(c,['definitions','floorCostMinorPerCell','officeMarketWorkers','restaurantDailyCustomers','walkingTicksPerCell','stairTicksPerFloor','standardCarCapacity','elevatorTiming','schedules','level2','routing','metrics','historyLimits']);
  tick(c.floorCostMinorPerCell);tick(c.officeMarketWorkers);tick(c.restaurantDailyCustomers);positive(c.walkingTicksPerCell);positive(c.stairTicksPerFloor);
  requireValue(c.standardCarCapacity===8,'The standard car has eight places');
  numbers(c.elevatorTiming,['startTicks','floorTicks','levelTicks','openTicks','closeTicks','boardTicks','unloadTicks','dwellTicks'],true);
  record(c.schedules,['office','restaurant']);
  const office=c.schedules.office;const restaurant=c.schedules.restaurant;
  record(office,['id','arrivalStart','arrivalEnd','departureStart','departureEnd']);
  record(restaurant,['id','start','end','mealStart','mealEnd','mealShareBasisPoints','visitMinTicks','visitMaxTicks']);
  requireValue(office.id==='office.workday' && restaurant.id==='restaurant.lunch','Unsupported schedule profiles');
  for(const profile of [office,restaurant]) for(const [key,n] of Object.entries(profile)) if(key!=='id'){requireValue(typeof n==='number','Invalid schedule time');tick(n);}
  requireValue(office.arrivalStart>=28800 && office.arrivalStart<office.arrivalEnd && office.arrivalEnd<=36000 && office.departureStart>=61200 && office.departureStart<office.departureEnd && office.departureEnd<=68400,'Office rush outside published windows');
  requireValue(restaurant.start<restaurant.mealStart && restaurant.mealStart===41400 && restaurant.mealEnd===48600 && restaurant.mealEnd<restaurant.end && restaurant.end<86400 && restaurant.mealShareBasisPoints>=7000 && restaurant.mealShareBasisPoints<=10000 && restaurant.visitMinTicks>0 && restaurant.visitMaxTicks>=restaurant.visitMinTicks,'Invalid restaurant demand windows');
  requireValue(Array.isArray(c.definitions) && c.definitions.length===5,'Missing MVP definitions');const seen=new Set<string>();
  for(const d of c.definitions){
    record(d,['typeId','definitionVersion','displayName','footprint','entranceOffsetX2','constructionCostMinor','operatingMinorPerDay','capacity','rentMinorPerDay','visitPriceMinor','perFloorCostMinor','scheduleProfileId','capabilities']);
    requireValue(Object.hasOwn(definitionCapabilities,d.typeId) && !seen.has(d.typeId) && d.definitionVersion===1 && typeof d.displayName==='string' && d.displayName.length>0,'Unsupported definition');seen.add(d.typeId);
    numbers(d.footprint,['width','height'],true);requireValue(d.footprint.height===1,'Unsupported room height');
    for(const n of [d.entranceOffsetX2,d.constructionCostMinor,d.operatingMinorPerDay,d.capacity,d.rentMinorPerDay,d.visitPriceMinor,d.perFloorCostMinor])tick(n);
    requireValue(d.entranceOffsetX2<=multiply(d.footprint.width,2),'Entrance outside footprint');
    requireValue(Array.isArray(d.capabilities) && d.capabilities.length===1 && d.capabilities[0]===definitionCapabilities[d.typeId],'Unsupported capability');
    const schedule=d.typeId==='office.small'?office.id:d.typeId==='restaurant.small'?restaurant.id:null;
    requireValue(d.scheduleProfileId===schedule,'Invalid schedule reference');
    if(d.typeId==='elevator.standard')requireValue(d.capacity===8,'Definition capacity mismatch');
    if(d.typeId==='lobby.basic')requireValue(d.constructionCostMinor===0 && d.operatingMinorPerDay===0 && d.rentMinorPerDay===0,'Permanent lobby must be free');
  }
  record(c.level2,['id','offices','workers','restaurants','visits','minimumCashMinor','positiveOperatingNet','quality','completedOfficeArrivals','maximumStranded','maximumUnresolvedPriorDayTrips','fullDayRequired']);
  for(const [key,n] of Object.entries(c.level2))if(!['id','positiveOperatingNet','fullDayRequired'].includes(key)){requireValue(typeof n==='number','Invalid progression number');tick(n);}
  requireValue(c.level2.id==='tower.level2' && c.level2.positiveOperatingNet===true && c.level2.fullDayRequired===true && c.level2.quality<=100 && c.level2.maximumStranded===0 && c.level2.maximumUnresolvedPriorDayTrips===0,'Unsupported progression predicates');
  numbers(c.routing,['routeCacheEntries','nominalCycleTicks','transferPenaltyTicks','rerouteImprovementTicks'],true);
  numbers(c.metrics,['version','walkingBasisPointsPerMinute','waitingBasisPointsPerMinute','ridingBasisPointsPerMinute','denialBasisPoints','transferBasisPoints','strandedBasisPointsPerMinute'],true);
  requireValue(c.metrics.version===1 && c.metrics.waitingBasisPointsPerMinute>c.metrics.ridingBasisPointsPerMinute,'Unsupported metric formula');
  numbers(c.historyLimits,['liveTicks','financeTicks','days'],true);
}
/** Enforce normalized base spans, configured bounds and supported permanent entrance geometry. */
export function assertWorld(w:WorldConfig,c:Content):void {
  record(w,['widthCells','minFloor','maxFloor','groundFloor','initialConstructedRanges','lobbyX','lobbyDefinitionId']);
  positive(w.widthCells);multiply(w.widthCells,2);integer(w.minFloor);integer(w.maxFloor);integer(w.groundFloor);add(w.maxFloor,1);add(w.minFloor,-1);integer(w.lobbyX);
  requireValue(w.minFloor<=w.groundFloor && w.groundFloor<w.maxFloor && w.lobbyDefinitionId==='lobby.basic','Invalid floor bounds');
  requireValue(Array.isArray(w.initialConstructedRanges) && w.initialConstructedRanges.length>0,'Missing base');let end=-1;
  for(const r of w.initialConstructedRanges){record(r,['startX','endXExclusive']);tick(r.startX);positive(r.endXExclusive);requireValue(r.startX> end && r.startX<r.endXExclusive && r.endXExclusive<=w.widthCells,'Base ranges must be normalized');end=r.endXExclusive;}
  const lobby=c.definitions.find(d=>d.typeId===w.lobbyDefinitionId)!;const lobbyEnd=add(w.lobbyX,lobby.footprint.width);
  requireValue(w.initialConstructedRanges.some(r=>r.startX<=w.lobbyX && r.endXExclusive>=lobbyEnd),'Lobby needs full constructed support');
}
