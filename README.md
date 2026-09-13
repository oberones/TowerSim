# TowerSim

A deterministic desktop browser tower game. Build floors and offices, connect real walking and stair routes, manage eight-person elevators and queues, earn restaurant and rent income, reach Level 2, and save active traffic locally.

The gameplay loop is implemented. **Release qualification remains blocked** by the explicitly open native-browser, player-evaluation and performance gates in [release evidence](docs/release-evidence.md). Passing the automated build does not certify those gates.

## Run locally

Install Node through your existing version manager, then use the pinned runtime and lockfile:

```sh
nvm use
npm ci
npm run dev -- --host 127.0.0.1
```

Open the URL printed by Vite. The game starts paused at 06:00. Follow **Start here — build a thriving tower** in the game. Numeric construction fields support the same commands as pointer placement. The **Inspect and manage** links open reports and move keyboard focus to the chosen panel.

Keys: F floor, O office, R restaurant, S stairs, E elevator, D floor demolition, I inspect, Escape cancel; Space pause/resume; 0 pause, 1 normal, 2 fast, 3 very fast. Form inputs and modal dialogs retain their native keyboard behavior. Use Shift-drag, scrolling or Up/Down arrows on the canvas to pan vertically. Zoom only with the Zoom in and Zoom out buttons. Remove facilities and connections through their inspectors.

Normal runs 120 simulated seconds per real second (a 12-minute day), with 4× and 8× modes. People walk on the same floor. One-/two-floor trips choose the nearest usable stair or elevator entrance; longer trips prefer elevators and use stairs when no elevator route is available. Pausing preserves real trips and permits edits. Hidden tabs automatically pause and require explicit resume. Saves use one explicit IndexedDB slot in the same browser profile and origin. Load restores the saved instant paused; elapsed time outside the game adds no simulation time. New Game leaves the saved slot intact.

## Validate changes

```sh
npm run check:release
npm run test:integration
npm run bench
```

`check:release` runs every unit/integration test, including the required congestion comparison, strict TypeScript, domain import/global boundaries, descriptive function comments, both production builds and release/fixture isolation. Benchmarks run separately without coverage: three warmups, ten independently restored trials, matching canonical digests and JSON in `benchmark-results/`. See [headless results](docs/performance/headless-results.md) for scope and remaining budget failures.

Focused examples:

```sh
npm test -- tests/unit/keyboard.test.ts tests/unit/diagnostic-queries.test.ts
npm run test:congestion
node scripts/profile-reference.mjs
```

The profiler prepares the reference tower outside recording, then records 30 simulation ticks to `/private/tmp/towersim-reference.cpuprofile`. It reports domain CPU cost, not browser FPS. Expand **Development diagnostics** in `npm run dev` for read-only state and achieved-rate information; diagnostics are excluded from production builds.

## Static hosting

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

Publish **only the contents of `dist/`** using your static host's normal release process. Assets use relative URLs, so the same directory can be mounted at `/` or, for example, `/towersim/` with its trailing slash. Serve `index.html` as the directory index, return 404 for missing assets, and use HTTPS on a public host. No application server, account, remote gameplay service, CDN import or service worker is required. Do not use `file://` for storage qualification. Vite preview is a local verification server, not the production host.

A local root/subdirectory check, without deploying:

```sh
mkdir -p /tmp/towersim-static/towersim
cp -R dist/. /tmp/towersim-static/
cp -R dist/. /tmp/towersim-static/towersim/
python3 -m http.server 4180 --bind 127.0.0.1 --directory /tmp/towersim-static
```

Open `http://127.0.0.1:4180/` and `http://127.0.0.1:4180/towersim/`. These share an origin and therefore the local save slot. After initial resources load, disconnected core play/save/load must be observed separately; offline refresh is not promised. Changing scheme, hostname or port changes the storage origin. Retain a previous complete `dist/` for host rollback; never combine HTML from one build with assets from another. This repository task does not publish or deploy the game.

## Browser validation fixtures

```sh
npm run build:browser-test
npm run check:browser-builds
npm run preview:browser-test -- --host 127.0.0.1 --port 4174 --strictPort
```

`dist-browser-test/` is a separate production-mode fixture application using the same game entry. Choose a starting fixture, then use ordinary controls. The performance fixture includes a bounded frame/action recorder; its output explicitly identifies prepared-artifact evidence. For a reference release check, Save in the fixture build, stop its server, then serve `dist/` at the exact same origin and Load in the same browser profile. See [validation procedures](specs/001-playable-tower-mvp/validation.md) for the 10-minute reference exercise, 30-minute mixed sessions, storage failure cases and five-new-player protocol.

`make help` lists equivalent convenience targets; `nvm use && make install && make manual-test` runs unfiltered tests and checked builds before starting the fixture server.

## Architecture and authorship

Strict TypeScript simulation → application session/ports → native Canvas/DOM and IndexedDB adapters. Authoritative state uses integer time/money, seeded xoshiro128**, stable IDs, real travel and bounded histories. Presentation state and clocks stay outside saves. No production package dependencies.

Read [AGENTS.md](AGENTS.md), the [implementation plan](specs/001-playable-tower-mvp/plan.md), [data model](specs/001-playable-tower-mvp/data-model.md), [contracts](specs/001-playable-tower-mvp/contracts/README.md), [task status](specs/001-playable-tower-mvp/tasks.md) and [provenance](docs/provenance.md) before changing behavior.

### Compact controls

The left palette contains build tools. **Tower details** opens a dismissible panel with tabs for floor editing, offices and people, connections, restaurants, Level 2, finances and traffic. Reports and the starter walkthrough are hidden initially. Clicking a built object in Inspect mode reveals its details.

Choose a build tool and click the tower for a preview. Drag the preview or **Move** handle to position it, then confirm on the object. Floors start at **24 cells** and have grabbable left/right edges: drag either edge to resize. Choosing Floor keeps the information panel closed. Offices and restaurants keep their predefined size. Elevator previews have an **Elevator top floor** field, and moving them preserves their height. Arrow keys on **Move** nudge any preview by one cell or floor.

Nothing is built or charged until confirmation. Cancel, Escape, or another tool discards the proposal. Pan and zoom preserve the pending world location. Floor demolition retains its span controls, and existing elevator service-range editing remains in **Tower details → Connections**.
