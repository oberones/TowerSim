# C6 — one restaurant customer (partial native evidence)

Date: 2026-09-11; Safari 26.6.2 (21624.5.1.11.3); local `dist-browser-test/` at `http://127.0.0.1:4174/`; “One customer — restaurant visit”; seed `00000001000000020000000300000004`. The harness supplied the validated bounded start state before mounting; all observed subsequent operations used normal controls.

At 09:58 the selected restaurant showed expected 1, remaining 1, incoming 0, inside 0, visits 0, revenue $0. At 10:04 and 10:12, incoming was 1 and inside/visits/revenue remained zero. A screenshot showed the customer walking along the ground hallway toward the labeled restaurant. At 10:21, incoming was 0, inside 1, visits 1 and revenue $5; the financial receipt timestamp was 10:15, the real entrance arrival. The published nonzero 20–40-minute admission-relative duration was visible.

The occupied room was removed at 10:21. It disappeared while its customer appeared at the surviving entrance and physically walked toward the lobby. At 11:18, the customer marker had exited, cash remained $9,194.10 and the original single $5 receipt remained; no second payment appeared. See [finance evidence](us14-finances.md).

- [x] Safari incoming/inside distinction, actual travel/admission, once-only payment and safe early forced exit.
- [ ] Safari natural unforced visit-end observation, ordinary restaurant construction for this one-person case, mixed-nine queue and customer-inspector completion.
- [ ] Firefox complete one-person, demolition and mixed-nine/customer-inspector exercise.
- [ ] Chrome complete exercise; unavailable in current computer-control inventory.

T120 remains unchecked. The headless mixed-four-worker/five-customer test does prove eight equal slots and one ninth-person denial, but is not native browser evidence. Snapshot/continuation and natural full-duration visits pass automated tests.
