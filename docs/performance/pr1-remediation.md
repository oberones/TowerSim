# PR #1 feedback remediation

This follow-up implements the performance work requested in the two valid review threads. The reported construction-panel initialization error is a false positive: `reset` is declared before `placement`, but invoked only after the adapter is initialized. New tests exercise both the panel and the complete game-view composition, including drawing, replacement and disposal.

## Implementation and invariants

- Event boundaries use copy-on-write records instead of cloning the entire state. A synchronous application frame detaches its occupant/trip dictionaries once, then journals dictionary replacements at each completed boundary. Failure restores only the unfinished boundary; prior boundaries remain committed. A new frame detaches again, preserving references retained before advancement. Public advancement and runner creation still validate the complete external state.
- Pending wakeups retain an indexed scheduler. Insertions/cancellations update its heap and ordered snapshot incrementally. The cache is invalidated before an event transaction, so failure reconstructs from the last published events instead of reusing a partially consumed heap. Persistent events remain plain detached records.
- Construction commands use the same unpublished transaction machinery. Physical lobby reachability is computed once per topology using connected hallway components and actual stair/shaft landings. Consecutive passenger events and ordered queue migration share static route geometry and maintain approach counts as each person moves; boarding costs remain current for every decision. A numeric indexed search frontier preserves the prior stable score/tie ordering.
- Native probing exposed an additional application limit: the previous fixed 4 ms frame budget could not deliver 8× playback even with the faster engine. Frame budgets are now 4/12/24 ms at normal/fast/very fast, retaining the per-tick yield check and 240-tick ceiling. Clock-controlled tests verify every budget and retained debt.
- Bulk approach scans read the current draft records without creating proxies for untouched occupants. The view is read-only, sees pending edits, and leaves journal/publication semantics intact; a regression exercises later writes after the read.
- Queue indices store scalar locators instead of transient draft objects. Successful publication rebinds the derived index; failed drafts cannot change the previous boundary's index. Queue removal copies the entry array structurally, and cohort queue bookkeeping uses the arrival trip's original day.

There are no changes to demand, car capacity, authoritative event ordering, integer clocks, route preferences, save identifiers or acceptance thresholds. Commands still publish atomically and all foreground tick debt is retained.

## Reproduction and evidence

Use Node from `.nvmrc`:

```sh
nvm use
npm run check:release
npm run bench
node scripts/profile-reference.mjs
node scripts/profile-reference.mjs --edit
node scripts/profile-reference.mjs --evening
```

The fresh pre-edit reference reports in [pr1-before](pr1-before/) use the current PR head's fixture and routing rules; older Phase 19 reports remain historical. The fixture is a 2,000-person mixed tower with 1,920 active people at the checkpoint, three eight-person cars and unchanged demand. Rush measures 30 ticks; the edit adds a fourth shaft at cell 22. Three warmups and ten independently restored trials exclude fixture setup, state validation, encoding and hashing from timing.

`pr1-reference-regression.test.ts` pins the original initial, rush and edit SHA-256 digests, covering every saved authoritative field. The new regressions additionally cover copy isolation, failure/retry, failure after an earlier completed tick in a frame, queue rollback, heap snapshots, exact cached/uncached route equivalence and topology reachability against the route oracle. Existing three-day replay, save continuation and mandatory congestion checks remain in the unfiltered release suite.

The original combined 120-second scale-fixture timeout and all population assertions remain unchanged.

## Qualification status

`npm run check:release` passed **408 tests in 134 files**, strict types, 24 boundary fixtures, comments for 487 named production functions/methods, both production builds and application graph/settings/output isolation. The original combined scale-fixture test passes without raising its timeout. `npm run bench` passed **29 tests in 11 files**, producing 31 workload reports. Build/source hashes and exact changed code paths are retained in [the artifact manifest](../pr1-artifacts.json).

The complete final benchmark run is retained in [pr1-headless-results.json](pr1-headless-results.json). Firefox's prepared 8× probe overlapped part of collection; the reference edit p95 was **150.86 ms**, narrowly over budget. A separately retained [reference recheck](pr1-reference-recheck.json) ran after playback was paused, with no competing task validation/profile, using the same three warmups and ten restored trials. Both runs are retained; no samples were removed.


| Reference workload | Fresh PR-head median / p95 ms | Final recheck median / p95 ms | Result |
| --- | ---: | ---: | --- |
| 30 rush ticks | 875.77 / 896.89 | 23.10 / 29.33 | 1284.9 ticks/second; exceeds 960 headless target |
| Active shaft edit | 6322.59 / 6469.53 | 109.79 / 126.00 | p95 below 150 ms in the focused recheck |

The initial fixture and all 13 final digests for each reference workload exactly match the fresh pre-edit reports. These are Node measurements on Apple M2 Pro / **16 GiB**, Node 24.20.0, macOS Darwin 25.6.0. The reports' dirty flags are preserved; the current artifact manifest identifies the uncommitted implementation. Earlier Phase 19 claims of 32 GiB are historical and are not used for this comparison.

A diagnostic evening CPU profile (ticks 61200–61500, preparation outside timing) dropped from 451.13 ms to 173.98 ms after the bulk-read change, preserving final digest `0b2f4918821a7a2deeab41b42ab0a206f26a0ba65202313a1a6484782ab9d29b`. These cold, instrumented profiles explain the bottleneck; they are separate from restored-trial qualification.

Short native Firefox probes are summarized in [pr1-browser-probes.json](pr1-browser-probes.json). The final prepared artifact ran 8× for 127.574 seconds with median 58.42 FPS and 960.04 ticks/second. Debt peaked at 3743.4 ticks, subsequently recovered below one tick, and ended at 181.4 during another burst. This demonstrates recovery, not completion of the required sustained-rate exercise. The earlier normal-speed probe measured median 59.94 FPS and 119.96 ticks/second for 43.597 seconds; its artifact precedes the final burst optimization.

The final prepared build saved tick 151327 through Firefox IndexedDB in 794 ms. After serving release `dist/` at the same origin/profile, ordinary Load restored that tick paused with Day 2 18:02 and $27,820.50; construction controls mounted and Fast 4× resumed. Release load duration was not instrumented, so this is a functional handoff check, not a load-latency qualification.

**Release qualification remains open:** T151/T152 are not checked off. The complete ten-minute, 1440×900, actual Chrome/Firefox/Safari exercise, full input/access/save/load distributions, earlier sustained-session and new-player gates remain required. Chrome was absent from the enabled native-app inventory. Supplemental prepared probes and the scoped release save/load handoff cannot substitute for those gates. No PR comments were posted or review threads resolved, and no commit/push/deployment was performed.
