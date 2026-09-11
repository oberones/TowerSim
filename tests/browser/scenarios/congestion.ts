import { congestion } from '../../fixtures/congestion';
import { elevator } from '../../fixtures/transport';
/** Supply the validated pre-rush comparison before mounting; all subsequent play uses ordinary controls. */
export function congestionScenario(improved=false){const s=congestion();if(improved){elevator(s,5,14);}return s;}
