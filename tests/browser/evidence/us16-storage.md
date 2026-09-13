# US16 — native local storage

Status: **partial native qualification; T143 remains open**.

The initial observations below occurred on 2026-09-12 at `http://127.0.0.1:4174/` using the separate production-mode prepared artifact. They are not release-`dist/` qualification. Browser versions came from installed application metadata: Firefox 155.0.1 (15526.9.3), Safari 26.6.2 (21624.5.1.11.3). Chrome was absent from the enabled browser/app inventory. The host reports macOS 26.6.2 (25G83); CPU/RAM metadata was unavailable through the sandbox, so no hardware-class qualification is claimed.

## Firefox

Using ordinary Save after the prepared Level 2 observation committed tick **173446**. Play continued during the write, and the UI correctly reported that newer progress was unsaved. Pausing later showed day 3 00:25. Load first displayed a replacement choice naming tick 173446. Cancel preserved the later paused tower and showed cancellation feedback.

After page refresh, the **native aborted replacement** fixture mounted a moving-car state with a test-only repository. Its `put` succeeded at the request level and the actual browser transaction was then explicitly aborted. Save displayed failure. Load still offered tick 173446; accepting restored day 3 00:10, Level 2, cash 355396 minor units, 96 workers, Paused and Saved. The old slot survived the aborted replacement. This exercised native rollback and refresh retention; it did not force quota exhaustion or a blocked upgrade. Observed prepared asset: `index-ZEKmPOFg.js`.

## Safari reference tower

The **storage reference** was constructed through ordinary domain commands with disclosed finite scenario overrides: 13 floors, 24 offices, two restaurants, 12 stairs, three eight-person shafts, 1920 workers plus 80 scheduled customers, and at least 500 active travelers/waiters at tick **29160**. The automated reference fixture validates every boundary and the envelope.

Safari displayed day 1 08:06, 1920 workers, zero indoor workers and cash 2429800 minor units. Ordinary Save acknowledged tick 29160 and changed Unsaved to Saved. The harness-only action-to-visible-completion observer measured **913.0 ms**, including capture, validation, native commit and feedback. Ordinary Load of that unchanged clean session measured **919.0 ms** and displayed `Loaded tick 29160, paused. Resume when ready.` The same clock, cash, worker count and paused state remained. No confirmation delay was present in this measurement. Observed prepared asset: `index-bJxNVeT-.js`.

These individual prepared-build timings are under two seconds. They are scoped observations, not a final performance distribution or three-browser release qualification. Automated tests were also running on the machine; final hardware-controlled performance measurements belong to phase 19.

## Resumed verification after manual unlock — 2026-09-12

The user unlocked the Mac and native control resumed. Both final JavaScript artifacts matched the recorded SHA-256 values in `docs/phase-17-18-artifacts.json`. The release was served at the same origin/profile (`127.0.0.1:4174`), using `index-BfjvqIWd.js`; the subsequent prepared exercises used final `index-BtadBaHm.js`.

- **Safari release handoff and reopen:** refresh into release, Load, and accept restored reference tick **29160**, day 1 08:06, 1920 workers, cash 2429800 minor units, Paused/Saved. Resume advanced the clock to 08:08; switching away paused the session. Closing only the test tab, opening a new tab at the same origin and loading again restored tick 29160 without offline advancement.
- **Firefox release handoff and reopen:** refresh into release restored milestone tick **173446**, day 3 00:10, Level 2, original award tick **172800**, cash 355396 minor units and 96 workers. Closing/reopening the test tab and loading again retained the same saved tick and paused state.
- **Firefox final prepared reference:** ordinary Save committed tick **29160** in **1130.0 ms**; clean Load returned paused at that tick in **1173.0 ms**, with 1920 workers and cash 2429800. These are individual end-to-end observations, not distributions.
- **Safari final prepared rollback:** deliberately aborting the replacement after request success produced readable failure (15.0 ms). Load still offered reference tick **29160** and restored it, paused with the original cash/workforce; measured Load was **977.0 ms**, excluding the user's confirmation wait. No quota exhaustion or upgrade block was forced.
- **Final release recheck:** after the prepared exercises, both browsers refreshed back into release and loaded reference tick 29160. Firefox resumed at 8× to 08:10 and paused; Safari remained paused at 08:06. This observes short active continuation, not a full next-day trace or frame-rate qualification.

Chrome remained absent from the enabled app/browser inventory. The initial lock is resolved; the incomplete gates below are not attributed to a continuing lock. No production source changes were needed during resumed verification.

## Remaining native gates

- [x] Safari and Firefox same-origin release handoff, refresh and test-tab close/reopen (scoped states above).
- [ ] Chrome same-origin release handoff, refresh and close/reopen.
- [x] Firefox reference-tower Save/Load timings and Safari native aborted replacement.
- [ ] Chrome native workflows and timings.
- [ ] Native unavailable/quota/blocked-upgrade cases where feasible; Node mocks do not qualify them.
- [x] Short active traffic continuation after release restoration in Safari and Firefox.
- [ ] Full next-day native story trace.

The initial run ended when the Mac locked. Manual unlock enabled the resumed checks above. No storage was erased to bypass that initial block.

Run `npm run build`, `npm run build:browser-test`, and `npm run check:browser-builds`. Serve the prepared artifact, save the reference, stop that server, and serve release `dist/` at the **exact same host/port/profile**. Load through the ordinary release UI. Do not change ports and assume the slot follows. For rollback, first commit a valid ordinary save, refresh to the chooser, select the native aborted replacement exercise, press Save, then Load and verify the previous tick. The abort adapter and timing observer are test-only and excluded from release.
