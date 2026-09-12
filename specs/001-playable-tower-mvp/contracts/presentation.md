# Application and presentation contract

## Session and application commands

`GameSession` owns one domain runtime, selected speed, foreground pacing accumulator, session generation, unsaved revision, current tool/selection and Save/Load workflow state. Only the domain runtime is authoritative game state. Application commands include select tool/entity, update/cancel preview, commit a validated construction intent, set speed, Save, Load, New Game, camera pan/zoom and debug visibility.

Raw pointer/key events are interpreted in input/platform adapters. Construction tools follow `inactive → choosingTool → preview(valid/invalid) → committing → preview/inactive`; cancel returns without domain mutation. The preview uses the same pure validator as commit, and the commit revalidates against the current revision. Quoted construction price, separate accrued demolition settlement, and blocking dependency are visible before commitment.

All domain-changing intents are sequenced and applied at completed boundaries before further ticks. Application selection/speed/camera changes are not domain commands. UI event callbacks never directly mutate cash, positions, queues or occupancy. A New Game leaves the save slot alone and offers the spec-required cancellation when current progress is unsaved.

## Pacing and rendering

The platform supplies monotonic timestamps. While running/visible, accumulate elapsed foreground time × selected ticks-per-real-second; request only whole ticks and retain fractional remainder. Process short bounded batches (initial application budget about 4 ms before yielding, to be profiled); the budget affects when the app yields, never which domain phases run or which ticks are skipped. A single tick is atomic. At 8× the qualification target is 960 ticks/real second, not a different movement delta.

Explicit pause halts domain advancement; inspection, editing and save/load still work. On visibility loss, pause the application session and reset the real-time anchor. Do not add hidden time on return; any earned foreground whole-tick debt is retained for deliberate resume, while starting/loading a different session discards its old pacing debt. The user resumes explicitly. Preserve the last completed domain state during suspension.

`requestAnimationFrame` drives drawing and supplies platform timing only; domain functions do not call it. Rendering may interpolate a walk/car segment from committed endpoints/progress using application fractional time, clamped to committed movement. Do not visually anticipate boarding or unloading into an uncommitted state. At very fast speeds some intermediate images may be unrendered, but simulation service and travel still happen.

## Camera and drawing

Camera state: pan in world-space view units, zoom, CSS viewport dimensions and device pixel ratio. Provide invertible `worldToScreen`/`screenToWorld` and use their inverse for construction/selection. Normalize wheel/pointer coordinates to CSS pixels before conversion. Camera/resize changes never change the logical proposed span, price or validity; only which world position a new pointer motion proposes.

One visible Canvas 2D surface has ordered passes: background/grid; constructed spans; facilities; transport/landings/cars; visible occupants and queues; traffic overlay; selection/build previews; development debug overlay. Use simple original shapes first, cached shared art later if justified. Static layers are cached in ordinary detached canvases and invalidated by topology/style/zoom changes; avoid a world-sized bitmap.

Draw lists contain lightweight IDs, logical anchors, type/state and interpolation information, not a Canvas object owned by each occupant. Cull by visible floor/span using derived active spatial indices. Queue glyphs may group people while showing exact counts and waits. Do not create DOM nodes per person, facility or world cell. Dormant indoor occupants contribute to inspector counts without visible sprites.

## Read-only queries and snapshots

| Query | Required result |
| --- | --- |
| `getHud()` | Cash, day/time, selected application speed, current level and save status. |
| `getWorldView(viewBounds)` | Visible constructed ranges, facilities/transport, active logical draw records and topology/state revision; no full GameState clone each frame. |
| `inspectFacility(id)` | Footprint/access cause; office tenancy/assigned/present/rent/cost or restaurant allocation/incoming/inside/visits/revenue/cost. |
| `inspectElevator(shaftId)` | Separate car ID, position/direction/phase, passenger count/capacity8, service range and every served floor queue including zeros. |
| `inspectOccupant(id)` | Worker/customer, goal, real travel/inside/exit/stranded state and current trip measures. |
| `getTransportationReport(scope)` | Current unique waiting/denials and labeled live/last-morning/previous-day quality, waits, peak queues, completed/abandoned/stranded counts and samples. |
| `getFinanceReport()` | Cash, recent 24-hour income/expense/net, operating result, pending accrual, prior-day result and explicit archived reconciliation summary. |
| `getProgression()` | Each exact target/current value/unmet reason and permanent attained level. |
| `getPlacementPreview(proposal)` | Logical footprints, full cost/settlement, validity and specific blocking entities/reasons. |

Views are immutable copies or scoped read-only records, never mutable references exposed to UI handlers. Small projections update by revision/event or an initial maximum 10 Hz for text panels; immediate command feedback/pause/access changes still meet p95 150 ms. Domain state/metrics continue every tick irrespective of panel cadence.

## DOM UI and usable flows

Reports and inspectors live in a dismissible tab panel, hidden initially. Build tools remain visible; floor tools reveal their existing span controls, and existing elevator service-range controls remain in Connections. Office, restaurant, stair and elevator placement uses a Canvas click for the initial preview and an on-object confirmation to commit. Drag the preview or its Move handle before confirming; arrow keys on Move adjust by one logical cell or floor. Dragging retains the grab offset and dimensions. Elevator previews include a top-floor input; moving the shaft preserves its configured height. No room coordinate or size fields are required. Cancel, Escape and tool switches discard a pending placement. Modified drags and drags outside the pending footprint pan the camera without proposing objects; camera pan/zoom/resize preserve the pending logical footprint. Inspecting a built object reveals its details tab.

Provide semantic buttons and labeled controls for build tools, time, Save/Load/New Game, selection inspector, financial/progression/transport panels. Show keyboard focus, support Escape to cancel construction and named keyboard shortcuts, use readable text for access/errors/cash warnings, and do not rely on color alone for queue/status information. Canvas interaction receives a concise instructions panel and inspectable textual details. Keep mobile-specific layouts/localization out of this MVP unless separately specified.

Save/load workflow states: idle, capturing/validating, saving/loading, awaiting replacement decision, success, failure. Show operation status and prevent duplicate conflicting submissions. A storage failure preserves current play; unknown saves show a useful reason before replacement. Implementation details such as heap versions or cache IDs appear only in development diagnostics, not normal player flows.

## Development diagnostics

The development-only query exposes tick/date, seed/current PRNG words, active/dormant counts, scheduled-event count, car states/loads, queue lengths, graph version/cache statistics, mean wait and denied boardings. The application/platform adds ticks processed per real second and RAF FPS. No domain system imports the debug UI or performance clock. Record browser/device evidence separately from diagnostic counters.
