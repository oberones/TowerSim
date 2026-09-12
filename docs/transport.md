# Stairs and one-elevator journeys (phases 6–7)

Stairs and standard elevators now connect constructed floors to offices. Use the existing floor and office controls first, then the **Stairs** or **Elevator** tool. Construction remains paused until you choose a speed. Every named production function has a descriptive comment checked by `npm run build`.

## Controls

- **Stairs**: click the lower landing on the tower, drag the preview into position, then confirm **Place stairs** on the object. Both adjacent floors need a free, fully constructed two-cell landing. Each connection costs $50 and has no recurring cost. Use different cells for consecutive stairs so their shared-floor landing reservations do not overlap.
- **Elevator**: click the lower landing on the tower, adjust **Elevator top floor** in the on-object confirmation, drag the shaft into position, and confirm **Place elevator**. Moving the preview preserves its height. The aligned two-cell shaft needs constructed landings on every reserved floor and at least two contiguous served floors. The price is $2,000 plus $50 per reserved floor. The shaft contains exactly one eight-person car and costs $30 per simulated day, including empty idle time.
- Inspect a connection on Canvas or use **Selected connection**. The elevator inspector shows its served range, separate car ID, current phase, logical floor position, direction, load out of eight, every stop's up/down count, and accrued operating cost.
- To edit service, select an elevator, change the lower/upper floor fields, and use **Apply selected elevator service range**. Its reserved shaft stays in place. Existing overlapping stops retain their IDs. Edits that remove an occupied car's position, movement segment or unloading commitment reject.
- **Remove selected connection** is free, with no construction refund. Elevator removal separately settles accrued operation. Occupied stairs and loaded cars cannot be removed. Empty shaft removal cancels waiting requests at surviving physical anchors.

A small test layout is floors 1–3 over `[0,48)`, an office on floor 3 at cell 24, and an elevator at cell 18 serving 0–3. For stairs, use lower-floor/cell pairs `(0,10)`, `(1,12)`, `(2,14)`. Build before first unpause to participate in the initial 06:00 leasing review.

## Simulation behavior

A same-floor connected journey walks. One- or two-floor journeys prefer stairs; longer journeys prefer elevators. Either mode falls back to the other when no valid preferred route exists. Queue estimates cannot force a switch to stairs. A journey retains its original preference through intermediate floors, while the final connected hallway leg walks after unloading.

Walking and stairs have explicit timed endpoints. Elevator route edges are directed board/adjacent-ride/alight links, collapsed into one unload commitment so passing an intermediate floor does not force a stop. Queue admission requires actual presence at a stop; identical repeated requests are idempotent. One second of boarding moves a person atomically from queue to car. Unloading takes one second and precedes the visit's boarding cutoff. Capacity is enforced immediately; fuller queue/denial acceptance and presentation are owned by phase 8.

The car uses the fixed directional sweep, including opposite-direction requests at the farthest reversal point and nearest/lower-floor idle pickup ties. Start, leveling, doors and dwell consume two ticks each; adjacent floor movement takes four ticks. Passing floors do not pay another start cost. An empty canceled reposition finishes its current adjacent segment before idling.

Topology edits remove future route suffixes while preserving supported current movement and loaded unload commitments. Unreachable incoming visits are abandoned; people exit from real endpoints or remain stranded until repair. Existing inaccessible office leases persist, with rent suspended. New transport does not replay missed arrivals or regenerate schedules.

State snapshots now use `tower-transport-v1` / `mvp-transport-v1`. Earlier office-only snapshots are explicitly rejected rather than silently filling required transport fields. Queue admissions, car segments/phases, service cohorts/cursors, active journeys and costs survive capture/rebuild. Native browser Save/Load remains a later phase.

## Validation

```sh
nvm use
npm test
npm run build
npm run build:browser-test
npm run check:browser-builds
npx vitest run --config vitest.benchmark.config.ts tests/benchmarks/single-elevator.bench.ts
```

`make manual-test` serves the fixture chooser with upper offices needing transport, a visible pre-arrival elevator rider, all nine paused elevator phases, and stair ascent/descent/inside-office states. Fixtures create valid starting states before mounting the ordinary application; they add no controls that change gameplay state during play.

The final suite passes 168 tests across 59 files, including valid observation-fixture boundaries and exact resumed journeys. Native Firefox 155.0.1 and Safari 26.5 exercised stairs/access repair, tracked elevator journeys, all nine paused car phases and release construction smoke. See [stair evidence](../tests/browser/evidence/us04-stairs.md), [elevator evidence](../tests/browser/evidence/us05-one-elevator-rider.md), [artifact identities](phase-6-7-native-artifacts.json), and [timing samples](performance/single-elevator.md). T053/C1 and T064/M3 remain unchecked because Chrome qualification is pending at the user's request. Phase 8 and later tasks remain untouched.

Both connection types remain unbuilt until confirmation. Drag the preview or its **Move** handle to reposition it; focus **Move** and use arrow keys for one-cell or one-floor adjustments. Invalid footprints disable confirmation and show the blocking reason. Escape, Cancel, or another tool discards the pending placement. Existing elevator service-range controls remain in **Tower details → Connections**.
