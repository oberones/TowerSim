# C3 — traffic inspection evidence, 2026-09-10

**T087 remains unchecked.** Firefox/Safari scoped-report observations passed. Chrome and complete manual failed/abandoned journey traces remain outstanding; real customer projections/visits close at T120.

## Artifacts and method

Native Firefox 155.0.1 and Safari 26.5 on macOS/Darwin 25.5.0; seed `00000001000000020000000300000004` for prepared fixtures, rules `tower-transport-v1`, content `mvp-transport-v1`, state version 1. The production-mode fixture bundle was served at `http://127.0.0.1:4174/`, release at `http://127.0.0.1:4173/`. Fixture construction/scheduling/advancement finishes before mounting the ordinary application; all subsequent observation uses ordinary controls.

Queue and initial workday observations used prepared JavaScript `index-BT7GiMTP.js`; final Firefox day/stranding observations used `index-DP5_8Oki.js`. The final bundle adds indexed removal positions and retention of histories referenced by long-lived workers, with identical tested gameplay outcomes. Both native release smoke runs used final JavaScript `index-BZE1jtRk.js`. Exact final source/output hashes are in [phase-8-10-artifacts.json](../../../docs/phase-8-10-artifacts.json). No deployment or native-storage qualification is implied.

## Inspected report scopes and people

Both browsers exposed all eight directional queues for floors 0–3, including zero counts. Nine-person cutoff, full-car and completed-morning readings agree with [M4 evidence](us07-elevator-queue.md). Selection retained the ninth worker through waiting, subsequent service and indoor admission. Firefox also inspected a full-car rider with positive waiting/riding time and no first-boarding transfer penalty. Latest morning and previous completed-day scopes disclosed their day, complete sample counts, component totals, failed/unresolved labels and unclipped internal scoring rounded only for display. Empty release reports said `No trips yet`.

Both browsers loaded **Office workday — stranded after safe access removal**. The fixture first admits all 32 people, removes the empty shaft through the normal safe demolition command, and advances evening departures. At 19:26: **32 unresolved, 32 stranded**, zero queued, zero riding/waiting, **169,695 stranded seconds**, quality **0.30**. Safari selected `occupant:24`: real exit goal, `stranded` state, **8,800 stranded seconds**, zero denials/transfers. This visibly distinguishes missing access from capacity delay, which keeps positive queue membership and waiting history. The original morning cohort and completed-day samples remain independently selectable.

The waiting-time overlay was visually inspected in Safari; Firefox's expanded panel and Canvas were also inspected. Text and controls fit without overlap at the observed native window sizes. No cross-device, performance, accessibility-conformance or extended-session claim is made.

Automated reconciliation sums per-trip experience independently and matches live, cohort and completed-day counters; checks failed exits, repeated waits/transfers, midnight contributions once per active day, zero-wait members, no favorable empty sample, deadline failure, 30-day summary limits, report nonmutation and corrupted-snapshot rejection. The 200-test final suite passes on pinned Node 24.20.0.

## Ordinary release smoke

Both browsers opened release `dist/`: paused 06:00, $10,000, zero workers, zero queues and `No trips yet`. Ordinary Office placement at ground cell 24 charged $600. Normal then Pause at 06:01 produced 32 leased workers, zero presence and still no fabricated trips. Seeds: Firefox `d9d728abe1eb531c06a4d7d73c790060`; Safari `3d8036d191b1736b03fa6b32a13bd9a2`. These are release observations; prepared-state traffic measurements remain separately labeled.
