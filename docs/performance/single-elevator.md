# Single-elevator timing sample — 2026-09-10

This is a headless, one-passenger measurement for T063, not a rush, rendering or sustained-speed qualification.

Run `nvm use` followed by `npx vitest run --config vitest.benchmark.config.ts tests/benchmarks/single-elevator.bench.ts`. The fixture constructs floors 1–3, one office and one standard eight-person elevator through public commands, then stops one tick before the worker's generated arrival. Only the office workforce is reduced to one; production walking and elevator timings are unchanged.

The benchmark restores the same encoded state before each trial, outside the timed interval, then advances 1,200 simulated ticks through the complete arrival. It records three warmups and ten measured trials, hashes the final authoritative state outside timing, and requires all 13 digests to agree. No coverage instrumentation is enabled.

Measured on Apple M2 Pro, 12 logical CPUs, 16 GiB RAM, Darwin 25.5.0, Node 24.20.0: median **3.543 ms**, p95 **3.767 ms** per 1,200-tick batch. Much of this interval has no transition; the event-driven kernel coalesces that elapsed time exactly. Do not extrapolate this tiny workload to thousands of active passengers, the browser frame budget, or congestion acceptance.

| Completed arrival measure | Simulated ticks |
| --- | ---: |
| Walking to/from the elevator | 840 |
| Actual queue time, including boarding | 5 |
| Riding through unload completion | 23 |
| Complete trip | 868 |

The trip has one elevator boarding and no capacity denial. Movement tests independently assert two start ticks, three adjacent four-tick segments, two leveling ticks, two ticks per door/dwell phase and one tick per passenger transfer. Floors 1 and 2 are passed without a new start allowance or forced service.

Raw samples, counters, seed, machine and fixture/final hashes are retained in [single-elevator-results.json](single-elevator-results.json). Source and final static artifact identities are recorded in [phase-6-7-artifacts.json](../phase-6-7-artifacts.json). The working tree was dirty because this implementation was not committed.
