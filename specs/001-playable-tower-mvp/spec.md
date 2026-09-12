# Feature Specification: TowerSim First Playable MVP

**Feature Branch**: `001-playable-tower-mvp`
**Created**: 2026-09-09
**Status**: Draft — ready for planning
**Input**: Specify the first playable browser-based vertical tower management simulation, validating construction → occupied destinations → transportation demand → physical travel → congestion and improvement → revenue → expansion → first progression milestone.

## Clarifications

### Session 2026-09-09

- Q: How should an MVP elevator choose its stops? → A: Use a fixed directional sweep: serve onboard destinations and compatible waiting passengers ahead, reverse when no requests remain ahead, and skip floors without relevant requests. An idle car goes to the nearest requested pickup, breaking equal-distance ties by lower floor. Players do not configure scheduling algorithms.

- Q: When both stairs and elevators provide a valid route, which should travelers prefer? → A: Walk on the same floor; prefer the shortest walking approach to a usable stair or elevator entrance for trips spanning one or two floors and an elevator route for longer trips. Use another valid route if the preferred type is unavailable. For trips beyond two floors, a long elevator queue alone does not trigger switching to stairs.

- Q: What horizontal walking access should constructing a floor span create? → A: Each constructed span automatically provides a continuous shared walking path joined to directly adjacent built spans. Facilities and shafts reserve placement space without blocking that path; missing floor space breaks it. No corridor-building tool is required.

- Q: What fixed passenger capacity should the standard MVP elevator car use? → A: Eight people, with every worker or customer occupying one slot. Keep the limit in scenario data for later balancing, fixed during play, with no weight classes or player capacity upgrades. Add capacity by constructing additional shafts, each with exactly one standard car.

## User Scenarios & Testing *(mandatory)*

The player manages a tower through a side-on cutaway view. The playable slice includes a ground lobby, buildable floors, offices, a small restaurant, stairs, standard elevators, a repeating day, finances, transportation feedback, progression, and local saves.

P1 stories establish the construction and transportation loop; P2 stories complete the required management and continuation experience. **Every story below is required for this MVP.** Priorities order delivery, not optional scope. Each story can be tested using its stated starting tower without completing earlier stories interactively. Prepared towers must obey the same placement, occupancy, and financial rules as player-built towers.

### User Story 1 - Start a New Tower (Priority: P1)

As a new player, I can start with an understandable building site and control time while I learn the available tools.

**Why this priority**: Every play session needs a valid, affordable starting state and understandable time controls.

**Independent Test**: Start a fresh game and inspect the site, available tools, cash, clock, seed, and tower level.

**Acceptance Scenarios**:

1. **Given** the game has opened in a supported browser, **When** I start a new game, **Then** I see an otherwise empty site with a usable ground lobby, positive starting cash, the initial tower level, the current day and time, and tools for floors, offices, a small restaurant, stairs, a standard elevator, inspection, and demolition.
2. **Given** a new tower, **When** I inspect its bounds and available construction prices, **Then** the site can support multiple upper floors and the starting balance can fund the starter tower described in the assumptions.
3. **Given** a running tower, **When** I choose pause, normal, fast, or very fast, **Then** the selected mode is visible; pause stops simulated time and activity, and the other modes advance the same daily rules at the displayed relative speeds.
4. **Given** an active tower with unsaved changes, **When** I choose New Game, **Then** I can cancel without changing it or explicitly discard it and begin a fresh tower; an existing local save is not overwritten by starting a new game.

---

### User Story 2 - Construct Additional Floor Space (Priority: P1)

As a player, I can add visible, usable horizontal floor space and understand why a proposed extension is invalid.

**Why this priority**: Expansion creates the space needed for destinations and transportation.

**Independent Test**: From the starting lobby, construct two upper floors and extend one floor horizontally.

**Acceptance Scenarios**:

1. **Given** sufficient cash and a valid proposed floor span, **When** I commit construction, **Then** that span becomes usable floor space, its displayed cost is charged once, and I can select the floor to see its level, built span, available space, and access status.
2. **Given** a floor proposal, **When** it overlaps existing floor space, extends beyond site bounds, lacks required support, or exceeds my cash, **Then** placement is rejected with the specific reason and neither geometry nor cash changes.
3. **Given** an upper floor with no route from the lobby, **When** I inspect it, **Then** it remains visible and buildable under the construction rules but is identified as inaccessible until connected.
4. **Given** a built tower and an active construction proposal, **When** I navigate the view or resize the supported viewport, **Then** I can still reach and inspect every built span, and the same proposed world location has unchanged dimensions, price, and placement validity.
5. **Given** a continuous built floor span, **When** I place valid facilities and a shaft along it, **Then** travelers can still walk along the full span and reach its facility entrances and transport landings without separately building a corridor; demolishing a facility leaves that floor space and walking path intact.
6. **Given** two supported built spans on the same level separated by an unbuilt gap, **When** a route is evaluated, **Then** no direct horizontal route crosses the gap; constructing the missing supported span automatically connects their walking paths, while directly adjacent spans need no additional connection action.

---

### User Story 3 - Place and Lease an Office (Priority: P1)

As a player, I can build an office, distinguish vacancy from tenancy, and understand its workforce and finances.

**Why this priority**: Occupied destinations generate the recurring travel demand and revenue that make the tower function.

**Independent Test**: Place offices in a prepared tower with accessible vacant space and a known amount of remaining office demand.

**Acceptance Scenarios**:

1. **Given** enough cash and an unoccupied floor span large enough for an office, **When** I place it, **Then** its full horizontal footprint appears, the quoted cost is charged once, and its inspector distinguishes tenancy, assigned workforce, workers physically present, accessibility, rent, and operating cost.
2. **Given** an accessible vacant office, sufficient remaining market demand, and an eligible tower level, **When** the next daily leasing review occurs, **Then** the office acquires a tenant and an assigned workforce, and its recurring rent begins under the displayed billing rules.
3. **Given** an office that is inaccessible, ineligible, or unable to obtain remaining market demand, **When** a leasing review occurs, **Then** it stays vacant, earns no rent, and displays the reason.
4. **Given** a placement that overlaps a facility or reserved transport space, extends off a floor, or requires nonexistent floor space, **When** I try to build, **Then** the game explains the invalid placement and charges nothing.
5. **Given** an occupied office before the morning rush, **When** I inspect it, **Then** it can show an occupied lease and a nonzero assigned workforce while showing zero workers physically inside.
6. **Given** an occupied office earning rent, **When** its only access is removed and later restored, **Then** its tenant and assigned workforce remain identifiable, rent accrues only during accessible time, operating costs continue, and future scheduled arrivals resume without replaying missed arrivals.

---

### User Story 4 - Connect Floors with Stairs (Priority: P1)

As a player, I can connect adjacent floors and watch people use the resulting route.

**Why this priority**: Stairs provide a simple working route and an alternative transportation choice.

**Independent Test**: Add stairs between a lobby-connected floor and an adjacent inaccessible floor containing a destination.

**Acceptance Scenarios**:

1. **Given** valid free landing space on two adjacent floors, **When** I build stairs between them, **Then** they connect those floors, accessibility updates, and travelers can walk to the landing and spend nonzero time traversing the stairs.
2. **Given** a missing landing floor, an overlap, or floors more than one level apart, **When** I propose a stair connection, **Then** the game rejects it with a reason and charges nothing.
3. **Given** travelers using a stair segment, **When** I demolish it, **Then** the edit follows the safe-change policy in Edge Cases, new trips avoid the removed segment, and affected facility access is reevaluated.
4. **Given** valid stairs-only and elevator routes from the lobby to destinations one, two, and three floors above it, **When** travelers choose routes, **Then** they use the closest usable stair or elevator entrance for the one- and two-floor trips and an elevator for the three-floor trip; connected same-floor journeys use walking.
5. **Given** a one-floor trip with only a valid elevator route and a three-floor trip with only a valid stairs route, **When** their travelers select routes, **Then** the one-floor traveler uses the elevator and the three-floor traveler uses stairs, without marking either destination inaccessible solely because its preferred route type is missing.
6. **Given** a traveler queued for an elevator on a three-floor trip and an available stairs-only alternative, **When** the elevator backlog grows without an access change, **Then** the traveler does not switch to stairs solely because of queue length and retains accumulated waiting time and boarding denials.

---

### User Story 5 - Construct and Operate an Elevator (Priority: P1)

As a player, I can construct a shaft with a car and configure service that carries people between floors.

**Why this priority**: Visible, finite-capacity elevator travel is the central transportation system.

**Independent Test**: In a tower with existing landing floors and a lobby route, build a standard elevator and observe a trip to an upper-floor destination.

**Acceptance Scenarios**:

1. **Given** enough cash and a clear valid vertical shaft span, **When** I build a standard elevator and select a valid service range covering at least two landing floors, **Then** the tower gains a shaft and exactly one operational car with a displayed eight-person capacity, service range, and construction cost.
2. **Given** a passenger requesting a served floor, **When** the car responds, **Then** the passenger waits at the stop, boards a stopped car when space is available, travels with the moving car over nonzero time, and exits at a stop on the route to their destination.
3. **Given** a proposed misaligned or obstructed shaft, service outside the shaft, fewer than two valid stops, or a requested stop without landing floor space, **When** I commit the proposal, **Then** it is rejected with an explanation and no charge.
4. **Given** an empty elevator with no requests, **When** time advances, **Then** it rests at its last served stop until a request arrives and continues to incur its displayed operating cost.
5. **Given** a loaded moving car, **When** I pause and later resume, **Then** its position, load, requests, and passenger trip times remain unchanged during the pause and continue from that state without skipping stops.
6. **Given** an upward-moving car on floor 1, an onboard destination at floor 3, an upward pickup at floor 2 bound for floor 3, a downward pickup at floor 5 bound for floor 0, and no further requests, **When** it serves these requests, **Then** it stops at floors 2 and 3 in order, passes unrequested floor 4, reaches floor 5 to reverse and collect the downward traveler, and carries each boarded passenger to their requested destination.
7. **Given** an idle empty car at floor 2 and simultaneous pickup requests at floors 0 and 4, **When** it selects its next pickup, **Then** it chooses floor 0; with only a nearer pickup at floor 3 and a farther pickup at floor 0, it chooses floor 3.

---

### User Story 6 - Observe Office Workers Arrive and Leave (Priority: P1)

As a player, I can see a workday generate traffic between the lobby and occupied offices.

**Why this priority**: Occupancy must cause actual travel, not cosmetic activity or automatic physical presence.

**Independent Test**: Run a prepared occupied office through a day with a valid lobby route.

**Acceptance Scenarios**:

1. **Given** an occupied office before its morning arrival window, **When** that window passes, **Then** its workers enter through the lobby at multiple distinct times, follow valid routes, and count as present only after reaching the office.
2. **Given** workers inside an office, **When** the evening departure window passes, **Then** departure times are distributed, workers physically return through the transportation network, and they leave through the lobby.
3. **Given** the same initial tower, seed, and actions at the same simulated times, **When** I repeat a day at different rendering frame rates and simulation speeds, **Then** scheduled arrivals and departures and the resulting game state at the same simulated time are equivalent.
4. **Given** a worker who cannot reach the office or whose planned departure occurs before arrival, **When** the trip can no longer serve its workday goal, **Then** the worker abandons the office visit and attempts to return to the lobby without becoming physically present at the office.

---

### User Story 7 - Observe Elevator Queues (Priority: P1)

As a player, I can see people waiting for transportation and tell that their wait is real.

**Why this priority**: Visible queues make the transportation model understandable.

**Independent Test**: Trigger several elevator requests while the only serving car is away from their floor.

**Acceptance Scenarios**:

1. **Given** travelers whose route uses an elevator currently away from their stop, **When** they reach it, **Then** visible waiting people and an accurate queue count appear at that stop, requests persist, and waiting time increases with simulated time.
2. **Given** a waiting group and a car with limited free places, **When** boarding occurs, **Then** no more than the free capacity boards and the remaining people keep waiting with their accumulated wait intact.
3. **Given** simultaneous eligible requests, **When** boarding repeats, **Then** a stable order favors people who have already been waiting over later arrivals for the same service and direction; new arrivals cannot continually displace them.
4. **Given** an empty standard car and nine eligible queued passengers containing both workers and customers, **When** boarding occurs, **Then** exactly eight board in the established queue order and the ninth remains queued with one capacity denial; each person consumes one place regardless of type.

---

### User Story 8 - Overload an Elevator during Rush Hour (Priority: P1)

As a player, I can create an inadequate transportation design and observe its operational consequences.

**Why this priority**: A bottleneck must emerge from demand and capacity for the management challenge to exist.

**Independent Test**: Run the baseline configuration in the Congestion Loop acceptance scenario.

**Acceptance Scenarios**:

1. **Given** multiple occupied upper-floor offices relying on one insufficient standard elevator, **When** the morning rush occurs, **Then** queues grow across successive car visits, some people wait at least 10 simulated minutes, and at least one person is denied boarding on two eligible arrivals because the car fills.
2. **Given** that growing backlog, **When** I inspect transportation performance, **Then** the tower shows increased waits, denied boardings, and lower transportation quality than the corresponding adequately served condition; people still waiting contribute to the feedback.
3. **Given** a passenger who has missed several cars, **When** another car arrives, **Then** the passenger is still accounted for, retains accumulated waiting and denial history, and can board when eligible space becomes available.

---

### User Story 9 - Improve Congestion with Transportation Construction (Priority: P1)

As a player, I can add useful transportation capacity and see waiting and transportation quality improve.

**Why this priority**: This closes the essential cause-and-effect management loop.

**Independent Test**: Compare the baseline and improved configurations in the Congestion Loop scenario using the same scheduled workers and measurement period.

**Acceptance Scenarios**:

1. **Given** the congested tower and enough cash, **When** I add a second standard elevator in its own valid shaft serving the affected floors, **Then** new and waiting travelers can use the additional viable route and both elevators perform real trips.
2. **Given** sufficient added capacity for the same rush demand, **When** the next comparable morning period runs, **Then** mean waiting and peak queue population decrease by at least 30%, and the same cohort's transportation-quality score improves by at least 10 points on its 0–100 scale.
3. **Given** an additional elevator that does not serve the congested travelers' route, **When** I build it, **Then** the game does not award transportation quality merely for owning more infrastructure; feedback continues to reflect actual trip experiences.
4. **Given** queues already exist, **When** I change simulation speed, **Then** the queue order, elapsed waits in simulated time, capacity constraints, and eventual results match a run with the same actions and elapsed simulated time at normal speed.

---

### User Story 10 - Diagnose an Inaccessible Facility (Priority: P1)

As a player, I can identify why a destination cannot be reached and restore its access.

**Why this priority**: Broken access must be understandable and recoverable through construction decisions.

**Independent Test**: Inspect an upper-floor office disconnected from the lobby, add a connection, and remove it again.

**Acceptance Scenarios**:

1. **Given** an office or restaurant with no valid lobby route, **When** I view or select it, **Then** it has a visible inaccessible indicator and an explanation identifying the missing connection or unserved floor; no new successful visit or new lease is invented there.
2. **Given** an inaccessible facility, **When** I add a valid connection, **Then** its access status updates before subsequent routing or leasing decisions, and future demand may use it under the normal schedule.
3. **Given** an occupant en route, **When** an accepted construction change removes their destination's last route, **Then** they reroute if possible or abandon the visit and attempt to leave; if no safe route to the lobby exists, the stranding rule applies without teleportation.

---

### User Story 11 - Inspect an Elevator and Its Traffic (Priority: P1)

As a player, I can locate a bottleneck and understand what each elevator is doing.

**Why this priority**: Management decisions require observable car operation and queues.

**Independent Test**: Inspect a serving elevator during a prepared rush and open the tower traffic view.

**Acceptance Scenarios**:

1. **Given** an elevator with active trips, **When** I select it, **Then** I see its current floor or position between floors, direction and activity, passenger count, capacity, service range, and waiting counts for every served floor, including zero counts.
2. **Given** several elevators and queued travelers, **When** I inspect the tower traffic view, **Then** I can distinguish crowded floors or stops using queue counts and waiting duration, and a person waiting for one elevator is not counted twice as waiting for another.
3. **Given** a selected person in motion or a queue, **When** I inspect them, **Then** I can identify whether they are a worker or restaurant customer, their destination goal, and whether they are walking, waiting, riding, or attempting to leave.
4. **Given** recent completed and active trips, **When** I inspect transportation details, **Then** walking, waiting, elevator riding, denied boardings, completed trips, and abandoned trips are distinguishable with a labeled reporting period and sample count.

---

### User Story 12 - Build and Operate a Small Restaurant (Priority: P2)

As a player, I can build another occupied destination that earns money from actual customer visits.

**Why this priority**: A second destination type completes the MVP's demand and revenue variety.

**Independent Test**: Build a restaurant on an accessible prepared floor and advance through a meal period.

**Acceptance Scenarios**:

1. **Given** valid free floor space and sufficient cash, **When** I build a small restaurant, **Then** its footprint and cost are explicit, and its inspector shows accessibility, expected demand for the current day, current incoming customers, current visitors, revenue, and operating cost.
2. **Given** an accessible restaurant during a demand period, **When** customers visit, **Then** they enter through the lobby, physically travel to the restaurant, remain for a nonzero visit duration, generate one charge per admitted visit, and then travel back to the lobby to leave.
3. **Given** a restaurant with no access or no admitted visits, **When** simulated time passes, **Then** it earns no visit revenue, continues its disclosed operating costs, and reports access or demand status.
4. **Given** customers inside a restaurant, **When** I demolish it, **Then** they end their visits and attempt to exit under the safe-change policy; no subsequent visit charge or operating cost is created for that removed facility.

---

### User Story 13 - Observe Time-Dependent Restaurant Demand (Priority: P2)

As a player, I can anticipate a concentrated meal-period traffic wave rather than constant restaurant traffic.

**Why this priority**: Changing demand across the day creates a recognizable operating rhythm.

**Independent Test**: Observe daily customer schedules for an accessible restaurant with unused daily market demand.

**Acceptance Scenarios**:

1. **Given** a restaurant open for a full simulated day, **When** I compare new customer trip requests across the day, **Then** at least 70% are scheduled in the defined meal period, at multiple distinct times, and meal-period requests exceed those in an equal-length off-peak period.
2. **Given** a fixed amount of daily restaurant demand, **When** I add more restaurants, **Then** total generated restaurant customers do not exceed the tower's current daily market allowance, and the inspectors explain each restaurant's expected share.
3. **Given** the same seed, initial state, and timed actions, **When** I repeat a day, **Then** the restaurant trip-request times, destinations, and visit durations repeat regardless of display frame rate.

---

### User Story 14 - Understand Recent Financial Performance (Priority: P2)

As a player, I can see where cash comes from, what I spend, and whether the tower is operating sustainably.

**Why this priority**: The player must connect a working tower to income and affordable expansion.

**Independent Test**: Run a prepared tower through a full billing day with occupied and vacant offices, restaurant visits, construction, and recurring costs.

**Acceptance Scenarios**:

1. **Given** financial activity during the last 24 simulated hours, **When** I open finances, **Then** I see current cash, recent income, recent expenses, and their net result, plus a separate operating result that distinguishes recurring activity from construction and demolition.
2. **Given** an individual charge or receipt, **When** I inspect its history, **Then** its time, amount, reason, and related facility or construction action explain the balance change; displayed totals reconcile exactly with the entries.
3. **Given** rent and costs become due, **When** the due simulated time is processed at any speed or after reloading, **Then** each applicable financial event occurs once; vacant offices earn no rent and restaurant revenue requires an admitted visit.
4. **Given** operating expenses reduce cash to zero or below, **When** the game continues, **Then** cash and its warning remain visible, existing operations continue, and any construction with a positive charge is blocked until it is affordable; inspection, time controls, saving, and zero-cost demolition remain usable.
5. **Given** an office with earned but unposted rent and cost partway through a day, **When** I demolish it, **Then** the disclosed accrued amounts settle once, the demolition itself uses the displayed demolition price, and the next billing boundary does not charge or credit the same period again.

---

### User Story 15 - Reach the First Tower Milestone (Priority: P2)

As a player, I can understand the next tower level and achieve it through a functioning, financially healthy tower.

**Why this priority**: A clear attainable milestone gives the MVP loop a satisfying first goal.

**Independent Test**: Run a prepared near-qualifying tower across a full operating day, first with one condition unmet and then with every condition met.

**Acceptance Scenarios**:

1. **Given** the initial level, **When** I inspect progression, **Then** I see the next level and the target and current value for population, occupied accessible offices, a functioning restaurant, cash, recent operating result, and transportation quality; unmet conditions are explicit.
2. **Given** many constructed but empty or inaccessible facilities, **When** progression is evaluated, **Then** construction count alone cannot award the milestone.
3. **Given** all published milestone conditions are met using one full day's operating evidence, **When** the end-of-day evaluation occurs, **Then** the first milestone is awarded once, the current level changes visibly, and continued play and saving remain available.
4. **Given** a new player following the in-game information and making a viable design, **When** they play a normal MVP session with the available speed controls, **Then** they can earn the milestone within 30 real minutes without developer intervention.

---

### User Story 16 - Save, Reload, and Continue a Tower (Priority: P2)

As a player, I can preserve my tower locally and resume substantially the same simulation after refresh or reopening.

**Why this priority**: The completed management loop must survive a break in play.

**Independent Test**: Save a tower during a rush with an occupied moving car, waiting passengers, active facilities, and pending billing; compare resumed play with an uninterrupted continuation.

**Acceptance Scenarios**:

1. **Given** an active tower, **When** I save locally and receive success feedback, refresh or reopen the game in the same browser profile, and load, **Then** geometry, facilities, elevator service and car state, queues, occupants, tenants, cash and history, day and time, progression, schedules, trip measures, and deterministic continuation state are restored.
2. **Given** the same subsequent actions at the same simulated times, **When** saved and uninterrupted games advance through the next full day, **Then** their trips, queues, finances, occupancy, and progression agree, with no duplicated occupants or financial events.
3. **Given** malformed, internally inconsistent, or unsupported saved data, **When** I try to load it, **Then** a useful error appears and both the active game and previously valid local save remain unchanged.
4. **Given** an active game with unsaved changes, **When** I load another tower, **Then** I explicitly confirm replacement after the candidate is validated, or cancel and retain the active game; successful loading leaves exactly one active simulation, initially paused.
5. **Given** local storage is unavailable or a write fails, **When** I save, **Then** the game reports failure without claiming success, preserves any previous valid save, and lets the active session continue.

---

### Required End-to-End Acceptance Scenario - Congestion Loop

This is the central proof of the MVP. It must be reproducible through ordinary construction, simulation controls, and visible inspectors; a repeatable prepared tower may establish the starting condition.

**Controlled setup**: Use one paused pre-rush tower with at least three occupied offices on multiple upper floors, a lobby, one standard elevator, known workforce and scheduled arrivals, and enough cash for the intervention. In this comparison the offices rely on elevator service; stairs may serve other floors. Keep tenants, workforce, destinations, meal demand, seed, day, office schedules, elevator type and eight-person car capacity, and all non-transport rules constant. Adding capacity means constructing one or more additional shafts, each with exactly one standard car, rather than enlarging a car or putting more cars in an existing shaft. Create baseline and improved continuations from that same starting state. Adding a second shaft must not regenerate the scheduled demand. Also demonstrate that the same improvement can be made during normal continued play before a later comparable rush.

1. **Given** the baseline's vertical capacity is insufficient for its scheduled morning workforce, **When** arrivals progress through the morning rush, **Then** a visible queue grows over at least three successive eligible elevator arrivals, at least one person waits 10 or more simulated minutes, and at least one person is denied boarding at two eligible arrivals because the car is full.
2. **Given** these measured waits and denied boardings, **When** transportation feedback updates, **Then** tower quality declines as the backlog develops; active waiting people affect the score even before finishing their trips. Walking, waiting, riding, denied boardings, and completed trips remain separately observable.
3. **Given** the identical pre-rush starting tower, **When** the player constructs enough additional standard shafts, each with one eight-person car and valid access to those same offices, and runs the same morning schedules, **Then** the new capacity actually carries passengers; mean elevator waiting per person and the maximum combined queue population fall by at least 30%, and the cohort transportation-quality score increases by at least 10 points compared with baseline.
4. **Given** both continuations, **When** their results are compared, **Then** they contain exactly the same scheduled worker cohort, all cohort office trips finish before the departure window, and no cancellation, reduced tenancy, skipped demand, hidden passenger removal, or instantaneous transport accounts for the improvement.
5. **Given** the player instead improves a continuously running baseline tower before a subsequent comparable rush, **When** that rush occurs with the same workforce and equivalent arrival intensity, **Then** visible queues and recorded waits decrease and the tower's aggregate quality improves without resetting the tower.

**Measurement contract**: For the controlled comparison, follow every worker scheduled in the morning window from entering at the lobby until reaching the office. Mean waiting is the sum of all elevator queue time for those workers divided by the full cohort size, including zero waits; changing queues does not erase time. Peak queue population is the maximum simultaneous count of unique waiting cohort members across all stops. Compare the same cohort's mean trip-quality score after all have arrived, alongside the live tower indicator. Both runs must complete the cohort before the workday departure window; otherwise the comparison fails rather than dropping incomplete trips. The baseline must recover after its rush, so the challenge is a measurable bottleneck, not a permanently impossible tower.

### Edge Cases

The **safe-change policy** applies to demolition and service-range edits: evaluate the proposed result before charging or changing anything. A traveler may reroute or abandon a destination and return to the lobby. A person with no valid exit route remains at a real surviving location with a visible stranded status; restoring access permits them to continue leaving. Stranded people do not produce completed trips, new visit revenue, or favorable transport samples. No recovery may teleport someone or leave them referencing removed infrastructure. A change that would erase an actively occupied stair segment or car is rejected until that segment or car is empty; this limited restriction is explained in the UI and does not prevent removing other access.

| Case | Required observable behavior |
| --- | --- |
| Insufficient construction funds | Reject the complete action, identify required cost and available cash, and leave cash and construction unchanged. An exactly affordable action succeeds and may leave zero cash. |
| Overlapping construction | Reject a conflicting floor span, facility, stair landing, or shaft footprint, identify the conflicting space, and charge nothing. |
| Construction outside space or without floor support | Reject the action and identify the bounds, missing floor, or support problem. A proposed elevator stop must have valid landing space. |
| Deleting stairs used by active travelers | Reject deletion while someone is physically on the segment and explain that it is in use. If travelers have only planned or queued for that stair, allow deletion, reevaluate their route, and reroute, return, or mark them stranded. |
| Deleting or disabling elevator access used by active travelers | Reject removal of a shaft or car while it contains passengers, and reject a service edit that would invalidate a loaded car's current segment or onboard passengers' committed unloading stops. Otherwise allow the change; clear affected pending requests, reroute waiting or approaching people, preserve their elapsed waits and denials, and mark newly inaccessible facilities. |
| Deleting an occupied office | End the lease and future rent, stop future operating charges, cancel unstarted workforce visits, and move workers inside to the surviving floor at that office's entrance to begin a real exit trip. En-route workers abandon the office trip. Earned rent is retained; no fictitious arrival or duplicate departure is recorded. |
| Deleting a restaurant containing customers | End its demand and future costs; customers inside emerge at its surviving entrance and attempt to leave. En-route customers abandon the visit. Revenue already charged at admission remains, and no abandoned incoming visit earns revenue. |
| Removing floor space or the ground lobby | Reject removal of floor space supporting facilities, transport landings, people, or upper-floor support until those dependencies are removed. The initial lobby and its base entrance floor cannot be demolished. |
| Elevator becomes full | Stop boarding at capacity. Eligible people left behind stay visibly queued with their pending trip and receive a denied-boarding event for that visit. People waiting for another direction or an unserved destination are not incorrectly counted as denied. |
| Passenger waits through multiple elevator arrivals | Keep the passenger's identity, goal, place relative to later eligible arrivals, accumulated wait, and denial count; do not reset their timer or silently discard them. At an eligible boarding stop, unloading happens before free places are assigned. |
| Occupant destination becomes inaccessible while traveling | Reevaluate at the next routing decision after the edit. Use a remaining valid route if one exists; otherwise abandon the visit and try to exit. A rider first unloads at their preserved valid committed stop. If exit is impossible, show them stranded on a surviving floor until access is restored. |
| Elevator has no pending requests | Finish any current empty repositioning movement to its next valid stop, then idle at the last reached stop. Do not invent trips, move occupants, or stop operating expenses. |
| Pause while an elevator moves | Freeze its logical position, boarding/unloading progress, passenger waits and rides, clock, demand, and financial timing. Inspection, valid building edits, and saving remain available. Resume continues from that state. |
| Change speed while queues exist | Process more or less simulated time per real second; preserve the same queue order, rules, scheduled demand, and results for equal elapsed simulated time and equally timed actions. Never clear queues or skip boarding to catch up. |
| Cash reaches zero or becomes negative | Show the balance and a financial warning. Continue existing services, demand, income, and costs; prevent unaffordable positive-cost actions. No forced reset, asset deletion, loans, or mandatory game-over occurs in the MVP. |
| Malformed or unsupported save | Reject with a readable reason before replacing active state. Preserve the active game and last valid save; do not partially load or silently start a new tower. |
| Load while another game is active | Validate first, request confirmation if unsaved progress would be lost, and offer cancellation. After confirmation replace the active tower as one operation, start paused, and prevent the old tower from continuing to generate events. |
| Save fails or is interrupted | Do not report a completed save; retain the prior valid save and active game. Retry remains available. |
| Demand exceeds supply or supply exceeds demand | Unleased offices do not earn rent; unmet finite market demand does not create extra tenants beyond its limit, and spare restaurants do not create unlimited customers. |
| No transportation samples yet | Show “No trips yet” and the sample count, not a perfect score. Progression cannot satisfy its transport condition using an empty sample. |
| Leave and later reopen the browser | Load the saved simulated instant; no offline time, rent, queue aging, or missed demand is invented from elapsed real time. |
| Worker has not left before a later day's arrivals | Retain that same worker at their actual location and continue the pending exit or stranding recovery. Do not spawn another copy at the lobby, assign simultaneous visits, or count an uncompleted return as a successful departure. Resume the ordinary schedule only for a subsequent feasible workday. |

## Requirements *(mandatory)*

### Functional Requirements

#### Starting experience, world, and construction

- **FR-001**: The game MUST provide New Game, local Save, and local Load, with the new-game state and replacement behavior in US1. Core play MUST work in supported desktop browsers without an account or continuous network access after game resources are available.
- **FR-002**: The starting scenario MUST provide a permanent usable ground lobby, visible positive cash, the initial tower level, a displayed seed, and every MVP construction tool. Its buildable space, available market demand, and starting funds MUST permit the starter tower and first-day operating allowance in the assumptions without prerequisite progression.
- **FR-003**: The player MUST view and inspect a side-on cutaway tower, navigate to every buildable floor and horizontal span, and distinguish facility footprints, walking space, stair connections, shafts, car positions, and queues. Changing viewport size or view position MUST NOT alter dimensions, routes, construction validity, or game outcomes.
- **FR-004**: Constructed floor space MUST be an explicitly built horizontal span within displayed site bounds, including a continuous shared walking path. Paths on directly adjacent built spans at the same level MUST connect automatically; an unbuilt gap MUST break direct horizontal access. Facilities and shafts MUST NOT block this path, and no corridor-building tool is required. Placing a facility or extending a shaft MUST NOT create missing floor space. New upper-floor space MUST have supporting floor space directly below its full span; widening begins at the ground or extends existing supported space. Accessibility is separate from physical support and MUST NOT prevent construction on a supported but currently inaccessible floor.
- **FR-005**: Construction tools MUST show the proposed footprint, cost, and validity before commitment. Facilities and transportation landings MUST fit entirely on existing floor space and respect their displayed footprints. These footprints reserve placement space while preserving the floor's continuous shared walking path and access to facility entrances and landings. Demolishing a facility MUST leave its underlying floor span and shared walking path intact.
- **FR-006**: The game MUST reject insufficient funds, overlapping occupied or reserved space, out-of-bounds construction, missing floor/support space, invalid stair connections, and invalid elevator geometry with a specific visible reason. A rejected action MUST change neither the tower nor cash; a successful action MUST charge its quoted construction cost exactly once.
- **FR-007**: The player MUST be able to demolish player-built facilities, stairs, shafts/cars, and eligible floor spans under the safe-change policy. The game MUST display the demolition charge or refund, including zero, and any blocking dependency before commitment; the permanent entrance lobby and its base floor MUST remain protected.
- **FR-008**: Accepted construction, demolition, and elevator-service edits MUST update access indicators and invalidate affected routes before further trip, admission, or leasing decisions. No person, request, or facility may keep using removed space or transport, and edits MUST behave consistently while paused.

#### Time and repeatable behavior

- **FR-009**: The game MUST show the current day and simulated time and repeat a daily cycle that controls arrivals, departures, meal demand, leasing reviews, financial timing, and milestone evaluations. Relevant schedule windows MUST be discoverable from the UI.
- **FR-010**: Pause MUST halt all simulated activity and elapsed trip time while retaining inspection, valid construction edits, saving, and loading. Normal, fast, and very fast MUST have visible, distinct speed factors and MUST alter only how quickly simulated time is processed.
- **FR-011**: Identical starting state, seed, and ordered actions at the same simulated instants MUST yield the same schedules and authoritative outcomes at the same simulated instant, regardless of rendering frame rate or speed mode. Equivalent outcomes include people, locations, goals, queues, car loads/positions, trip measures, tenants, cash, and progression; visual animation details are excluded.
- **FR-012**: Changing speed, pausing, saving/loading, or time spent away from the game MUST NOT skip or duplicate arrivals, boarding, travel, departures, billing, or milestone events. Loading resumes from saved simulated time, with no real-time offline advancement.

#### Occupants, schedules, routes, and access

- **FR-013**: Office workers and restaurant customers MUST have an identifiable type, destination goal, and observable travel state. Applicable states MUST distinguish entering, walking, taking stairs, waiting, riding, visiting/working inside a facility, returning to the lobby, stranded, and departed; a person MUST occupy only one location or transport at a time.
- **FR-014**: Every external arrival and departure MUST pass through the lobby. Walking, stair traversal, elevator movement, and visits MUST take nonzero simulated time, and reaching a facility MUST require a valid completed journey. People inside facilities may be hidden from animation while remaining counted and scheduled to leave.
- **FR-015**: Each occupied office MUST generate its assigned workforce's arrival requests at multiple distinct times during the morning window and departure goals at multiple distinct times during the evening window. Schedules MUST be repeatable for a fixed seed and state, with the default windows in the assumptions. A late worker whose departure becomes due MUST abandon the unfinished office visit and attempt to exit. Workers still in the tower from an earlier day MUST retain their real state and pending exit, without duplicate arrivals or simultaneous visits; the overnight Edge Cases rule applies.
- **FR-016**: Restaurant trip requests MUST have a finite daily tower-wide allowance, assigned among accessible restaurants, and a defined meal-period concentration. At least 70% of requests MUST fall in that window at multiple distinct times, and an equal-duration off-peak window MUST have fewer requests. Repeat runs MUST preserve generated visit timing and duration under FR-011.
- **FR-017**: Routes MUST join a person's real location to their goal using connected horizontal walking space, adjacent-floor stairs, and valid elevator stops. Travelers MUST walk for same-floor trips when a connected horizontal path exists. For an origin-to-destination separation of one or two floors, they MUST prefer the valid route with the shortest walking approach to its first stair or elevator entrance; equal approaches are resolved by estimated total journey cost and stable deterministic ties; for greater separation, they MUST prefer a valid route using elevators. When the preferred route type is unavailable, they MUST use another valid route; route preference MUST NOT make an otherwise reachable destination inaccessible. For trips beyond two floors, elevator queue length alone MUST NOT trigger switching to stairs. Travelers MUST be able to combine walking with stairs or elevators, without an advanced transfer-floor system being required.
- **FR-018**: A facility MUST be accessible only when relevant users have valid routes both from the lobby to its entrance and back. Inaccessible facilities MUST display their status and an actionable cause, receive no new leases or admitted visits, and resume eligibility when access is restored.
- **FR-019**: Travelers MUST reevaluate affected routes after a relevant edit. They MUST use a remaining valid route or abandon the visit and attempt to leave; when no exit exists, they MUST remain at a real surviving location with a visible stranded count/status and resume exit travel after access returns. Abandoned or stranded visits MUST NOT count as arrivals or completed destination trips.
- **FR-020**: Removing a facility MUST cancel its unstarted visits, prevent future admissions, and cause its present occupants to emerge at its surviving entrance to begin an exit journey. Safe removal and service-edit restrictions MUST match every applicable Edge Cases row, including protection of physically occupied stairs and loaded cars.
- **FR-021**: The view MUST show enough entering, walking, waiting, stair, riding, and exiting activity to distinguish rush and quiet periods. When people are visually grouped or hidden inside facilities, displayed counts and trip measures MUST still account for every simulated person.

#### Stairs and standard elevators

- **FR-022**: Stairs MUST connect exactly two adjacent existing floors at valid unoccupied landing spans. They MUST become usable immediately after a valid connection is constructed, take nonzero traversal time, and support the short-trip preference and fallback rules in FR-017 without detailed fitness or fatigue rules.
- **FR-023**: A standard MVP elevator MUST comprise an aligned vertical shaft, exactly one car, and at least two served landing floors. Its passenger capacity MUST be eight people, with each worker or customer occupying one slot. This limit MUST be defined in scenario data and fixed during play; weight classes, player capacity upgrades, and additional cars within a shaft are outside MVP scope. The player MUST be able to increase useful capacity before the first milestone by constructing additional independent shafts, each containing exactly one standard car.
- **FR-024**: The player MUST configure a contiguous service range within a shaft. Every level selected as a served stop MUST have a valid landing connected to walkable floor space; the shaft MUST fit inside site limits and its reserved span MUST NOT conflict with facilities or stairs. Reversed ranges, nonvertical geometry, missing landings, obstructions, and fewer than two valid stops MUST be rejected.
- **FR-025**: A person arriving at a valid elevator boarding stop MUST establish a persistent trip request and join its waiting group. Every standard car MUST use the fixed directional sweep in the assumptions, serving requested stops in floor order along its current direction, reversing when no requests remain ahead, and skipping floors without relevant requests. Idle pickup selection MUST choose the nearest requested floor, breaking equal-distance ties by lower floor. The car MUST stop, unload before boarding, and physically carry passengers to valid served destinations; it MUST NOT skip the journey or unload between floors. The MVP MUST NOT expose configurable scheduling algorithms.
- **FR-026**: At a stop, unloading MUST precede boarding. Car load MUST never exceed capacity. Eligible people unable to board because of capacity MUST remain waiting, retain their request, and record one denied boarding for that eligible car arrival; incompatible service or direction MUST NOT create a false denial.
- **FR-027**: Queueing MUST use a repeatable order and favor earlier eligible waiting people over later ones for the same service/direction. Waiting time and denied boardings MUST persist through multiple arrivals, rerouting, and queue changes. Finite reachable demand MUST eventually be served when adequate capacity exists and no construction change invalidates it.
- **FR-028**: Travelers MUST be able to choose or switch to useful added elevator service without double-counting people or resetting experience. The routing and boarding behavior MUST make sufficient added capacity reduce congestion in the controlled acceptance scenario; merely adding unused infrastructure MUST NOT confer a quality bonus.
- **FR-029**: Empty elevators without pending requests MUST settle at a valid stop and idle until called. Current position, direction, travel/stopped/boarding/unloading/idle state, passenger count, capacity, served range, and queue counts at every served floor MUST be inspectable while operating or paused.

#### Trip measures, congestion, and transportation quality

- **FR-030**: For each trip, the game MUST distinguish elapsed walking/stair time, elevator waiting time, elevator ride time, capacity denials, origin, intended destination, and outcome (active, completed, abandoned, or stranded). A completed trip requires physically reaching its goal; the outward and return legs are separate trips.
- **FR-031**: A tower traffic view MUST expose current unique waiting counts and waits by floor/stop, recent mean elevator waiting, denied boardings, completed trips, abandoned/stranded trips, and the reporting period and sample size. Completed-period results MUST remain available through the next corresponding rush so players can compare their last construction decision.
- **FR-032**: The game MUST display an aggregate transportation-quality score from 0 to 100 derived from actual recorded trip experience, with higher meaning better. Other things equal and away from score limits, adding waiting time MUST lower quality more than adding the same amount of ordinary elevator ride time, and adding repeated capacity denials MUST lower quality. The inspector MUST explain these influences in plain language.
- **FR-033**: The live quality indicator MUST use the last 60 simulated minutes of finished trips plus current unfinished trips, counting each trip once and including its accumulated experience. Abandoned trips retain their experienced penalties, and stranded or still-waiting people MUST NOT disappear from live feedback. With no samples it MUST display “No trips yet”; no automatic perfect score or infrastructure-count bonus is permitted.
- **FR-034**: The game MUST also retain the last completed morning cohort's wait, peak queue, and mean trip-quality results and the previous completed day's transportation quality. Morning-cohort measurement MUST follow the end-to-end scenario's measurement contract; unfinished or failed trips MUST remain identified rather than silently omitted. Full-day quality MUST include all trips active during that day with their experience recorded through completion or day end, counting each once.
- **FR-035**: A small tower with multiple occupied upper-floor offices and insufficient standard-elevator service MUST be capable of producing persistent visible rush queues, waits of at least 10 simulated minutes, repeated capacity denials, and declining quality. Providing enough useful elevator capacity MUST meet the improvements specified by the Congestion Loop scenario without reducing its demand.

#### Facilities, demand, and economy

- **FR-036**: Offices MUST distinguish vacant and leased status, assigned workforce, and physical presence. A daily leasing review MUST fill eligible accessible vacant offices only while enough finite market demand remains for their published workforce; lack of accessibility, level eligibility, or demand MUST be explained. Office construction alone MUST generate neither workers physically inside nor rent.
- **FR-037**: A leased office MUST earn rent while accessible, independently of whether its assigned workers are currently physically present. Losing access MUST retain its tenant but suspend further rent accrual and prevent workforce arrivals whose scheduled times occur while inaccessible; daily departure goals and costs continue. Restored access MUST permit remaining future arrivals, without replaying missed requests. Demolishing the office MUST terminate its lease and release its market allocation at the next leasing review.
- **FR-038**: Office inspection MUST show tenancy, assigned workforce, current physical presence, accessibility and vacancy/suspension reason, rent rate, recent income, and operating cost. Tower-level office market availability MUST be visible, and total allocated workforce MUST NOT exceed the scenario's current office market allowance.
- **FR-039**: An accessible restaurant MUST admit physically arriving customers, show current incoming demand and visitors, retain each visitor for their scheduled visit, charge the displayed per-visit amount once on admission, and then generate an exit journey. Failed, canceled, or inaccessible visits MUST earn no restaurant revenue.
- **FR-040**: Restaurant inspection MUST show its meal window, finite expected daily customer allocation, remaining scheduled/incoming demand, current visitors, recent revenue, visit price, operating cost, and accessibility. More restaurants MUST share the existing tower demand allowance rather than independently multiply unlimited demand; new demand allocations take effect at the next daily review.
- **FR-041**: The player MUST always be able to find current cash. Floor, office, restaurant, stair, elevator, and applicable demolition actions MUST have disclosed financial effects; offices and restaurants MUST disclose their income rules and every maintained structure MUST disclose its recurring cost, including zero-cost types.
- **FR-042**: Each balance change MUST have an inspectable financial event with simulated time, signed amount, reason, and relevant subject. Current cash MUST reconcile exactly to starting cash plus those events, at the smallest displayed currency denomination, without hidden rounding drift or duplicated charges.
- **FR-043**: Rent and recurring operating costs MUST accrue only for the eligible time a structure exists, at their published rates, and settle once at the daily billing boundary. Demolition MUST settle any already earned rent and incurred cost once, stop future accrual, and display those prior operating amounts separately from the demolition price. Such prior operating liabilities may make cash negative and MUST NOT prevent otherwise zero-cost demolition.
- **FR-044**: The financial view MUST report the last 24 simulated hours of posted income, expenses, and net cash change, labeled as a partial period during the first day. It MUST distinguish construction/demolition from operating income/costs and show the last completed day's operating net used for progression. Income minus expenses MUST equal the shown net for that period.
- **FR-045**: Construction with a positive charge MUST be rejected if cash is less than that charge. A nonnegative balance is not otherwise required for play: expenses may make cash negative, with a visible warning and continued inspection, simulation, existing services, income, costs, saving, and free demolition. No forced bankruptcy reset is required.

#### Progression and persistence

- **FR-046**: Progression MUST have an initial level and a first achieved milestone. The milestone MUST combine an assigned tenant population, occupied accessible offices, actual restaurant visits, nonnegative cash, a positive completed-day operating result, and satisfactory measured transportation. Default targets are stated in the assumptions and MUST be visible before the player tries to achieve them.
- **FR-047**: Progression MUST show the current level, every target, its current value, and unmet conditions. At a completed-day evaluation, a qualifying tower MUST receive a visible one-time milestone award, retain the attained level thereafter, and remain playable. Empty construction, stranded populations, zero transport samples, or instantaneous pre-billing cash MUST NOT substitute for operating evidence.
- **FR-048**: Initial prices, finite demand, starting cash, travel capacity, daily timing, and milestone thresholds MUST collectively allow a player to build a functional mixed tower, create and improve a bottleneck, earn an operating surplus, and reach the milestone within the normal-session success target. The milestone MUST NOT unlock transportation tools needed to achieve itself.
- **FR-049**: Local saving MUST retain tower bounds/geometry, facilities, stairs, shafts and service ranges, car positions/states/loads, people and queues, finances and pending accruals, time, progression, tenants and demand allocations, future schedules, goals, accumulated trip/reporting measures, seed, and continuation state needed for FR-011. Purely visual state need not be retained.
- **FR-050**: Every save MUST identify its format version. The MVP MUST load its supported format and reject unknown, unsupported, malformed, or internally inconsistent data with an understandable error before changing the active game. Earlier unsupported formats may be rejected; silent loss of fields or partial restoration is not acceptable.
- **FR-051**: Save MUST show unambiguous success or failure and preserve a previous valid local save if a replacement fails. Load MUST survive a normal refresh or reopening in the same browser profile, replace exactly one active simulation only after validation and any unsaved-progress confirmation, and initially pause at the saved simulated instant.
- **FR-052**: Saved and uninterrupted continuations MUST produce equivalent results through at least the following full simulated day when supplied the same subsequent timed actions. This MUST hold when saving during travel, queues, visits, and immediately around billing or progression evaluation, without duplicated revenue, occupants, requests, or awards.
- **FR-053**: Starting a new tower MUST offer cancellation if it would discard unsaved active progress, MUST leave existing local saves intact until an explicit save replacement, and MUST reset the new simulation's population, accounts, schedules, and progression to the selected new-game starting state.

#### Playability and bounded scale

- **FR-054**: All required stories and the congestion scenario MUST be achievable through the player-facing game without developer commands or edits during the play session. Construction errors, inaccessible destinations, financial warnings, and save/load errors MUST be understandable and leave a usable path to continued play.
- **FR-055**: The MVP MUST support at least 30 real minutes of continuous mixed construction, simulation, inspection, speed changes, and a save/reload without a crash, impossible occupant state, lost simulation, forced reset, or developer intervention.
- **FR-056**: At the representative scale in SC-012, normal-speed presentation MUST sustain at least 30 displayed frames per second over 95% of measured one-second intervals, and 95% of construction, selection, pause, and inspection actions MUST show a response within 150 milliseconds. These budgets also apply to response time at faster modes; at that scale their displayed simulated-time rates MUST be achieved without changing rules or dropping activity.
- **FR-057**: Save/load for the representative tower MUST each complete within two real seconds on the recorded reference desktop. Placement validity and user-visible routing/access status after a change MUST be available within 150 milliseconds for 95% of such changes, including when many occupants are active.

### Constitution Alignment *(mandatory)*

The existing [TowerSim constitution](../../.specify/memory/constitution.md) remains the source of engineering constraints. This specification states the player-visible contracts and required evidence; it defines the fixed MVP stop policy but does not select languages, frameworks, rendering systems, storage mechanisms, or internal representations.

- **Clean-Room Scope (CA-001)**: TowerSim's game identity, writing, visuals, and content MUST be original or appropriately permitted and unrelated to assets of prohibited proprietary games. Evidence: reviewable provenance for every shipped content/asset source and a release review of names and presentation against Constitution I.
- **Authoritative Simulation (CA-002)**: Construction, transport, finances, and progression MUST produce the same observable results when advanced without graphics as when played through the view. Evidence: repeat the state transitions and congestion scenario without a displayed scene and compare outcomes to the playable scenario (FR-006, FR-011, FR-035).
- **Determinism (CA-003)**: The seed and equally timed ordered player actions MUST reproduce daily schedules and continuation, independent of frame rate and speed. Evidence: SC-010 across multiple days, speed modes, and save/reload, including pending financial events. Randomness mechanisms remain governed by Constitution III.
- **Logical World and Transportation (CA-004)**: Changing the view MUST NOT change physical space; paths, finite capacity, queues, waits, travel, boarding failures, and transfers between walking and vertical travel MUST be real and measurable. Evidence: valid/invalid placement scenarios, viewport-change comparison, stair and elevator trips, and the complete congestion scenario (FR-003–008, FR-017–035).
- **Hybrid Processing and People (CA-005)**: People inside facilities MUST remain scheduled and counted without requiring visible animation; active and resting populations MUST behave correctly at the representative scale. Evidence: correct reappearance for departures, preserved physical-presence counts, and SC-012. Choices about when to process inactive people remain governed by Constitution VI–VII.
- **State and Content Models (CA-006)**: Occupant, elevator, facility, construction, and save/load states MUST have testable transitions and preserve identity across time and continuation. Evidence: every Edge Cases transition, one-location-per-person and finite-capacity checks, save comparison, and consistent displayed prices, schedules, demand, and targets (FR-013, FR-020, FR-025–027, FR-036–053). Content representation remains governed by Constitution VIII–IX.
- **Emergent Metrics (CA-007)**: Transportation feedback MUST reconcile to experienced trip measures, include waiting and unsuccessful travel, and react to useful construction. Evidence: controlled changes to wait, ride time, and denials; reconciled cohort totals; and SC-003–004. No arbitrary building-count penalty or reward substitutes for measured operation.
- **Economy and Saves (CA-008)**: Players MUST be able to reconcile financial activity and resume the same tower safely. Evidence: exact cash/history reconciliation, billing-boundary continuation, safe rejection of unsupported/corrupt saves, and SC-007/SC-011. Currency representation and compatibility obligations remain governed by Constitution XI–XII.
- **Browser and Deployment (CA-009)**: The released MVP MUST support then-current stable desktop Chrome, Firefox, and Safari, and locally available core play MUST continue without connectivity or accounts. Evidence: actual browser versions and observed story outcomes, a deployable static release check under Constitution XIII, and a disconnected-core-play exercise. Automated substitutes MUST NOT be reported as completed manual browser evidence.
- **Performance and Slice Scope (CA-010)**: The complete loop MUST remain playable for the stated duration and population, with the response, display, and save budgets below. Evidence: SC-001–004 and SC-012–014, measured on recorded hardware/browser versions. Future facilities and advanced transport controls remain excluded; implementation complexity and scaling practices remain governed by Constitution XIV–XVI.

### Key Entities *(include if feature involves data)*

- **Tower / scenario**: The building site, visible bounds, ground entrance, starting balance, day timing, seed, finite market allowances, and available progression targets.
- **Floor span**: A level and explicit horizontal extent of built, supported space with an automatic continuous shared walking path. Adjacent built spans connect; unbuilt gaps do not. Facility and transport footprints reserve placement space independently of this shared path.
- **Facility**: A lobby, office, or restaurant with a footprint, entrance, accessibility, operating state, prices/costs, and facility-specific occupancy or visiting information.
- **Office tenant**: A lease associated with one office, its assigned workforce, market allocation, eligibility, and accessible rent-earning periods; distinct from workers physically present.
- **Stair connection**: A connection between landing spaces on exactly two adjacent floors, with travelers taking nonzero time to traverse it.
- **Elevator**: A shaft with valid served range/stops and exactly one standard car in the MVP. The car has its own position, direction, activity, eight-person capacity, passenger list, and outstanding requests; each passenger consumes one slot. The MVP restriction does not require future car and shaft concepts to share an identity.
- **Occupant**: An individual worker or customer with a consistent identity, schedule, real location, destination goal, travel/visit state, and any active trip.
- **Trip and queue entry**: A person's intended journey, route, elapsed walking/waiting/riding, boarding denials, and outcome; a waiting entry identifies one actual person awaiting eligible service.
- **Daily demand and schedule**: Finite allocations and repeatable times for leasing, arrivals, visits, departures, billing, and evaluation, which create different daily traffic intensity.
- **Financial event / accrual**: A posted or pending income/expense amount with its time, reason, subject, and eligibility period, supporting exact reconciliation and one-time settlement.
- **Transportation report**: Labeled live, rush-cohort, and daily measures with sample populations, waits, queues, trip outcomes, and experience-based quality.
- **Progression record**: Current and attained level, the first milestone's published targets, current measured values, and award status.
- **Saved tower**: A versioned local continuation containing persistent tower and simulation information, distinct from transient visual presentation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001 — Complete player journey**: In first-play evaluation, at least four of five new players can start a tower, build multiple floors with offices and a restaurant, connect them with stairs and an elevator, see arrivals and departures, spend and earn money, and save/reload using only the game's guidance within 30 real minutes. No evaluator may repair their tower or simulation during the session.
- **SC-002 — Reachable progression**: At least four of those five players reach the first milestone within 30 real minutes using the available speed controls. A prepared qualifying tower earns the milestone once after a full operating day; each independently unmet condition prevents the award and is correctly identified.
- **SC-003 — Congestion and improvement**: The end-to-end congestion scenario passes in full: at least three successive queue-building arrivals, a wait of at least 10 simulated minutes, repeated denied boarding, then at least 30% less cohort mean waiting, 30% lower peak combined queue, and 10 points higher cohort transportation quality after sufficient useful capacity is added. Both configurations carry the entire identical cohort to its offices before the departure window.
- **SC-004 — Diagnosis and decision**: At least four of five new players can identify the congested stop, explain whether lack of capacity or lack of access is responsible, make a relevant construction improvement, and locate the resulting change in wait and quality reports without developer tools or explanation.
- **SC-005 — Construction and recovery**: Every invalid-placement class and safe-change case listed under Edge Cases produces its stated explanation and outcome. Rejection causes zero unintended cash/geometry changes; accepted edits leave zero people on removed space, zero invalid car loads, and zero visits incorrectly marked complete. Restoring the sole missing exit lets previously stranded occupants leave.
- **SC-006 — Daily traffic**: A reproducible occupied-office day contains at least three distinct morning arrival times and three distinct evening departure times; each rush hour's average request rate exceeds an equal-length quiet daytime window. At least 70% of a restaurant's daily requests fall within its meal window, with at least three distinct request times and fewer requests in any equal-length off-peak window. These comparisons measure scheduled demand rather than delayed physical arrivals.
- **SC-007 — Financial clarity**: In a full-day mixed tower scenario, every displayed cash balance reconciles exactly to starting cash plus financial history; recent income minus recent expenses equals reported net. Vacant offices and abandoned restaurant visits generate zero income. A viable tower produces positive operating net for a complete day after costs; an unaffordable construction attempt produces zero new charges.
- **SC-008 — Understandable occupancy**: Inspection correctly distinguishes leased workforce from physical presence before arrival, during work, and after departure, and distinguishes incoming restaurant customers from those inside. Every inaccessible facility identifies its missing route and becomes eligible again after repair.
- **SC-009 — Honest transport feedback**: With other trip experiences fixed and scores away from limits, equal additions to waiting and ride time reduce quality more for waiting; each additional capacity denial worsens quality. Still-waiting, abandoned, and stranded trips remain accounted for, and empty samples cannot satisfy progression. At least one overloaded full-day scenario fails the transport milestone condition while its adequately served counterpart passes it.
- **SC-010 — Repeatable time and continuation**: Across three explicit seeds and three full simulated days per seed, replaying the same actions at the same simulated instants under 30, 60, and 120 rendering frames per second, normal/fast/very-fast modes, and inserted pauses produces identical relevant game outcomes at matched simulated instants. Persisted continuation is included; only presentation differences are exempt.
- **SC-011 — Safe local persistence**: Save/reload at an idle moment, while a car is moving and passengers wait, during an occupied restaurant visit, and immediately before/after billing and milestone evaluation preserves equivalent next-day outcomes. Refresh and close/reopen continuation succeed in each supported browser with available local storage. Every malformed, unsupported, inconsistent, failed-write, and active-game replacement case preserves the correct prior state and reports its outcome without partial replacement.
- **SC-012 — Representative scale**: A valid reference tower with a lobby plus 12 upper floors, 24 offices, two restaurants, stairs, three standard elevator shafts, 2,000 scheduled occupants, and at least 500 simultaneously traveling or waiting meets FR-056–057 across a 10-real-minute rush-and-construction exercise on the recorded reference desktop in each supported browser. Normal-speed display meets the 30-frame budget for at least 95% of measured one-second intervals; 95% of the measured UI/access updates complete within 150 milliseconds; save and load each complete within two seconds. Faster modes achieve their published time rates and action-response budget. This is a performance qualification tower, not a demand or construction requirement for a new player.
- **SC-013 — Sustained playable session**: The full MVP supports a continuous session of at least 30 real minutes in each supported browser, including morning and evening rushes, meal demand, a congestion intervention, a safe demolition/access repair, a milestone award, and save/reload, without a crash, reset, developer intervention, lost progress, or impossible occupant state.
- **SC-014 — Browser and local play**: The complete player journey is verified in the release's stable desktop Chrome, Firefox, and Safari, with exact versions recorded. After initial game resources are available, disconnecting the network does not prevent construction, transport, schedules, finances, progression, or local saving/loading. Browser evidence and unmet manual checks are reported separately from automated simulation results.

## Assumptions

These defaults resolve unspecified behavior for planning. They are gameplay and evaluation assumptions, not a prescribed implementation. Balance values may be tuned during implementation, provided the published game values, acceptance fixtures, and this specification are kept consistent and the congestion, finite-demand, session, and milestone outcomes remain satisfied.

- **Platform and dependencies**: Single-player desktop browser play with a pointer and keyboard is the supported interaction context. Local save continuation assumes the same browser profile, site address, and available persistent storage; clearing browser data or private-session storage does not promise recovery. The game needs no account, backend, or external gameplay service. Initial delivery of game resources may require connectivity; installing an offline app is not required.
- **Reference desktop**: Performance qualification uses an Apple M1-class desktop with 16 GB memory or an explicitly recorded comparable machine, a 1440 × 900 gameplay viewport, and actual supported browsers. The chosen OS and browser versions are recorded when testing; this specification makes no claim that those checks have already run.
- **Day and speed defaults**: A new tower starts paused at 06:00 on day 1. A full day takes 12 real minutes at normal speed; fast is 4× and very fast is 8×. Default office arrival requests occur during 08:00–10:00, departure goals during 17:00–19:00, and meal demand concentrates during 11:30–13:30. These windows, clock, and relative speeds are visible to the player.
- **Leasing and demand**: Review vacancies and allocate the day's remaining office/restaurant demand at 06:00. The initial review occurs once when time first advances from the paused 06:00 starting state, so construction completed while initially paused is eligible. Offices built after a review may remain vacant until the next one and display that timing. Tenancies do not expire in the MVP, but access loss suspends their revenue under FR-037. Restaurant customers are external visitors; optional worker lunch trips between office and restaurant are a future extension, not required demand. Initial office demand supports at least three default offices, and initial restaurant demand supports at least one restaurant without prior progression.
- **Money and billing**: Prices, daily rates, and daily market allowances are visible before purchase. Daily rent/cost settlement occurs at 00:00 for the elapsed day before progression evaluation. Partial-day earnings/costs follow the eligible fraction of the published daily rate, rounded once to the nearest smallest displayed currency denomination, with half units rounded away from zero. Demolition has a default price of zero and no construction refund; previously earned or incurred operating amounts settle separately under FR-043. There are no emergency loans, interest charges, or automatic asset sales.
- **Affordable starter tower**: Starting cash funds three additional full useful floors, three default offices, one restaurant, stairs linking those floors to the lobby, one complete standard elevator serving them, and the first full day's operating costs. Earned revenue makes at least one further useful elevator affordable before the milestone; an efficient player may reserve initial funds for it. Footprint sizes, site width/height, costs, workforce per office, and elevator capacities are published scenario values and must allow this setup. The performance qualification tower may use a larger finite demand allowance than the new-game scenario.
- **Spatial defaults**: Each constructed floor span includes a continuous shared walking path connected to directly adjacent built spans, even alongside facility and shaft footprints; unbuilt gaps break the path. Facilities and shafts consume placement space without obstructing this path, and there is no corridor-building tool. Floor support follows FR-004. Elevator shaft spans reserve placement space through their full vertical range, with traversable landings at served floors; structural engineering, gravity, and collapse are outside scope. The MVP uses exactly one eight-person car per shaft and a contiguous served range. Added capacity requires additional standard shafts; capacity upgrades, multiple cars in one shaft, multi-car controls, and selective express stops are excluded.
- **Elevator capacity default**: Every standard car holds eight people, and workers and customers each consume one slot. Capacity is a scenario value fixed during play, with no weight classes or player upgrades. Later balance changes must keep scenario data, published values, this specification, and acceptance fixtures consistent; the eight-person default still requires implementation evidence for the congestion and session targets.
- **Elevator stop policy**: All standard cars use one fixed directional sweep. In the current direction, stop in floor order for onboard destinations and matching-direction pickups, including pickups where capacity may deny boarding. Continue toward outstanding requests ahead; an opposite-direction pickup can be the farthest request and become the reversal stop, where its passengers become eligible after reversal. Reverse when no requests remain farther ahead; do not reverse between floors or leave an onboard destination unserved. Skip floors without a relevant pickup or unloading request. An idle empty car chooses the nearest pickup floor, with lower floor breaking equal-distance ties, then serves the waiting direction. With no requests, the existing idle-car rule applies. This policy adds no express zoning, destination dispatch, sky lobbies, or player-configurable scheduling.
- **Safe edits and stalled trips**: The restrictions and stranding behavior in Edge Cases are the MVP recovery policy. Losing a route may leave a person temporarily stranded; the game clearly identifies the affected floor and allows the player to restore a route. The policy never silently removes people to improve queues or satisfaction. Occupants are not subject to simulated injury, fatigue, or rescue services.
- **Restaurant visits**: Each generated customer makes one lobby-to-restaurant visit and one return journey, paying once on admission. Visit durations are finite, nonzero, and repeatable for a fixed seed. Daily market allowance is the required bound on customers; detailed seating, table queues, menus, stock, or staffing simulation is excluded.
- **Transportation reports**: Quality uses actual cumulative trip experience and applies consistently to live, cohort, and daily reports, with scope and sample count labeled. Morning cohort reporting tracks office workers scheduled in that morning window. A zero-sample or unfinished cohort is labeled accordingly; progression uses completed-day evidence plus unresolved trips, not the live score alone. Normal elevator travel is not failure; disproportionate waiting and repeated inability to board are the principal negative signals. Exact weighting may be tuned subject to FR-032 and SC-003/SC-009.
- **Initial milestone defaults**: Start at Level 1 and award Level 2 after one complete 00:00–24:00 operating day meets all conditions: at least three leased accessible offices with at least 80 assigned workers maintained throughout that day; at least one accessible restaurant with at least 10 admitted visits during it; nonnegative cash after daily settlement; a strictly positive daily operating net; daily transportation quality of at least 60/100 with at least 80 completed office arrival trips; and zero stranded occupants or unresolved prior-day trips at evaluation. The first partial starting day cannot qualify. Level 2 remains earned and visible; additional levels, unlocks, and level loss are not required.
- **Balancing and independent acceptance**: A small default office workforce is sufficient for the starter progression targets in combination. The overloaded fixture is intentionally under-capacity but can clear its morning wave before departures; the improved fixture adds enough standard shafts to meet the numeric comparison targets. Independent story fixtures provide their stated geometry, funds, occupancy, time, and seed without requiring a tester to play previous stories. The end-to-end and new-player success checks still require ordinary gameplay.
- **Future possibilities, outside this MVP**: Hotels; condominiums; retail beyond the small restaurant; parking garages; subway/metro stations; security; housekeeping; service elevators; express elevators; escalators; sky lobbies; multiple elevator dispatch algorithms; complex transfer-floor strategies; multi-car shaft controls; player elevator-capacity upgrades; disasters; fires; VIP characters; complex tenant categories, negotiation, rent-setting, and regional markets; multiplayer; backend accounts; cloud saves; mobile-specific UI; mod/plugin systems. These are scope records only and do not authorize implementation.
