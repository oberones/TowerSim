# Phase 19 UI observations — 2026-09-12

T145 implementation is complete. Full native story/release checkpoints remain open. The checked application provides a seven-step affordable starter guide, shortcuts routed through ordinary tool buttons, shared Escape cancellation, protected native form/dialog keys, visible focus and management links, a keyboard office selector, text validity/access/capacity indicators and native Save/Load controls. Development diagnostics have no emitted production code.

## Ordinary release journey (supplemental in-app browser)

Seed `dee17c8756e500be34d1c5ce02a86173`; initial release `index-8MN6gX9X.js` at `http://127.0.0.1:4190/`, followed by the same-origin local saved continuation. This initial observation predates the measured owned-runner optimization; it is not substituted for final native performance evidence.

Using only ordinary controls, constructed floors 1–5 over `[0,96)`, elevator A x10 serving 0–5, stairs x80 0–1 and x84 1–2, offices x24 on floors 3/4/5, restaurant x24 floor 1. Started time at 8×; all 96 workers physically arrived. Day-1 completed cohort: mean wait 376.6 ticks, quality 65.71, peak unique queue 62, 333 denials, no abandoned/unresolved/stranded members. Added shaft B at x14 through ordinary controls. Saved while restaurant customers walked at tick 42669.

Continued to the full qualifying day and observed Level 2 awarded at tick 172800: 3 accessible leased offices, 96 workers/arrivals, 40 restaurant visits, operating net 56000 minor units, daily quality 93.48213848039215 and no stranded/unresolved prior-day trips. Day-3 morning showed 119.6 mean wait, peak 37, quality 89.60 and 68 denials. This is a continuing-tower comparison with subsequent schedules, not the identical-cohort controlled acceptance fixture.

Saved again at tick 226294, dismissed New Game with Escape, refreshed, validated the saved candidate and explicitly confirmed replacement. Restored paused at day 3 14:51, cash 344232 minor units, the original seed and permanent Level 2 award. No console errors were reported. Office Escape disabled its commit action; the load dialog retained its own replacement/cancellation behavior. Later server-unavailable save/load is recorded in static-offline.md.

## Native browser observations

Firefox 155.0.1 (build 15526.9.3) and Safari 26.6.2 (21624.5.1.11.3), versions read from installed application metadata. Initial port 4190 is reserved by Firefox, so native observations use ordinary static release port 4177. No browser security setting was changed.

Safari seed `d41800cbe33db6490d640ba8545e5b45`: release guidance/control load; Floor 1 `[0,24)` builds once for 2400 minor units; inspector states inaccessible and gives a connection remedy; overlapping quote rejects. Office Escape returns to inspection. Opening New Game from Floor mode and pressing Escape preserves Floor mode and restores focus to New Game. These are scoped UI observations, not a full native management session.

Firefox final-release smoke seed `9ec24b4bebb2ef6e02b2910750954ba5`: reload, Floor 1 build for 2400 minor units, Office Escape, Traffic link reveals `No trips yet`, native Save acknowledges tick 21600. Normal advances the session; Load validates, requests explicit replacement, then restores the same seed/cash/floor paused at tick 21600. Final artifact revalidation is recorded in `docs/phase-19-artifacts.json`.

Chrome is absent from the enabled inventory. Full three-browser ordinary journeys, all changed focus/pointer sequences, and the sustained/performance sessions remain unqualified. The implementer is not one of the five new-player participants.

Final-artifact Firefox smoke: refreshed `http://127.0.0.1:4177/` after the final checked build (`assets/index-ikaD4deS.js`), loaded the existing 24-cell floor save after the ordinary confirmation, and verified seed `9ec24b4bebb2ef6e02b2910750954ba5`, cash 997600 minor units and tick 21600 paused. Normal play advanced to 06:38 and paused correctly. This has no workforce and does not replace the earlier ordinary journey or full native qualification. Exact final source/output hashes are in `docs/phase-19-artifacts.json`.
