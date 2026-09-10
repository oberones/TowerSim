# Phase 2 kernel measurements

Measured locally on 2026-09-10 with Node 24.20.0 on Apple M2 Pro (12 logical CPUs, 16 GiB RAM), macOS Darwin 25.5.0. These are headless kernel workloads, with no people, rendering, transport or gameplay performance qualification.

Reproduce with `nvm use`, `npm ci`, `npm run bench`. Each workload restores outside timing, performs three warmups and ten measured trials serially without coverage, and requires all 13 final digests to match. Event-only workloads declare zero simulation ticks; event operations are in the counters. The baseline setup counter is excluded here.

| Workload | Measured batch | Median ms | p95 ms | Storage result |
| --- | --- | --- | --- | --- |
| kernel-boundaries | 259,200 ticks (3 days) | 4.559 | 5.046 | 2 pending recurring events |
| kernel-cancellation | 20,000 inserts and cancellations | 56.454 | 57.627 | peak 64; final heap/ID/sequence/owner indices all 0 |
| kernel-event-burst | 5,000 inserts and pops | 21.395 | 24.881 | peak 5,000; final indices all 0 |

The cancellation workload never accumulates canceled records. Per-trial counters and SHA-256 result digests, fixture identity, seed, build/rules/content IDs, CPU/RAM/OS/Node, base commit and dirty-tree flag are retained in [kernel-evidence/](kernel-evidence/). The [source hash manifest](kernel-evidence/source-sha256.json) identifies the implementation and tests measured; the base commit alone does not identify this uncommitted work. Heap-used bytes are post-trial observations, not retained-memory or GC qualification.

Before removing repeated callback allocation/event scans from the ordinary tick loop, the same boundary workload measured 20.482 ms median / 20.908 ms p95. After moving callbacks and the next-event lookup outside the loop and using the prevalidated tick range, the values are in the table above. All final trial digests agree between both runs. The earlier report is [boundaries-before.json](kernel-evidence/boundaries-before.json); its dirty source was superseded and only the final implementation has a source hash manifest. This small comparison is local evidence, not a cross-machine speed guarantee.

Future stateful story handlers must extend transactional staging before adding movement/financial effects to these phases. Current event boundaries stage the small kernel state; ordinary ticks have only a clock update. Profiling populated towers belongs to later tasks.
