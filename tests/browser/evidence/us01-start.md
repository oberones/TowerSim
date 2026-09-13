# C0: start a new tower — 2026-09-10

**Status:** T016–T022 implemented. T023 remains unchecked pending actual stable Chrome, Firefox and Safari observations. In-app observations are supplemental and do not qualify that matrix.

## Identity

Final production-mode release `dist/`, served on `http://127.0.0.1:4173/`. Rules `tower-construction-v1`; content `mvp-construction-v1`; scenario `mvp-default`. Exact source file hashes, dirty commit identity and release/harness artifact hashes are in [../../../docs/phase-3-4-artifacts.json](../../../docs/phase-3-4-artifacts.json). Release JS: `index-Ca7o7T9t.js`, SHA-256 `86bd8a81487da7925637c374d3888657bbaf6b151208c5906f9982060ca2c8d7`.

Codex In-app Browser was the available automated browser. Its engine/version was not exposed by the available observation interface; do not label it Chrome, Safari or Firefox. Host metadata is retained with the headless benchmark report. A direct attempt to access installed Firefox through the native CUA app interface failed with `timeoutReached`; no Firefox observation occurred. Chrome and Safari were absent from the available browser inventory. No browser was installed or substituted.

## Observed on final release

- A fresh paused site displayed day 1 06:00, Level 1, $10,000.00, permanent lobby/base, seed, named tools and clearly disabled later features.
- Seed `d993ba2a62e8027117dbae94716cdb4d`: Normal 1×, Fast 4× and Very fast 8× selected states were visible; time progressed through 06:09 and 07:03. Pause retained day 1 08:25.
- New Game displayed explicit Cancel and Discard & start controls with visible focus. Cancel preserved the paused time, funds and seed. Discard reset to day 1 06:00, paused, $10,000.00, and seed `cfb915892e4e674029f84e1fee5de749`.
- Camera zoom/reset and the site/lobby were inspected visually. Exact rates, hidden-tab behavior, DPR/resize inversion and frame-debt semantics are automated evidence below, not native-browser timing qualification.

An early in-app run exposed a stale RAF timestamp predating a newer control event, stopping the loop. The delivery-time monotonic-clock fix has a regression test; subsequent builds advanced visibly, including the final artifact above. The original error is tied to obsolete `index-CgSPO5uu.js`, not the final artifact.

## Automated evidence and open gates

62 tests across 23 unit/integration files pass; the separate integration command passes 21 tests. Strict types, 21 domain-boundary fixtures, comments for 166 named production functions/methods, both checked production builds and graph/output isolation pass. Tests include initial pending review, configurable negative-ground/narrow sites, immutable content/query views, current-state round trips, 120/480/960 ticks per second, fractional/whole debt, bounded foreground batches, pause/visibility/explicit resume, no hidden catch-up, cancel/discard, one runner per mount, stale callbacks and invalid prepared-state rejection.

Actual three-browser visual, focus, speed/visibility and replacement checks remain open. Save/Load, complete tool behavior, people, operating finance, progression and storage acceptance belong to later phases. No deployment or release qualification is claimed.
