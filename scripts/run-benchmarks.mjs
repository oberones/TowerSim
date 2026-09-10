import { readdirSync, readFileSync, mkdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
mkdirSync('benchmark-results', { recursive: true });
for (const file of readdirSync('benchmark-results')) if (file.endsWith('.json')) rmSync(`benchmark-results/${file}`);
const result = spawnSync(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', '--config', 'vitest.benchmark.config.ts'], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;

if (result.status === 0) {
  const reports = readdirSync('benchmark-results').filter(file => file.endsWith('.json')).map(file => JSON.parse(readFileSync(`benchmark-results/${file}`, 'utf8')));
  console.table(reports.map(({ name, medianMs, p95Ms, trials }) => ({ name, medianMs, p95Ms, trials })));
  console.log('JSON reports: benchmark-results/ (setup workload is not simulation qualification).');
}
