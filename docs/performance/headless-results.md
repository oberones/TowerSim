# Final headless measurements — 2026-09-12

**Reference performance fails release requirements.** Passing benchmark tests establishes reproducible runs and valid population/accounting, not the browser performance budgets. The reference processes 30 event-heavy ticks far slower than 0.25 seconds required for normal speed; the active topology edit also far exceeds 150 ms. See [remediation](remediation.md).

Run `nvm use && npm run bench`. [Complete JSON](headless-results.json) retains every workload, exact Node/CPU/RAM/OS, commit/dirty flag, content/rules/seed, fixture hashes, raw timing samples, all 13 digests, counters and heap observations. Final source/output identities are in `docs/phase-19-artifacts.json`. The machine is Apple M2 Pro / 32 GiB; Node 24.20.0. Normal desktop browser activity occurred during collection; these are development measurements, not isolated reference-browser qualification.

| Workload | Median ms | p95 ms | Ticks/real second | Actual active min/mean/max |
| --- | ---: | ---: | ---: | --- |
| scaling-dormant-0 | 0.006 | 0.009 | 15625000.0 | 100/100.0/100 |
| scaling-dormant-5000 | 0.011 | 0.015 | 8794301.3 | 100/100.0/100 |
| scaling-reference-edit | 5669.437 | 5714.080 | 0.0 | 1920/1920.0/1920 |
| scaling-reference-rush | 867.086 | 890.224 | 34.6 | 1920/1920.0/1920 |
| scaling-rush-100 | 47.104 | 51.002 | 628.2 | 196/196.0/196 |
| scaling-rush-1000 | 149.637 | 153.713 | 199.8 | 1096/1096.0/1096 |
| scaling-rush-5000 | 1086.409 | 1145.320 | 27.5 | 5096/5096.0/5096 |
| scaling-walking-100 | 0.009 | 0.021 | 9252063.2 | 100/100.0/100 |
| scaling-walking-1000 | 0.011 | 0.023 | 7915525.5 | 1000/1000.0/1000 |
| scaling-walking-5000 | 0.011 | 0.080 | 4818301.8 | 5000/5000.0/5000 |

Three warmups and ten independently restored trials use the same snapshot and command script; restoration, encoding, hashing and population tracing are outside timing. Scoped graph builds, route requests/searches, cache hits/misses, event scheduling/processing and boundary-copy counts are enabled only during timed work. Actual population min/mean/max comes from a separate one-tick replay. Every trial retains matching canonical final digests. The heap delta includes garbage-collection noise and is not retained-memory proof.

Dense walking is deliberately transition-free for 100 ticks. Timestamp movement permits skipping directly to the next event; its very high throughput is not a rush result. The 100/1,000/5,000 named rush fixtures retain 196/1,096/5,096 active people through 30 ticks, include queues, and retain three eight-person shafts. The additional 96 people prevent the measured load draining below its named scale. The dormant pair keeps 100 walkers and adds 5,000 scheduled sleepers whose wakeups are outside measurement. Reference rush has 1,920 active plus 80 scheduled customers in the required 13-floor mixed tower. Its edit adds a fourth standard shaft at cell 22 during traffic.

The initial experiment sampled full population inside timing; its walker/dormant numbers mostly measured observation overhead. Those superseded reports remain under `phase-19-before/` for transparency and must not be used as domain throughput. The observer was moved out of timing in the final harness. Before/after reference comparisons are directional because of this instrumentation correction; the CPU profiles separately isolate the repeated descriptor-validation cost. No numeric acceptance threshold or demand rule was weakened.

All existing benchmarks were rerun, including kernel, construction, office, queues, restaurant/financial history and transport edits/reports. The ordinary 96-person congestion comparison remains a separate non-skippable correctness gate. Full 10-minute native FPS/input/save distributions and 30-minute sessions remain open.
