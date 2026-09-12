# C5 — financial reporting (partial native evidence)

Date: 2026-09-11. Local `dist-browser-test/`, served by `npm run preview:browser-test -- --host 127.0.0.1 --port 4174`. Shared ordinary application controls, no runtime state injection. Seed `00000001000000020000000300000004`. Rules/content: `tower-restaurant-v1` / `mvp-restaurant-v1`.

Safari **26.6.2 (21624.5.1.11.3)** was inspected with native accessibility and screenshots. Browser version was read from the installed application metadata. On “One customer — restaurant visit,” the finance view showed $800 construction outflow, no revenue while incoming, then one $5 admission at 10:15. Occupied removal at 10:21 settled $10.90 accrued cost once, retained the payment, cleared pending accrual and left cash $9,194.10 through 11:18. Initial $10,000 plus retained net -$805.90 reconciled exactly.

On the final built “Finances — zero cash and accrued restaurant cost” fixture, a disclosed prepared scenario adjustment leaves zero cash at noon. Ordinary placement at x48 was rejected as unaffordable; its full $800 quote remained visible. The selected room disclosed $15 accrued operating cost. Free removal posted exactly that cost and cash became -$15. The finance panel showed readable “Restaurant #4 operating cost,” three retained transactions and no pending accrual. Normal time advanced from 12:00 to 13:33 without changing the negative balance or disabling inspection/pause. Safari was brought forward before resuming; visibility auto-pause correctly prevented background advancement.

The initial visit observation preceded a receipt-label-only presentation update; the final zero-cash observation verified the readable receipt labels. A final small presentation adjustment clears a pending construction preview after removal and says “No customers allocated to this room today” for zero allocation; behavioral evidence above remains scoped to the observed flows.

- [x] Safari scoped recent/operating distinction, payment and removal reconciliation, negative cash and usable time controls.
- [ ] Safari full vacancy/access-dependent office rent and archive-history checkpoint exercise.
- [ ] Firefox complete C5 exercise.
- [ ] Chrome complete C5 exercise (not present in the available computer-control inventory).

T113 remains unchecked. Headless finance/continuation tests are separate evidence, not substitutes for the full three-browser checkpoint.
