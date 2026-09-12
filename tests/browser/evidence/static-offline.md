# Static root/subdirectory and server-unavailable observations

T147/SC-014 remain **open** for complete disconnected Chrome/Firefox/Safari release qualification.

2026-09-12 supplemental in-app checks: the actual `dist/` contents were copied unchanged to `/private/tmp/towersim-static/` and `/private/tmp/towersim-static/towersim/`, then served by Python's static HTTP server at port 4180. `/towersim/` loaded relative JS/CSS successfully, built Floor 1 for 2400 minor units, and saved tick 21600. Loading that save from `/` on the same origin demonstrates the origin-scoped slot. No backend route or external gameplay service was used.

Separately, the preview server on port 4190 was stopped after the ordinary mixed release tower and resources had loaded. The already-open game advanced from day 3 14:51 to 15:42, saved tick 229363 and loaded it paused with Level 2 intact. This proves core play and local storage with the game server unavailable. It is **not** an OS/network disconnection test and does not promise offline resource refresh; internet connectivity was not disabled.

Native Safari/Firefox release smoke used port 4177 because Firefox reserves port 4190. The full root/subdirectory, disconnection, active traffic, save/load and reopen procedure remains required in all three browsers against the final release hashes.

The root load confirmation completed: seed `7d574ee9704b8012ea50c5667af85d2b`, saved tick 21600 and cash 997600 minor units restored paused, matching the subdirectory save after a 24-cell floor purchase. This static copy predates the final pacing change and is supplemental to the final artifact audit.
