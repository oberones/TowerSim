# Congestion acceptance — 2026-09-11

The automated baseline and cloned-cohort comparison pass without reduced demand or relaxed thresholds. Native-browser checkpoints remain independently tracked.

| Measure | One shaft | Two shafts |
| --- | ---: | ---: |
| Scheduled / completed | 96 / 96 | 96 / 96 |
| Mean total elevator wait, including zeros | 382.0625 ticks | 112.16666666666667 ticks |
| Peak unique simultaneous cohort queue | 69 | 37 |
| Completed cohort quality | 65.52534722 | 90.14435764 |
| Last arrival tick | 30804 | 30253 |
| Maximum individual wait | 772 | 235 |
| Maximum individual denials | 8 | 2 |

Mean wait decreases 70.64%; peak queue decreases 46.38%; quality increases 24.62 points. Both runs finish before tick 61200 (17:00). Both improved cars carry actual passengers.

The canonical fixture is a validated 07:50 DTO produced by normal construction, leasing and schedule generation: seed `00000001000000020000000300000004`, three offices of 32 workers at x24 on floors 3/4/5, supported `[0,48)` floor spans through floor 5, no stairs, shaft A x10 and optional B x14 serving 0–5. Starting funds remain 1,000,000 minor units. Fixture SHA-256: `2391e0ba7b4679f780e58a900b666418c26eaf8a54436f4409c53d14c516c736`. Rules/content identities are now `tower-restaurant-v1` / `mvp-restaurant-v1`; the saved scenario records the complete calibrated content.

The only balance change is the shared office arrival window 28800–29160 (08:00–08:06), within the allowed morning period. Departure windows, PRNG, eight-person cars, passenger exchange/movement durations, 96-tick routing proxy and quality coefficients are unchanged. The former two-hour profile failed the baseline's 600-tick wait assertion (observed maximum 72). The new profile passes; baseline boarding cutoffs at ticks 29014, 29082, 29178, 29274 and 29370 contain 3, 16, 27, 48 and 69 queued people. Live unfinished trips contribute while quality declines. These are measured traces, not dispatch estimates.

`npm run test:congestion` runs the baseline and mandatory comparison, including normal/4x/8x application pacing and segmented frames with pauses. Every replay compares canonical final state against the measured full-cohort continuation. `npm test`, `npm run test:integration` and `npm run check:release` include these tests without skip, quarantine or retry. The expected JSON files under `tests/fixtures/` freeze all membership IDs, cutoff samples and report values.

`congestion-continuous-play.test.ts` separately finishes the baseline day, builds shaft B in the same tower and checks better waits, queues and quality on the next comparable morning, retaining prior reports. New seeded daily timestamps are allowed only in this separate comparison. The exact cloned comparison owns numerical attribution.

An isolated unserved shaft test has a landing disconnected from the office-side upper hallway; it carries no one and gives no report bonus. A shaft serving only 0–1 beside existing connected hallways was experimentally useful as a transfer, so it is correctly not classified as useless. Mid-rush construction tests require real migration, retained wait/denials, unchanged workforce/RNG, reserved-boarder protection and physical new-queue admission.

See [edit timing](../performance/transport-edits.md), [baseline browser evidence](../../tests/browser/evidence/us08-congestion-baseline.md), [improvement browser evidence](../../tests/browser/evidence/us09-congestion-improvement.md), and [access recovery evidence](../../tests/browser/evidence/us10-access-recovery.md). Save/Load, restaurant admission and final release-scale/player qualification remain later phases.

Phase 14–16 note: the canonical hash was refreshed for required finance archive, restaurant-day records and the explicit rules/content version change. The expected cohort identities, request times, car usage and every numerical baseline/improvement assertion remain unchanged. Earlier measurement artifacts retain their original versions.
