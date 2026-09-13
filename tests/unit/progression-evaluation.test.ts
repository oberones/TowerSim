import { expect,it } from 'vitest';
import { progressionPredicates } from '../../src/simulation/progression/evaluate';
import type { Evaluation } from '../../src/simulation/progression/evaluate';
import { LEVEL2 } from '../../src/content/progression/level2';
export const qualifying:Evaluation={day:1,evidence:{dayStart:86400,eligibleFullDay:true,minAccessibleLeasedOffices:3,minAssignedWorkers:80,restaurantAccessibleEvidence:1,admittedRestaurantVisits:10,completedOfficeArrivals:80},cashMinor:0,operatingNetMinor:1,quality:60,samples:180,strandedCount:0,unresolvedPriorDayTrips:0};
it('accepts every exact threshold with a nonempty unrounded daily score',()=>{expect(progressionPredicates(qualifying,LEVEL2).every(p=>p.met)).toBe(true);});
for(const [key,value] of Object.entries({eligibleFullDay:false,minAccessibleLeasedOffices:2,minAssignedWorkers:79,restaurantAccessibleEvidence:0,admittedRestaurantVisits:9,completedOfficeArrivals:79}))it(`rejects independently unmet ${key}`,()=>{const v=structuredClone(qualifying);Object.assign(v.evidence,{[key]:value});expect(progressionPredicates(v,LEVEL2).filter(p=>!p.met)).toHaveLength(1);});
for(const [key,value] of Object.entries({cashMinor:-1,operatingNetMinor:0,quality:59.99999,samples:0,strandedCount:1,unresolvedPriorDayTrips:1}))it(`rejects independently unmet ${key}`,()=>{const v={...qualifying,[key]:value};expect(progressionPredicates(v,LEVEL2).filter(p=>!p.met)).toHaveLength(1);});
