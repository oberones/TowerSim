# Progression and local continuation

Phases 17–18 implement Level 2 and one explicit local save slot. Phase 19 remains unstarted.

```sh
nvm use
npm test
npm run build
npm run build:browser-test
npm run check:browser-builds
npm run preview -- --host 127.0.0.1 --port 4173
```

The Level 2 panel separates today's provisional counters from the last completed-day decision. It lists each target/current/result. The starting partial day cannot qualify. Minimum accessible leased offices and assigned workers survive temporary losses and repairs. Actual room admissions and completed office arrivals increment evidence at their transitions. Midnight first closes the complete transport report and settles finance, then evaluates quality without display rounding. The award at a qualifying midnight is permanent.

The default command journey has three upper offices, a ground restaurant, and a useful second shaft added after observing real denials. All construction uses the initial million minor units and ordinary commands. It earns Level 2 after day 2, with 96 completed office arrivals, 40 admitted restaurant visits, 272 total transport samples, daily quality 94.36158088235292, operating net 56000 minor units and settled cash 355396 minor units. This is headless default-content evidence, not a timed new-player trial.

`daily-quality-progression.test.ts` supplies a separate finite stress contrast: six offices/192 workers, 40 restaurant customers and the same 464-trip complete-day denominator in both runs. Its named scenario concentrates departures into 17:00–17:06, alongside the usual 08:00–08:06 arrivals. One shaft fails daily quality 60; two meet it, with every other milestone predicate met. This disclosed schedule override is test data; default departure schedules and all shared quality coefficients are unchanged. The original 96-worker congestion acceptance retains its exact numerical results; only its canonical hash changes for the new persistent progression fields and compatibility identifiers.

Save captures a detached completed boundary, while play and paused edits may continue. The displayed saved tick belongs to that capture; newer changes remain unsaved. Writes are serialized. IndexedDB commits one envelope to `TowerSimSaves`, version 1, store `saves`, key `local-main`. Request success is provisional; only transaction completion is acknowledged. Abort/quota/connection failures preserve the previous committed slot.

Load reads and validates before asking to replace unsaved progress. Cancel retains the current tower. Acceptance replaces one owned runner, invalidates old callbacks, resets pacing debt and starts paused without offline advancement. The loaded scenario rebuilds its own controls and prices. New Game changes only the active tower and leaves the slot intact. Save and Load are disabled during a pending storage operation; ordinary play remains usable. Storage belongs to the browser origin/profile: another port, private profile or browser has a different slot.

The v1 envelope requires matching schema/rules/content/scenario/slot/tick/day metadata and canonical UTF-8 payload size. Current identifiers are `tower-mvp-v1` and `mvp-v1`; earlier restaurant/transport snapshots reject explicitly. No migration invents missing daily evidence. Validation enforces closed shapes, finite integer/counter bounds, scenario-derived collections, geometry, live/historical references, physical routes/segments, queue/service reservations, finance, reports and progression. Historical retired IDs remain valid without live people.

The separate browser chooser adds **Level 2 — ten ticks before qualifying midnight**, **Storage reference — 2000 people, active rush**, and **Storage exercise — native aborted replacement**. The last intentionally aborts a real native transaction after successful `put`; use it only for the documented rollback exercise. Harness-only timing observes Save/Load actions through visible completion; load confirmation time is excluded. No test fixture, abort adapter or measurement observer enters the release graph.

See [determinism](acceptance/determinism.md), [milestone observation](../tests/browser/evidence/us15-management-loop.md), [native storage](../tests/browser/evidence/us16-storage.md) and [full journey gates](../tests/browser/evidence/full-mvp-loop.md) for evidence boundaries.
