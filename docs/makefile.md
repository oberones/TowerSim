# Makefile workflows

Run commands from the repository root. The Makefile works with macOS GNU Make 3.81 and delegates toolchain operations to the existing npm scripts.

```sh
nvm use             # Select the pinned Node 24 runtime from .nvmrc
make install        # npm ci using the committed lockfile
make help           # Also the default when running make without arguments
make dev            # Live-reloading game at http://127.0.0.1:5173/
```

## Manual validation between phases

```sh
make manual-test
```

This runs **all unit/integration tests**, builds release `dist/` and the production-mode fixture artifact `dist-browser-test/` with their static checks, checks that the fixture is isolated from release, then launches the fixture chooser at **http://127.0.0.1:4174/**. A failing check stops the command before the server starts. `make manual` is an alias. Benchmarks are a separate `make bench` or `make phase-check` step.

Choose a starting fixture before play, then use ordinary game controls. Current choices include the one-worker visible approach, one-worker same-floor office, default paused site, narrow site with negative ground, and a validated completed boundary. The visible approach uses one worker and starts shortly before arrival for observation; its walking pace now matches default release content, which retains its normal 32-worker workforce. Fixtures come from the existing harness, so later phases can add scenarios without changing the Makefile.

Leave the command running while testing. Press **Ctrl-C** to stop it. There are no background daemons or saved PID files. Run `make preview` in another terminal to smoke-test the release artifact already built by `manual-test`, at **http://127.0.0.1:4173/**. For a freshly rebuilt release instance alone, use `make serve`.

```sh
make manual-test OPEN=1             # Ask Vite to open the fixture page
make manual-test TEST_PORT=4184     # Use another explicit fixture port
make preview PREVIEW_PORT=4183      # Serve the existing release on another port
make preview-browser               # Reuse an existing fixture build without rerunning checks
```

Servers bind to loopback by default and use `--strictPort`: an occupied port fails instead of silently switching origins. Stop the existing process or choose another port explicitly. `HOST`, `DEV_PORT`, `PREVIEW_PORT`, and `TEST_PORT` are overridable; `OPEN=1` opts into opening a browser. Different ports are different browser-storage origins. Neither the fixture launch nor passing automated checks marks a manual acceptance task complete. Record actual browser observations using [the evidence procedure](../tests/browser/README.md), including both artifact identities. Publish only `dist/`.

## Automated checks and maintenance

| Command | Purpose |
| --- | --- |
| `make check-env` | Check supported Node and installed development dependencies. |
| `make install` / `make deps` | Install exact locked dependencies; `npm ci` replaces the installed dependency tree. |
| `make check` | Types, architecture boundaries and descriptive function comments. |
| `make check-types` | Simulation, browser and test TypeScript projects. |
| `make check-boundaries` | Simulation import/global restrictions and checker regressions. |
| `make check-comments` | Production function-comment coverage. |
| `make test` | All unit and integration tests. |
| `make test-unit` / `make test-integration` | One test project. |
| `make test-watch` | Interactive Vitest watch mode; stop with Ctrl-C. |
| `make bench` | All restored-trial benchmarks; reports in `benchmark-results/`. |
| `make build` | Checked production build. |
| `make build-browser` | Checked production-mode fixture build. |
| `make check-browser-builds` | Shared app/settings and release-fixture isolation checks; builds in memory. |
| `make verify` | Unfiltered tests, both checked builds, then isolation checks. |
| `make phase-check` | `verify` followed by benchmarks. |
| `make clean` | Generated build/coverage/benchmark directories and Vite cache; retains dependencies, source, saved evidence and browser storage. |

Use `TEST_ARGS` for focused debugging. It is deliberately ignored by `verify`, `phase-check`, and `manual-test`, which always run the full test suite:

```sh
make test-unit TEST_ARGS=tests/unit/office-leasing.test.ts
make test-integration TEST_ARGS=tests/integration/one-worker-walk.test.ts
make test-watch TEST_ARGS=tests/unit/office-leasing.test.ts
```

`NODE` and `NPM` can override executable names or paths. Both must use the supported Node runtime; the simplest setup is `nvm use`. Build/cleanup targets run serially even with `make -j` because they share output directories. Avoid separate concurrent build or cleanup processes while observing an artifact. Builds check the existing dependency installation; only the explicit install targets run `npm ci`.
