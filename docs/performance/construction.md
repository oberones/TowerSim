# Construction measurements — 2026-09-10

Headless Vitest/Node measurements, not browser FPS, UI latency or final SC-012 qualification. Run `npm run bench` to reproduce the workloads in `tests/benchmarks/construction.bench.ts`. Exact samples, warmups, digests, fixtures, counters and machine metadata are retained in [construction-results.json](construction-results.json).

Environment: v20.20.2; Apple M2 Pro, 12 logical CPUs, 17179869184 bytes RAM; darwin 25.5.0. Source was dirty at commit `089d5b21131aacc47f190358b4e6f1efb6399947`. Rules `tower-construction-v1`, content `mvp-construction-v1`, seed `00000001000000020000000300000004`. The final source/artifact file-hash inventory is in `docs/phase-3-4-artifacts.json`; subsequent changes after measurement were input event scoping and pointer cancellation only, outside these headless workloads.

Three warmups and ten measured trials each restore the same validated snapshot outside the timed interval. Timing includes behavioral assertions and excludes snapshot reconstruction and hashing. All thirteen end-state digests match within each workload.

| Workload | Median batch time | p95 batch time |
| --- | --- | --- |
| construction-edit-and-preview | 16.608 ms | 18.340 ms |
| construction-walking-cache | 11.969 ms | 25.713 ms |

The edit batch builds 40 full-width upper floors, makes 2,000 rejected overlap previews, and safely removes those floors top-down: 80 accepted edits, one final base-floor record, 40 construction transactions, 80 topology revisions. No preview changes state. The walking-index batch reconstructs 41 sparse floor records 1,000 times, preserving topology version 40 and canonical authoritative state. These are batch times, not per-edit p95 latency.

A separate renderer unit test checks that repeated unchanged draws reuse one viewport-sized static cache, while geometry, pan, resize, DPR and explicit invalidation redraw it. This tests cache ownership/invalidation, not actual raster performance. The browser evidence files retain the native-browser and final release gaps.
