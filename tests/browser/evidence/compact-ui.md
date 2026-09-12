# Compact UI follow-up — 2026-09-12

Scope: optional reports/inspectors in a dismissible tab panel; pointer placement with confirmation on office/restaurant rooms. Existing simulation rules, content footprints, floor span sizing and elevator service-range operations are retained.

## Automated checks

Node 24.20.0, `npm run check:release`: **368 tests / 124 files passed**, strict types, domain boundaries (24 regression fixtures), descriptive function comments, release build, prepared-browser build and release isolation passed. `git diff --check` passed.

Eight focused regression tests cover pointer-down world anchors through camera movement, drag/modified/canceled gestures, listener disposal, explicit confirmation, cancellation and tool changes, stale validation, one visible report tab, retained tab selection, keyboard tab navigation and dismissal focus. Existing construction/domain tests remain in the full suite.

## In-app browser observations

Supplemental Codex in-app browser observations on macOS; these do not qualify the named Chrome/Firefox/Safari, sustained-session, performance or new-player gates.

Development server at `http://127.0.0.1:4183/`:

- Initial layout has the build palette and compact header; starter instructions and report panel are closed. Room coordinate fields are absent.
- Office click displays an on-room $600 confirmation without spending; confirmation changes cash from $10,000 to $9,400. Restaurant confirmation subsequently changes it to $8,600.
- Inspecting the built office reveals its selected room, tenancy/access and workforce data in the office tab. The Finances tab shows both matching construction transactions; closing details restores the clear tower view.
- Floor drag updates its span and quote. An out-of-bounds start is rejected; correcting the start to 0 and committing `[0,31)` on floor 1 charges $31.
- Office preview on the new floor cancels with Escape and leaves cash at $9,969. Dragging to pan with Office selected creates no room confirmation or charge.
- End selects the final report tab; Escape dismisses it and returns focus to Tower details.

After the final checked build, the development server was stopped and release `dist/` was served on the same port:

- Reload shows the compact default layout without development diagnostics.
- Restaurant preview displays $800 and leaves cash at $10,000; confirmation changes cash to $9,200 and dismisses the room confirmation.
- Finances shows the single $800 restaurant construction transaction and matching cash. Close details hides the entire report panel.

No save slot was written during these observations. Existing release qualification blockers and historical checkpoint evidence are unchanged.

## Movable placement follow-up

The shared confirmation now covers offices, restaurants, stairs and elevators. Initial proposals are anchored to the first tower click. Dragging the footprint or its Move handle retains the grab offset and dimensions; arrow keys on Move adjust one cell/floor. Elevator top-floor editing remains in the on-object confirmation, and existing service-range editing remains in Connections.

Final automated validation: Node 24.20.0, `npm run check:release`, **377 tests / 126 files passed**, both checked builds and release isolation passed. Nine additional tests cover dragging at multiple zoom levels, handle/keyboard movement, cancellation/capture cleanup, all four object types committing only their moved position through actual domain validation, elevator height preservation and incomplete input, and collision rejection/recovery.

Supplemental in-app browser observations:

- Development: an office initially at cell 25 dragged to 35 and nudged left to 34; cash stayed $10,000 until confirmation, then became $9,400.
- Development: constructed `[0,96)` on floors 1–3; an elevator initially at cell 10 moved to 14, with no charge during movement. Changing its top floor from 3 to 2 updated the price to $2,150. Confirmation changed cash from $9,712 to $7,562. Inspecting it showed the completed 0–2 service range and retained service-edit controls.
- Checked release `dist/`: a restaurant initially at cell 53 dragged to 43. Cash stayed $10,000 during movement and became $9,200 only after confirmation.

These observations do not close the existing native-browser, performance, sustained-session or player-evaluation gates. No save slot was written.
