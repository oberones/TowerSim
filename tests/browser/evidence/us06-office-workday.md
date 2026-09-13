# C2 — recurring office workday evidence, 2026-09-10

**T079 remains unchecked.** Native observations are supplemental. Chrome, a complete three-request morning/evening manual trace in each browser, and the overnight rider recovery observation remain outstanding. Automated tests do establish those deterministic lifecycle/request requirements.

## Artifacts and method

Native Firefox 155.0.1 and Safari 26.5 on macOS/Darwin 25.5.0; seed `00000001000000020000000300000004` for prepared fixtures, rules `tower-transport-v1`, content `mvp-transport-v1`, state version 1. The production-mode fixture bundle was served at `http://127.0.0.1:4174/`, release at `http://127.0.0.1:4173/`. Fixture construction/scheduling/advancement finishes before mounting the ordinary application; all subsequent observation uses ordinary controls.

Queue and initial workday observations used prepared JavaScript `index-BT7GiMTP.js`; final Firefox day/stranding observations used `index-DP5_8Oki.js`. The final bundle adds indexed removal positions and retention of histories referenced by long-lived workers, with identical tested gameplay outcomes. Both native release smoke runs used final JavaScript `index-BZE1jtRk.js`. Exact final source/output hashes are in [phase-8-10-artifacts.json](../../../docs/phase-8-10-artifacts.json). No deployment or native-storage qualification is implied.

## Observed workday and retained reports

Firefox loaded the default **Office workday — before morning rush** (32 assigned workers, ordinary 08:00–10:00 requests). At 08:04/4× it showed no trips yet and zero presence. At 08:47 paused: ten trip samples, eight completed and eight present, two unresolved. Normal then Pause at 09:01 showed fourteen samples, ten completed/present and four unresolved, including a real ground queue of one. A screenshot showed walkers at the lobby and upper office. These samples demonstrate distributed activity; exact request-time diversity is checked in `office-rush-schedules.test.ts`.

Safari loaded **Office workday — before evening rush**, changed to 4×, and at 17:01 observed 30 still present with two active exit trips. Pausing later at 20:09 showed zero present, no queues and the final recent completed exit still included in the trailing-hour report. This was a continuing tower between those observations.

Both loaded the next-day prepared continuation at day 2 06:00: 32 retained workers, zero present, $7,153.50. The previous completed day agreed: **64 samples, 64 completed**, no abandoned/unresolved/stranded trips, waiting **1,257s** (19.6s displayed mean), walking **53,760s**, riding **1,484s**, zero denials/transfers, quality **97.52**. This fixture advances the same tower through normal domain events before mounting; it is not an observed overnight browser session.

Automated evidence covers identical identities on subsequent days, finite stable request generation, three or more distinct request timestamps, rush versus quiet windows, all 30/60/120 callback schedules at 1×/4×/8× with pauses and timed construction, committed overdue rider unloading, no duplicate next-day visit while exiting, repeated demolition retirement and 35-day bounded retention.

## Ordinary release smoke

Both browsers opened release `dist/`: paused 06:00, $10,000, zero workers, zero queues and `No trips yet`. Ordinary Office placement at ground cell 24 charged $600. Normal then Pause at 06:01 produced 32 leased workers, zero presence and still no fabricated trips. Seeds: Firefox `d9d728abe1eb531c06a4d7d73c790060`; Safari `3d8036d191b1736b03fa6b32a13bd9a2`. These are release observations; prepared-state traffic measurements remain separately labeled.
