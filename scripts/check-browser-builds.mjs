import assert from 'node:assert/strict';
import { build, resolveConfig } from 'vite';
import { resolve, relative } from 'node:path';

const configs = [];
const graphs = [];
const emittedGraphs = [];
for (const configFile of ['vite.config.ts', 'vite.browser.config.ts']) {
  const config = await resolveConfig({ configFile, mode: 'production' }, 'build', 'production', 'production');
  assert.equal(config.env.DEV, false, 'production checks must not resolve development flags');
  assert.equal(config.env.PROD, true);
  configs.push(config);
  const modules = new Set();
  const emitted = new Set();
  await build({ configFile, mode: 'production', build: { write: false }, plugins: [{
    name: 'inspect-module-graph', generateBundle(_options, bundle) {
      for (const output of Object.values(bundle)) if (output.type === 'chunk') for (const [id, info] of Object.entries(output.modules)) if (info.renderedLength > 0) emitted.add(id.split('?')[0]);
      for (const id of this.getModuleIds()) modules.add(id.split('?')[0]);
    },
  }] });
  graphs.push(modules);
  emittedGraphs.push(emitted);
}
const [release, harness] = configs;
assert.equal(resolve(release.build.outDir), resolve('dist'));
assert.equal(resolve(harness.build.outDir), resolve('dist-browser-test'));
for (const field of ['base', 'mode', 'envDir', 'publicDir']) assert.deepEqual(release[field], harness[field], field);
for (const field of ['target', 'minify', 'sourcemap', 'cssTarget']) assert.deepEqual(release.build[field], harness.build[field], field);
assert.deepEqual(release.env, harness.env);
assert.deepEqual(release.define, harness.define);
assert.deepEqual(release.resolve.alias, harness.resolve.alias);
const appModules = graph => [...graph].filter(id => id.startsWith(resolve('src') + '/')).sort();
assert.deepEqual(appModules(graphs[0]), appModules(graphs[1]), 'shared application graph');
assert.ok(graphs.every(graph => graph.has(resolve('src/main.ts'))), 'shared mount entry');
for (const id of graphs[0]) assert.ok(!relative(resolve(), id).startsWith('tests/'), `test module in release: ${id}`);
assert.ok(graphs[1].has(resolve('tests/browser/harness.ts')));
console.log('Separate outputs, shared application graph/settings, and release isolation passed.');

for (const graph of emittedGraphs) for (const name of ['src/ui/diagnostics.ts', 'src/app/game/diagnostic-queries.ts', 'src/platform/performance-counters.ts']) assert.ok(!graph.has(resolve(name)), `development diagnostics in production: ${name}`);
console.log('Development diagnostic modules contain no emitted production code.');
