# Transportation reports — 2026-09-10

T086: `tests/benchmarks/transport-reports.bench.ts` restores the completed 32-worker workday with 64 historical trips, one morning cohort and one completed-day summary, then makes 1,000 full transport projections. Median **87.638 ms**, p95 **91.177 ms** per 1,000 queries (median 0.0876 ms/query). The canonical state digest is unchanged. Raw evidence: [transport-reports-results.json](transport-reports-results.json).

Live scope filters finished outcomes to the last 3,600 ticks and includes every unfinished trip once; it derives open-segment age without settling state. Historical raw trips remain in the existing bounded audit retention for cohort reconciliation, with references from still-retained long-lived workers protected. The current day accumulates finished outcomes at transitions; midnight adds each still-active trip once, stores its cumulative experience, and resets current-day finished counters. The summary ring retains 30 days. Morning queue peaks update on actual append/removal, including reserved boarders until boarding completion, rather than through sampling.

The 35-day integration verifies actual retention bounds and exact save reconstruction. Unit tests independently check cutoff expiry, zero samples, crossing-midnight membership, multiple waits/transfers and failed/stranded penalties. These simple report projections scan retained trip/people collections on query; no optimization or large-population performance qualification is claimed from this fixture.


Run from the repository root with `nvm use` (Node 24.20.0), then `npx vitest run --config vitest.benchmark.config.ts` followed by the relevant benchmark file paths. Measurements use Apple M2 Pro, 12 logical CPUs, 16 GiB RAM, Darwin 25.5.0; no coverage. Three warmups precede ten measured trials restored from the same encoded boundary outside timing. All 13 final authoritative digests agree. Source is uncommitted; hashes and build identity are in [phase-8-10-artifacts.json](../phase-8-10-artifacts.json).

These small headless workloads do not qualify sustained browser pacing, rendering, thousands of occupants or the later congestion acceptance gate. Event-boundary cloning, validation outside runner creation, and physical route/service processing are kept distinct from a simulation-second throughput claim.
