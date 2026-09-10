# TowerSim boundary contracts

These Markdown contracts define planned TypeScript/API behavior; they are not implementation code or HTTP endpoints. Core gameplay is local and has no backend.

| Boundary | Owner and contract |
| --- | --- |
| Ordered domain commands and tick advancement | [simulation.md](simulation.md): headless simulation API; application translates browser intent. |
| Route and elevator requests | [navigation-transport.md](navigation-transport.md): logical movement, queue/service and dispatch boundaries. |
| Save/load repository and schema | [persistence.md](persistence.md): application port, pure DTO codec/validation, native IndexedDB adapter. |
| Queries, snapshots, pacing and input | [presentation.md](presentation.md): application sessions, read-only renderer/UI views, platform timing. |

Dependency flow: browser/platform → application → domain. Application declares persistence/platform ports; adapters implement them. Domain owns gameplay commands/state and imports neither application nor adapters. Data definitions are injected as validated plain records. A boundary/import check and separate TypeScript projects enforce this direction.

External input is never a direct GameState mutation. All contracts return typed success/failure and stable error codes plus enough data for a useful UI explanation. Display wording may change; code and entity IDs remain stable. A valid save is the public persistence contract; internal caches are not.
