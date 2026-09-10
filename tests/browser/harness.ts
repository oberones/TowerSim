import { mountGame } from '../../src/main';
// T022 adds validated initial fixtures before mounting; no mid-play mutation API.
const root = document.getElementById('app');
if (!root) throw new Error('Missing application root');
mountGame(root);
