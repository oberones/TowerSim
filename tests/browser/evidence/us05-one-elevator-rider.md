# M3 one-elevator rider checkpoint — 2026-09-10

**Status:** T054–T063 implementation and automated checks pass. Native Firefox **155.0.1** and Safari **26.5** completed the observations below. **T064 remains unchecked: Chrome is pending at the user's explicit request.** Phase 8 remains untouched.

Observer: Codex using native mouse/keyboard, accessibility inspection and Canvas screenshots in the installed apps on macOS 26.5 (25F71), with existing local profiles. Screenshots covered approximately 1490×770 Firefox and 773×770 Safari windows; exact content viewport/DPR and native console/network diagnostics were not measured.

## Artifact and method

The current prepared-fixture artifact is production-mode `dist-browser-test/` at `http://127.0.0.1:4174/`, JavaScript `index-jnNBFeFR.js`. Release smoke used `dist/` at `http://127.0.0.1:4173/`, JavaScript `index-kCBmuJVt.js`. Full output, fixture-source, lockfile and dirty-source hashes are in [the native artifact manifest](../../../docs/phase-6-7-native-artifacts.json).

Seed `00000001000000020000000300000004`; rules `tower-transport-v1`, content `mvp-transport-v1`, state version 1. One-worker fixtures retain the standard eight-person car and every production duration. Fixtures prepare valid completed boundaries through commands/advancement before mounting; ordinary controls drive all subsequent play. Paused fixture generation and continuation are separately tested. UI times are minute readings, not exact tick measurements.

## Tracked lobby-to-office journey

In each browser, loaded **Elevator phase — idle** at day 1 09:12 and selected `occupant:24` on Canvas at the lobby. Its inspector showed walking toward `facility:7`, with all travel counters initially zero. Normal advanced that same selected worker across the ground hallway, through the elevator and along floor 3 into the office.

Firefox's live inspector samples captured `waitingForElevator` at 450 walking seconds / 3 waiting seconds, then `ridingElevator` with 5 waiting seconds and 10 then 22 riding seconds. Following unloading, the worker walked beside the upper office with 23 total riding seconds. Safari samples captured riding at 17 seconds, then upper-floor walking with the same 5-second wait and 23-second ride totals. Safari's brief waiting state was between samples; its queued state was inspected separately in the paused boarding fixture below.

Both retained the worker selection through `insideFacility`, visit admitted, at 09:26. Paused office inspection showed `facility:7`, leased, Assigned 1 / Present 1 and accessible (Firefox 09:28; Safari 09:26). Screenshots showed ground approach, upper-floor walking and the worker disappearing into the counted office. No state mutation or fixture reload occurred within either journey.

## All nine paused car phases

Each row was independently loaded and checked in **both** native browsers: selected the narrow shaft directly on Canvas; read the phase, load, position and directional queues; reaffirmed Pause and verified unchanged displayed state/cost; resumed Normal; paused again after advancement. All **18 checks passed**.

| Starting phase | Floor | Load | Ground up queue | Firefox | Safari |
| --- | ---: | ---: | ---: | --- | --- |
| idle | 0.00 | 0/8 | 0 | pass | pass |
| leveling | 0.00 | 0/8 | 1 | pass | pass |
| opening | 0.00 | 0/8 | 1 | pass | pass |
| boarding | 0.00 | 0/8 | 1 | pass | pass |
| dwell | 0.00 | 1/8 | 0 | pass | pass |
| closing | 0.00 | 1/8 | 0 | pass | pass |
| starting | 0.00 | 1/8 | 0 | pass | pass |
| moving | 0.00 | 1/8 | 0 | pass | pass |
| unloading | 3.00 | 1/8 | 0 | pass | pass |

The inspector consistently identified `shaft:8` / `car:10`, serving floors 0–3. Other directional queues were zero. Idle starts at 09:12 with $4.00 accrued cost; the other starts are 09:19 with $4.16, or $4.17 when unloading. After resumed service, each non-idle fixture showed an empty idle car at floor 3 and zero queues at 09:20–09:21. The idle fixture remained empty at ground while the worker approached, with advancing clock/cost. The one-tick boarding boundary correctly kept the person queued until transfer completion.

These are paused phase inspections plus sampled live transitions. They do not claim a continuous video or a manually timed pause inside every one-tick transfer. Production Normal advances 120 simulated seconds per real second; precise tick freezing/continuation is also covered by automated tests.

## Loaded guards and release smoke

Initial native checks in both browsers used the preceding harness JavaScript `index-suurlDdP.js`, archived in [the initial manifest](../../../docs/phase-6-7-artifacts.json). Production source and release bytes are unchanged between these harness revisions. On the paused loaded moving car, ordinary removal rejected with “Unload all passengers before removing this shaft.” Changing service from 0–3 to 0–2 rejected with “The loaded car must retain every committed unloading stop.” The range and passenger remained intact. Normal then delivered the worker to the upper office with Present 1. Direct narrow-shaft Canvas selection succeeded in both native browsers, resolving the earlier in-app pointer-check uncertainty.

Separately, each native browser exercised the fresh release artifact through ordinary controls. Seeds: Firefox `8286861765d8ffca8505eee92327358a`; Safari `10db6a026060da4af7116242b48cdd00`. At paused day 1 06:00, built 48 upper cells, an office on floor 1 at cell 24, stairs at cell 10 and a standard elevator at cell 18 serving 0–1. Cash followed $10,000 → $9,952 → $9,352 → $9,302 → $7,202. Canvas showed the constructed connections and car. Shaft inspection showed service 0–1, idle floor 0, Load 0/8, zero queues and $30/day operating cost. Normal then Pause at 06:01 left the idle car at ground with $0.04 accrued cost. Release smoke covers construction, access, selection, costs and pacing; the isolated one-person journey uses the prepared artifact.

## Automated verification and remaining gate

**168 tests / 59 files pass**, together with strict types, 24 boundary regression fixtures, comments on 299 named production functions/methods, both production builds and build isolation. Twelve new observation-fixture regressions verify valid paused boundaries and exact capture/rebuild continuation. Existing tests cover sweep/reversal ties, timed transfers, unload commitments, route preference, physical requests, service edits, strict malformed-state rejection and following-day continuation. The [single-elevator timing sample](../../../docs/performance/single-elevator.md) remains headless evidence only.

Chrome M3 observations remain unverified. Native storage, multi-passenger congestion, browser performance and player evaluation remain separate later gates.
