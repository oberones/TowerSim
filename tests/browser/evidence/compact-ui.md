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

## Floor placement and boundary arrows — 2026-09-12

Floor now uses a 24-cell default preview at the initial tower click. Selecting it keeps Tower details closed. Dragging the preview or Move preserves its width; the arrow pair beside each edge adjusts only that boundary by click, drag or keyboard. The on-floor confirmation shows the span and current price. Demolition retains its existing controls.

Node 24.20.0, `npm run check:release`: **385 tests / 127 files passed**, strict types, 24 architectural regression fixtures, descriptive comments, both production builds and release isolation passed. Eight new tests cover default size and deferred commitment, independent boundaries, moving resized spans, edge dragging at three zoom levels, preventing crossed boundaries, invalid bounds/recovery, cancellation/default reset, keyboard nudges and capture cleanup. `git diff --check` passed.

Supplemental Codex in-app browser observations on macOS:

- Development: Floor kept the information panel closed. A click created `[23,47)` on floor 1 for $24. The two edge arrows expanded it to `[22,48)` for $26. Dragging the floor moved it to `[32,58)` without changing width or cash. Dragging the right boundary added ten cells, yielding `[32,68)` for $36. Confirmation charged exactly $36, leaving $9,964.
- Development: an unsupported floor preview disabled confirmation. Escape removed its preview, confirmation and arrows without a charge.
- Checked release `dist/`: a default 24-cell preview expanded to 25 cells with the right arrow; confirmation built `[23,48)` on floor 1 and changed cash from $10,000 to $9,975. The existing Demolish controls then removed that span for $0, with cash unchanged.

No save slot was written. These observations do not qualify the separate native-browser, performance, sustained-session or new-player gates.

## Directly draggable floor edges — 2026-09-12

This supersedes the arrow-button controls described above. The floor preview now has one grabbable vertical edge on each side. Dragging an edge resizes that side while the other stays fixed; grabbing/releasing without movement has no effect. Focused edges retain keyboard nudges. The default size, whole-floor movement, validation and explicit confirmation flow are unchanged.

Supplemental in-app browser development observation: `[23,47)` on floor 1 expanded to `[19,47)` by dragging the left edge, then `[19,57)` by dragging the right edge. Dragging the middle moved the 38-cell span to `[24,62)` without changing its dimensions. Cash stayed $10,000 throughout preview edits and became $9,962 only on confirmation. Screenshots showed edge grips with no arrow buttons. No save slot was written; separate release qualification gates remain open.

Final edge-handle validation: Node 24.20.0, `npm run check:release`, **386 tests / 127 files passed**, both checked builds and release isolation passed. Floor regressions now use direct edge drags and include grabbing without movement producing no resize or charge. In the checked production build, dragging the right edge expanded `[23,47)` to `[23,57)`; cash stayed $10,000 during preview and became $9,966 only after confirmation. `git diff --check` passed.
