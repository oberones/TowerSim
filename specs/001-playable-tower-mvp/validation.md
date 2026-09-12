# Validation and evidence plan

This file defines future implementation checks. No application tests, benchmarks, browser QA or player evaluations have run during planning. Documentation validation is reported separately. The [constitution](../../.specify/memory/constitution.md) and all [spec success criteria](spec.md#success-criteria-mandatory) remain release gates.

## Planned commands

Create these scripts during implementation; they do not exist in the planning-only checkout yet.

| Command | Responsibility |
| --- | --- |
| `npm run check:types` | Separate strict simulation, browser, and test/tool TypeScript checks. Domain lib excludes DOM/Node globals. |
| `npm run check:boundaries` | Reject simulation imports of app/platform/persistence/rendering/UI/Vite and direct browser/time/random dependencies. Include static/dynamic imports; source review supplements automated enforcement. |
| `npm test` | `vitest run`: unit and headless integration suites with explicit fixtures/seeds. |
| `npm run test:integration` | Major story and full-loop integration suites independently. |
| `npm run bench` | Normal Vitest entry invoking a custom warmup/trial harness, independent of experimental benchmark APIs; emit machine-readable measurements and state digests. |
| `npm run build` | Typecheck/boundary validation followed by Vite static production build. |
| `npm run build:browser-test` | The same typecheck/boundary gates, then `vite build --config vite.browser.config.ts --mode production`; outputs the separate static browser-test bundle. |
| `npm run preview:browser-test` | `vite preview --config vite.browser.config.ts`; serve the built fixture harness, normally with `-- --host 127.0.0.1 --port 4174`. |
| `npm run check:browser-builds` | `node scripts/check-browser-builds.mjs`; after both builds, verify isolated output roots, no fixture/harness modules in the release bundle graph, and shared application source/build settings. |
| `npm run dev` / `npm run preview` | Local Vite development / built-asset static preview. |

The benchmark configuration runs serially without coverage instrumentation. Unit/integration tests may parallelize independent fixtures, but each simulation has isolated state/RNG. Browser platform harness pages use the actual native APIs and have their own build entry; they are not imported by the release entry graph. No test depends on the rendered scene to advance a simulation.

## Browser build and serve procedure

T001 introduces the shared bootstrap `mountGame` export from `src/main.ts`; T022 completes its game composition. Importing it never auto-starts another session. Release `index.html` mounts ordinary new-game inputs. `tests/browser/index.html` and `tests/browser/harness.ts` mount the same application with a validated scenario or completed-boundary state generated through normal domain operations. The fixture is chosen before play; subsequent construction, selection, inspection, time and save/load actions use ordinary UI, with no test-only mid-play state mutation.

T003 owns the package scripts above. T005 owns `vite.browser.config.ts`, `scripts/check-browser-builds.mjs` and the browser README/evidence template. The config inherits the release production mode, browser target, environment and application settings; its root is `tests/browser`, its built entry is `/index.html`, and its output is repository-root `dist-browser-test/`. Resolve environment/public-asset directories from the repository root so the alternate entry uses the same inputs. The release build remains in `dist/`. Neither build may clear or overwrite the other's output, and `dist-browser-test/` is ignored and never shipped as the release. Run the commands only after both setup tasks complete:

```sh
npm run build
npm run build:browser-test
npm run check:browser-builds
```

For every browser checkpoint, smoke-test the available ordinary-player slice in release `dist/`:

```sh
npm run preview -- --host 127.0.0.1 --port 4173
```

Prepared-state observations, including M2's one-worker fixture before browser saving exists, additionally use the separately built production-mode harness:

```sh
npm run preview:browser-test -- --host 127.0.0.1 --port 4174
```

Open the served root `/`, select the prepared fixture, then start the application and use its normal controls. Record release versus harness evidence separately with artifact hashes, source revision, config/mode, seed, scenario/content/rules versions and actual browser versions. Shared source/settings do not make the two bundles byte-identical or substitute harness observations for release-artifact qualification. The checker must inspect the release bundle graph, not merely the presence of differently named directories.

Once US16 saving exists, use this same-origin handoff for prepared reference towers needed in release storage/performance checks: stop any server on port 4173, serve the harness there with `npm run preview:browser-test -- --host 127.0.0.1 --port 4173`, mount the validated fixture and explicitly Save through the application. Stop the harness server, serve release `dist/` on that exact host/port with `npm run preview -- --host 127.0.0.1 --port 4173`, then refresh/open the release page in the same browser profile and Load through normal UI. The port-4174 save is a different origin and cannot be used directly. Start measurement after this ordinary paused load; never inject state during qualification. Repeat within each browser/profile. Native adapter fault probes may use the harness, but record them separately from release Save/Load, refresh/reopen and visible failure handling. Final sustained sessions, new-player evaluations and SC-012 performance evidence use release `dist/`.

## Unit-test ownership

| Area | Required behavioral cases | Earliest slice |
| --- | --- | --- |
| World coordinates/camera | Half-open bounds, negative/configured floors, widths other than120, camera inverse/zoom/resize invariance. | A |
| Floor construction | Partial ranges, adjacency merge/gap split, full lower support, reject overlap, protected base, underlying floor survives room demolition. | A |
| Placement collision/lookup | Facility rectangles, two stair landings, full shaft reservations, missing landing, bounds/cost rejection; footprint reservations do not sever hallways. | A |
| Facility definitions | Stable IDs, capability/version validation, data-driven prices/footprints, office tenancy independent of existence/access. | A/B |
| PRNG | Canonical seed parsing, all-zero rejection, golden vectors, unbiased bounded sampler, current-state round trip, no random draws in edits/rebuilds. | A |
| Scheduler | Total ordering, equal-time phases, cancellation/reschedule/index consistency, future-only events, no tombstone accumulation, rebuild equality. | A |
| Office workforce | Finite whole-office demand, stable leasing order, first-unpause review exactly once, distributed arrivals/departures, skipped inaccessible arrivals, overnight identity retention. | B |
| Restaurant demand | Finite shared allocation, ≥70% meal requests, repeatable nonzero visit durations, next-review activation, no worker-lunch subsystem. | D |
| Occupant states/sleep | One location, legal transitions, facility wakeups, exit/stranding, no duplicate work visit, inactive population does not enter active tick loops. | B |
| Occupant inspection | Canvas hit-selection, identity/type/goal/state text, retained worker selection while inside or dormant, pause/read-only queries; T041 tests precede M2/T042, and T085 extends the same UI. | B |
| Occupant retirement | T043 former-worker cleanup after real exit/never-entered cancellation; T074 keeps recurring leased-worker identities; T116/T118 add customer cleanup. Clear live references, preserve historical IDs/source data and market release, protect active/stranded people, and never reuse IDs. T124 tests at least 35 complete days without accumulating departed records or growing bounded histories. | B, extended D |
| Navigation | Mode preference before generalized cost, real walking/stairs/ride legs, same-floor gaps, deterministic ties, all valid services searchable. | B/C |
| Topology/cache | Full rebuild/version, bounded-cache eviction neutrality, preserve safe current segment, clear invalid suffix, resume replan after load, graph-anchor subdivision does not change walking duration. | B/C |
| Car state machine | Nonzero physical phases, skip empty exchange phases, adjacent segment progress, direction retained while stopped, loaded-edit restrictions, no teleport. | C |
| Collective dispatch | Requested order/reversal, opposite-direction farthest request, idle nearest/lower-floor/global-admission ties, no onboard reverse journeys, full-car hall stops. | C |
| Queue order/capacity | Nine mixed people → eight onboard; unload frees places first; admission cutoff; one denial per eligible service; late/opposite calls no false denial; local FIFO after migration. | C |
| Trip/quality metrics | Segment duration reconciliation, transfers, accumulated queue history, active/abandoned/stranded inclusion, exact cohort denominators, monotonic waiting/denial penalties away from clamp, empty sample. | C/D |
| Money/transactions | Safe integer arithmetic, exact half-away rounding once, positive-cost rejection, accrued demolition liabilities, settlement idempotency, archived + recent reconciliation. | A/D |
| Progression | Each independently unmet criterion fails, maintained full-day population/access, first partial day fails, settlement-before-award, no empty-sample qualification, award permanent/once. | D |
| Serialization | Plain schema, content/rules validation, all phase/counter/order fields round trip, unknown/corrupt/reference-invalid data safely rejects. | A through E |
| App/persistence ownership | Save revision/generation races, validation before replace prompt, cancellation, one runner after load, transaction-complete acknowledgement, failed write retains old slot. | E |

Do not write trivial tests that merely restate object literals. Tests target rules, state transitions, invariants, deterministic continuations and failure boundaries. Property-style generated command sequences may use the explicit seeded test generator; they must record failing seed/action sequence.

## Story and acceptance coverage

| Spec coverage | Headless integration evidence | Player/platform evidence |
| --- | --- | --- |
| US1–2, FR-001–012 | New-game state; construction quotes/atomicity; pause and timed commands; variable width/floors. | Understandable site/tools/time, camera navigation and responsive previews. |
| US3–4, US6, FR-013–022/036–038 | Leasing/workforce/presence, nearest short-trip entrance and long-trip elevator preference/fallback, sleeping, access loss/recovery and safe demolition. | Watch individual journeys and distinguish lease/workforce/present counts. |
| US5, US7, US11, FR-023–031 | Car/queue/dispatch phases, inspection query truth, capacity/denials and trip measures. | Moving cars, queues and every served-floor count are legible. |
| US8–9, FR-032–035 | Controlled same-cohort congestion and added-shaft comparison; continuous subsequent-day intervention. | Diagnose bottleneck, build improvement using ordinary controls, compare reports. |
| US10, all Edge Cases | Removal/invalid access, reroute/abandon/stranding, real exits, restored access, no impossible references. | Visible reason and safe recovery, including occupied-asset rejection. |
| US12–13, FR-039–040 | Restaurant timing/allocation, admission once, visit wakeup/exit, cancellation/demolition. | Meal wave and incoming/inside/finance views. |
| US14–15, FR-041–048 | Exact day settlement, recent/archive totals, healthy/negative cash, full-day Level 2 pass/fail. | Financial explanation, published targets and visible one-time award. |
| US16, FR-049–053 | All active-phase saves, corrupt/failed replacement, next-day equality. | Actual storage, refresh/reopen, errors and initially paused load. |
| FR-054–057, SC-001–014 | State invariants, seeded replay, measured headless throughput and edit cost. | Actual three-browser sessions, SC-012 budgets and five-new-player evaluation. |

All 16 stories and 72 existing story scenarios are required. Their priority orders delivery, not optional scope. Tests may construct valid prepared fixtures independently; end-to-end player evaluation cannot use developer repairs.

## Deterministic congestion fixture

Build fixtures through domain construction/lease/schedule paths, not invalid hand-edited occupants. Candidate layout: full floors 0–5; offices on3/4/5 with32 workers each; shaft A x10 serving0–5 with capacity 8; no stairs connection to offices; enough funds/clear space for shaft B x14. Use one explicit 128-bit seed and a profile distributing96 arrivals at distinct ticks in08:00–08:06 inside the accepted morning window. Lease on initial06:00 advance; pause/save a canonical07:50 state after schedules exist. This is an analytical starting fixture, not a proven result.

Controlled test:

1. Clone that saved pre-rush state into baseline and improved continuations; assert identical scheduled worker IDs/times/goals, tenants, restaurant demand, seed/current RNG and nontransport configuration.
2. Baseline uses one shaft. Record unique cohort queue changes at every domain transition and eligible car arrival, complete per-person wait/denials, and trip quality with the same coefficients as improved.
3. Require queue growth over at least three successive eligible car visits, a wait≥600 ticks, and a person denied at least twice by capacity. Assert sampled live quality worsens as the backlog grows before the cohort completes, with unfinished waiting members contributing to the score; labels alone do not satisfy this check.
4. Improved continuation constructs sufficient additional identical single-car shafts without random draws or demand regeneration. Require added cars to carry passengers; preserve physical walks, trips and queue ordering.
5. Advance both until every scheduled cohort member reaches its office, failing if the departure window starts first. No canceled, stranded, dropped or uncounted cohort member can make the test pass.
6. Compute mean waiting as total elevator queue ticks divided by all96 workers, including zero waits; peak is maximum simultaneous unique waiting cohort members over all stops. Require both mean and peak ≤70% of baseline and cohort quality ≥baseline+10 points.
7. Compare state at fixed checkpoints and retain the two morning reports through the next rush. No rendering is needed.

Add a separate mid-rush topology test: while existing passengers wait, construct shaft B and require at least one eligible old waiter to switch through real walking when the alternative beats staying. Preserve cumulative wait/denials and local destination-queue ordering, with zero duplicate membership. Verify a useless added shaft attracts no impossible route and gives no direct quality bonus.

Also run a separate continuous-play integration: let the baseline finish its first day, construct another shaft in that same running tower, and observe the next comparable rush with equal workforce/intensity. Require useful service and improved visible/report measures without resetting the tower. Do not claim exact day-to-day equality of random timestamps; the controlled clone above owns numerical attribution.

For SC-009, use a full-day fixture with morning and evening demand sufficient to make baseline daily quality<60 while its adequately served counterpart is≥60, with all other milestone conditions satisfied. This may need a larger finite workforce or additional useful shafts beyond the 96-person candidate. Freeze the final fixture and coefficients once verified; do not weaken the daily threshold, omit completed return legs, or reduce demand in the improved run. The research arithmetic establishes plausibility only.

## Continuation and replay matrix

Use three explicit nonzero seeds, three full simulated days each, and the same ordered commands at the same ticks. Compare canonical state at matching ticks under30/60/120 simulated presentation callbacks per real second, normal/4×/8×, inserted pauses and segmented advance batches. Presentation differences alone are exempt.

Save points cover scheduled/not-entered worker, walking halfway, active stair, queued after multiple denials, car between floors, opening, partly unloaded, partly boarded, selected-goal cancellation, inside office, inside restaurant, stranded exit, immediately after topology invalidation, and immediately before/after daily settlement/milestone. Continue for the next full day after every reload; check people, queues, routes, current PRNG, events/counters, accruals, reports and awards.

Also capture immediately after former-worker/customer retirement while valid historical trip/cohort/service/financial references remain. T136 accepts those historical references but rejects a live queue/car/event/route/active-trip reference to a removed person; T137 proves that load does not recreate retired people or reuse IDs. T124's `tests/integration/occupant-retention.test.ts` runs at least 35 complete days with fixed finite demand and reachable exits, comparing the same post-departure boundary each day. Departed customers/former workers must not accumulate; leased workers keep their identities, configured history windows/rings remain bounded, and revenue/trip totals and saved continuation still reconcile. Separate stranded/unresolved fixtures verify that genuine remaining population is protected, not removed to satisfy a bound.

Compare cold rebuilt caches with uninterrupted warm caches. Heap serialization order/layout, cache eviction, and visible-occupant aggregation cannot change results. Saving during paused edits at the same tick must capture the correct revision. A failed/late save response cannot mark a later edit or replacement session saved.

## Headless benchmark protocol

| Workload | Fixture and measurement intent |
| --- | --- |
|100 active| Small mixed traversal/queue tower; establish low-overhead baseline. |
|1,000 active| Wider/taller valid scenario with finite demand, multiple shafts and office destinations; include queue and routing pressure. |
|5,000 active| Explicit larger configuration; stress active walking, queue records and event bursts while retaining standard car capacity 8. This is separate from the reference release tower. |
|Dormant comparison| Keep identical active work but multiply inside-facility/scheduled population with wakeups outside the measured interval; detect accidental dormant scans. |
|Topology burst| Add/remove legal access and build useful shafts amid traffic; measure validation/rebuild/reconciliation latency separately. |

Construct and warm fixtures outside timed advancement. For a dense-walking workload, use a long enough valid corridor and a measured simulated interval shorter than its remaining traversal so the advertised active count persists. For rush workloads, use deterministic overlapping arrival waves and report actual active min/mean/max; a run that drains below its named scale is not evidence for that scale. Never repeatedly time an already-completed tower.

Perform three warmup trials and at least ten measured trials, restoring the same canonical snapshot and command script each time. Measure fixed tick batches using a monotonic clock in the harness, with no clock access inside the domain. Report median and p95 ms/batch, total ticks/simulated seconds, real duration, ticks/real second, path searches/cache hits, event operations, active-state distribution, queue counts, edit latency and heap/memory observations where supported. Every repetition must finish with the same authoritative digest.

Record machine model/CPU/RAM, OS, Node/browser versions, commit/content/rules IDs, build mode, seed, fixture hash, batch size, warmups/trials and instrumentation. Output JSON plus a concise human-readable table. Measure simulation throughput separately from Canvas. A browser benchmark may advance the same headless runtime without rendering in that engine; do not use Node numbers as Safari results.

## Reference browser qualification

The SC-012 reference tower has ground+12 upper floors,24 offices,two restaurants,stairs,three eight-person shafts,2,000 scheduled occupants and≥500 simultaneously traveling/waiting. A valid example profile uses80 workers/office plus80 restaurant customers across two restaurants; its finite definition/demand overrides are saved with the scenario. It does not replace the default new-player32-worker office profile.

On Apple M1-class16GB or recorded comparable hardware at1440×900, in actual current stable Chrome/Firefox/Safari:

- Run the 10-real-minute rush-and-construction exercise. At normal speed, ≥30 displayed FPS in≥95% of one-second intervals. Measure display separately from simulation throughput.
- p95 command/selection/pause/inspection response≤150ms and p95 placement/access update≤150ms, including active topology changes.
- Save and load each≤2 real seconds from action to usable result, including validation/storage/reconstruction. Report actual sample sizes and p95/max as appropriate; every required save/load exercise must satisfy the two-second acceptance bound.
- At normal/4×/8×, achieve120/480/960 ticks per real second without event loss and retain the response budget. A catch-up debt warning is honest behavior outside the qualified scale, not a substitute for passing it.
- Run the 30-real-minute full mixed session, including safe demolition/repair, meals, finance, progression and active save/reload; no impossible state, crash, forced reset or developer intervention.
- Build and serve static `dist/` with no backend; after resources load, disconnect and continue core play/save/load. Separately verify refresh/reopen from a stable origin with local storage available.

Record actual browser versions and observations. Include Retina/viewport changes, focus/visibility suspension, camera/tool input, DOM keyboard/focus labels, indexedDB error/abort/blocked-upgrade checks, and immutable failed-save preservation. Missing manual evidence remains unchecked; headless tests do not imply visual/Safari qualification.

## New-player and release evidence

SC-001/002/004 use five new players: at least four complete the ordinary journey and Level 2 within30 real minutes using only in-game guidance; at least four diagnose access versus capacity and make a useful improvement. Record observed actions/timing and explanations. The implementer cannot fix a tower during evaluation.

Maintain provenance for shipped code/assets/content; original placeholder shapes are acceptable. Record dependency lockfile/license review and static output inspection. Release handoff distinguishes automated suites, benchmark measurements, actual browser/manual evidence and blocked checks. Early profiling may justify later data-layout/cache optimization; each optimization requires before/after evidence and identical replay digests.
