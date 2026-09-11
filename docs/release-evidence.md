# Release evidence procedure

For each release, review the source diff and asset inventory against docs/provenance.md. Record author/source, permission and modifications for each addition. Exclude proprietary assets and copied game text. Review the lockfile diff, installed package license files, and generated bundle helpers; investigate missing or incompatible license declarations before redistribution.

Run the checked release build, tests, benchmark workload appropriate to the slice, and browser-build isolation checker. Inspect static output for unexpected scripts, remote resources and fixture code. Record SHA-256 hashes, commit plus dirty diff identity, versions and unmet checks using tests/browser/evidence/template.md. Preserve the output and measurements associated with that identity.

Actual Chrome, Firefox and Safari observations, storage/reopen checks, sustained performance and new-player evaluation remain separate gates defined in specs/001-playable-tower-mvp/validation.md. Do not mark these complete from Node tests or a prepared harness.

## Phase 1 evidence (2026-09-10)

Node 24.20.0: offline lockfile reinstall (`npm ci --offline`), strict type checks, domain boundary checker with 21 positive/negative fixtures, two unit/integration setup tests, separate integration command, benchmark runner self-check (3 warmups/10 restored trials), release and browser-test production builds, and shared-graph/output-isolation check passed. The benchmark only exercises the harness; it establishes no simulation throughput. No gameplay, native-browser, visual, storage, player or performance qualification is claimed.

## Phase 2 evidence (2026-09-10)

T006–T015 were implemented with tests written and observed failing before their implementation. The final suite has 30 passing tests across 11 files, including three seeds across three days, segmented/reconstructed continuation, pure previews, rejected-command sequencing, exact money and overflow nonmutation, strict state validation, scheduler cancellation and rollback boundaries. Two additional review regressions were observed failing and then fixed: sparse arrays masked by named properties, and a reschedule counter behind prior sequence allocation.

Type and domain-boundary checks, separate integration entrypoint, release/browser-test production builds and shared-build isolation pass. Benchmarks run 3 warmups plus 10 restored trials with matching digests; full methodology/results are in [performance/kernel.md](performance/kernel.md). The C reference was compiled and its ten outputs matched the TypeScript golden vector. There is still no gameplay or native-browser qualification in this headless phase.

## Phase 3/4 evidence (2026-09-10)

Implemented T016–T022 and T024–T029: immutable scenario/content, configurable initial tower, application-owned pacing/session lifecycle, Canvas camera/cache, named controls, floor construction/demolition, explicit quotes, floor inspection and strict pure state continuation. The remaining phase checkpoints T023/C0 and T030/M1 are **not fully qualified** because actual stable Chrome/Firefox/Safari observations could not be completed. Phase 5 onward remains untouched.

Final checks: 62 tests / 23 files pass; separate integration entrypoint passes 21 tests / 7 files; strict types, the domain checker and its 21 regression fixtures pass; descriptive comments are checked for 166 named production functions/methods; release and browser-test builds plus graph/output isolation pass. Both new construction benchmarks pass, using three warmups and ten restored trials with matching authoritative digests. See [performance/construction.md](performance/construction.md) and its retained JSON for measured batch timings and limits.

Supplemental in-app browser observations cover the paused lobby/site, all displayed speed modes with advancing time, pause, New Game cancel/discard, two upper floors plus extension, normalized span inspection, unsupported quotes, unchanged quotes after zoom, safe free demolition and upper-support rejection. A real observed RAF timestamp-ordering error was corrected and regression-tested before the final smoke. Exact observations and native-browser gaps are in [C0 evidence](../tests/browser/evidence/us01-start.md) and [M1 evidence](../tests/browser/evidence/us02-construct-tower.md). Source/artifact hashes are retained in [phase-3-4-artifacts.json](phase-3-4-artifacts.json). No native storage, final performance, user evaluation, deployment or complete-MVP qualification is claimed.


## Phase 5 evidence (2026-09-10)

Implemented office placement/leasing, finite workforce schedules, real walking/admission/exit, retained occupant inspection, exact source accrual/settlement, safe demolition, former-worker retirement and strict office save-state continuation. Implementation tasks T031–T041 and T043–T046 are complete. T042/T047 remain open for full browser qualification; the native Firefox release smoke and supplemental in-app observations are explicitly scoped in [office evidence](../tests/browser/evidence/us03-offices.md) and [M2 evidence](../tests/browser/evidence/us03-one-walker.md).

New functions have descriptive comments enforced by the build. Domain-boundary regression fixtures now allow literal occupant location properties while continuing to reject browser location access. The privately owned application runner validates/rebuilds once; public advancement still validates external input. Phase 5 tests cover normal and abandoned journeys, physical presence, rent/access, exact rounding, safe removal and repair, market release, no repeated schedule draws, immutable inspectors, malformed saves and next-day continuation. All 12 restored-trial benchmarks pass; [walking measurements](performance/occupants.md) distinguish transition-free domain timing from unmeasured rush/browser performance. Final verification counts and source/artifact hashes are recorded in [phase-5-artifacts.json](phase-5-artifacts.json).


## Phase 6/7 evidence (2026-09-10)

Implemented T048–T052 and T054–T063: adjacent stairs, physical traversal and topology recovery; standard elevator construction, separate service/stop/car identities, fixed collective sweep, timed car phases and transfers, physical queue requests, semantic route-mode preference, immutable inspection and ordinary construction/service controls. The prior office-only snapshot rules are superseded by explicitly validated transport rules. Function comments remain build-enforced.

Final verification passes 168 tests across 59 files, strict types, 24 boundary regression fixtures, comments for 299 named production functions/methods, both production builds and build isolation. Twelve observation-fixture regressions cover stair boundaries and all nine elevator phases. Current Node/toolchain versions and static-build/source hashes are in [phase-6-7-native-artifacts.json](phase-6-7-native-artifacts.json); [phase-6-7-artifacts.json](phase-6-7-artifacts.json) preserves the earlier run. The focused [single-elevator benchmark](performance/single-elevator.md) passed with 13 identical restored-run digests. It does not qualify browser performance or multi-passenger congestion.

After the Mac was unlocked, native Firefox 155.0.1 and Safari 26.5 exercised stair ascent/descent, occupied-removal rejection, stranded-exit repair, tracked lobby-to-office elevator journeys, every paused car phase, loaded guards and ordinary release construction smoke. Exact observation methods and limits are recorded in [stair evidence](../tests/browser/evidence/us04-stairs.md) and [elevator evidence](../tests/browser/evidence/us05-one-elevator-rider.md). T053/C1 and T064/M3 remain unchecked because Chrome is deferred at the user's request. No phase 8 or later task is advanced.


## Phase 8–10 evidence (2026-09-10)

Implemented T065–T071, T073–T078 and T080–T086: indexed FIFO membership and waiting-time aggregates, multi-person exchange/denials, physical queue rendering, recurring-workforce traces and overnight guards, exact score arithmetic, full-population morning reports, current-day accumulation, bounded completed-day summaries, read-only traffic views and person inspection. First boarding no longer counts as an elevator transfer; the existing single-rider assertions were corrected to the documented rule.

Final validation on pinned Node 24.20.0: **200 tests across 76 files pass**, strict domain/browser/test types, 24 boundary fixtures, descriptive comments on 335 named production functions/methods, release and prepared-fixture production builds, and graph/output isolation. New behavior was tested first; pre-existing exchange/workday behavior was extended with passing behavioral coverage. The new FIFO module and score/report/query APIs were observed failing before implementation, and the first-boarding transfer assertion failed before correction.

Tests cover nine-person capacity, multi-unload cursor stability, frozen cutoff/late arrivals, full-car intermediate stops, repeated denials, selected-goal cancellation, retained trip histories, default 32-worker attendance/return travel, overdue committed riders, retirement, all speed/callback schedules with timed edits, zero-wait denominators, failed/unresolved reporting, midnight ownership, malformed report rejection and 35-day retention. Queue/service and report snapshots resume identically into subsequent workdays.

Three warmups plus ten restored trials per workload retain matching digests. See [queue measurements](performance/queues.md), [office rush and route measurements](performance/office-rush.md), and [report measurements](performance/transport-reports.md). These are focused headless measurements, not browser frame-rate or final-scale qualification. Initial exploratory runs used the shell's Node 20; final evidence was rerun on Node 24.20.0.

Native Firefox 155.0.1 and Safari 26.5 observations and their limits are in [M4 queue evidence](../tests/browser/evidence/us07-elevator-queue.md), [C2 workforce evidence](../tests/browser/evidence/us06-office-workday.md), and [C3 report evidence](../tests/browser/evidence/us11-traffic-inspection.md). Both browsers completed ordinary release smoke: empty reports, office placement, first leasing, real clock advancement and pause. Source/output hashes are in [phase-8-10-artifacts.json](phase-8-10-artifacts.json). **T072/T079/T087 remain unchecked**: Chrome is unavailable in the enabled inventory, and full repeated-rush/overnight/manual checkpoint traces remain to be collected. No later congestion, restaurant, native-storage, final-scale or player-evaluation gate is claimed.
