# Phase 18 deterministic continuation

Run on Node 24.20.0:

```sh
nvm use
npx vitest run tests/integration/three-day-replay.test.ts tests/integration/save-continuation.test.ts tests/integration/progression-continuation.test.ts
```

The replay fixture uses three explicit seeds:

- `00000001000000020000000300000004`
- `ffffffffffffffffffffffffffffffff`
- `123456789abcdef013579bdf2468ace0`

Each runs from the initial 06:00 boundary through tick 280800 (three full elapsed days), under 30, 60 and 120 presentation callbacks/second. Speeds cycle through normal, 4× and 8×; inserted pauses add wall time without domain advancement. Identical ordinary service-range commands occur at ticks 50000, 86400, 129600, 172800, 216000, 259200 and 280800. Every checkpoint is encoded in a v1 envelope, parsed, validated, replaced, and resumed paused with zero pacing debt. Complete canonical states match direct advancement after every command, including RNG, IDs, ordering, queues, service cursors, trips, money, reports and progression. Envelope display metadata is outside the authoritative comparison.

This bounded mixed replay deliberately uses a disclosed scenario with twelve workers and four daily customers; office capacity is four. Movement, eight-person cars, timing, finance and milestone thresholds remain unchanged. It does not claim 2,000-person replay throughput or earned awards in that smaller scenario. The separate default-content MVP journey earns Level 2 at tick 172800 with 96 office arrivals, 40 admissions, 272 daily transport samples, positive settled net and no injected money/people. Its pre/post-midnight continuation test covers unmet-to-met and permanent attained awards.

The active-state matrix covers scheduled people, walking, stairs, denied queues, riding, opening, partial unloading/boarding, canceled selections, indoor workers/customers, stranding, topology changes, billing, and historical records after worker/customer retirement. Each snapshot and its cold-cache restoration continue through the end of the next complete calendar day with identical commands and complete state equality. Retired people are not recreated.

These are automated/headless correctness results. Native storage durability, browser rendering, achieved speed, final performance and new-player evaluation require their separate evidence.
