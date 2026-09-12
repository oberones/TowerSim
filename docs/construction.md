# Construction slice: phases 3 and 4

Run `npm run dev`, or build with `npm run build` and serve with `npm run preview -- --host 127.0.0.1 --port 4173 --strictPort`. The site begins paused on day 1 at 06:00. Normal, fast and very fast use the same simulation at 120/480/960 ticks per real second. Hiding the document pauses it; returning requires an explicit speed selection. No hidden time is added.

Choose **Floor** (F) and click the tower for a default 24-cell preview. The information panel stays closed. Drag the preview or its **Move** handle to position it. Grab the left or right edge and drag to resize that boundary independently. Each edge also supports left/right arrow keys when focused. Boundaries retain at least one cell. Review the updated price and confirm **Place floor** on the preview; moving and resizing do not commit. Build floor 1 `[0,24)`, floor 2 `[0,24)`, then extend floor 1 `[24,40)`. The inspector shows the merged span and its inaccessible status until stairs or elevators exist in later phases.

Choose **Demolish** (D) for free removal without refunds. Removal beneath upper floors rejects. The configured initial ground base and lobby are permanent, while later ground extensions can be removed when they support nothing. Select **Inspect** (I) and click a built span for its floor, ranges, free space and per-span access explanation. Escape cancels a proposal without submitting a command. Move and boundary controls support keyboard nudges; floor demolition retains its numeric fields and drag-to-select flow.

In Inspect mode, drag to pan. Shift-drag or secondary-button drag pans while building. Scroll or use Zoom in/out; arrow keys pan the focused Canvas. Camera changes and resizing leave an existing proposal's coordinates, dimensions and quote unchanged. All drawing coordinates and cached canvases stay outside saved state. The static cache is viewport sized and redraws when geometry, viewport, DPR, pan or zoom changes.

**New Game** offers cancel or explicit discard. A replacement starts paused and discards old pacing debt. There is no persistence adapter in these phases; New Game cannot write an existing save slot. Office, restaurant, stair, elevator, save and load buttons disclose that their handlers arrive in later phases. The scenario panel shows immutable prices, demand windows and future targets from data. The Level 1 label does not imply that progression evaluation is implemented.

## Domain and state boundaries

`createGame` validates configuration and seed, allocates stable tower/base/lobby identities and creates only a pending initial review. Floor previews and commits share bounds, whole-span nonoverlap, complete direct support, affordability and overflow checks. Construction stages allocations, finance and geometry before publishing one topology revision. Rejected envelopes can consume command sequence metadata only. Free edits post no artificial zero-value transaction. Empty floor records disappear; their IDs are never reused.

The current development state uses schema 1, rules `tower-construction-v1` and content `mvp-construction-v1`. It persists immutable content/world configuration, tower/lobby/floor records, topology revision, Level 1, kernel clock/RNG/counters/events and integer transactions. Pure capture/validation/reconstruction includes these fields. Earlier unreleased kernel snapshots are explicitly rejected; no migration or native storage support is claimed. Later subsystems must extend the edit guards for their facilities, people and transport commitments.

## Verification

`npm test` runs the unit and integration suites; `npm run test:integration` runs the integration project alone. Checked builds run strict types, domain import/global checks, and `check:comments` for named production functions/methods. Small inline callbacks are documented by their owning functions or event blocks. `npm run build:browser-test` and `npm run check:browser-builds` verify the separate prepared-fixture artifact and release isolation. `npm run bench` measures restored headless workloads; see [performance/construction.md](performance/construction.md).

The available in-app browser provides supplemental construction observations. Required actual stable Chrome, Firefox and Safari C0/M1 observations remain open in the checkpoint evidence files. Phase 5 and subsequent implementation tasks are intentionally untouched.
