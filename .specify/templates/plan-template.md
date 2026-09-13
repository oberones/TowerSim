# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [e.g., library/cli/web-service/mobile-app/compiler/desktop-app or NEEDS CLARIFICATION]  
**Simulation Time**: [fixed timestep, events, activation/sleep, or N/A with rationale]
**Randomness**: [seed format and PRNG abstraction, or N/A with rationale]
**World Configuration**: [logical units, configurable bounds, and relevant scenario limits]
**Rendering Approach**: [simulation-to-presentation boundary and rendering technology]
**Persistence**: [save format/version/migration approach, or N/A]
**Browser/Deployment**: [Chrome/Firefox/Safari verification and static-build approach]
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Clean-room originality**: Identify code/content/asset provenance and confirm the
  feature neither copies proprietary game material nor implies official affiliation.
- **Simulation boundary**: Show that authoritative rules and state remain headless,
  command-driven, tick-driven, and independent of DOM, rendering, wall-clock, and UI
  framework state.
- **Determinism**: Define seeds, PRNG abstraction, command ordering, tick semantics,
  and deterministic test fixtures. Confirm simulation code never calls
  `Math.random()` directly.
- **Logical world**: Define world-space units and scenario-derived bounds; keep camera,
  zoom, and pixels out of authoritative rules.
- **Transportation**: Model applicable walking, stairs, stops, queues, cars, capacity,
  travel time, transfers, and failed boarding without teleportation; preserve extension
  points for advanced elevator service.
- **Hybrid processing and lightweight people**: Separate continuous updates from
  scheduled or dormant work and avoid full-population tick scans, rendering objects in
  simulation records, and one DOM element per person.
- **Explicit state and data**: Name state machines, transitions, invariants,
  data-driven definitions, composed behaviors, and stable IDs affected by the feature.
- **Emergent metrics**: Identify recorded trip or gameplay facts and show how derived
  player-facing outcomes trace back to those facts.
- **Economy**: Route monetary changes through auditable events using integer minor
  units and derive UI values from authoritative economy state.
- **Save contract**: State save-version, compatibility, migration, round-trip, and safe
  failure impacts. Confirm persistence excludes presentation/framework objects.
- **Browser and static delivery**: Plan current stable Chrome, Firefox, and Safari
  verification, offline-capable core play, and static production output.
- **Performance**: Define representative tower/population scale, measurable budgets,
  profiling evidence, and protection from prohibited per-frame or per-entity traps.
- **Playable slice and clarity**: Demonstrate a runnable, independently testable
  milestone; reject speculative scope and justify necessary complexity.

Any non-applicable gate MUST be marked N/A with a concrete reason. Any deliberate MUST
violation MUST be recorded in Complexity Tracking with the principle, impracticality,
alternatives, consequences, and temporary or permanent status.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Impracticality | Alternatives | Consequences | Status / remedy |
|-----------|----------------|--------------|--------------|-----------------|
| [XIV: full scan] | [constraint] | [options] | [impact] | [status; remedy] |
