# Transport edit measurement — 2026-09-11

Measured ordinary shaft B construction at tick 29700 in the canonical 96-worker rush, including atomic draft, topology rebuild, access checks, and stable waiter reconciliation. Three warmups and ten restored trials produced identical canonical result digests.

Command: `node node_modules/vitest/vitest.mjs run --config vitest.benchmark.config.ts tests/benchmarks/transport-edits.bench.ts` under Node v24.20.0 on Apple M2 Pro, darwin 25.6.0.

Median 28.749 ms; p95 30.757 ms. The [raw report](transport-edits.json) retains seed, fixture SHA-256, source commit/dirty status, machine metadata, counters and every trial. This is a headless 96-person edit measurement, not final SC-012 browser/UI qualification. No optimization was added in response to this measurement.
