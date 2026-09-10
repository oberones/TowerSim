# Phase 5 walking and dormant-population benchmark

Measured 2026-09-10 with `npm run bench`: all 12 benchmarks passed. Runtime: v20.20.2; Apple M2 Pro, 12 logical CPUs, 17179869184 bytes RAM, darwin 25.5.0. Source base commit `ba414e722cc1a1630349484fb364352c25de7a95` plus the Phase 5 working diff. Retained [trial reports](phase-5-results/) contain fixture hashes, every timing, counters, authoritative digests and machine metadata.

Each fixture contains exactly one active walker plus 0, 1,000 or 5,000 scheduled-outside or inside-office workers. Ordinary construction/leasing allocates every identity. The performance fixture then freezes arrival/departure wakeups within the validated scenario windows, before measured advancement. Walking costs 1,000 ticks/cell in this benchmark only. All indoor workers were physically admitted through normal advancement. The measured 100-tick interval contains no wakeup, admission, path search, review or settlement.

Three warmups and ten measured trials each restore the identical canonical DTO, validate it, and create a privately owned runner outside timing. The timed call uses the same runner as the application. Active min/mean/max are exactly one throughout: no lifecycle transition occurs in the interval, and endpoint membership is asserted. Digests match in all 13 repetitions of every fixture. The remaining duration of the one walk changes by precisely 100 ticks, independent of dormant count.

| Fixture | Median ms / 100 ticks | p95 ms / 100 ticks | Active min / mean / max | Dormant |
| --- | ---: | ---: | --- | ---: |
| occupants-inside-0 | 0.0139 | 0.0363 | 1 / 1 / 1 | 0 |
| occupants-inside-1000 | 0.0484 | 0.0948 | 1 / 1 / 1 | 1000 |
| occupants-inside-5000 | 0.0518 | 0.0758 | 1 / 1 / 1 | 5000 |
| occupants-scheduled-0 | 0.0302 | 0.0752 | 1 / 1 / 1 | 0 |
| occupants-scheduled-1000 | 0.0605 | 0.1868 | 1 / 1 / 1 | 1000 |
| occupants-scheduled-5000 | 0.0516 | 0.0885 | 1 / 1 / 1 | 5000 |

Movement position and open trip measures derive from saved integer timestamps. There is no per-tick dormant scan or movement rewrite. The pending-event heap and rendering active list rebuild only when their authoritative records change. The full external `advance(state, count)` entrypoint still validates caller-supplied state; `createRunner` validates a privately owned runtime once and prebuilds its heap. An initial benchmark exposed repeated validation/heap rebuilding in the application path; both were moved to runtime creation, then this full suite was rerun.

These are deliberately idle-between-transition domain timings, **not** browser FPS, rush/burst throughput, input latency, or final population qualification. Event boundaries still stage a detached state and can scale with total population; office rush profiling belongs to Phase 9. Reports keep that cost separate instead of using the above numbers as burst or release evidence. Public codec validation and cold reconstruction are intentionally outside the timed interval.
