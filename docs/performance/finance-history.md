# Phase 14 financial history measurements

Measured on 2026-09-11 on pinned Node 24.20.0 (Apple M2 Pro, 16 GiB RAM, Darwin 25.6.0) with the committed benchmark harness (three warmups, ten measured trials, detached restore outside timing). Run:

```sh
node node_modules/vitest/vitest.mjs run --config vitest.benchmark.config.ts tests/benchmarks/restaurant-finance.bench.ts
```

See [raw finance results](phase-14-16/finance-history.json) for machine, Node, commit/dirty state, all samples and identical final digests. The fixture runs 35 complete days with one restaurant and 40 finite customers per day using normal construction, schedules and physical visits. Preparation is intentionally outside the query measurement; it takes roughly a minute on this checkout, so this benchmark has a 120-second test timeout. The initial 30-second harness timeout expired during preparation; the repeated run passed. This is not a claim of final full-game performance qualification.

One thousand immutable financial queries: median **55.392 ms**, p95 **64.641 ms** per batch (about 0.055 ms per query). At the final boundary: 42 detailed transactions, 1,394 archived transactions, 30 operating summaries, 30 restaurant-day histories, 2,400 retained trip records, zero live customers. All trial digests match.

Detail retention is by time, pruned at midnight; records exactly at the cutoff survive. Thus up to the configured financial window plus one day is retained between pruning boundaries, with every recent event preserved. The archive stores cumulative income, expense, net, count, last transaction ordinal and posting tick. Cash always reconciles as initial funds + archived net + retained transaction net. The panel explicitly distinguishes the recent 24-hour subset from all retained detail and from construction-excluding operating summaries. Midnight source settlements belong to the elapsed operating day; physical admissions at midnight belong to the new day.

`finance-history.test.ts`, `financial-continuation.test.ts`, `financial-day.test.ts`, `finance-report-contract.test.ts` and the existing settlement/rounding suites cover cutoff retention, archived continuation, exact signed rounding, unsafe aggregate rejection, partial-day accrual, zero/negative cash and once-only demolition liabilities. Native financial observations are recorded separately in `tests/browser/evidence/us14-finances.md`.

Exploratory tests and measurements initially used the shell default Node 20.20.2. The retained JSON and numbers above supersede them with the successful pinned Node 24.20.0 run.
