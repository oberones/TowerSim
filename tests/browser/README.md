# Native browser build

The harness now offers a default paused site, a narrow site with negative ground, and a validated completed boundary. Select a fixture before mounting the same ordinary construction application as release. There are no mid-play state-mutation controls. Importing src/main.ts does not mount automatically. See evidence/us01-start.md and evidence/us02-construct-tower.md for the incomplete native-browser qualification gates.

From the repository root:

```sh
nvm use
npm ci
npm run build
npm run build:browser-test
npm run check:browser-builds
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
# In another terminal:
npm run preview:browser-test -- --host 127.0.0.1 --port 4174 --strictPort
```

Release serves dist/ at http://127.0.0.1:4173/; the test artifact serves dist-browser-test/ at http://127.0.0.1:4174/. Both use production mode, the same application graph, browser targets, environment directory and public assets. The graph checker rebuilds in memory without overwriting either artifact. Never publish dist-browser-test/.

Record artifact kind, hash of every output, source identity and exact browser/OS using evidence/template.md. Generate identities with:

```sh
git rev-parse HEAD
git status --short
find dist dist-browser-test -type f -exec shasum -a 256 {} \;
```

A dirty source tree also needs an archived diff and newly added source files; a commit alone does not identify it. Test both artifacts in actual stable desktop Chrome, Firefox and Safari at each owning checkpoint. Missing observations remain unverified. Once saves exist, use the same-origin handoff in specs/001-playable-tower-mvp/validation.md; different ports do not share storage.

`npm run bench` emits benchmark-results/*.json and a summary table. The initial counter workload verifies runner restoration/digest checks only. Later benchmark tasks supply canonical game snapshots, SHA-256 fixture identities, explicit seeds, counters and workloads.
