# Release evidence procedure

For each release, review the source diff and asset inventory against docs/provenance.md. Record author/source, permission and modifications for each addition. Exclude proprietary assets and copied game text. Review the lockfile diff, installed package license files, and generated bundle helpers; investigate missing or incompatible license declarations before redistribution.

Run the checked release build, tests, benchmark workload appropriate to the slice, and browser-build isolation checker. Inspect static output for unexpected scripts, remote resources and fixture code. Record SHA-256 hashes, commit plus dirty diff identity, versions and unmet checks using tests/browser/evidence/template.md. Preserve the output and measurements associated with that identity.

Actual Chrome, Firefox and Safari observations, storage/reopen checks, sustained performance and new-player evaluation remain separate gates defined in specs/001-playable-tower-mvp/validation.md. Do not mark these complete from Node tests or a prepared harness.

## Phase 1 evidence (2026-09-10)

Node 24.20.0: offline lockfile reinstall (`npm ci --offline`), strict type checks, domain boundary checker with 21 positive/negative fixtures, two unit/integration setup tests, separate integration command, benchmark runner self-check (3 warmups/10 restored trials), release and browser-test production builds, and shared-graph/output-isolation check passed. The benchmark only exercises the harness; it establishes no simulation throughput. No gameplay, native-browser, visual, storage, player or performance qualification is claimed.
