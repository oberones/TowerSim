# US8 baseline — partial native evidence, T092 open

2026-09-11: Firefox mounted the canonical one-shaft fixture paused at 07:50 with 96 assigned and zero present. Ordinary Normal speed and the Traffic reports panel produced a recovered paused state at 08:38: 96 present, 96 completed samples, zero abandoned/unresolved/stranded, mean wait 382.1 s, 331 denials and quality 65.53. These match the automated baseline. No demand was removed or developer state changed during play.

The three exact growing cutoff visits and the individual ≥600-tick/repeated-denial waiter were measured automatically but were not individually captured through native inspectors in this run. Chrome is unavailable, and Safari did not replay this full scenario. T092 remains unchecked.

Environment: macOS, Firefox 155.0.1 / Safari 26.6.2. Release `dist/` served at `http://127.0.0.1:4273/`; separate production-mode fixture `dist-browser-test/` at `http://127.0.0.1:4274/`. Artifact hashes are in [phase-11-13-artifacts.json](../../../docs/phase-11-13-artifacts.json). Seed for congestion: `00000001000000020000000300000004`; rules/content: `tower-transport-v1` / `mvp-transport-v1`. Fixture setup finishes before mounting; subsequent actions use ordinary controls.

Release smoke: Firefox displayed the new paused 06:00 site, $10,000, zero workers and ordinary tools (seed `0cfc8ee8df493fca8ad0bc4a6a4ac733`). Safari displayed the equivalent paused release site (seed `7e79586b50b5dd274eadf5f9514d50f4`). This confirms page loading only, not full release gameplay qualification.
