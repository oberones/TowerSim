# Phase 16 finite meal demand measurements

Run the phase benchmark command in [finance-history.md](finance-history.md). These are headless pinned Node 24.20.0 measurements on Apple M2 Pro / 16 GiB RAM, not browser frame-rate or final reference-tower qualification.

| Workload | Median | p95 | Observed outcome |
| --- | ---: | ---: | --- |
| Two ground-floor restaurants, 40 customers, 06:00:01 to midnight | 122.687 ms | 126.966 ms | 40 requests, 40 completed visits/exits, 20,000 minor units admission income, no remaining customers, two recurring events |
| 1,000 ticks before arrivals with 40 dormant customers | 0.024 ms | 0.066 ms | 40 dormant, zero active, 42 pending events; no arrival or route work in interval |

Raw records: [meal wave](phase-14-16/restaurant-demand.json), [dormant interval](phase-14-16/restaurant-dormant.json). Each uses three warmups and ten measured trials, captures hardware/toolchain metadata and requires identical authoritative digests. These measure the complete finite wave and an event-free dormant interval, not a 2,000-person browser workload or instantaneous worst-case burst.

Default content already disclosed 80% meal concentration and 20–40-minute admission-relative visits. The implementation uses integer ceiling for each allocated meal count, stratified seeded meal times, seeded off-peak times and seeded durations. Eligible restaurants share one daily allowance in stable ID order with deterministic remainder distribution. No topology edit or load regenerates existing requests. Request counts are independent of delayed physical arrivals.

Tests cover three explicit seeds across three days, 120/480/960-tick and segmented batches, real application pacing with pauses, occupied save continuation, multiple restaurants, next-review construction, zero demand and malformed visits. The 35-day retention test keeps the leased worker's identity, removes completed customers every day, bounds closed histories, preserves exact visit/revenue totals and compares restored continuation. A separate stranded case proves unresolved travelers remain real population rather than cleanup candidates.

Native observations and remaining C6 obligations are in `tests/browser/evidence/us13-meal-demand.md`.
