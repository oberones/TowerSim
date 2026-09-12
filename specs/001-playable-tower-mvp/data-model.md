# Data Model: TowerSim MVP

This is a design contract, not production source. Names describe planned TypeScript records. All persistent values are JSON-compatible; unions use an explicit `kind` discriminator. [Simulation ordering](contracts/simulation.md), [transport rules](contracts/navigation-transport.md), and [save validation](contracts/persistence.md) are normative companions.

## Common value rules

- `Tick`, counters, IDs, floor/cell coordinates, duration and currency are safe integers. Ticks and counters are nonnegative; floors may be negative in future validated scenarios. All additions/multiplications are checked before state changes.
- Entity IDs are immutable strings with a kind prefix and a monotonically allocated numeric ordinal. Numeric ordinal ordering breaks ties; do not depend on object enumeration or lexical `id:10` before `id:2`. IDs never encode width, coordinates, or array indices.
- `MoneyMinor` is a signed safe integer in the scenario's smallest currency unit. Use temporary integer/BigInt arithmetic for exact products/division when required, then range-check before converting to persisted numbers. BigInt itself is not serialized.
- `Direction` is `up | down`; only an idle empty car has null direction; stopped service phases retain the sweep direction, and ServiceVisit records its boarding direction. Floor ranges are inclusive; horizontal constructed/reservation intervals are half-open.
- Content IDs, ruleset ID, save schema version, and PRNG algorithm ID are distinct compatibility boundaries. Persist the immutable scenario/content snapshot used by a game, and reject unsupported behavior/capability versions.
- `null` represents an explicitly absent field; do not rely on dropped `undefined`, NaN, Infinity, class prototypes, Maps, Sets, functions, dates or platform handles.

## GameState

| Field | Persistent meaning |
| --- | --- |
| `stateVersion`, `rulesetId`, `contentVersion` | Public state/rules/content compatibility identifiers; initial supported set is v1. |
| `scenario` | Immutable WorldConfig and content/schedule/progression/metric definitions required by this game. |
| `clock` | GameClock at a fully committed simulation boundary. |
| `rng` | Original 128-bit displayed seed, algorithm ID, four current uint32 words. |
| `ids` | Next ordinals for entities, events, trips, transactions, car service visits, global queue admissions, and event insertion order. |
| `lastCommandSequence` | Last consumed external domain-command ordinal; stale/duplicate submissions cannot execute again. |
| `tower` | Tower, Floors, constructed ranges and permanent entrance identity. |
| `facilities` | Facility records and office/restaurant operating state, keyed by stable ID. |
| `occupants` | Current worker/customer records and their authoritative state/location. |
| `transportation` | Separate stairs, shafts, service stops, cars, queues and pending request records. |
| `navigation` | Persistent `topologyVersion` only; committed routes live with trips/occupants. |
| `economy` | EconomyState, accruals and bounded transaction/reporting history. |
| `demand` | Daily allocations, leases, workforce membership and schedule-generation markers. |
| `progression` | ProgressionState and current day's maintained evidence. |
| `metrics` | Active trips, retained finished samples, cohort/day summaries and bounded summary rings. |
| `scheduledEvents` | Pending ScheduledEvent records, canonically sorted for serialization; runtime heap/index are derived. |

No duplicate authoritative active-set membership, current clock string, car pixel position, UI selection, path cache or graph is stored. Counts needed for constant-time accounting may be persisted as materialized aggregates, but invariant checks must reconcile them with their authoritative members. No operation may update one side alone.

## WorldConfig

| Field | Default / validation |
| --- | --- |
| `scenarioId`, `scenarioVersion` | Stable identifiers; default `mvp-default`, version 1. |
| `widthCells` | 120 initially; positive integer, never assumed by entity IDs or algorithms. |
| `minFloor`, `maxFloor`, `groundFloor` | 0, 40, 0 initially; ordered and ground inside bounds. |
| `initialConstructedRanges` | Ground `[0,120)` in default content; adapt to configured width. |
| `entrance`, `lobbyDefinitionId` | Permanent facility/ground anchor; default lobby at x=0, width=8. |
| `startingFundsMinor` | Provisional 1,000,000; nonnegative safe integer and affordable-starter check required. |
| `tickSeconds`, `dayTicks`, `initialTick` | 1, 86,400, 21,600 (day 1, 06:00); initial review pending. |
| `officeMarketWorkers`, `restaurantDailyCustomers` | Finite nonnegative caps; initial examples 192 and 40. Qualification fixtures may override finite limits. |
| `walkingTicksPerCell`, `stairTicksPerFloor` | 30 and 30; positive integer times. Walking was raised from the provisional 1 to 30 after Phase 5 functional feedback so travelers remain observable at the published playback speeds. Half-cell movement duration rounds up once per committed leg. |
| `elevatorTiming`, `standardCarCapacity` | R07 timing data and capacity 8; immutable during play. |
| `routing`, `metrics`, `historyLimits` | Nominal wait/cycle estimates, transfer/reroute thresholds, score coefficients and fixed reporting windows. |
| `facilityDefinitions`, `scheduleProfiles`, `progressionDefinitions` | Validated immutable data; every referenced stable ID exists. |

Normal/fast/very-fast pacing defaults of 120/480/960 ticks per real second belong to application configuration and metadata, not movement calculations. Load always pauses regardless of a previous speed.

The provisional prices below make an initial five-floor congestion exercise affordable; they are planning inputs requiring balance tests. Core algorithms cannot contain them.

## Tower, Floor, ConstructedRange and reservations

**Tower:** `id`, `worldConfigId`, `floorIds`, `permanentLobbyId`, `entranceAnchor`. Floors exist as records only where ranges or reservations require them; configured bounds do not imply built floors.

**Floor:** `id`, `level`, `constructedRanges: ConstructedRange[]`. A floor may have multiple disconnected built spans. Empty floor records may be removed if no reservation/reference requires them.

**ConstructedRange:** `startX`, `endXExclusive`; integers, `0 <= start < end <= widthCells`, sorted and nonoverlapping. Adjacent ranges merge. Construction requires the entire new range to be absent at that level and, above ground, supported directly below. Partial overlap rejects the complete command rather than silently charging for a subset. Demolition may split a range but cannot remove support for facilities, landings, people or upper floors.

**Derived reservation:** `floor`, `startX`, `endXExclusive`, `ownerId`, `kind: facility | stairLanding | shaft`. Sorted per-floor arrays and ID maps support collision checks and lookup. Multi-floor reservations are derived from a source rectangle or shaft extent. The shared hallway is not a reservation and remains connected across placed footprints within each constructed range.

**Invariants:** Placement does not create missing floor; landings need existing floor; reserved transport/facility footprints cannot overlap; walking cannot cross an unbuilt gap; removing a room retains its floor and shared path. Shaft spans can reserve unbuilt levels outside their service range, but every floor in the MVP contiguous served range must have a landing.

## FacilityDefinition

Fields: `typeId`, `definitionVersion`, `displayName`, `footprint {width,height}`, `entranceOffsetX2`, `constructionCostMinor`, `operatingMinorPerDay`, `capacity`, `scheduleProfileId`, and a closed list of capabilities such as `entrance`, `officeLease`, `customerVisit`, `verticalStair`, `elevatorService`. Capability data is composed, not a base-class tree. Unknown capability/version rejects content/save loading.

| Definition | Provisional data and behavior |
| --- | --- |
| `lobby.basic` | Width 8, height 1; permanent entrance; zero recurring cost; no lease. |
| `office.small` | Width 16, height 1; 32 assigned workers; cost 60,000; rent 20,000/day; cost 4,000/day; `office.workday` profile. |
| `restaurant.small` | Width 20, height 1; cost 80,000; visit price 500; cost 6,000/day; `restaurant.lunch` profile; no seating/staffing simulation. |
| `stairs.basic` | Width 2 landing on each of two adjacent floors; cost 5,000; zero recurring cost; explicit traversal duration. |
| `elevator.standard` | Width 2 shaft, contiguous extent; base cost 200,000 plus 5,000 per reserved floor; car capacity 8; operating cost 3,000/day; one car/shaft. |
| Floor construction | 100 minor units/cell; zero recurring cost; zero-cost demolition, no refund. |

Transport definitions share placement/economic metadata but instantiate transport records, not rented rooms. Definition values are part of the frozen scenario snapshot. Performance scenarios can change workforce/demand and bounds explicitly while keeping the required eight-person standard car.

## Facility, Office state and Restaurant state

**Facility:** `id`, `typeId`, `definitionVersion`, `floor`, `x`, `width`, `height`, `createdTick`, `generation`, `entrance {floor,x2}`, and a capability-state union. Footprint is validated against the definition; no runtime display name is an identity. Accessibility is derived from topology and queried with a reason; a topology transition closes/opens the office rent-eligibility interval.

**Office state:** `tenancy: vacant | leased`; when leased, `tenantId`, `leasedAtTick`, `assignedWorkerIds`, `workforceSize`, `marketAllocation`, `leaseGeneration`. Vacancy and accessibility are independent: `leased + inaccessible` remains a lease with suspended rent, not a third mutually exclusive tenancy value. Physical presence is derived from occupants at this facility; assigned workforce is not attendance. The daily review leases entire workforces in stable facility ordinal order only if capacity is available. No negotiation, expiry, partial workforce, or rent slider.

On demolition, cancel future workforce visit events, terminate the lease, schedule its market allocation for release at the next review, settle accrual once, and send present/en-route workers toward exit under the safe-change policy. Former workers remain as occupants until physically gone, then retire; no dangling live facility reference is retained.

**Restaurant state:** `dailyAllocation {day,scheduled,unstarted,incoming,admitted}`, active `visitIds`, admitted-revenue count and schedule generation. Physical presence is derived from occupants at the facility. A customer pays exactly once at admission, with a typed visit-end event; payment and entry are one domain transition. Future demand belongs to a day/allocation generation. Removal cancels unstarted arrivals and future visit ends, retains posted revenue, and initiates real exits.

## Demand profiles and tenant/workforce lifecycle

**ScheduleProfile:** stable ID/version, eligible daily windows, distribution segments and seeded sampling rule, visit duration range where applicable. Generate integer ticks, process recipients in stable IDs, and keep generation markers so reloading cannot generate a second schedule.

- Office arrivals use the calibrated 08:00–08:06 window within the allowed 08:00–10:00 period; departures remain 17:00–19:00, both at multiple distinct times. The default and 96-worker fixture share the same calibrated profile; the UI explains the morning rush and the fixture freezes every generated time before comparison.
- Restaurant requests use a finite daily cap, initially 80% in 11:30–13:30 (never below the required 70%), with the remainder in 10:00–11:30 and 13:30–16:00 and seeded nonzero bounded visits of 20–40 simulated minutes. Allocate integer shares among accessible restaurants in stable facility order, distributing any remainder deterministically.
- The first review runs only on first time advancement from paused 06:00. A later-built office/restaurant waits for the next review. Topology edits do not regenerate schedules. Missed inaccessible worker arrivals are skipped rather than replayed after access repair.
- A worker still in the tower cannot acquire another simultaneous work visit. Keep identity and pending exit/stranding recovery; only a subsequent feasible day creates a new arrival. Customer identities may be retired after exit and required reporting aggregation.

## Occupant and OccupantState

**Occupant:** `id`, `kind: worker | customer`, `generation`, optional lease/visit provenance, `goal`, `state`, `location`, optional `tripId`, `route`, `wakeEventIds`, and daily schedule/visit identity. Historical provenance may name a deleted facility as a label, but live goals/locations cannot reference a removed entity.

| State | Authoritative location and work ownership | Transitions |
| --- | --- | --- |
| `scheduled` | Outside; future arrival event only. | Arrival → entering; cancellation → retired. |
| `entering` | Lobby entrance anchor, current trip created once. | Valid route → walking/waiting; goal invalid → exiting/finished as applicable. |
| `walking` | Walk leg endpoints, elapsed/duration ticks, segment-support spans. | Endpoint → next leg, queue or facility admission. |
| `takingStairs` | Stair ID, from/to anchors, elapsed/duration ticks. | Endpoint → next leg/reroute; occupied stair deletion rejects. |
| `waitingForElevator` | Queue ID and entry ID; one membership. | Selected boarding completion → riding; edit → rerouting/exit/stranded. |
| `ridingElevator` | Car ID and committed unload stop; car owns motion. | Unload completion → physical stop anchor and next leg/reroute. |
| `insideFacility` | Facility ID, visit/lease provenance and wake event. | Scheduled departure/visit end or demolition → exit trip. |
| `rerouting` | Surviving anchor plus pending goal/reason; a boundary transition, not a scanning loop. | Valid path → travel; impossible visit → exit attempt; no exit → stranded. |
| `exiting` | Exit goal plus an ordinary travel state/leg; no separate teleport location. | Physical lobby arrival → departed. |
| `stranded` | Surviving floor anchor and pending exit intent. | Topology restoration → rerouting toward lobby. |
| `departed` | Outside, completed exit. | Worker → scheduled for a feasible future day; transient customer/former worker → retired after aggregation. |

Represent exiting as `goal.kind = exit` attached to a movement state to avoid duplicate movement machines; inspection labels it as exiting. Completion belongs to `TripMetrics.outcome`; retirement removes transient records only after metrics/financial references are safe. An idle worker outside may remain as a dormant worker record, not a rendered person.

**Retirement boundary:** `src/simulation/occupants/retirement.ts` removes a former worker/customer only after physical lobby exit, or cancellation while still outside before entry. An ordinary leased worker is retained for future feasible workdays. Before removal, clear obsolete events/indices and all live queue/car/route/active-trip references; finish the relevant accounting and preserve required historical trip/cohort identities, processed service-visit records and financial source labels. These historical references do not require a live occupant record and must not be used to reconstruct one on load. Keep deferred office market release separate until its scheduled review. IDs remain monotonic and are never reused. Run cleanup at relevant completed lifecycle/accounting transitions, not by scanning every person each tick; active, inside, returning, stranded or unresolved people are never cleanup candidates. Retained history still obeys its configured windows/rings. Repeated days with fixed finite demand and reachable exits must not accumulate departed person records. T043/T074 own former-worker behavior; T116/T118/T124 own customer and repeated-day coverage; T136/T137 own save validation/continuation after retirement.

**Location union:** `outside`, `anchor {floor,x2}`, `walkEdge {from,to,elapsedTicks,durationTicks,support}`, `stair {stairId,...}`, `queue {queueId}`, `car {carId}`, `facility {facilityId}`. Never duplicate pixel position or both car and floor occupancy. Mid-step positions for safe-change validation are rationally derived from endpoints and tick progress.

**Sleeping:** A facility occupant has a wake event and no active movement-list membership. Pending arrivals are not processed per tick. Derived active indices contain walkers/stair users, active cars, nonempty queues and topology-affected stranded IDs. Rebuild them after load using stable ID order without changing state or RNG.

## GameClock and ScheduledEvent

**GameClock:** `tick`, `tickSeconds: 1`, `initialReviewPending`, and any last completed day marker needed for idempotency. Day number and HH:MM are derived from absolute tick; a new game starts at tick 21,600. Pause/speed/wall-clock anchor are application session state.

**ScheduledEvent:** `id`, `dueTick`, `phasePriority`, `sequence`, `kind`, `targetId`, `targetGeneration`, `payload`. Supported kinds cover day-boundary settlement/evaluation, daily lease/demand review, worker arrival, worker departure goal, customer arrival, visit end and other explicitly scheduled financial operations. Payloads are closed typed records, not opaque arbitrary functions. Exactly one phase-0 day-boundary event owns the atomic midnight settlement/report/evaluation/reset sequence and schedules the next day boundary; do not duplicate it with a separate clock-modulus handler.

All pending event IDs/sequences are unique; references are live or explicitly cancelable lifecycle tombstones pending a review. Every pending event has dueTick strictly greater than the current clock tick at a completed boundary. Handlers schedule only future ticks; the initial pending review is a dedicated bootstrap flag, not a past-due event. Heap layout and its index map are derived. Serializing pending events sorts by total comparator. Cancellation removes events and event-by-owner indices, so repeated building/deletion cannot grow dead queues.

## Stair connection

Fields: `id`, `definitionId`, `lowerFloor`, `upperFloor`, `x`, `width`, `lowerAnchor`, `upperAnchor`, `traversalTicks`, `createdTick`. Exactly adjacent floors and nonconflicting built landings are required. Both directions are available without fatigue or explicit stair passenger capacity. Occupied traversal prevents removal; planned future usage does not.

## ElevatorShaft and ElevatorStop

**ElevatorShaft:** `id`, `definitionId`, `x`, `width`, `minFloor`, `maxFloor`, `serviceId`, `servedMinFloor`, `servedMaxFloor`, `stopIds`, `carIds`, `createdTick`. Separate `carIds` supports later schema evolution, but validation requires length exactly one in MVP. The served range is contiguous, within the shaft, and has at least two valid landings. Every served level has a stop, not player-selected express gaps.

**ElevatorStop:** `id`, `serviceId`, `shaftId`, `floor`, `anchorX2`, `upQueueId`, `downQueueId`. Terminal directions with no possible destination are disabled. Stable IDs survive graph reconstruction; service-range edits cancel invalid hall requests and use the loaded-car safety rules. Shaft footprint reservation does not block hallway walking.

## ElevatorCar

Fields: `id`, `shaftId`, `serviceId`, `capacity: 8`, `direction`, `state`, `currentFloor` when landed, optional `segment {fromFloor,toFloor,elapsedTicks,durationTicks}`, `targetStopId`, `onboard [{occupantId,unloadStopId,boardedTick}]`, `pendingRequests`, `serviceVisit`, and phase timing.

`pendingRequests` references onboard unload commitments and active hall requests; runtime ordered stop sets are derived and must agree. Hall request direction remains separate from physical car direction. An idle car has no movement segment or onboard passengers and rests at its last stop. A loaded car cannot be deleted, made unable to unload its passengers, or assigned a reverse journey.

| Car state | Timing / transition |
| --- | --- |
| `idle` | No request: sleep. Reachable request: deterministic target/direction selection. |
| `starting` | Two ticks of start allowance for a new flight. |
| `moving` | Four ticks per adjacent floor segment; evaluate next floor crossing before continuing or stopping. |
| `leveling` | Two ticks at an actual requested stop; skipped for pass-through floors. |
| `opening` | Two ticks; create one service visit ID. |
| `unloading` | One tick per passenger whose committed stop is this stop, stable onboard order. Empty phase skips immediately. |
| `boarding` | Freeze eligible queue entries after unloading; one tick per admitted person, at most free capacity. Empty phase skips immediately. |
| `dwell` | Two ticks after exchange; arrivals after the cutoff await a later service. |
| `closing` | Two ticks; then dispatch next flight or settle idle if no request remains. |

No physical acceleration/jerk state is needed. Movement uses start/level allowances rather than acceleration integration. Zero-work administrative transitions may occur at one boundary, but physical travel/doors/dwell and each passenger transfer take their prescribed nonzero time.

**ServiceVisit:** `id` allocated on transition into opening after leveling, `stopId`, `boardingDirection`, `cutoffTick`, immutable visit-local cohort records `{queueEntryId,occupantId,unloadStopId,admissionSequence,status}`, an immutable ordered unloading cohort captured from onboard passengers for this stop, and separate unload/board cursors/remaining ticks. Status distinguishes pending, boarded, denied and canceled. Processed cohort references are historical; only unprocessed selected entries require live matching queue membership. Unloaded passengers are removed from the car but not from the visit-local unloading snapshot; the cursor never indexes a shrinking onboard array. Processed unloaded occupants may already have departed and are historical references. Retain this compact cohort until the visit ends, even after an entry leaves its queue. Boarding reservations prevent concurrent routing of a selected passenger. A selected passenger remains logically waiting until the transfer completes, then atomically moves to the car; denied passengers remain waiting. If a destination is canceled during boarding, invalidate its pending admission safely and fill no new place from arrivals after the cutoff. Preserve the visit and cursor in saves.

## ElevatorQueue

Fields: `id`, `serviceId`, `stopId`, `direction`, ordered `entries`. **QueueEntry:** `id`, `occupantId`, `tripId`, `requestedUnloadStopId`, `joinedTick`, globally unique monotonic `admissionSequence`, optional `reservedServiceVisitId`, `lastDeniedServiceVisitId`.

FIFO is local to the queue but uses globally comparable admission ordinals; they also break simultaneous opposite-direction idle-call ties. Runtime linked/indexed storage supports removal and avoids repeated array shifting; save encoding is an ordered compact entry array. Migration to another service allocates a new admission ordinal while preserving trip wait and denial totals. It does not jump existing travelers at the new stop.

A person is in at most one queue. A capacity-excluded eligible entry gets one denial per service visit. Incompatible directions/stops and arrivals after cutoff get none. Denials are observable on the service boundary; future departures cannot erase them. Derive current wait from `clock.tick - joinedTick` plus accumulated prior queue segments. Maintain count/sum-of-join-ticks for aggregates rather than scan all waiting people per tick.

## NavigationNode, NavigationEdge and Route

**NavigationNode (derived):** semantic `id`, `kind: hallway | entrance | stairEndpoint | stopPlatform | rideUp | rideDown`, logical anchor and owner/service reference. Insert sorted hallway anchors only inside constructed ranges. Equal-coordinate anchors connect without fictional walking time; movement between distinct coordinates takes positive ticks.

**NavigationEdge (derived):** `id`, `from`, `to`, `kind: walk | stairs | board | ride | alight`, `infrastructureId`, optional `serviceId/direction`, positive traversal time where physical, and generalized nonnegative integer cost in half-tick units. Walking edge cost is exact in half-cell units; other durations multiply by two, preserving route cost under anchor subdivision. Board edges charge estimated wait once; alighting is a graph transition whose real duration is owned by the car. Adjacent ride links preserve direction; no mid-car reverse graph edge.

**Route (persistent while committed):** `id`, `computedTopologyVersion`, `goal`, `modePreference`, ordered semantic legs, `currentLegIndex`, optional `replanAfterCurrentLeg`. Walk/stair legs store endpoints/duration; elevator legs store boarding and unload stop IDs/service ID. Collapse consecutive ride links so intermediate stops are not forced. Also collapse consecutive straight same-floor walk edges before rounding physical duration once, so adding graph anchors cannot change travel time over the same distance. Store valid remaining committed legs; do not refer to graph-array indices. On an edit, clear any invalid future suffix immediately and retain only the valid current segment plus an explicit pending-replan goal/reason. A removed destination becomes an exit goal; deleted infrastructure must not survive as a live future route reference.

**Derived caches:** graph and connected-component/access lookup; owner/entrance indices; bounded LRU static-path/connectivity cache; active IDs; queue and approaching-service counts; event heap/index; presentation spatial index. Load reconstructs these without bumping the topology version or choosing new routes. After an edit, valid committed segments finish; replan remaining legs at safe boundaries. No cache eviction changes valid route availability.

## TripMetrics and reporting

**TripMetrics:** `id`, `occupantId`, `purpose: officeArrival | officeExit | restaurantArrival | restaurantExit | abandonedExit`, origin/goal references, `startTick`, `endTick`, `outcome: active | completed | abandoned | stranded`, elapsed `walkingTicks`, `stairTicks`, `waitingTicks`, `ridingTicks`, `strandedTicks`, `transferCount`, `deniedBoardingCount`, `openSegment {kind,startTick}`, optional morning `cohortId`. The open segment is settled exactly once on state transitions; read queries may add its current age without mutating state.

Abandonment closes the attempted visit with its experienced penalties and creates a separate real exit trip. A stranded exit stays active/stranded until recovery; its elapsed stranding must hurt quality rather than becoming a perfect sample. Retain the old visit's failure in reports without counting it as successful arrival. Boarding after a prior elevator ride increments transfer count; walking-to-first-elevator does not.

**Score:** versioned coefficients in scenario data. Initial form: clamp `100 - walkPenalty - waitPenalty - ridePenalty - transferPenalty - denialPenalty - strandedPenalty` to 0–100. Use integer basis-point arithmetic and a sufficiently fine internal score scale; displayed rounding cannot change progression comparisons. Waiting coefficient exceeds ordinary ride coefficient; every extra denial decreases an unclamped score. A provisional candidate is 3 points/min waiting, 0.25 points/min riding, 0.1 points/min walking/stairs, 4 points/denial, 2 points/transfer, and 3 points/min stranded. These are balance inputs, not a tuned result. Report the formula/version and sample counts.

**Live report:** all unfinished trips plus finished outcomes whose end tick is in the last 3,600 ticks, each once. Empty → `No trips yet`. Retain finished samples only until they age out; retain unfinished trips until resolution. Maintain aggregate components on transitions; compute open-segment age from timestamps without permanent per-tick history entries.

**Cohort report:** day/seed/profile identity, complete scheduled worker membership, completed count, sum of all elevator wait, current unique queued count, peak queued count, quality sum, and explicit failed/unresolved members. Zero waits count in the denominator. Freeze comparison results only when the entire office-arrival cohort finishes before departures. Hold at least the previous cohort through the next rush; archive older summaries, never silently drop unresolved members.

**Daily report:** count each trip active during that day once, using its cumulative experience through completion or day end. Completed-trip aggregates plus an end-of-day snapshot of still-active trips avoid double counting. A trip crossing midnight contributes once to each day in which active. Keep previous completed day plus a bounded 30-day summary ring; unresolved records remain live. These day snapshots drive progression, not the favorable instantaneous live score.

## EconomyState and FinancialTransaction

**EconomyState:** `initialCashMinor`, `cashMinor`, `nextTransactionSequence`, recent `transactions`, `archived {throughSequence,netMinor,incomeByType,expenseByType,count}`, accrual records by source, current/previous daily operating summaries, and a 30-day aggregate ring.

**FinancialTransaction:** `id`, `sequence`, `tick`, `kind: construction | demolition | officeRent | restaurantVisit | operatingCost`, `sourceId`, durable source label/type snapshot, `amountMinor`, optional covered accrual interval/visit ID, and `operating` flag. Positive means income, negative expense. A transaction is immutable after posting. Unique settlement/visit identities prevent replay duplication; obsolete identities can retire after all referring events are gone and checkpoints preserve sequence monotonicity.

**Accrual:** source ID, rate minor/day, day start, last eligibility-change tick, accumulated eligible ticks and existence ticks, rent-access eligibility, settlement generation. Close the interval on access changes and demolition; round the total eligible fraction once at settlement, half away from zero. Use exact integer arithmetic, not floating currency. Demolition settles pending amounts before deleting live state; it may leave negative cash and does not duplicate the next midnight event.

**Reconciliation:** `cash = initialCash + archived.net + sum(retained.amount)`. Recent income/expense covers posted events in the last 86,400 ticks; the first day is labeled partial. The visible archive is an explicit earlier-activity summary, not a fictitious new cash transaction. Retention is time-bounded and preserves every required recent event; no arbitrary per-event count truncation. Saturated safe-integer arithmetic rejects an action/load before partial mutation.

## ProgressionState

Fields: current level, attained milestone IDs, awarded tick per milestone, and `dayEvidence {dayStart,eligibleFullDay,minAccessibleLeasedOffices,minAssignedWorkers,restaurantAccessibleEvidence,admittedRestaurantVisits,completedOfficeArrivals,strandedCount,unresolvedPriorDayTrips}` plus references to settled finance and the completed-day report. Maintain population/access minima on every relevant transition instead of sampling only at midnight.

**Definition:** `milestoneId: tower.level2`, predicates and configurable thresholds matching the spec: three leased accessible offices and 80 assigned workers maintained throughout a full 00:00–24:00 day; at least one accessible restaurant with at least 10 admitted visits; cash ≥0 after settlement; operating net >0; daily quality ≥60 with ≥80 completed office arrivals; no stranded people or unresolved prior-day trips at evaluation. The partial starting day cannot qualify. UI shows current/target/reason for each predicate. Once awarded, never remove the level; no additional unlocks or levels.

## SaveMetadata

`schemaVersion: 1`, `rulesetId`, `contentVersion`, `scenarioId`, `slotId`, display name, saved tick/day, optional platform-generated saved-at UTC string and build identifier, payload size and optional integrity digest. Real-world timestamps are descriptive only and excluded from simulation replay equality.

**SaveEnvelope:** metadata plus detached authoritative state. Only the explicitly supported schema/rules/capability versions load. Validate metadata/payload agreement, numeric bounds, normalized geometry, definitions, IDs, one-location invariant, queue/car membership, service reservations, routes, scheduled event generations, accrual and financial reconciliation, report references and all capacity bounds before any active-session replacement.

## Invariant and extension summary

Keep shafts, cars, service ranges/stops, queues and dispatch decisions separate now; constrain the MVP to one car and contiguous stops through validation. Future multi-car collision/dispatch, express stops, service elevators or transfers need new policies and rules versions, not overloaded identifiers. Do not implement those behaviors or user controls now.

Runtime indexes may use Maps/Sets/typed arrays or custom heap nodes internally; none is authoritative persistence. Cache reconstruction must consume zero random draws, preserve ordering, and leave the canonical state digest unchanged. Domain construction/edit operations validate their entire proposed result before changing geometry, cash, requests or occupancy.

## Phase 19 implementation reconciliation

The shipped boundary uses `GameState` in `src/simulation/state/game-state.ts`, schema v1, `tower-mvp-v1` rules and `mvp-v1` content. Its concrete top-level records include `offices`, `restaurants`, `stairs`, `shafts`, `stops`, `cars`, `queues`, `occupants`, `trips`, `workforceDays`, `restaurantDays`, `transportReports`, `economy` and `progression`. The earlier conceptual grouped names above describe responsibilities, not additional save fields. [Persistence contracts](contracts/persistence.md) and the strict codec/validators govern the exact shape.

Phase 19 adds no persistent fields or balance changes. Keyboard focus, onboarding, diagnostic rate windows, optional work counters and performance recording stay outside saves. Benchmark scenario funding, workforce capacities, finite demand and schedule overrides are explicitly captured in each fixture's existing scenario snapshot. Unfinished trips and actual dormant people are retained; the fixtures do not fabricate transport completion or enlarge cars.

Short-trip routing amendment: new one-/two-floor journeys persist `nearest` mode, minimizing walking approach to a usable first vertical entrance before total estimated cost and stable ties. Same-floor `walk` and long-trip `elevator` modes are unchanged. Existing v1 short journeys with `stairs` remain valid and preserve their prior committed route/preference until completion; no saved active leg is rewritten during load.
