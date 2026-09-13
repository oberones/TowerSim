# C1 stair checkpoint — 2026-09-10

**Status:** T048–T052 implementation and automated checks pass. Native Firefox **155.0.1** and Safari **26.5** completed the observations below after the Mac was unlocked. **T053 remains unchecked: Chrome is pending at the user's explicit request.** Phase 8 remains untouched.

Observer: Codex using native mouse/keyboard, accessibility inspection and Canvas screenshots in the installed Firefox and Safari apps on macOS 26.5 (25F71). These are native product observations, not in-app or headless browser substitutes. Native content-area/DPR values were not measured; screenshots covered approximately 1490×770 Firefox and 773×770 Safari windows using existing local profiles. Console/network diagnostics were not collected in these native runs.

## Artifact and method

Prepared journeys used production-mode `dist-browser-test/` at `http://127.0.0.1:4174/`, JavaScript `index-jnNBFeFR.js`. Release construction smoke used `dist/` at `http://127.0.0.1:4173/`, JavaScript `index-kCBmuJVt.js`. Full output, fixture-source, lockfile and dirty-source identities are in [the native artifact manifest](../../../docs/phase-6-7-native-artifacts.json). The earlier [initial manifest and archive](../../../docs/phase-6-7-artifacts.json) remain historical records.

Seed `00000001000000020000000300000004`; rules `tower-transport-v1`, content `mvp-transport-v1`, state version 1. Fixtures use one worker and unchanged production stair timings. Starting states are produced by domain commands/advancement before mounting; all subsequent actions use ordinary player controls. **One worker — paused on stairs** starts at day 1 09:15; **paused descending stairs** starts at 17:10. Exact fixture generation is archived. UI clock readings below are minutes, not exact simulation ticks.

## Native observations in both browsers

1. Selected the paused climbing worker and stair on Canvas. The inspector retained `occupant:8`, `takingStairs`, goal `facility:5`, 210 seconds walking and zero completed stair seconds. The screenshot placed the worker at the lower landing. Ordinary occupied removal rejected with “A person is using these stairs. Wait for them to reach the landing.” The stair, worker and paused clock stayed unchanged.
2. Resumed Normal. Screenshots showed the worker walking on floor 1, with 30 seconds of stair travel recorded. By paused 09:28, the same selected worker was `insideFacility`, visit admitted. Removed the now-empty stair: cash stayed $9,302, confirming free removal without refund.
3. Inspected the upper office. It stayed leased, Assigned 1 / Present 1, with the explicit cause “No stairs or elevator connection to the lobby. Rent suspended.” Advanced to after departure using ordinary 8×/Pause. The same worker became `stranded`, goal exit; the office became Present 0. Observed times were 23:23 in Firefox and 19:34 in Safari.
4. Rebuilt stairs at lower floor 0, cell 10 using **Stairs → Build connection**. The $50 charge changed cash to $9,252. The access cause cleared and the same stranded worker resumed walking toward the exit. Subsequent Normal/paused observations showed `outside`, goal none, visit departed: 23:46 in Firefox and 19:54 in Safari. No fixture reload or state injection occurred during this removal/repair journey.
5. Separately loaded the descending fixture. Canvas and person inspection showed `takingStairs` at the upper landing, goal exit, 630 seconds walking and zero completed stair seconds. Normal resumed the real leg: screenshots showed the worker walking on ground toward the lobby, with 30 stair seconds. The same worker later became outside/departed (Firefox 17:27; Safari 17:21).

These are sampled native screenshots and inspector transitions, not an uninterrupted video of every frame of the 30-tick stair animation. Direction, distinct landings, positive travel time, pause, admission and repaired departure were observed.

## Release smoke and automated checks

In each native browser, the ordinary fresh release site built 48 upper-floor cells ($48), an upper office ($600) and stairs ($50). The upper office changed from inaccessible to accessible, and cash reached $9,302. The same release sessions then built/inspected an elevator and exercised Normal/Pause; see [M3 evidence](us05-one-elevator-rider.md) for seeds and outcomes.

The final suite passes **168 tests in 59 files**, including 12 observation-fixture regressions covering stair ascent/descent/inside boundaries and all nine elevator phases. Existing stair tests cover landing reservations, atomic prices/failures, bidirectional nonzero traversal, attendance, no double movement, occupied removal, stranded exits, repair and capture/rebuild. Type checks, domain boundaries, descriptive function comments, both production builds and build isolation pass. Commands are in [the browser README](../README.md).

Chrome C1 observations remain unverified. No storage, sustained browser performance or new-player qualification is implied.
