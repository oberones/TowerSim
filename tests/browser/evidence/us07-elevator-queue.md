# M4 — elevator queue evidence, 2026-09-10

**T072 remains unchecked.** Firefox and Safari observations below passed; Chrome and the complete forming-while-away checkpoint trace remain unverified. Mixed real customer traffic belongs to T119.

## Artifacts and method

Native Firefox 155.0.1 and Safari 26.5 on macOS/Darwin 25.5.0; seed `00000001000000020000000300000004` for prepared fixtures, rules `tower-transport-v1`, content `mvp-transport-v1`, state version 1. The production-mode fixture bundle was served at `http://127.0.0.1:4174/`, release at `http://127.0.0.1:4173/`. Fixture construction/scheduling/advancement finishes before mounting the ordinary application; all subsequent observation uses ordinary controls.

Queue and initial workday observations used prepared JavaScript `index-BT7GiMTP.js`; final Firefox day/stranding observations used `index-DP5_8Oki.js`. The final bundle adds indexed removal positions and retention of histories referenced by long-lived workers, with identical tested gameplay outcomes. Both native release smoke runs used final JavaScript `index-BZE1jtRk.js`. Exact final source/output hashes are in [phase-8-10-artifacts.json](../../../docs/phase-8-10-artifacts.json). No deployment or native-storage qualification is implied.

## Observed queue behavior

Both browsers loaded **Nine workers — paused at boarding cutoff**. At 08:07 the car had not yet boarded any passenger; all nine were physically queued. Live report: nine samples, nine unresolved, four seconds mean waiting, 36 total waiting seconds, 4,050 walking seconds, zero riding and one capacity denial; quality 98.61. Every served floor 0–3 showed both directional counts including zeros. Selecting `occupant:32` showed waiting for the office, four seconds waiting and one denial. Pause preserved the readings.

Both separately loaded **Eight aboard — ninth waiting**. The shaft inspector read `car:10`, floor 0, up, dwell, **Load 8/8**, ground-up queue **1**, every other queue zero. Report: 80 total waiting seconds, 28 riding seconds, one denial; remaining wait age 12 seconds. Firefox selected rider `occupant:24`: five seconds waiting, seven seconds riding, zero denials/transfers. Safari's visual check showed the `↑ 1` group label and `↑ wait 0m 12s` overlay next to the ground car.

From the cutoff fixture, ordinary Normal continued the same ninth worker. Safari sampled it still waiting at 56 seconds, with the same single denial. Firefox later sampled it walking from the upper landing with 65 accumulated waiting seconds and 23 riding seconds, still one denial. Both reached **nine present**; selected `occupant:32` remained inspectable inside the office. Completed morning report matched in both: nine samples/completions, peak unique queue 9, total waiting 133s (mean 14.8s displayed), riding 263s, walking 7,560s, one denial, zero transfers, quality **97.29**, all arrivals before departure.

Screenshots were visually inspected through native UI tooling; no continuous video or manual timing of each one-second transfer is claimed. The exact eight sequential boarding transfers and partial unloading are verified by automated tests.

## Ordinary release smoke

Both browsers opened release `dist/`: paused 06:00, $10,000, zero workers, zero queues and `No trips yet`. Ordinary Office placement at ground cell 24 charged $600. Normal then Pause at 06:01 produced 32 leased workers, zero presence and still no fabricated trips. Seeds: Firefox `d9d728abe1eb531c06a4d7d73c790060`; Safari `3d8036d191b1736b03fa6b32a13bd9a2`. These are release observations; prepared-state traffic measurements remain separately labeled.
