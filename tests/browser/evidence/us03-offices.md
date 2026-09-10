# Office lifecycle observations — 2026-09-10

**Status:** T031–T041 and T043–T046 implemented and automated checks pass. T047 remains unchecked pending the complete supported-browser office/access/finance walkthrough. T042's remaining M2 evidence is recorded separately.

## Release smoke

Actual installed **Firefox 155.0.1** on macOS opened release `dist/` at `http://127.0.0.1:4175/` (Vite selected 4175 because 4173 was occupied). The page started paused at 06:00 with $10,000 and seed `328f74e1b8c42863fa46a2da1660c021`. The Office tool gave a valid $600 quote. Clicking Place office reduced cash to $9,400, rendered the office beside the lobby and left the floor visible. Normal speed advanced the clock; Pause held it at 06:09. No simulation error appeared. This uses default content, including a 32-person workforce, but the native smoke did not inspect all workers or establish the entire workday visually. The installed version was read locally; no claim is made that it is the latest release.

A final-artifact Firefox reload repeated the paused start, valid $600 quote, active Office tool indicator and successful placement to $9,400 with unchanged 06:00 clock. Final smoke seed: `9c177366e92ff85464d8fe194f36e461`. The original lifecycle observations below remain separately scoped.

## Supplemental fixture observations

In the Codex In-app Browser at 4174, ordinary inspection showed leased versus present separately, access explanation, daily $200 rent/$40 cost, no posted rent before midnight, and next review/available market. The retained selected worker was inspected while walking and inside. On day 2 the inspector showed $150 recent rent from the initial partial day. Ordinary indoor-office demolition settled $104.55 net accrued finance, changed cash to $9,624.55, preserved the floor and started a physical exit for the same selected worker. See [M2 notes](us03-one-walker.md) for exact observation limits.

Unit/integration tests separately cover vacancy and whole-market limits, inaccessible rent suspension/resumption, missed-arrival skipping without invented attendance, negative-cash free demolition, exact midnight/demolition settlement, stranded exit repair, reference cleanup, repeated retirement and immutable queries. A validated slow pre-arrival fixture is available for repeating the browser sequence.

## Remaining evidence

Complete Chrome/Firefox/Safari visual/focus qualification, an uninterrupted normal arrival/departure observation, browser access-loss/repair and missed-arrival observation, and the full repeated browser walkthrough remain unverified. The checked tasks are implementation/headless evidence; no native storage, final performance or deployment is claimed. The final source/artifact inventory is [phase-5-artifacts.json](../../../docs/phase-5-artifacts.json). Earlier smoke observations precede the last small validation/UI refinements and are not represented as qualification of unobserved behavior.
