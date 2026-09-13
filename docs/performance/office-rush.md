# Office rush and route work — 2026-09-10

T078: `tests/benchmarks/office-rush.bench.ts` advances a default 32-worker upper-floor office from 06:00 to 20:00 (50,400 ticks), including morning and evening movement and indoor sleep. Median **967.709 ms**, p95 **986.062 ms** per complete workload. Thirty-tick instrumentation samples are inside the timed interval. Sampled maxima: 10 active travelers, 32 inside, 66 pending events, queue size 2. Transition-maintained morning peak also equals 2. A total of 1,241 events were scheduled; 64 physical arrivals/exits completed and 32 worker identities remain. Sampled distributions can miss brief intermediate states; they are not exact continuous peaks.

The separate route workload rebuilds the actual default tower graph and finds the real lobby–office route 100 times, asserting walk/elevator/walk legs. Median **2.979 ms**, p95 **3.493 ms** for 100 builds/searches; 14 nodes and 24 directed edges. This measures explicit route work independently; it does not pretend that scheduled event counts equal route-search counts.

Raw workday samples: [office-rush-results.json](office-rush-results.json). Route samples: [office-rush-routes-results.json](office-rush-routes-results.json). The 35-day one-worker integration separately proves stable recurring identity, 30 workforce days/summary days and at most 64 retained trip records, then exact restored continuation.


Run from the repository root with `nvm use` (Node 24.20.0), then `npx vitest run --config vitest.benchmark.config.ts` followed by the relevant benchmark file paths. Measurements use Apple M2 Pro, 12 logical CPUs, 16 GiB RAM, Darwin 25.5.0; no coverage. Three warmups precede ten measured trials restored from the same encoded boundary outside timing. All 13 final authoritative digests agree. Source is uncommitted; hashes and build identity are in [phase-8-10-artifacts.json](../phase-8-10-artifacts.json).

These small headless workloads do not qualify sustained browser pacing, rendering, thousands of occupants or the later congestion acceptance gate. Event-boundary cloning, validation outside runner creation, and physical route/service processing are kept distinct from a simulation-second throughput claim.
