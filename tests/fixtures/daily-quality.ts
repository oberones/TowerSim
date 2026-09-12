import { MVP_DEFAULT } from '../../src/content/scenarios/mvp-default';
import { mvpJourney } from './mvp-journey';
import { until,WALKER_SEED } from './one-worker';
/** Freeze a disclosed two-rush stress scenario: both directions concentrate requests into six minutes. */
export function dailyQuality(improved:boolean){const scenario={...MVP_DEFAULT,scenarioId:'full-day-rush-contrast',content:{...MVP_DEFAULT.content,schedules:{...MVP_DEFAULT.content.schedules,office:{...MVP_DEFAULT.content.schedules.office,departureEnd:61560}}}};const s=mvpJourney(WALKER_SEED,6,improved,5,scenario);until(s,172800);return s;}
