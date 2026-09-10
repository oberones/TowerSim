# Headless kernel development

Phase 2 exposes `createKernelState`, `applyCommand`, `validateCommand`, `query`, `advance`, `captureState`, `encodeState`, `decodeState` and `rebuildDerived` from `src/simulation/index.ts`.

Use the explicit scenario and three seeds in `tests/fixtures/seeds.ts` for headless examples. `tests/fixtures/replay.ts` demonstrates ordered command envelopes, rejected-command replay prevention, deterministic internal financial postings and capture/reconstruction at fixed tick offsets. Run `npm test` or `npm run test:integration` under `nvm use`.

This is a kernel initializer, not the future `createGame` tower/lobby initializer (T018). The scenario has only clock, initial money, identity and an empty supported-capability list. Unsupported capabilities reject. The seven planned command kinds are typed, but return `notImplemented` until their owning construction tasks add behavior. Valid new envelope sequences are consumed on rejection; malformed envelope metadata and duplicate sequences are not. Preview and query never allocate or advance time.

Phase 2 used development compatibility identifiers `stateVersion: 1`, `tower-kernel-v1`, `kernel-v1`. Phase 3/4 extends that unreleased contract with tower geometry and scenario content, using `tower-construction-v1` and `mvp-construction-v1`. Old kernel-only snapshots are rejected; no released save format or browser storage existed to migrate. Unknown/missing fields and unsupported identifiers reject. Later tasks must update contracts/validation/round-trip coverage as they introduce state and decide the relevant rules/content identity; no migration from an imaginary released save is provided. Browser storage is deferred. Scenario snapshots are copied/frozen, and all records handed out by the codec are detached. Rebuilt heap indices are disposable and absent from the DTO.

The first positive advance executes the pending 06:00 review before the first interval. The review currently only schedules its successor. Midnight has one phase-0 owner that records the boundary and schedules its successor; financial policy, demand and progression are added by later stories. All six phases run in explicit order. The movement/completion/decision hooks are empty in this phase because there are no occupants or cars. Their ordering is tested with isolated work, rather than claiming implemented movement.

Advance checks the requested end tick before mutation. Event work executes against a detached draft, so a failed handler/allocation leaves the prior completed tick intact; the result reports the ticks actually committed and an error code. Ordinary kernel ticks have no effect beyond the clock. Future active-system tasks must extend the draft/commit boundary before adding effects; never mutate the published state midway through a phase. Immutable scenario data is retained across the commit.

The ledger primitive accepts internal auditable postings and prevents duplicate source identities. No player-facing money command exists. Operating policy and bounded ledger archival belong to later finance tasks. Each future persistent field must extend the validator, codec tests and deterministic fixture when introduced.

The [kernel measurements](performance/kernel.md) cover event insertion/drain, physical cancellation and clock boundaries. They do not qualify populated simulation, rendering or browsers.
