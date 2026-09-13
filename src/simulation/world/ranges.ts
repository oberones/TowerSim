import type { Range } from '../state/content';
/** Detect positive overlap in half-open intervals; touching boundaries do not overlap. */
export function overlaps(a:Range,b:Range):boolean {return a.startX<b.endXExclusive && b.startX<a.endXExclusive;}
/** Test complete coverage by one normalized connected span. */
export function covers(ranges:readonly Range[],range:Range):boolean {return ranges.some(r=>r.startX<=range.startX && r.endXExclusive>=range.endXExclusive);}
/** Copy, sort and coalesce ranges into maximal connected intervals without mutating inputs. */
export function normalizeRanges(input:readonly Range[]):Range[] {
  const result:Range[]=[];for(const r of [...input].sort((a,b)=>a.startX-b.startX)){const last=result[result.length-1];if(last && r.startX<=last.endXExclusive)last.endXExclusive=Math.max(last.endXExclusive,r.endXExclusive);else result.push({...r});}return result;
}
/** Remove a validated interval, retaining independent left/right fragments and their original coordinates. */
export function subtractRange(input:readonly Range[],cut:Range):Range[] {
  const result:Range[]=[];for(const r of input){if(!overlaps(r,cut)){result.push({...r});continue;}if(r.startX<cut.startX)result.push({startX:r.startX,endXExclusive:cut.startX});if(r.endXExclusive>cut.endXExclusive)result.push({startX:cut.endXExclusive,endXExclusive:r.endXExclusive});}return result;
}
