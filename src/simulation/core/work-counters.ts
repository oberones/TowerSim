export type WorkKind='graphBuilds'|'routeRequests'|'pathSearches'|'cacheHits'|'cacheMisses'|'eventsScheduled'|'eventsProcessed'|'boundaryTransactions'|'draftContainersCopied'|'accessBuilds'|'accessQueries'|'draftCopiedSlots';
export type WorkCounts=Record<WorkKind,number>;
let current:WorkCounts|null=null;
/** Count explicitly opted-in diagnostic work without clocks, persistent fields or gameplay decisions. */
export function countWork(kind:WorkKind,amount=1):void {if(current)current[kind]+=amount;}
/** Scope one synchronous measurement and always disable instrumentation after success or failure. */
export function measureWork<T>(run:()=>T):{value:T;counts:WorkCounts}{
 if(current)throw Error('Work measurements cannot overlap');
 const counts:WorkCounts={graphBuilds:0,routeRequests:0,pathSearches:0,cacheHits:0,cacheMisses:0,eventsScheduled:0,eventsProcessed:0,boundaryTransactions:0,draftContainersCopied:0,accessBuilds:0,accessQueries:0,draftCopiedSlots:0};current=counts;
 try{return {value:run(),counts};}finally{current=null;}
}
