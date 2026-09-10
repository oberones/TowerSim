<!--
Sync Impact Report
- Version change: unratified template → 1.0.0
- Modified principles: none; this is the initial ratification
- Added principles:
  - I. Clean-Room Original Implementation
  - II. Simulation Is the Product Core
  - III. Deterministic Simulation
  - IV. Fixed Logical World
  - V. Transportation Is a First-Class Simulation System
  - VI. Hybrid Simulation Model
  - VII. Individual People, Lightweight Representation
  - VIII. Explicit State Machines
  - IX. Data-Driven Content
  - X. Emergent Metrics Over Arbitrary Penalties
  - XI. Event-Based Economy
  - XII. Save Games Are a Public Contract
  - XIII. Browser-First, Static Deployment
  - XIV. Performance Is a Gameplay Requirement
  - XV. Playable Vertical Slices
  - XVI. Understandable Over Clever
- Added sections:
  - Required Quality Evidence
  - Development Workflow and Quality Gates
- Removed sections: none
- Templates reviewed or updated:
  - ✅ .specify/templates/plan-template.md updated
  - ✅ .specify/templates/spec-template.md updated
  - ✅ .specify/templates/tasks-template.md updated
  - ✅ .specify/templates/constitution-template.md reviewed; no change required
  - N/A .specify/templates/commands/*.md; directory is not present
  - ✅ AGENTS.md reviewed; no change required
- Follow-up TODOs: none
-->
# TowerSim Constitution

## Core Principles

### I. Clean-Room Original Implementation (NON-NEGOTIABLE)

TowerSim MUST be an original implementation inspired only by general tower-management
simulation concepts. The project MUST NOT contain code, artwork, text, sounds, maps,
names, or other assets copied from or derived from SimTower, Yoot Tower, or any other
proprietary game. TowerSim MUST NOT present itself as an official, authorized, or
affiliated SimTower product. General concepts such as floor construction, rentable
facilities, occupant transportation, elevators, congestion, finances, schedules, and
progression MAY be implemented only through independent design and authorship.

Rationale: a clean-room boundary protects the project's originality while allowing the
genre's general mechanics to be explored independently.

### II. Simulation Is the Product Core (NON-NEGOTIABLE)

The authoritative game simulation MUST be independent of rendering, DOM state,
browser events, animation timing, and UI frameworks. Automated tests MUST be able to
instantiate a game, issue commands, advance simulation time, and inspect outcomes
without a renderer or browser UI. The presentation layer MAY observe simulation state
and issue commands, but it MUST NOT own authoritative game rules or duplicate
authoritative state.

Rationale: a headless simulation boundary makes the defining gameplay testable,
portable, and resistant to presentation-layer regressions.

### III. Deterministic Simulation (NON-NEGOTIABLE)

Given the same initial game state, simulation seed, ordered player commands, and
ordered simulation ticks, TowerSim MUST produce the same simulation outcome.
Simulation randomness MUST use a seedable pseudo-random number generator behind an
explicit abstraction. Simulation systems MUST NOT call `Math.random()` directly.
Rendering frame rate, animation progress, browser scheduling, and wall-clock timing
MUST NOT change simulation outcomes.

Rationale: reproducibility is required for reliable tests, debugging, replays, and save
compatibility.

### IV. Fixed Logical World (NON-NEGOTIABLE)

The tower MUST use logical coordinates independent of screen pixels. Facilities,
floors, elevators, occupants, paths, and construction rules MUST operate in world-space
units. Camera position, viewport size, and zoom MUST remain presentation concerns.
Maximum tower width, vertical range, and other world limits MUST come from scenario or
world configuration rather than hard-coded assumptions in game systems.

Rationale: a stable logical world prevents display choices from altering simulation
rules and allows scenarios to vary without system rewrites.

### V. Transportation Is a First-Class Simulation System (NON-NEGOTIABLE)

Occupants MUST physically and logically travel between destinations through a
transportation network; movement MUST NOT be cosmetic. The system MUST model
horizontal walking, stairs, elevator stops, elevator queues, elevator cars, and
transfers between transport modes. Elevators MUST NOT act as instant teleportation.
Queueing, capacity, travel time, and failed boarding MUST be meaningful simulation
events.

Interfaces and data models MUST permit future extension to multiple cars and shafts,
express service, transfer or skylobby floors, configurable stops, and alternative
dispatch strategies. Those advanced behaviors are not required in the MVP unless its
specification includes them.

Rationale: transportation pressure and its observable consequences form a central
management challenge rather than visual decoration.

### VI. Hybrid Simulation Model (NON-NEGOTIABLE)

The simulation SHOULD combine fixed-timestep updates for continuously active systems
with scheduled events for inactive or future behavior. Entities that require no
continuous processing SHOULD sleep until an event activates them. A worker inside an
office until departure and a future financial transaction SHOULD therefore avoid
per-tick processing. Plans that choose a different model MUST explain why it is simpler
or more suitable without introducing scans of every simulated person on every tick.

Rationale: hybrid processing preserves understandable time semantics while avoiding
work that cannot affect the current outcome.

### VII. Individual People, Lightweight Representation (NON-NEGOTIABLE)

TowerSim SHOULD simulate individual occupants whenever doing so makes transportation
behavior understandable. Each person MUST remain a lightweight simulation record, not
a DOM, Canvas, framework, or rendering object. Simulation entities and rendered
sprites MUST be separate concepts. Occupant state MUST distinguish, as applicable,
active, dormant, queued, walking, inside an elevator, inside a facility, and leaving
the simulation. The representation SHOULD reasonably support thousands of occupants
without requiring one DOM element per person.

Rationale: individual trips make congestion legible while separation and lightweight
records keep large towers practical.

### VIII. Explicit State Machines (NON-NEGOTIABLE)

Behavior with multiple phases SHOULD use explicit state machines rather than implicit
combinations of boolean fields. This rule applies especially to occupants, elevator
cars, construction tools, facility lifecycles, and loading or saving workflows.
Important transitions, invalid transitions, and state invariants MUST be directly
testable. A plan that uses another representation MUST document how it preserves the
same clarity and testability.

Rationale: explicit transitions make complex temporal behavior easier to verify,
debug, and extend.

### IX. Data-Driven Content (NON-NEGOTIABLE)

Facility types, occupant archetypes, schedules, economic values, progression
requirements, and similar content SHOULD be represented as data wherever practical.
Adding a facility type SHOULD normally require a new definition and composition of
supported behaviors, not changes across unrelated systems. Designs MUST prefer
composition over deep class hierarchies unless the plan justifies an exception. Stable
internal IDs MUST remain separate from display names.

Rationale: data-driven composition expands content without coupling every addition to
core engine changes or localized presentation text.

### X. Emergent Metrics Over Arbitrary Penalties (NON-NEGOTIABLE)

Player-facing outcomes SHOULD derive from measurable simulation behavior wherever
practical. Transportation MUST record meaningful trip information needed by the
feature, such as walking time, waiting time, elevator ride time, transfers, and denied
boardings. Satisfaction and transportation quality SHOULD derive from such experiences
rather than periodic penalties disconnected from simulation activity. Any proxy metric
MUST be documented and traceable to an observable event or state.

Rationale: outcomes grounded in simulated experience help players understand cause and
effect and make balancing evidence-based.

### XI. Event-Based Economy (NON-NEGOTIABLE)

Financial state MUST change through explicit financial transactions or equivalent
auditable events. Currency MUST use integer minor units and MUST NOT use floating-point
arithmetic for authoritative balances. Financial UI MUST derive its values from the
authoritative economy state rather than maintain a separate balance.

Rationale: auditable integer transactions prevent hidden mutations, display drift, and
rounding ambiguity.

### XII. Save Games Are a Public Contract (NON-NEGOTIABLE)

Every saved game MUST declare a format version. Persistent simulation state MUST NOT
contain DOM objects, Canvas state, callbacks, framework objects, or other
presentation-specific values. Every persistent-state change MUST consider backward
compatibility and migration, and the plan MUST state whether it preserves, migrates,
or deliberately rejects earlier formats. Malformed or unsupported saves MUST fail
safely without corrupting authoritative state.

Rationale: players depend on saved state outliving implementation details and normal
evolution of the game.

### XIII. Browser-First, Static Deployment (NON-NEGOTIABLE)

Released gameplay MUST run in the then-current stable Chrome, Firefox, and Safari
versions. Core gameplay MUST NOT require a backend, authentication, a remote database,
or continuous network connectivity. The production build MUST be deployable as static
assets. Any optional network integration MUST degrade without changing the availability
or authority of core local gameplay.

Rationale: static, local-first delivery keeps the game broadly accessible and avoids
making core simulation depend on service availability.

### XIV. Performance Is a Gameplay Requirement (NON-NEGOTIABLE)

Architecture MUST avoid one DOM element per person, one DOM element per world cell,
unnecessary per-frame scans of all simulation entities, unnecessary allocation inside
hot simulation loops, and pathfinding from scratch on every rendering frame. Teams
MUST profile before adding complex optimizations, while preserving an architecture
capable of large towers and several thousand simultaneous occupants. Feature
specifications MUST define measurable budgets when they add or materially affect a hot
path, population scale, rendering load, or pathfinding behavior.

Rationale: congestion at meaningful scale is part of the game, so simulation and
presentation performance directly affect playability.

### XV. Playable Vertical Slices (NON-NEGOTIABLE)

Development MUST proceed through coherent playable milestones. Every major milestone
MUST leave the project runnable and testable. The MVP MUST validate the central loop of
construction, occupancy, transportation, feedback, and management decisions before
broad content expansion. Speculative systems MUST NOT be added unless they support an
identified current or near-term feature.

Rationale: vertical slices expose integration risks early and keep effort tied to
demonstrable player value.

### XVI. Understandable Over Clever (NON-NEGOTIABLE)

Implementations SHOULD favor straightforward algorithms, explicit interfaces,
descriptive names, and documented invariants over clever abstraction. Complexity MUST
be justified by a concrete current or near-term requirement. Code and simulation
behavior MUST remain approachable enough to reason about, test, and debug.

Rationale: understandable systems are safer to evolve as interacting simulation rules
and entity counts grow.

## Required Quality Evidence

Every feature MUST provide evidence proportional to the constitutional rules it
touches:

- Simulation changes MUST have headless automated tests of commands, ticks, outcomes,
  important transitions, and invariants.
- Random or time-dependent behavior MUST have deterministic fixtures using explicit
  seeds, command sequences, and tick counts.
- Transportation changes MUST test routing, queues, capacity, elapsed travel, transfers
  when supported, and failed boarding when applicable; player-facing metrics MUST be
  traceable to recorded trip experience.
- Economy changes MUST test transaction history and integer balance derivation. Save
  changes MUST test round trips, supported migrations, and safe rejection of malformed
  or unsupported data.
- New content and assets MUST have reviewable provenance showing independent creation
  or permission for a source unrelated to prohibited proprietary games. Content MUST
  use stable internal IDs independently of display names.
- Browser-facing milestones MUST verify the applicable gameplay slice in current
  stable Chrome, Firefox, and Safari and MUST verify a static production build. Missing
  manual or platform evidence MUST be reported as unverified, not inferred from other
  automated results.
- Performance-sensitive work MUST define representative scale and measured budgets.
  Profiling evidence MUST precede complexity introduced solely as an optimization.

## Development Workflow and Quality Gates

Specifications MUST identify the playable slice, authoritative simulation behavior,
relevant state machines, data definitions, observable metrics, persistence impact,
browser behavior, and measurable scale or performance expectations. Requirements that
do not apply MUST be marked as such with a reason rather than silently omitted.

Every implementation plan MUST complete its Constitution Check before research and
repeat it after design. The check MUST describe how simulation and presentation remain
separated, how determinism is preserved, how world and transportation rules are
modeled, and how applicable economy, save, browser, clean-room, and performance
contracts will be verified. A deliberate violation of a MUST principle requires an
entry naming the principle, why compliance is impractical, alternatives considered,
consequences, and whether the violation is temporary or permanent. Convenience alone
is not sufficient justification.

Tasks MUST assign ownership for all applicable constitutional evidence within the
earliest relevant setup, foundational, or user-story phase. Quality work required by a
story MUST NOT be deferred to a generic final polish phase. Each milestone MUST end
with a runnable build and its planned automated checks; release claims MUST distinguish
automated evidence from browser, visual, or other manual evidence.

## Governance

This constitution governs and supersedes conflicting guidance in TowerSim
specifications, plans, tasks, reviews, and implementations. Each specification and plan
review MUST verify compliance, and each implementation review MUST cite the tests,
measurements, provenance, or manual checks that satisfy applicable principles.

Amendments MUST be proposed as an explicit constitution change, state their rationale
and migration impact, update dependent templates and runtime guidance in the same
change, and pass a consistency review before adoption. An amendment takes effect when
approved by a project maintainer and merged into the repository.

Constitution versions follow semantic versioning: MAJOR for incompatible governance
changes or principle removals or redefinitions, MINOR for new principles or materially
expanded obligations, and PATCH for clarifications that do not change obligations.
The Sync Impact Report MUST record the version decision and propagation status.

A deliberate violation of a MUST principle MUST document the affected principle, why
compliance is impractical, alternatives considered, consequences, and whether the
violation is temporary or permanent. Temporary violations MUST name a remediation
condition or follow-up. Implementation convenience alone MUST NOT weaken this
constitution.

**Version**: 1.0.0 | **Ratified**: 2026-09-09 | **Last Amended**: 2026-09-09
