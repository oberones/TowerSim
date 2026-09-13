# Navigation and elevator contracts

## Route request and response

`findRoute(context, request)` accepts occupant/trip ID, actual logical origin, destination/exit anchor, current tick, topology version, committed segment where applicable, and immutable trip mode preference. It returns semantic legs plus generalized cost, or `unreachable` with a cause identifying missing constructed span, stairs, landing or served range. It does not move a person or mutate a queue. The caller commits a selected route/approaching assignment in stable order before processing the next traveler.

Mode selection precedes cost: connected same-floor walking; shortest walking approach to a usable first stair/elevator entrance for a one-/two-floor origin-to-goal trip, with total generalized cost and stable ties resolving equal approaches; an elevator-containing route for a longer trip when viable; otherwise an available alternative. It is based on the journey's origin/goal, not recalculated after every passing floor to force premature alighting. A return/abandoned-exit journey gets its own origin and preference. Queue length cannot make a still-reachable facility inaccessible or cause stairs fallback by itself.

Generalized costs use nonnegative integer half-tick units (two cost units per simulated tick). A walk edge costs `abs(deltaX2) * walkingTicksPerCell`, so subdividing a hallway cannot add rounding cost. Stair, estimated wait, ride and transfer durations in ticks convert by multiplying by two. The complete straight physical walk leg rounds to whole ticks only once. A board edge uses a documented load estimate such as:

`ceil(nominalCycle / 2) + floor((eligibleQueuedAhead + approachingAssignedAhead) / capacity) * nominalCycle`

This estimate is in ticks and converts to cost units before comparison.

Use the current person's actual predecessors for staying in a queue and all current eligible predecessors for a new queue. Provisional nominal cycle is 96 ticks and transfer penalty 30. This is a generalized-cost proxy, not a dispatch forecast or a transportation-quality score. At a route decision, freeze the load view for that request; update approach reservations before the next decision. Ties use fewer transfers, then service/entity ordinal, then semantic edge ID.

Graph board → directed ride nodes → alight separates service usage from physical car control. Consecutive straight same-floor walk edges collapse before duration rounding, preserving travel time under graph subdivision. Consecutive ride edges in a shaft collapse into a boarding/unload commitment; intermediate graph floors do not force stops. Search remains capable of walking/stairs/elevator combinations through ordinary shared hallway connections. Do not introduce dedicated transfer-floor or sky-lobby features.

## Topology and cache lifecycle

Build nodes in canonical `(floor,x2,kind,ownerOrdinal)` order and edges in canonical semantic order. Hallway edges connect only within a constructed span; touching normalized ranges connect automatically. Reservations for rooms/shafts do not obstruct the implicit path.

An accepted topology edit increments `topologyVersion` and performs one complete graph/access rebuild. Cached static walk/stair paths/connectivity include version, source/goal and mode; initial LRU bound 4,096. Queue-sensitive complete route choices are not reusable cached winners. Cache misses or evictions may change runtime cost, never route availability or tie results. Do not precompute all stop pairs; adjacent directed ride edges keep transport topology linear in stops.

Rebuild runtime active/approach indices from committed routes. Existing walking/stair legs retain endpoints and elapsed/duration ticks if physically supported. Loaded riders retain valid unload commitments. Clear invalid future route suffixes immediately and retain only valid current segments plus explicit pending-replan goals; replan at safe endpoints. Deleted destinations become exit goals, not invalid live references. On load, rebuilding preserves the saved version and choices; it is not a construction event.

**Added capacity:** after a topology change, reevaluate affected waiting passengers in `(currentQueueAdmissionSequence, occupantOrdinal)` order. Switch only if an alternative elevator route beats staying by more than a configured 10 ticks (20 cost units). Remove old membership, retain history, physically walk to the new stop, and join its FIFO with a new global admission sequence. Update approach reservations immediately. Do not reroute selected/in-transfer boarders; they finish their committed safe transfer. No periodic queue scanning/rerouting is required.

If full rebuild/access plus route reconciliation fails the p95 150 ms edit budget, profile the exact cost before implementing incremental floor subgraphs, grouped shared destination searches, or time-sliced candidate work. A partially updated topology must never be published as usable.

## Elevator request boundary

`requestElevator(occupantId, tripId, boardingStopId, unloadStopId)` validates co-service reachability, differing valid floor directions, physical presence at boarding anchor, and absence of another queue/car membership. It creates one persistent queue entry/request with joined tick and a globally allocated admission sequence. Repeating the same active request is idempotent; conflicting membership rejects. Approaching travelers reserve estimated load in a derived index but do not call a car until physically at the stop.

`cancelElevatorRequest(entryId, reason)` removes membership and its hall-call contribution, settles elapsed waiting into the trip, and preserves denials. It cannot delete an in-progress physical boarding transfer without the domain's safe cancellation transition. Hall requests remain while at least one matching queued traveler exists; onboard destination requests remain until unloading.

One car belongs to one shaft/service in MVP. Separate identifiers and request records are kept for later multi-car/group dispatch designs; there is no group assignment algorithm now.

## DispatchPolicy boundary

Input is a read-only car view, valid stops/range, onboard unload floors, nonempty up/down queues, current phase and tick. Output is `idle | serveHere(direction) | moveToward(stopId,direction)`. The controller applies results only at legal stopped/floor-crossing decision points. The policy cannot mutate money, passenger locations or queue metrics.

The only shipped implementation is the fixed collective sweep:

1. Continue in the current direction through outstanding requests ahead, serving onboard destinations and compatible hall calls in floor order.
2. Opposite-direction calls ahead count when determining the farthest reversal floor. Reverse there before taking its now-compatible passengers. Never reverse between floors or against an onboard destination.
3. If requests remain behind and none ahead, reverse at the current valid landing. Skip floors without relevant calls/destinations.
4. If idle and empty, choose nearest requested pickup; ties choose lower floor. When both directions wait there, choose the earliest global queue admission ordinal.
5. If all requests disappear during empty repositioning, finish the committed adjacent segment at a valid stop and idle; no fabricated trips or expenses stop.
6. Full cars still stop for compatible hall calls, giving the required eligible passengers one denial for that visit. Do not import a full-load bypass rule from a real-world controller.

## Passenger service boundary

After leveling, on transition into opening allocate one `serviceVisitId`; doors open; unloading occurs before boarding. Capture an immutable ordered unloading cohort and advance a separate cursor; removing someone from onboard membership cannot shift that cursor. Every completed unload takes one simulated second and moves the person to the stop anchor. After all unloads and this boundary's queue arrivals, record the eligible boarding cutoff. Empty unloading/boarding phases can skip immediately; doors and dwell cannot.

Select the first free-capacity eligible entries in queue order; persist immutable visit-local cohort records and transfer cursor. Processed entry IDs are historical after queue removal; pending selected records must match live queue reservations. Remaining eligible passengers receive exactly one capacity denial for this service visit and stay queued. Entries arriving after cutoff, passengers for the opposite direction, and unserved destinations receive no denial for this visit. One person boards per tick; reserved boarders remain logically in the queue until transfer completion, then queue removal and car membership update atomically. A canceled selected goal releases its reservation safely; it does not expand the cutoff to later arrivals.

Queues, capacity and physical boarding never consult sprite distance or animation state. One person occupies one slot whether worker/customer. No car load exceeds eight, including a partially completed exchange. Pausing freezes all phases and measures; save/load retains cutoff IDs, cursor, reservations and denial identity.

## Transport acceptance obligations

- Walk/stair/elevator movement takes positive time and is independent of pixels/FPS.
- Service-order fixture: upward floor 1 car, destination 3, up pickup at 2 to 3, down pickup at 5 to 0 → serve 2,3, pass 4, reverse/service 5, then deliver downward.
- Idle floor 2 with calls 0/4 chooses 0; nearer floor 3 beats floor 0.
- Nine eligible people at an empty car → eight admitted and one retained/denied; mixed types consume equal slots.
- Queue migration preserves cumulative wait/denials while respecting the new queue's local order and actual walking.
- Congestion comparison uses the same pre-rush state, seed, scheduled cohort, eight-person cars, score formula and reporting period. Additional shafts carry real people. Both runs finish the full cohort before departures; mean wait and peak unique queue fall ≥30%, quality rises ≥10 points, and baseline has the specified sustained growth/10-minute wait/repeated denial.
- Save/restore and topology edits during walking, waiting, riding and service exchange preserve all invariants. Report unachieved runtime evidence honestly.
