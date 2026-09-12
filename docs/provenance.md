# Provenance

Phase 1 source, bootstrap wording, checks and harnesses were authored for TowerSim with Codex assistance from this repository's specification. No external application source was copied. Phase 1 had no game assets; the original phase 3/4 Canvas geometry and content are recorded below. No external images, fonts or audio were added.

Excluded: proprietary tower-game code, extracted assets, screenshots, names, UI text, data tables, traced artwork and reverse-engineered resources. No runtime CDN or production npm dependencies are used. Vite's generated module-preload helper is build-generated code covered by Vite's MIT license.

## PRNG reference and Phase 2 authorship

The [xoshiro128** reference](https://prng.di.unimi.it/xoshiro128starstar.c) is credited to David Blackman and Sebastiano Vigna (2018). Its header dedicates rights to the public domain where possible and grants unrestricted use, modification and distribution, with warranty disclaimer. Phase 2 adapts its corrected 1.1 transition in `src/simulation/core/random/xoshiro128.ts`. The full permission/disclaimer is retained in `tests/fixtures/xoshiro-reference.c`; the source adapter links to it. The C fixture adds a fixed input/output driver and was compiled independently to establish the ten golden outputs used in `tests/unit/random.test.ts`. Reproduce with `cc tests/fixtures/xoshiro-reference.c -o /tmp/towersim-prng-reference && /tmp/towersim-prng-reference`.

The remaining Phase 2 arithmetic, indexed heap, boundary processing, state/codec, ingress, ledger, replay fixtures and benchmark code were independently authored for this specification with Codex assistance. No reference priority-queue source was copied. No new dependency or gameplay asset was introduced.

## Locked development dependency inventory

Captured from package-lock.json on 2026-09-10, including optional platform packages. License identifiers below are package declarations; preserve upstream license files when redistributing tools and re-review changes at release.

| Package | Version | Declared license |
| --- | --- | --- |
| @babel/helper-string-parser | 8.0.0 | MIT |
| @babel/helper-validator-identifier | 8.0.4 | MIT |
| @babel/parser | 8.0.4 | MIT |
| @babel/types | 8.0.4 | MIT |
| @jridgewell/resolve-uri | 3.1.2 | MIT |
| @jridgewell/sourcemap-codec | 1.6.0 | MIT |
| @jridgewell/trace-mapping | 0.3.31 | MIT |
| @oxc-project/types | 0.149.0 | MIT |
| @rolldown/binding-android-arm-eabi | 1.2.8 | MIT |
| @rolldown/binding-android-arm64 | 1.2.8 | MIT |
| @rolldown/binding-darwin-arm64 | 1.2.8 | MIT |
| @rolldown/binding-darwin-x64 | 1.2.8 | MIT |
| @rolldown/binding-freebsd-x64 | 1.2.8 | MIT |
| @rolldown/binding-linux-arm-gnueabihf | 1.2.8 | MIT |
| @rolldown/binding-linux-arm64-gnu | 1.2.8 | MIT |
| @rolldown/binding-linux-arm64-musl | 1.2.8 | MIT |
| @rolldown/binding-linux-ppc64-gnu | 1.2.8 | MIT |
| @rolldown/binding-linux-s390x-gnu | 1.2.8 | MIT |
| @rolldown/binding-linux-x64-gnu | 1.2.8 | MIT |
| @rolldown/binding-linux-x64-musl | 1.2.8 | MIT |
| @rolldown/binding-openharmony-arm64 | 1.2.8 | MIT |
| @rolldown/binding-win32-arm64-msvc | 1.2.8 | MIT |
| @rolldown/binding-win32-x64-msvc | 1.2.8 | MIT |
| @rolldown/pluginutils | 1.0.1 | MIT |
| @types/chai | 5.2.3 | MIT |
| @types/deep-eql | 4.0.2 | MIT |
| @types/estree | 1.0.9 | MIT |
| @types/node | 24.13.4 | MIT |
| @typescript/typescript-aix-ppc64 | 7.0.2 | Apache-2.0 |
| @typescript/typescript-darwin-arm64 | 7.0.2 | Apache-2.0 |
| @typescript/typescript-darwin-x64 | 7.0.2 | Apache-2.0 |
| @typescript/typescript-freebsd-arm64 | 7.0.2 | Apache-2.0 |
| @typescript/typescript-freebsd-x64 | 7.0.2 | Apache-2.0 |
| @typescript/typescript-linux-arm | 7.0.2 | Apache-2.0 |
| @typescript/typescript-linux-arm64 | 7.0.2 | Apache-2.0 |
| @typescript/typescript-linux-loong64 | 7.0.2 | Apache-2.0 |
| @typescript/typescript-linux-mips64el | 7.0.2 | Apache-2.0 |
| @typescript/typescript-linux-ppc64 | 7.0.2 | Apache-2.0 |
| @typescript/typescript-linux-riscv64 | 7.0.2 | Apache-2.0 |
| @typescript/typescript-linux-s390x | 7.0.2 | Apache-2.0 |
| @typescript/typescript-linux-x64 | 7.0.2 | Apache-2.0 |
| @typescript/typescript-netbsd-arm64 | 7.0.2 | Apache-2.0 |
| @typescript/typescript-netbsd-x64 | 7.0.2 | Apache-2.0 |
| @typescript/typescript-openbsd-arm64 | 7.0.2 | Apache-2.0 |
| @typescript/typescript-openbsd-x64 | 7.0.2 | Apache-2.0 |
| @typescript/typescript-sunos-x64 | 7.0.2 | Apache-2.0 |
| @typescript/typescript-win32-arm64 | 7.0.2 | Apache-2.0 |
| @typescript/typescript-win32-x64 | 7.0.2 | Apache-2.0 |
| @vitest/mocker | 5.0.0 | MIT |
| @vitest/spy | 5.0.0 | MIT |
| assertion-error | 2.0.1 | MIT |
| chai | 6.2.2 | MIT |
| detect-libc | 2.1.2 | Apache-2.0 |
| es-module-lexer | 2.3.2 | MIT |
| estree-walker | 3.0.3 | MIT |
| expect-type | 1.4.0 | Apache-2.0 |
| fdir | 6.5.0 | MIT |
| fsevents | 2.3.3 | MIT |
| lightningcss | 1.33.0 | MPL-2.0 |
| lightningcss-android-arm64 | 1.33.0 | MPL-2.0 |
| lightningcss-darwin-arm64 | 1.33.0 | MPL-2.0 |
| lightningcss-darwin-x64 | 1.33.0 | MPL-2.0 |
| lightningcss-freebsd-x64 | 1.33.0 | MPL-2.0 |
| lightningcss-linux-arm-gnueabihf | 1.33.0 | MPL-2.0 |
| lightningcss-linux-arm64-gnu | 1.33.0 | MPL-2.0 |
| lightningcss-linux-arm64-musl | 1.33.0 | MPL-2.0 |
| lightningcss-linux-x64-gnu | 1.33.0 | MPL-2.0 |
| lightningcss-linux-x64-musl | 1.33.0 | MPL-2.0 |
| lightningcss-win32-arm64-msvc | 1.33.0 | MPL-2.0 |
| lightningcss-win32-x64-msvc | 1.33.0 | MPL-2.0 |
| magic-string | 1.3.1 | MIT |
| nanoid | 3.3.18 | MIT |
| obug | 2.2.1 | MIT |
| picocolors | 1.1.1 | ISC |
| picomatch | 4.0.7 | MIT |
| postcss | 8.5.28 | MIT |
| rolldown | 1.2.8 | MIT |
| siginfo | 2.0.0 | ISC |
| source-map-js | 1.2.1 | BSD-3-Clause |
| stackback | 0.0.2 | MIT |
| std-env | 4.2.0 | MIT |
| tinybench | 6.1.4 | MIT |
| tinyexec | 1.3.0 | MIT |
| tinyglobby | 0.2.17 | MIT |
| typescript | 7.0.2 | Apache-2.0 |
| undici-types | 7.18.2 | MIT |
| vite | 8.2.2 | MIT |
| vitest | 5.0.0 | MIT |
| why-is-node-running | 2.3.0 | MIT |

## Phase 3/4 authorship

The site grid, floor slabs, lobby rectangle, selection and preview overlays, palette, copy and CSS were authored for this repository with Codex assistance. They use Canvas primitives and system fonts, with no copied game artwork, screenshots, audio or UI text. Scenario prices, footprints, timing, schedules, finite demand and Level 2 data implement this repository's accepted design artifacts. Session/pacing, camera, construction, content validation, query and input code were independently authored. No production or development dependencies were added.


## Phase 8–10 authorship

Queue group glyphs, waiting-time overlays, traffic/workforce copy, report controls, FIFO indexing, lifecycle traces and report calculations were authored for this repository with Codex assistance. They use original Canvas primitives, Unicode direction arrows and system fonts. Score coefficients implement the provisional values already accepted in the design; they are not claimed as congestion calibration. No assets, reference code, runtime dependencies or development dependencies were added.

## Phases 11–13 (2026-09-11)

Congestion fixtures, acceptance traces, queue cost/reservation and migration code, access diagnostics, and recovery tests were independently authored in this repository. The shared arrival-window calibration is original balance data. No third-party assets, code, gameplay service, or production dependency was added. Existing prototype Canvas shapes remain in use.

## Phase 19 source/content audit — 2026-09-12

New onboarding text, keyboard routing, diagnostic counters/panels, benchmark fixtures, test-only performance recorder and documentation were authored in this repository. No images, audio, fonts, proprietary layouts, third-party reference implementations or production dependencies were introduced. Existing native Canvas shapes and system font stack remain the only visual content. `package.json` and `package-lock.json` are unchanged; their earlier dependency/license inventory remains applicable.

The release audit checks actual emitted assets and module graphs. Only `dist/` is a deployable output; prepared fixtures, diagnostic chunks, profiles, source archives, benchmark JSON, saves and development tools must not be uploaded as the game. The local artifact manifest lists exact shipped output hashes. No publishing/deployment was performed.
