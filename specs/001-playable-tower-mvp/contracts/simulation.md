# Simulation commands and advancement

## Public surface

Planned operations:

- `createGame(validatedScenario, seed) -> GameState`: no browser/wall-clock access; creates permanent lobby, configured base floor, initial cash and paused-session-ready state at 06:00. The application owns pause.
- `validateCommand(state, command) -> ValidationResult`: pure proposal, quoted price/accruals/footprints, or typed rejection. No IDs, random draws, events or transactions are consumed by a preview.
- `applyCommand(state, envelope) -> CommandResult`: executes one command atomically at the stated current tick and global command sequence; validates again because the preview may be stale.
- `advance(state, tickCount) -> AdvanceResult`: integer tickCount ≥0, no wall time or Canvas. Completes every requested tick or reports a deterministic invariant/limit failure at a documented committed boundary; never hides skipped ticks.
- `query(state, derivedContext, request) -> ReadonlyResult`: no mutation or random draws. The application exposes narrower inspector/presentation views.
- `captureState(state) -> SaveStateDTO`, `validateState(dto) -> ValidatedState | errors`, `rebuildDerived(state) -> RuntimeContext`: pure state/snapshot and deterministic reconstruction. Persisted navigation choices do not change when caches rebuild.

The runtime may wrap `GameState` plus derived structures internally, but exported save data remains plain. Domain errors are not browser exceptions as gameplay control flow. Reject malformed command data before evaluating costs or topology.

## Domain command envelope

Fields: `sequence`, `atTick`, `kind`, typed `payload`. `atTick` must equal the current completed-boundary tick; future commands are delivered by the application/replay driver after advancing to their tick. `sequence` is monotonically increasing across accepted and rejected submissions; replay uses the same ordered input. A previously consumed sequence returns `duplicateCommand` without replaying its effect. Game entity/RNG/event allocation happens only after a proposal is validated. No unbounded command journal is required in GameState; tests retain their external replay script.

| Command | Payload and required result |
| --- | --- |
| `constructFloorRange` | floor, startX, endXExclusive. Full support/bounds/no-overlap/affordability checks; one charge, normalize adjacent spans. |
| `demolishFloorRange` | floor and interval. Reject lobby base or any people/facility/transport/upper-support dependency; preserve untouched ranges. |
| `placeFacility` | definitionId, floor, x. Known capability/footprint, built-space and collision checks; no automatic tenancy/people. |
| `buildStair` | definitionId, lowerFloor, x. Exactly adjacent built landings, clear reservations; one charge and immediate connectivity. |
| `buildElevatorShaft` | definitionId, x, min/maxFloor, servedMin/maxFloor. Aligned in-bounds reservation, every contiguous served landing valid, at least two stops; create exactly one eight-person car initially at the lowest served stop. |
| `setElevatorServiceRange` | shaftId and inclusive range. Validate prospective access and all loaded-car/current-segment/unload commitments before modifying stops/requests. No express gaps. |
| `demolishEntity` | stable facility/stair/shaft ID. Protected lobby, occupied stair and loaded car reject. A shaft command removes its single car as a unit; no separately stranded empty shaft/car UI lifecycle is needed. |

Selection, camera, tool choice, speed, Save, Load, New Game and debug toggles are application commands, not domain commands. New Game calls `createGame` only after the spec's unsaved-progress decision. A pointer event cannot set cash, occupancy or car state.

**Validation errors:** unknown entity/definition, invalid numeric input, out of bounds, missing constructed floor/support/landing, overlap/reserved footprint, insufficient funds, protected lobby, active traversal, loaded car/committed stop conflict, invalid service range, stale tick/sequence and safe-integer overflow. Return specific affected spans/entities and quoted values. On failure, geometry, cash, tenancy, occupants, routes and pending events remain unchanged; only the consumed command sequencing metadata may advance.

## Completed boundaries and deterministic phases

At a published state for tick t, all ordinary work due at t has completed. Apply incoming commands in sequence before advancing the next interval; while paused they execute at t without aging any simulation state. A rejected action cannot partially invalidate a route. Snapshot/load is allowed only at these completed boundaries.

**Bootstrap exception:** A new tower at 06:00 has `initialReviewPending = true`. Player construction while paused happens first. On the first positive advance, execute that one review at the existing tick, clear the flag, and schedule the next day's review. Saving before first advance preserves the flag. `advance(0)`, queries, and construction alone cannot trigger it.

For each ordinary tick from t to u=t+1:

1. **Integrate [t,u):** advance only already-active walk/stair/car/transfer work by one tick. Accumulate or close elapsed metric intervals. Collect completion intents; do not admit arrivals, execute future events or process a newly activated entity for a second tick. Waiting/riding ages derive from timestamps.
2. **Set clock to u; drain reserved phase-0 boundary events if due:** the single scheduled day-boundary event settles the elapsed day's rent/cost accruals, finalizes its trip/day evidence through u, evaluates progression from that completed day and post-settlement finances, then opens the new day's counters and schedules the next boundary event. Trip completions/events stamped u belong to the new day's boundary; unfinished prior-day trips remain visible in the completed-day sample. At evaluation, an unresolved trip whose start precedes the newly opened day is a prior-day trip. Do not also run a clock-modulus settlement outside this event.
3. **Drain due scheduled events:** order by `(dueTick, phasePriority, sequence)`; departure goals/visit ends before lease/demand reviews, then external arrivals, then other typed future financial operations. Events with an obsolete lifecycle generation are rejected/removed safely. All newly scheduled events must have dueTick >u; no zero-delay heap recursion.
4. **Apply physical completions:** stable entity ordinal order within movement/unloading/boarding categories. Arrival whose departure goal is already due abandons the work visit before admission. Complete all arriving walkers and unloading passengers before creating new boarding cutoffs; no newly started leg consumes this elapsed interval again. A rider whose goal was canceled still unloads at the protected committed stop.
5. **Resolve boundary decisions:** route/queue/admit occupants in stable ordinal order, updating approaching reservations immediately; dispatch car decisions in car ordinal order. Freeze each service's eligible boarders after unloading and after this boundary's queue arrivals. Administrative empty passenger phases may skip, but positive movement/door/dwell/transfer durations start for the next interval. Cutoffs and visit IDs are persisted.
6. **Commit reports and changes:** post admission revenue once, update maintained counts/cohort peaks and active indices, expire old bounded samples, verify relevant invariants, and publish the completed state. No presentation query observes a partially executed phase.

A scheduled departure takes precedence over a same-tick office admission. No worker can become physically present for a visit whose workday has ended. Same-time behavior is a contract, not inferred from object iteration. The exact same phases run at every speed and headlessly.

A same-day ordinary financial event is applied in its phase once; if new event kinds later require a different boundary ordering, change the versioned ruleset and tests explicitly. Initial scenarios do not schedule unrelated income exactly at midnight to bypass the completed-day criterion.

## Scheduler contract

Event priority constants are versioned data in the ruleset: atomic day-boundary settlement/report/progression 0, departure/visit-end 10, lease/demand review 20, external arrival 30, other scheduled financial operation 40. Unique insertion sequence totally orders events within a phase. The indexed min-heap supports insert, peek, pop, cancel-by-ID, reschedule (fresh sequence), and export sorted pending records. Owner → event ID indices support demolition cancellation.

Scheduling into the past/current completed tick rejects. Event payloads never hold functions. Cancellation physically removes a pending event, rather than accumulating tombstones. Load checks unique IDs/sequences, due times, supported kinds, target generations and event/state correspondence before rebuilding the heap.

## Atomic edits and disrupted travel

Validate prospective geometry, protected support and every affected live movement commitment before finance/topology mutation. Determine settlement and queue/event changes as one deterministic command transaction. After acceptance, increase topology version once, rebuild derived graph/access, close/open rent eligibility intervals, cancel removed requests, and mark affected routes for safe replanning. Preview uses the same rules but does not run the edit.

- A walk/stair segment may finish only if its physical support remains valid. Removing occupied stairs or floor support rejects; queued/planned usage alone does not block removal.
- Loaded cars and their active segment/committed unloading stops are protected. An empty moving car whose service changes is reconciled to a valid movement continuation or the edit is rejected; do not teleport it. An unloaded entire shaft can be removed with its empty car.
- Demolished room occupants emerge at the surviving entrance and start a timed exit. Cancel their old wakeups/visits and settle accrued finance. If no lobby route survives, retain a stranded location until repair.
- Route rebuilding cannot reset wait/denials, duplicate occupants, create completed visits, consume random numbers, or regenerate already scheduled demand.

## Determinism and headless evidence

Tests may create a validated scenario, issue the same envelopes, call advance for integer ticks, and compare canonical authoritative state at matching boundaries. Exclude metadata timestamps, application speed/camera, cache layout and render output. Include IDs, PRNG words, events/order sequences, phase cursors, queues, money, reports and progression. Three-seed/three-day tests cover different presentation schedules, pauses and save/load splits.
