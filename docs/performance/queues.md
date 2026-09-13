# Queue operations — 2026-09-10

T066/T071: `tests/benchmarks/queues.bench.ts` restores 32 real workers at their first frozen boarding cutoff, performs 10,000 indexed count/join-time reads, then advances 2,000 ticks through finite service. Median **154.126 ms**, p95 **164.189 ms** per combined workload. Peak unique queue 32, 48 accumulated capacity denials, all 32 arrivals completed. Exact counters and samples: [queues-results.json](queues-results.json).

Lookup by entry/person and count/sum-of-joined-time queries use maps and constant-time arithmetic. A repeated-read operation-count assertion confirms no additional entry visits for 10,000 age queries. Append preserves monotonic FIFO admissions. Removing an indexed entry splices its persistent ordered array and updates shifted indices; this remains linear in the shifted suffix. Snapshot/event-boundary reconstruction rebuilds the derived index once for that owned queue map. No ordinary transition-free tick scans or ages every queue entry. These measurements do not claim constant-time array removal.


Run from the repository root with `nvm use` (Node 24.20.0), then `npx vitest run --config vitest.benchmark.config.ts` followed by the relevant benchmark file paths. Measurements use Apple M2 Pro, 12 logical CPUs, 16 GiB RAM, Darwin 25.5.0; no coverage. Three warmups precede ten measured trials restored from the same encoded boundary outside timing. All 13 final authoritative digests agree. Source is uncommitted; hashes and build identity are in [phase-8-10-artifacts.json](../phase-8-10-artifacts.json).

These small headless workloads do not qualify sustained browser pacing, rendering, thousands of occupants or the later congestion acceptance gate. Event-boundary cloning, validation outside runner creation, and physical route/service processing are kept distinct from a simulation-second throughput claim.
