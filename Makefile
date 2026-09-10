# Convenience entrypoints; package.json remains the owner of toolchain commands.
# Compatible with the GNU Make 3.81 supplied by macOS.
SHELL := /bin/sh
.DEFAULT_GOAL := help

# Builds, cleanup and previews share output directories. Keep them ordered even
# when make is invoked with -j; run simultaneous servers in separate terminals.
.NOTPARALLEL:

NPM ?= npm
NODE ?= node
HOST ?= 127.0.0.1
DEV_PORT ?= 5173
PREVIEW_PORT ?= 4173
TEST_PORT ?= 4174
OPEN ?= 0
TEST_ARGS ?=
OPEN_FLAG = $(if $(filter 1,$(OPEN)),--open,)

.PHONY: help check-node check-env install deps dev check check-types \
	check-boundaries check-comments test test-unit test-integration test-watch \
	bench build build-browser check-browser-builds verify phase-check \
	preview preview-browser serve manual-test manual clean

help: ## List commands and configurable ports (default target).
	@printf 'TowerSim development commands\n\n'
	@awk 'BEGIN { FS = ":.*## " } /^[a-zA-Z0-9_-]+:.*## / { printf "  %-22s %s\n", $$1, $$2 }' Makefile
	@printf '\nOptions: HOST=%s DEV_PORT=%s PREVIEW_PORT=%s TEST_PORT=%s OPEN=%s\n' '$(HOST)' '$(DEV_PORT)' '$(PREVIEW_PORT)' '$(TEST_PORT)' '$(OPEN)'
	@printf 'Use OPEN=1 to open a browser. TEST_ARGS applies only to test/test-unit/test-integration/test-watch.\n'
	@printf 'First run: nvm use && make install\nBetween phases: make manual-test\n'

check-node: ## Require the Node 24 version range declared in package.json.
	@$(NODE) -e 'const [major, minor] = process.versions.node.split(".").map(Number); if (major !== 24 || minor < 11) { console.error("TowerSim requires Node >=24.11.0 <25; found " + process.version + ". Run nvm use (see .nvmrc), then retry."); process.exit(1); }'

check-env: check-node ## Check the runtime and installed development dependencies.
	@test -f node_modules/vite/package.json && test -f node_modules/vitest/package.json && test -f node_modules/typescript/package.json || { printf 'Missing development dependencies. Run make install first.\n' >&2; exit 1; }

install: check-node ## Install exact dependencies from package-lock.json with npm ci.
	$(NPM) ci

deps: install ## Alias for install.

dev: check-env ## Start the live-reloading development server on DEV_PORT.
	$(NPM) run dev -- --host '$(HOST)' --port '$(DEV_PORT)' --strictPort $(OPEN_FLAG)

check: check-types check-boundaries check-comments ## Run all static checks without building.

check-types: check-env ## Type-check simulation, browser and tests.
	$(NPM) run check:types

check-boundaries: check-env ## Enforce simulation/platform boundaries and regression fixtures.
	$(NPM) run check:boundaries

check-comments: check-env ## Require descriptive comments on named production functions.
	$(NPM) run check:comments

test: check-env ## Run all unit and integration tests; optionally pass TEST_ARGS.
	$(NPM) run test -- $(TEST_ARGS)

test-unit: check-env ## Run only the unit-test project.
	$(NPM) run test -- --project unit $(TEST_ARGS)

test-integration: check-env ## Run only the integration-test project.
	$(NPM) run test:integration -- $(TEST_ARGS)

test-watch: check-env ## Watch tests while developing; Ctrl-C stops the watcher.
	$(NPM) exec -- vitest --watch $(TEST_ARGS)

bench: check-env ## Run restored-trial benchmarks and write benchmark-results/*.json.
	$(NPM) run bench

build: check-env ## Run static checks and build the release artifact in dist/.
	$(NPM) run build

build-browser: check-env ## Run static checks and build the fixture artifact in dist-browser-test/.
	$(NPM) run build:browser-test

check-browser-builds: check-env ## Check shared application settings and release/fixture isolation.
	$(NPM) run check:browser-builds

# Run unfiltered tests here, regardless of TEST_ARGS used for focused debugging.
# Separate recipe lines stop immediately on failure before any server is started.
verify: check-env ## Run all tests, checked builds and browser-build isolation in order.
	$(NPM) test
	$(NPM) run build
	$(NPM) run build:browser-test
	$(NPM) run check:browser-builds

phase-check: verify bench ## Run all automated phase checks, including benchmarks.

preview: check-env ## Serve an existing release build on PREVIEW_PORT without rebuilding.
	@test -f dist/index.html || { printf 'No release build. Run make build or make serve first.\n' >&2; exit 1; }
	$(NPM) run preview -- --host '$(HOST)' --port '$(PREVIEW_PORT)' --strictPort $(OPEN_FLAG)

preview-browser: check-env ## Serve an existing fixture build on TEST_PORT without rebuilding.
	@test -f dist-browser-test/index.html || { printf 'No fixture build. Run make build-browser or make manual-test first.\n' >&2; exit 1; }
	$(NPM) run preview:browser-test -- --host '$(HOST)' --port '$(TEST_PORT)' --strictPort $(OPEN_FLAG)

serve: build preview ## Build and launch the release instance for a normal-game smoke test.

manual-test: verify ## Verify, rebuild and launch the fixture chooser for manual phase validation.
	@printf '\nManual validation: http://%s:%s/\nChoose a starting fixture, then use ordinary game controls. Ctrl-C stops this server.\nFor release smoke testing, run make preview in another terminal.\n\n' '$(HOST)' '$(TEST_PORT)'
	$(NPM) run preview:browser-test -- --host '$(HOST)' --port '$(TEST_PORT)' --strictPort $(OPEN_FLAG)

manual: manual-test ## Alias for manual-test.

clean: ## Remove generated builds, coverage, benchmark output and Vite cache only.
	rm -rf -- dist dist-browser-test coverage benchmark-results node_modules/.vite
