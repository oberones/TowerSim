# Research: TowerSim MVP

**Date**: 2026-09-09. **Inputs**: [specification](spec.md), [constitution](../../.specify/memory/constitution.md), and the implementation-planning request. Decisions below resolve all 16 requested research topics. Sources establish algorithms/platform behavior; TowerSim representations and numerical game defaults are design choices, not measured performance or real-elevator engineering claims.

## R01 — Fixed tick and presentation speed

**Decision:** One tick is one simulated second. Clock, scheduled deadlines, phase durations, and trip timing use integer ticks. The application converts foreground real time to 120/480/960 ticks per second for normal/4×/8× and 0 for pause. Retain unprocessed foreground work, yield between bounded batches, and never omit simulation events to catch up. Render interpolation is read-only.

**Rationale:** A ten-second tick cannot directly represent one-second transfers or two-second door phases. Splitting every ten-second tick internally would introduce a second scheduler/timebase. One-second ticks give direct, testable ordering without sub-tick events. The accepted 12-real-minute day implies 120 simulated seconds per real second; the request's suggested 60 is tentative and would double session-day duration. Preserve the spec and keep pacing configurable outside the domain.

**Alternatives considered:** 10 seconds (too coarse); 5 seconds (still coarse boarding/doors); 0.1 seconds (10× update work without a current gameplay need); variable delta time (outcomes/ordering depend on presentation). A one-second tick is a design decision to validate, not a benchmark result. At 500 active walkers and 8×, naïve traversal work is about 480,000 updates/real second; 5,000 implies 4.8 million. Queue age and riders do not require equivalent individual work.

**Sources:** [Fiedler's original fixed-timestep/accumulator article](https://gafferongames.com/post/fix_your_timestep/); [Peters, Lift Performance Time](https://joomla.peters-research.com/index.php/support/articles-and-papers/117-lift-performance-time); [Peters, passenger-transfer discussion](https://www.joomla.peters-research.com/index.php/support/articles-and-papers/247-expert-systems-for-lift-traffic-design). Real service-phase observations inform granularity only; selected game durations remain independent balance data.

## R02 — Logical world coordinates

**Decision:** Integer placement cells, integer floors, and half-open horizontal ranges `[x, x + width)`. `WorldConfig` starts at width 120, floor 0 through 40, but algorithms accept any validated configured bounds. Entrance positions use integer half-cell units (`x2 = 2*x + width`) to support odd-width facilities without fractional placement. Movement is endpoints plus integer elapsed/duration ticks; pixels are never authoritative.

**Rationale:** Half-open ranges make adjacency and overlap unambiguous. Half-cell entrance units avoid floating location accumulation; interpolation may use fractions only in presentation. Stable entity IDs never encode a grid-array offset or assume width 120.

**Alternatives considered:** Pixels (break zoom independence); floating authoritative coordinates (unnecessary drift); one entity per cell (more allocation and rigid identity); physical meters (not needed for this game). This is a domain design decision grounded in FR-003–006 and Constitution IV.

## R03 — Constructed ranges and placement indices

**Decision:** Persist sorted disjoint maximal `ConstructedRange[]` on each `Floor`. Merge adjacent ranges, reject overlapping proposed construction, and require every upper-floor cell to be covered below. Derive sorted per-floor reservation intervals for facilities, stair landings, and shaft slices; owner IDs support inspector lookup. Binary search checks likely overlaps, then only adjacent reservations are examined. Shaft reservations span all shaft floors, even an unserved floor; every level within the selected contiguous service range requires a valid built landing.

**Rationale:** Sparse intervals represent partially built floors directly. At width 120 and modest room counts they are simple and small; widening does not change persisted identity or allocate an entire world grid. Placement occupancy is separate from the automatically provided continuous hallway. A shaft can reserve construction space without severing horizontal walking.

**Alternatives considered:** Dense typed occupancy arrays (reasonable at width 120, but require another representation and scale with configured width); a cell graph (needlessly couples routing and construction resolution); spatial trees (no benefit before profiling). Sorted arrays give O(log r) lookup and O(r) insertion per affected floor, adequate for infrequent edits. This is an original design choice; measure edit latency under SC-012.

## R04 — Scheduled-event queue

**Decision:** Small custom indexed binary min-heap keyed by `(dueTick, phasePriority, sequence)`, with an event-ID → heap-index map. Event records contain typed data, never callbacks. Persist pending records and the next sequence/ID; reconstruct heap layout deterministically after load. Insert/pop/cancel/reschedule are O(log n), peek O(1). Rescheduling allocates a fresh sequence. True cancellation and lifecycle-generation checks prevent stale events accumulating or resurrecting demolished facilities.

**Rationale:** The game needs cheap removal of visits/wakeups when facilities disappear. Total ordering makes same-time execution independent of hash-map iteration and heap layout. Schedule handlers may create only future-tick events; intentional same-boundary chains are explicit later phases in the advancement contract.

**Alternatives considered:** Sorted array (O(n) churn at large schedules); ordinary heap with lazy canceled tombstones (unbounded dead future records); calendar queue (extra tuning); a library (small required surface does not justify a production dependency).

**Source:** [Sedgewick/Wayne indexed priority queue documentation](https://algs4.cs.princeton.edu/code/javadoc/edu/princeton/cs/algs4/IndexMinPQ.html). Implement the abstract data structure independently; do not copy source with incompatible licensing.

## R05 — Seeded PRNG

**Decision:** A small `xoshiro128**` adapter (`algorithmId: xoshiro128ss-v1`, using the author's corrected 1.1 transition). A displayed seed is exactly 32 hexadecimal characters interpreted as four uint32 words in displayed order; reject the all-zero seed. Persist the original seed and all four current words. Platform code may generate a new seed with `crypto.getRandomValues`; the domain only receives seed data. Use explicit unsigned normalization, `Math.imul`, bounded integer rejection sampling, import/export, and fixed golden vectors.

**Rationale:** Four 32-bit words fit JavaScript's integer bitwise operations, JSON encoding and deterministic continuation. One PRNG state is enough; system/entity iteration order is fixed. Construction of another shaft consumes no random values and never regenerates the existing demand schedule.

**Alternatives considered:** `Math.random()` (no reproducible state contract); PCG32 (64-bit arithmetic adds implementation cost here); seeded random package (unnecessary for this narrow API); numeric/string seed hashing (avoided by explicit 128-bit seed syntax). Future stream splitting requires a versioned rules change rather than implicit reseeding.

**Sources:** [Generator author's overview](https://prng.di.unimi.it/), [permitted reference transition and all-zero restriction](https://prng.di.unimi.it/xoshiro128starstar.c), [ECMAScript Math.imul semantics](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-math.imul). Record the reference's public-domain permission and attribution in provenance; no proprietary game code is involved.

## R06 — Navigation topology and invalidation

**Decision:** Sparse portal graph: hallway anchors within each constructed span, facility entrances, stair endpoints, lobby entrance, elevator platforms, and directed ride nodes. Adjacent hallway anchors connect by walk edges. Board/alight edges distinguish queuing from travel; adjacent same-direction ride edges yield O(stops) elevator graph size and collapse to a single committed ride leg. They do not force the car to stop at intermediate graph nodes. Consecutive straight walk edges also collapse before duration rounding so graph subdivision cannot change travel time.

Fully rebuild derived graph/index data once per accepted topology change, increment a persistent version, and discard stale cache entries. Use deterministic Dijkstra with nonnegative integer generalized costs measured in half-tick units, keeping half-cell walking costs exact under graph subdivision. A bounded cache (initially 4,096 entries) stores static walk/stair paths or connectivity, not queue-sensitive winning routes. All viable elevator services remain searchable. Generic edge kinds and semantic infrastructure IDs allow later transfers/modes.

**Rationale:** Edits are much rarer than movement ticks. Rebuilding a small portal graph is easier to validate than incremental mutation. Persist active segment endpoints/progress and committed ride stops; rebuilding a graph does not invalidate a safe segment already underway. Load reconstructs the graph at the saved version without rerouting or consuming RNG.

Apply mode preference first: same-floor direct walking when connected; stairs-only if one/two floors and viable; a route containing elevator travel for longer trips if viable; otherwise another valid route. Inside that class, use walk/stair duration, estimated wait, ride duration and transfer penalty. Estimate wait from a nominal cycle and directional queued plus approaching assignments, not a full future car simulation. Sequential routing updates assignments to avoid a same-tick herd.

Only topology changes reconsider existing queues in MVP. Compare current remaining cost with alternative walk + queue + ride; migrate only for a strict configured improvement (initially 10 ticks). Use stable waiting/ID order; retain total wait/denials and physically walk to the other stop. Joining a new service takes a fresh local FIFO place. No periodic route oscillation or queue-driven stairs fallback.

**Alternatives considered:** Every-cell graph, all stop pairs, incremental graph repair/D* Lite, per-frame pathfinding, exact future elevator prediction, or caching one permanently selected shaft. These either grow graph/work or preserve stale decisions without a measured need.

**Sources:** [Red Blob's original graph-reduction discussion](https://www.redblobgames.com/pathfinding/grids/algorithms.html); [Koenig/Likhachev, D* Lite](https://www.cs.cmu.edu/~maxim/files/dlite_icra02.pdf). The latter establishes an incremental alternative; adopting it is deliberately deferred until profiling justifies complexity.

## R07 — Elevator movement abstraction

**Decision:** Integer timing and explicit car phases: idle, starting, moving, leveling, opening, unloading, boarding, dwell, closing. Initial game values: start 2 ticks, adjacent-floor travel 4, leveling 2, door open/close 2 each, unload/board 1 per person, dwell 2. Persist current adjacent-floor segment and phase progress. Apply start/level overhead at actual stopped flights, not each crossed floor. A direct n-floor flight therefore takes `4*n + 4` ticks before service phases.

**Rationale:** Travel and passenger exchange are real and saveable; acceleration/jerk physics contributes no necessary MVP decision. At floor crossings the controller may accept newly requested stops ahead. It never reverses between floors or discards an onboard destination. Presentation interpolates motion from logical endpoints.

**Alternatives considered:** Instant floor jumps (invalid); detailed acceleration curves (extra model); constant per-floor time including a full stop overhead even when passing (penalizes express-like uninterrupted travel artificially). These timings are tunable original game defaults.

**Sources:** [Peters, flight time](https://joomla.peters-research.com/index.php/support/articles-and-papers/117-lift-performance-time); [Peters, traffic calculations and dwell](https://download.peters-research.com/library/Traffic_calculations_and_how_they_compare_with_what_happens_in_the_real_world_090916.pdf). Do not infer real engineering safety/performance from game values.

## R08 — Collective-control policy

**Decision:** A single internal `DispatchPolicy` implementation follows the accepted directional sweep. Serve onboard and compatible hall requests ahead in floor order; include opposite-direction calls ahead when finding the farthest reversal point. At that point reverse before boarding matching return travelers. Idle empty cars take the nearest pickup, lower floor on distance ties; both directions at that floor are resolved by earliest queue admission sequence. Never reverse a loaded car away from an onboard destination. Full cars still stop for eligible calls and record capacity denials; unloaded places are available before boarding.

**Rationale:** Predictable service, persistent requests and finite throughput satisfy the gameplay. Keep the policy boundary separate from entities/queues without a player algorithm selector or generic plugin infrastructure.

**Alternatives considered:** FIFO pickup journeys (poor shared service); stopping at every floor (unrequested dwell); destination dispatch/group optimization (explicitly excluded). The source's single-car collective-control description supports the basic concept; advanced sections are outside scope. TowerSim's full-car stopping/denial rule is explicitly determined by its specification.

**Source:** [Gerstenmeyer/Peters, Reverse Journeys and Destination Control, sections 1.1–1.2](https://liftescalatorlibrary.org/paper_indexing/papers/00000068.pdf). No destination-dispatch algorithm is adopted.

## R09 — Elevator queues and service cohorts

**Decision:** Explicit queue records per service stop and direction with entries keyed by occupant ID and persistent globally allocated admission sequence (FIFO within each queue). Runtime indices support append/removal without per-tick compaction. Persist membership/order, accumulated trip wait, current waiting start, requested unload stop, and active car-service cohort/progress. Freeze eligible boarders at the cutoff after unloading; board one person/tick up to capacity. Give each eligible capacity-excluded person one denial for that car service ID. Later arrivals join a future service, without retroactive denial.

**Rationale:** A cutoff makes boarding finite, ordering reproducible and mid-service saves unambiguous. Queue timestamps and count/sum aggregates support current waits without updating every waiting person each tick. Active queue processing means responding to service/routing changes and maintaining aggregates, not scanning all passengers every tick.

**Alternatives considered:** Sprite proximity (not authoritative); arrays repeatedly shifted (avoidable O(n)); full queue scans each tick (wasteful); erased/recreated queues after edits (loses history). This decision implements FR-025–029; exact structures are specified in the model.

## R10 — Occupant sleeping and wakeups

**Decision:** Lightweight discriminated person/location records plus derived active indices. Office workers and restaurant visitors in a facility sleep until typed departure/visit-end events. Future external arrivals are scheduled identities; walking/stairs advance on ticks; riding locations reference a car; waiting ages derive from timestamps. Reevaluate stranded people on topology changes, not continuously. Retain worker identity if still inside at a later day's arrival time; suppress duplicate visits.

**Rationale:** Simulation cost follows active work, rather than tenant population. Save captures both the dormant state and its future event. Cached counts are updated on transitions and can be rebuilt/verified.

**Alternatives considered:** Full-population update each tick; object-per-person UI state; regenerating people from seed on load; general-purpose ECS. None is necessary. This is a direct design application of Constitution VI–VIII and spec overnight behavior.

## R11 — Bounded metrics and financial history

**Decision:** Keep active trip accumulators, finished trip samples for the last 60 simulated minutes, current/last morning cohort summaries, current/previous completed-day summaries, and a fixed recent-day summary ring. A live score is the mean of per-trip scores, counting unfinished trips once. A simple configurable penalty model uses elapsed wait, ride/walk time, denials and stranding, with stronger wait/denial effects. Required monotonic inequalities and pass/fail fixtures constrain coefficients.

Retain detailed posted transactions for the last 24 simulated hours and aggregate older postings into an archived checkpoint (signed net, category totals, count, last sequence). Keep current/previous daily operating results and a fixed summary ring. Display the archive explicitly so initial cash + archived net + retained transactions always reconciles. Use transition-time accrual and exact integer rounding.

**Rationale:** Memory is bounded by active population and fixed reporting windows, not elapsed game days. Cohort data includes its complete membership until all have arrived or are explicitly failed; it cannot evict inconvenient passengers. Repeatedly stranded trips survive reporting and prevent false progression. Bounded does not mean arbitrary silent truncation of required samples or financial events.

**Alternatives considered:** Unlimited trip/transaction log; samples that drop unfinished trips; building-count satisfaction; frequent per-person history appends. All undermine scale or honesty. Aggregation and formula are TowerSim design choices constrained by FR-030–044 and SC-003/009.

## R12 — Save serialization

**Decision:** Versioned plain-data envelope v1 with immutable scenario/content/rules snapshot and authoritative state. Encode finite numbers, strings, booleans, null, arrays and records only. Store current PRNG words, counters/order sequences, pending events, queues, active traversal/boarding phases, trip accumulators, accruals and milestone evidence. Do not store callbacks, classes, maps/sets, graph objects, caches, browser handles or UI state.

**Rationale:** Rebuild derived structures after load without changing authoritative choices. Full active state is necessary for the next-day equality contract; an original seed alone cannot restore progress. Validate shape, ranges, references, state invariants and compatibility before replacement. Reject unsupported schemas/rules; later migration must be an explicit tested version-to-version conversion.

**Alternatives considered:** Serializing runtime objects, reconstructing active journeys from seed, accepting partially missing fields, or ignoring content/rules differences. All threaten deterministic continuation. [IndexedDB stores structured-cloneable values](https://w3c.github.io/IndexedDB/#value-construct); choosing a narrower JSON-compatible public contract is a deliberate portability decision.

## R13 — IndexedDB strategy

**Decision:** Native IndexedDB with a small Promise-returning adapter implementing application-owned `SaveRepository`. One object store and one envelope record per save slot. Capture/encode before starting the transaction; `put` replaces payload and metadata atomically within one readwrite transaction. Success requires transaction completion; abort or failure preserves the earlier record. Do not delete first or await unrelated asynchronous work inside the transaction.

**Rationale:** IndexedDB is asynchronous and suitable for growing structured snapshots. Native glue remains small for this operation set. Load validates a detached candidate before the existing-unsaved-game confirmation and one session swap; it does not write the candidate back implicitly.

**Alternatives considered:** localStorage (synchronous string serialization and less suitable scale); `idb` (good small wrapper but not needed yet); a database ORM (excess surface); cloud persistence (out of scope).

**Sources:** [IndexedDB transaction specification](https://w3c.github.io/IndexedDB/#transactions), [MDN transaction lifecycle](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB), [idb author's transaction-lifetime guidance](https://github.com/jakearchibald/idb#transaction-lifetime). One-slot native adapter avoids a runtime dependency without pretending transaction lifetime is trivial.

## R14 — Canvas and DOM strategy

**Decision:** One viewport-sized visible Canvas 2D surface with ordered drawing passes and cached static surfaces; no world-sized bitmap. Camera pan/zoom maps logical positions to CSS pixels, with backing-store dimensions accounting for device pixel ratio. Cull by visible floors/ranges; render lightweight shapes or a shared owned sprite sheet. Query visible active people and queue counts without cloning GameState each frame. DOM controls and one selected-entity inspector reuse stable elements.

**Rationale:** This workload does not demonstrate a need for a large UI framework, scene graph, or WebGL. Keep per-frame allocation low, use dirty static layers, and interpolate active locations only. Debug FPS is platform data, never a simulation input.

**Alternatives considered:** DOM entities/cells (constitution violation); rendering framework (unnecessary); worker OffscreenCanvas/LOD (profile first); rebuilding all UI every tick (wasteful).

**Sources:** [Canvas optimization guidance](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas), [RAF behavior including background suspension](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame). Ordinary detached HTML canvas caching avoids requiring worker OffscreenCanvas.

## R15 — Toolchain, Safari, and static delivery

**Decision:** Use strict TypeScript, Vite, Vitest, Node 24 LTS tooling, and native browser APIs. Verified package metadata on the research date: TypeScript 7.0.2, Vite 8.2.2, Vitest 5.0.0. Vite requires Node 20.19+ or 22.12+; Vitest's published ranges include Node 24 and Vite 8. Capture exact selected versions and their lockfile during implementation. No packages are installed by this plan.

Separate `tsconfig.simulation.json` (`lib: [ES2022]`, `types: []`, strict, unchecked-index and exact-optional checks) from browser DOM libraries and test/tool Node types. Run a real typecheck; Vite TypeScript transformation alone does not check types. Enforce imports/globals with a source-boundary check independent of compiler API internals.

Production is `dist/` with `base: './'`, no runtime CDN imports and no history-router/server requirement. Vite's published browser baseline includes Safari 16.4+, but actual then-current stable Safari/Chrome/Firefox acceptance remains mandatory. On Safari verify IndexedDB transaction completion, quota/availability failures, blocked upgrades, close/reopen, Retina sizing, pointer/camera behavior, background/resume and sustained play. Close DB connections on `versionchange`; never fix blocking by deleting saves. Storage remains origin/profile-specific; no promise of retention after user clearing or browser eviction.

**Rationale:** The required toolchain has a compatible Node/Vite/Vitest combination, while the modest Canvas-plus-panels UI needs no framework. Separate compiler environments catch accidental platform coupling; native browser APIs keep static delivery and Safari validation explicit. Package compatibility does not replace actual browser qualification.

**Alternatives considered:** Framework application shell; IndexedDB ORM; legacy-browser plugins; service worker/PWA; browser-specific storage fallback that silently weakens atomicity. None is required by current scope. Handle unsupported storage visibly while preserving active play.

**Sources:** [TypeScript package metadata](https://registry.npmjs.org/typescript/latest), [Vite metadata](https://registry.npmjs.org/vite/latest), [Vitest metadata](https://registry.npmjs.org/vitest/latest), [Node release policy](https://nodejs.org/en/about/previous-releases), [Vitest requirements](https://vitest.dev/guide/), [TypeScript strict](https://www.typescriptlang.org/tsconfig/strict), [TypeScript lib](https://www.typescriptlang.org/tsconfig/lib.html), [TypeScript types](https://www.typescriptlang.org/tsconfig/types.html), [Vite TS behavior](https://vite.dev/guide/features#typescript), [Vite production build](https://vite.dev/guide/build), [WebKit storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/).

## R16 — Benchmark methodology

**Decision:** Seeded, headless full-system benchmarks for approximately 100/1,000/5,000 simultaneously active occupants; separately compare equal active populations with much larger dormant populations. Restore identical fixtures outside timed intervals, warm up three times, measure at least ten independent trials, and compare final canonical state digests. Measure rush, dense walking, and topology-edit workloads independently. Use a small explicit benchmark harness called by a package script; Vitest owns assertions and fixtures.

Report ticks and simulated seconds processed, real duration, ticks/real second, median/p95 fixed-batch latency, active min/mean/max and state breakdown, event operations, path searches/cache hits, graph rebuild/access latency, queue measures, memory where available, and deterministic digests. Record machine/OS/Node/browser/build/commit/instrumentation. Use monotonic performance clocks only in the harness/platform. No universal FPS claim follows from Node throughput.

**Rationale:** Restore-per-trial avoids measuring a drained tower. Active count, not scheduled count, defines stress. The 5,000-active scenario is an architectural stress target; the exact SC-012 qualification tower separately must sustain 120/480/960 ticks per real second and its browser budgets. A failing qualification is a release blocker; an exploratory stress limit is reported with context.

**Alternatives considered:** Timing a single unit test; counting dormant tenants as active; combining rendering and simulation into one opaque FPS figure; relying on experimental runner-specific APIs. Vitest's experimental benchmark wrapper can be added later, but fixtures/harness data remain independent.

**Sources:** [Vitest benchmark feature status](https://vitest.dev/guide/features.html#benchmarking-experimental), [High Resolution Time](https://www.w3.org/TR/hr-time-3/#the-now-method), [Node performance APIs](https://nodejs.org/api/perf_hooks.html).

## Dependency decisions

| Dependency | Why preferable to native/small custom alternatives | Scope |
| --- | --- | --- |
| TypeScript | Required strict static contracts and separate environment typechecking; native JS lacks these checks. | Development |
| Vite | Required local development and static asset production with established browser tooling; custom bundler would add maintenance. | Development |
| Vitest | Required unit/integration runner, assertions, deterministic fixtures and coverage support. | Development |
| Node type declarations | Correct types for tooling/tests, isolated from domain/browser compilation. | Development |
| Runtime libraries | None. Native Canvas/DOM/IndexedDB plus small PRNG/heap/navigation modules cover the specified surface. | No runtime package |

Third-party tool/package licenses and transitive dependencies are recorded at implementation. The PRNG reference permission is preserved in provenance. No image assets or proprietary game references are needed for initial shapes.

## Feasibility reasoning and limits

A candidate congestion fixture has three offices of 32 workers on floors 3/4/5, one eight-person shaft serving 0–5, no stairs route to these offices, and 96 arrivals concentrated in 08:00–08:06 within the allowed morning window. The improved clone adds a second identical shaft without rescheduling anyone. A representative full car cycle visiting 0→3→4→5→0 is approximately 96 simulated seconds under the provisional timings, about five passengers/minute versus 16 arrivals/minute. Fluid estimates give peak backlogs around 66 versus 36 and longest waits around 13.2 versus 3.6 minutes. This suggests a testable bottleneck and useful added capacity, but is not an executed acceptance result.

The schedule profile must remain visibly concentrated and seeded; spreading 96 arrivals uniformly across two hours would likely fail to overload this capacity. Test the exact discrete result, denominator, repeated denials, all-cohort completion, 30% wait/queue reductions, 10-point quality change, and full-day progression contrast. Tune documented data consistently; never weaken the accepted thresholds or remove demand to get a pass.

## Phase 1 toolchain verification — 2026-09-10

Installed and locked TypeScript 7.0.2, Vite 8.2.2, Vitest 5.0.0, and @types/node 24.13.4 after querying npm metadata. Node 24.20.0 is pinned in `.nvmrc`; the system default Node 20 is not used for validation. Vitest 5 requires Node ^22.12.0, ^24.0.0, or >=26.0.0 and accepts Vite 8.

Added development-only @babel/parser 8.0.4 (MIT) for stable TypeScript AST parsing in the boundary checker, independent of TypeScript 7's unstable compiler APIs. Its Node requirement raises this project's minimum to 24.11.0 within the selected Node 24 line. No production dependencies were added. Boundary checking conservatively reserves platform identifier names, rejects non-relative/computed imports and computed Math access; source review still checks indirect capability injection.

Metadata sources: [Vite](https://registry.npmjs.org/vite/8.2.2), [Vitest](https://registry.npmjs.org/vitest/5.0.0), [parser](https://registry.npmjs.org/@babel%2fparser/8.0.4). Installation audit reported zero vulnerabilities; this is a dated tooling result, not release qualification.

## Phase 19 measured decisions — 2026-09-12

Default prices, demand, walking speed, schedule windows, metric coefficients and eight-person cars are unchanged. Scale tests use finite saved overrides; dense walkers and event-heavy rushes are separate workloads. Population sampling runs in an untimed replay so observer scans are not mistaken for domain cost. Scoped optional counters record graph/path/cache and event work without entering authoritative state.

The reference profile identified repeated `assertPlain` descriptor walks plus whole-boundary copying as a major hot path. Public advance and runner creation retain full validation. The owned event loop now copies its already validated state directly with JSON, retaining detached rollback on failure. The full-state copy remains expensive, and reference rush/edit budgets remain unmet; see `docs/performance/remediation.md`. No workers, ECS, incremental graphs or LOD were introduced. The live route path currently rebuilds graphs and does not use the separate bounded RouteCache utility; diagnostics disclose that limitation.

Production graph verification previously called Vite's `resolveConfig` with its default development Node environment despite production mode. The checker now passes explicit production defaults and asserts `DEV=false`/`PROD=true` before checking both graphs and emitted diagnostic code. Ordinary CLI production builds already used production flags.
