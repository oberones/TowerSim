import type { Content } from '../../simulation/state/content';
/** Version-one balance coefficients in basis points, independent of infrastructure counts. */
export const TRANSPORT_METRICS:Content['metrics']=Object.freeze({version:1,walkingBasisPointsPerMinute:10,waitingBasisPointsPerMinute:300,ridingBasisPointsPerMinute:25,denialBasisPoints:400,transferBasisPoints:200,strandedBasisPointsPerMinute:300});
