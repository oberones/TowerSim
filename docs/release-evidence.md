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
