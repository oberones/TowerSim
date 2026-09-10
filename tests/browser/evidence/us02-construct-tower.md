# M1: construct and render a tower — 2026-09-10

**Status:** T024–T029 implemented. T030 remains unchecked pending actual stable Chrome, Firefox and Safari qualification. Phase 5 onward is untouched.

## Identity and ordinary-control observations

Final production-mode release `dist/` at `http://127.0.0.1:4173/`, seed `cfb915892e4e674029f84e1fee5de749`, scenario `mvp-default`, rules `tower-construction-v1`, content `mvp-construction-v1`. Release JS `index-Ca7o7T9t.js` has SHA-256 `86bd8a81487da7925637c374d3888657bbaf6b151208c5906f9982060ca2c8d7`. The complete source/artifact inventory is [../../../docs/phase-3-4-artifacts.json](../../../docs/phase-3-4-artifacts.json). These are Codex In-app Browser observations, not native-browser qualification; see [us01-start.md](us01-start.md) for browser availability limits.

1. Chose Floor and committed floor 1 `[0,24)` through the labeled fields and Commit span button: cash fell from $10,000.00 to $9,976.00.
2. Built floor 2 `[0,24)`: cash $9,952.00.
3. Extended floor 1 `[24,40)`: cash $9,936.00. The inspector showed one normalized `[0,40)` span, 40 built/free cells, and an explicit inaccessible/no-stairs-or-elevator explanation.
4. Proposed floor 3 `[0,40)`: full $40.00 quote remained visible, commit was disabled, and the reason required full support on floor 2. Zoom retained the same floor, interval, price and invalid reason; cash stayed $9,936.00.
5. Chose Demolish for floor 1 `[24,40)`: the valid quote separated $0 build/demolition/accrued settlement. Commit removed the extension without refund; cash stayed $9,936.00 and the inspector returned to 24 built/free cells.
6. Proposed removing floor 1 `[0,10)`: rejected because it supports floor 2, with disabled commit and no charge. The earlier build's visual inspection also confirmed original Canvas spans and selection/preview overlays.

No state injection or fixture-only mid-play control was used. The separate fixture harness builds and passes isolation checks; no native-browser prepared-state observation is claimed.

## Automated evidence

62 unit/integration tests pass, including two upper floors and support-chain widening on a partial starting base, narrow and negative configured worlds, overlap/gap/bounds/support/protected-base rejection, exact affordability, zero/free edits at negative cash, transaction and allocation overflow rollback, once-only charges, no identity reuse, adjacent-range merge/splitting, camera-stable proposals, cancellation, stale-preview revalidation, immutable floor inspection and deterministic edited-state reconstruction/continuation. Renderer tests verify viewport-sized static-cache reuse and invalidation independently of actual pixel rendering.

Checked release/browser-test builds and architectural/comment checks pass. Construction benchmark methodology, restored-trial digests, timing samples and scope limits are in [../../../docs/performance/construction.md](../../../docs/performance/construction.md). Those headless batch timings do not establish browser FPS or p95 UI response.

## Outstanding qualification

Actual supported-browser visual/focus tests, pointer drag/pan/resize across the full world, visibility handling and device-pixel-ratio observations remain unverified. In-app numerical-field and zoom observations do not replace those gates. Facilities/people/transport occupancy guards are intentionally added when those states become possible in their later phases; this slice already protects permanent base and upper-floor support.
