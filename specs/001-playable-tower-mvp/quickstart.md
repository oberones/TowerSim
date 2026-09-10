# TowerSim MVP quickstart and playable validation

This is the target developer/player walkthrough for the planned implementation. Phase 1 provides the npm entrypoints and static bootstrap. Gameplay, prepared fixtures and the player walkthrough below remain future work. Setup validation is recorded in `docs/release-evidence.md`.

## Developer startup after implementation

Use Node 24 LTS and the committed npm lockfile. From the repository root:

```sh
nvm use
npm ci
npm run check:types
npm run check:boundaries
npm test
npm run test:integration
npm run dev -- --host 127.0.0.1
```

Open the Vite URL in a supported desktop browser. For the production artifact:

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

The built `dist/` directory is static hosting output. Serve it over HTTP(S) at a stable origin; no backend, account, runtime CDN or database service is required. Relative asset paths support a subdirectory deployment. Browser-local saves remain tied to origin/profile. Do not claim `file://` as a deployment mode.

For prepared development checkpoints such as the one-worker walking scenario, build and serve the separate production-mode test harness after the release build:

```sh
npm run build:browser-test
npm run check:browser-builds
npm run preview:browser-test -- --host 127.0.0.1 --port 4174
```

Open the served root `/` and choose a validated starting fixture before play. This serves `dist-browser-test/` using the same application composition and production settings; ordinary controls drive the subsequent session. It does not replace the release `dist/` smoke test and is not a deployment artifact. Record which artifact was observed. For native storage or final performance qualification on a prepared tower, follow the [same-origin local-save handoff](validation.md#browser-build-and-serve-procedure) to load the fixture into the release page; saves from port 4174 are not available automatically on port 4173.

Run headless benchmarks separately:

```sh
npm run bench
```

Capture the machine/version/fixture metadata described in [validation.md](validation.md). This command measures domain throughput, not Canvas FPS.

## Default testable tower layout

Use a fresh default scenario and a recorded seed, such as `00000001000000020000000300000004`. It starts paused at 06:00 on day 1 with width 120, ground floor 0, a permanent lobby at x0–8, positive funds, and all MVP tools available. The seed syntax is32 hex characters; spaces below are prose, not part of the seed.

| Construction | Logical placement |
| --- | --- |
|Ground base|Already built over `[0,120)` with permanent lobby/entrance. |
|Upper floor space|Build full ranges `[0,120)` on floors 1,2,3,4,5 in ascending order. Five floors exceed the requested minimum of three and support the elevator-only office fixture. |
|Lobby-connected stairs|Build floor 0→1 at x80,width 2, and floor 1→2 at x84,width 2. Different positions avoid overlapping reserved landings. Do not connect floor 2→3 for this congestion exercise. |
|Elevator A|Shaftx10, width 2,floors 0–5; served range0–5; exactly one eight-person car. |
|Offices|One width 16 office at x24 on each of floors 3,4,5;32 workers each after leasing. |
|Elevator B intervention|Shaftx14, width 2,floors 0–5, same service and car capacity. This space is reserved for the later improvement. |
|Restaurant|Width20 at x24 on floor 1, built after the initial congestion observation. |

The proposed1,000,000-minor-unit starting balance covers five full new floors (60,000), stairs (10,000), offices (180,000), elevator A (230,000), elevator B (230,000), restaurant (80,000) and a full day's listed operating costs (24,000), leaving186,000. These are planned balance inputs; the construction UI and content must show the same values. No borrowing or developer money injection is needed.

## Playable walkthrough

1. **Start:** choose New Game, inspect the paused06:00 clock, seed, positive cash, Level 1 and tools. Confirm the lobby/base is protected from demolition.
2. **Construct floor space:** add floors 1–5 in order using the floor-range tool. Observe per-span cost/support validation and automatic walking paths. Camera zoom/pan changes only the view. An unsupported/overlapping preview shows a reason and charges nothing.
3. **Connect infrastructure:** build the two low-floor stair links and elevator A. Confirm shaft range and every landing are valid. Stairs serve floors 1–2 only; offices above will rely on elevators so stairs do not hide the bottleneck.
4. **Place offices:** construct the three offices while still paused. Inspect vacant tenancy, zero physically present workers and the next leasing review.
5. **Acquire tenants:** unpause briefly. The one initial06:00 review leases the accessible offices if finite demand is available, assigning96 total workers. The tenant/workforce count can be nonzero while physical presence is still zero.
6. **Prepare measurement:** advance toward 07:50, pause, and inspect the morning schedule. For an exact controlled comparison, explicitly save this pre-rush tower now; starting a new game does not overwrite that slot. This saved snapshot retains the already generated worker cohort.
7. **Observe morning traffic:** run through 08:00 and the concentrated arrival wave. People enter at the lobby, walk to the stop, queue, board up to eight, ride over time, and enter their offices. Normal speed is120 simulated seconds per real second; pause often to inspect. Fast/very-fast are4×/8× of normal.
8. **Intentionally exceed capacity:** retain only elevator A while all three offices generate their rush. Inspect successive visits: a persistent backlog, denied boarding and increasing waits should be visible. Record baseline mean wait, peak unique queue and cohort quality after all96 reach their offices. The candidate profile must be calibrated to meet the spec's three growing visits, ≥10-minute wait and repeated denial; do not mark this step passed based on the research estimate alone.
9. **Diagnose:** use the elevator inspector and transportation view to distinguish a reachable but overloaded destination from an inaccessible one. Inspect a waiting person and compare walking/waiting/riding/denials and sample counts.
10. **Add capacity:** during continued play, build elevator B in its own shaft serving those same floors. Inspect both eight-person cars. Waiting/new travelers can choose useful additional service; migration includes a real walk and preserves previous wait/denials. Capacity is not an upgrade to elevator A or a second car in its shaft.
11. **Observe improvement:** on the next comparable morning with the same workforce and arrival intensity, compare retained reports and visible queues. For the exact numerical acceptance check, load the explicit07:50 save (validate first and handle unsaved replacement), addB before the rush, and replay that identical cohort. The headless fixture performs this comparison automatically: ≥30% less mean wait, ≥30% lower peak queue and ≥10-point better cohort quality, with everyone arriving before departures. Perform the continuous-play improvement as well; the controlled load does not substitute for it.
12. **Build a restaurant:** place the floor 1 restaurant. If its daily06:00 allocation review has passed, its inspector explains that first customer schedules begin after the next review. No instant customer revenue appears merely from construction.
13. **Observe lunch:** after an eligible review, run through 11:30–13:30. Most daily customers arrive during that meal window, use the lobby and physical route (the short-floor stairs preference applies), enter/pay once, stay for a bounded visit, then return to the lobby. Incoming and inside counts remain distinct.
14. **Read finances:** inspect construction outflow, restaurant admission income, rent earned only during office access, ongoing costs, pending accrual and midnight posting. Totals reconcile. A failed placement changes no money; a zero-cost demolition may still settle previously incurred operating amounts.
15. **Complete a qualifying day:** preserve three leased accessible offices/96 workers throughout a full00:00–24:00 day, keep a functioning accessible restaurant with at least10visits, achieve cash≥0 and positive operating net after settlement, daily transport quality≥60 with≥80completed office arrivals, and zero stranded or unresolved prior-day trips. The initial partial day cannot qualify; after construction and the next review, a later complete day can. Inspect each target/reason and observe the permanent one-time Level 2 award.
16. **Save active traffic:** during a subsequent rush, save while a car carries people and others walk or wait. Note the saved tick and success feedback; a pending operation must not erase newer paused edits from unsaved status. Repeat a save during a restaurant/office stay to cover sleeping occupants.
17. **Reload:** refresh or close/reopen under the same browser origin/profile and load. Validate the candidate before any active-game replacement decision. Loading starts paused at the saved instant with the same cars, queues, routes, occupants, finances and future schedules; no elapsed real time generates simulation progress.
18. **Continue:** resume and finish the next full day. Look for preserved queue order/waits, valid unloading, once-only revenue and milestone status. Automated continuation tests compare against an uninterrupted run; visual similarity alone does not establish equality.
19. **Recovery check:** in a separate saved copy, test removing an empty access link or occupied room. Loaded cars/occupied stairs reject unsafe removal; demolished room occupants emerge at their surviving entrance and attempt a real exit, becoming visibly stranded only if no route exists. Restore a route and observe departure without teleportation.

## Evidence to record

Record seed, content/rules version, command/build layout, day/time, baseline/improved complete cohort membership and metric totals, observed milestone day, save points, exact browser/OS/hardware and unmet checks. For release, execute in actual current stable Chrome, Firefox and Safari; distinguish automated headless results from visual/storage observations and five-new-player evaluations. A planned workflow or analytical capacity estimate is not evidence that gameplay, balancing or performance passed.
