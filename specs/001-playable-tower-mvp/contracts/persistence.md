# Persistence and save contract

## Port and ownership

Application-owned `SaveRepository` exposes asynchronous `read(slotId) -> SaveEnvelope | notFound`, `write(slotId, envelope) -> success | failure`, and `listMetadata() -> SaveMetadata[]`. MVP UI uses one slot, `local-main`; the interface permits later slots without changing simulation state. There is no automatic destructive delete or export/import feature in MVP. An in-memory/fault-injecting repository supplies headless application tests; the browser adapter alone imports IndexedDB.

The domain defines a plain state DTO, pure validation and rules compatibility. The application captures a consistent state, coordinates pending commands/unsaved replacement, and owns one active session. The IndexedDB adapter stores envelopes and returns typed errors; it cannot start/advance a game or decide what an invalid state means.

## Version-1 envelope

Fields: `metadata` (SaveMetadata) and `state` (GameState DTO). Schema, ruleset and content identifiers must agree with the payload. The immutable scenario/content snapshot is included; executable capabilities are supported by ruleset version, not loaded code. Save the current RNG words, command/event/queue/ID counters, active routes and segment progress, service cohorts/cursors, pending schedules, financial accruals, bounded reporting and progression evidence.

No DOM, Canvas, RAF, wall-clock pacing debt, UI selection, runtime heap layout, graph/cache, browser storage object, function, Map/Set or class instance is part of the contract. Presentation metadata such as a UTC save date is explicitly nonauthoritative. Canonical replay digests sort records and exclude this metadata, but include all behavior-relevant counters and data.

Only schema v1 plus supported rules/capabilities load in MVP. Reject earlier/future formats explicitly; do not invent migration from files that never existed. When a later persistent field/rule changes, define preserve/migrate/reject behavior and test version-to-version migration before any active replacement.

## Save workflow

1. Application flushes already accepted domain commands and waits for a completed tick/paused-command boundary. Capture a detached plain snapshot and the session generation, unsaved revision and tick associated with it; the world may resume after detachment.
2. Validate/canonicalize required data and compute optional integrity metadata before opening a database transaction. Serialization must not depend on current renderer objects or live references that can mutate under an async write.
3. Open `TowerSimSaves` database version 1 and `saves` object store keyed by slot ID. Start a single `readwrite` transaction and `put` one complete envelope over the prior record. Do not delete the previous record first or split metadata/payload across independent commits.
4. Do not await unrelated timers, network work or computation inside an active IndexedDB transaction. Encapsulate request and transaction handlers. Resolve success only on transaction `complete`; request `success` alone is insufficient.
5. On abort/quota/unavailability/connection failure, return a readable failure and preserve active play and the previous valid slot. UI identifies the actual saved tick/revision, since play or paused edits may have changed state during the write. Mark only the captured revision saved; newer revisions stay dirty. A completion for an old session generation cannot update a replacement session or clear its unsaved status. A Save during pending save is serialized or disabled with visible progress, not raced.

Reported success means the browser transaction completed; arbitrary power/OS failure durability beyond browser guarantees is not promised. The spec's interrupted-write tests concern transactional replacement and usable previous state.

## Load workflow

1. Read candidate data into a detached value; leave the active session and storage unchanged.
2. Validate schema/version, finite safe integers, size/collection limits derived from supported scenario bounds, normalized geometry/support, content capabilities, unique IDs/counters, referential integrity, queues/car capacity and state/location consistency, pending events/generations, valid routes/committed stops or a valid current segment with an explicit pending-replan goal (never an invalid live suffix), economy reconciliation and report invariants. Service-visit cohort entries already processed are historical snapshots, not required live queue references; pending selections must still match their queue or a valid cancellation state. Pending heap events must be strictly after the saved tick. Reject unknown variants or missing required fields; no silent defaulting of authoritative state.
3. Construct the candidate runtime indices/heap/graph deterministically at its saved topology version, consume zero RNG draws, and verify invariants/canonical state equality. Do not regenerate current demand or change selected routes.
4. If the active session has unsaved changes, show the spec-required replacement/cancel choice only after the candidate is valid. Cancellation discards the detached candidate and leaves the current session intact.
5. On acceptance, invalidate the old application's runner generation, cancel its scheduled browser callback ownership, swap one active-session reference, clear wall-time pacing debt, reset the anchor, and start paused at the saved tick. Exactly one active simulation may produce future events.

A rejected or canceled load never writes the candidate back to the save slot. Read metadata cannot be trusted until payload validation. No elapsed real-world time produces rent, arrivals, queue age or movement.

Retired-person references follow the data model's historical/live distinction: closed trip records, retained cohort identities, processed service-visit history and financial source snapshots may retain a historical ID without a live occupant record. A current queue/car membership, pending event, committed route or active/unresolved trip cannot reference a removed person. Validate these categories explicitly and never reconstruct retired occupants or reuse their IDs merely to satisfy a historical reference. Include post-retirement snapshots in next-day continuation tests.

## Platform failures and Safari

Return typed errors for unavailable storage, quota, abort, blocked upgrade, unsupported version, malformed data and invalid invariants. Close a connection on `versionchange`; show a blocked-upgrade explanation and permit retry after other tabs close. Do not wipe the database to fix an upgrade. Concurrent tabs use IndexedDB transaction ordering; the last completed explicit save replaces the single slot, and the UI displays its metadata. Cross-tab locking/cloud conflict resolution is outside MVP.

Use origin/profile-local storage; HTTP(S) static hosting provides a stable origin. Do not promise `file://` persistence, recovery after clearing browser data, or indefinite private-session retention. Core active play continues when saving is unavailable. All core assets are local after initial load; no network request is part of save or gameplay.

## Required evidence

Pure tests: serialize/restore idle, scheduled, walking, stair, waiting, riding, each car passenger-exchange phase, inside office/restaurant, stranded, and pre/post settlement/milestone states. Compare the following full day to uninterrupted continuation, including generated IDs, queues, denials and finance. Reject duplicate queue/car membership, over-capacity cars, invalid segment progress, unsupported content, invalid event targets, all-zero RNG and mismatched ledger totals.

Repository fault tests: failed replacement retains the old envelope; success occurs only after commit acknowledgement; stale runner cannot tick after replacement; canceled invalid/unsaved loads change nothing; paused edits during a pending save remain dirty, and a stale save completion cannot affect a newly loaded session. Round-trip immediately after route invalidation and midway through boarding/cancellation, including processed visit-local cohort history. Real browser tests: IndexedDB completion/abort/quota/blocked-upgrade behavior, refresh/reopen, unavailable/private-profile behavior where testable, and two-second save/load at the reference scale in actual Chrome, Firefox and Safari. A Node mock or WebKit-engine substitute does not count as actual Safari qualification.
