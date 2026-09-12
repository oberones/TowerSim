# Restaurants and finances (phases 14–16)

Use `npm run dev`, or build/serve the prepared browser harness:

```sh
nvm use
npm test
npm run build
npm run build:browser-test
npm run check:browser-builds
npm run preview:browser-test -- --host 127.0.0.1 --port 4174
```

The chooser includes a one-customer visit, two-room meal wave, zero-cash accrued-cost fixture, and four-worker/five-customer boarding cutoff. Preparation happens before the ordinary application mounts; release `dist/` contains no fixture modules. Refreshing the harness returns to its chooser. Native Save/Load remains phase 18.

Choose **Restaurant**, enter its floor/start cell (or click a built footprint), review the full price, and press **Place restaurant**. Select a room from the restaurant dropdown or click it to inspect. Default restaurants cost 80,000 minor units, charge 500 per physical admission and incur 6,000/day by existence. Removal is free but immediately settles its accrued cost, may leave negative cash, and sends existing customers toward the lobby without another charge. Unsupported or unaffordable construction is rejected atomically.

The first positive advance performs the initial 06:00 review. Later restaurants wait until the next daily review. All accessible restaurants share the saved finite daily allowance (default 40); stable ID order receives integer remainder shares. Default schedules concentrate at least 80% in 11:30–13:30, with seeded off-peak requests and 20–40-minute visits measured from admission. Incoming people actually walk/use stairs/elevators; no payment occurs before a valid entrance arrival. Customers physically exit after visiting. Inaccessible requests are skipped, not replayed after repair. Demolition cancels pending visits, preserves supported ongoing travel and protects stranded people until a real exit is available.

The inspector separates today's allocated/remaining requests, current incoming/inside people, today's visits, lifetime visits and earned revenue. The **Finances** disclosure separates recent cash movement, operating results excluding construction, current/previous operating days, pending accruals, and archived versus retained reconciliation. Receipts retain readable source identity after demolition or customer retirement. At zero/negative cash, inspection, time controls and free removal still work; positive-price construction requires funds.

Pure snapshots now require `tower-restaurant-v1` / `mvp-restaurant-v1`. Earlier transport-only states are explicitly rejected; missing finance/customer data is never silently invented. Schema remains 1; native save envelopes, IndexedDB and UI loading remain the later persistence phase. Movement timings, directional sweep, standard eight-person capacity and the mandatory congestion thresholds are unchanged.

Validation: all automated story, retention, replay, source-rounding and congestion tests pass; focused benchmark methodology is in [finance history](performance/finance-history.md) and [restaurant demand](performance/restaurant-demand.md). Full native C5/C6 remain open: see [financial observations](../tests/browser/evidence/us14-finances.md), [one visit](../tests/browser/evidence/us12-restaurant-visit.md) and [meal demand](../tests/browser/evidence/us13-meal-demand.md). Phase 17 progression has not started.
