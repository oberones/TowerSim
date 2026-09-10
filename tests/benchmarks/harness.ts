import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { cpus, totalmem, platform, release } from 'node:os';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

export interface Benchmark<S> {
  name: string;
  seed: string;
  contentId: string;
  rulesId: string;
  fixtureHash: string;
  ticks: number;
  restore: () => S;
  run: (state: S) => void;
  digest: (state: S) => string;
  counters?: (state: S) => Record<string, number>;
}
export function runBenchmark<S>(benchmark: Benchmark<S>) {
  assert.ok(Number.isSafeInteger(benchmark.ticks) && benchmark.ticks > 0);
  const samples: number[] = [];
  const digests: string[] = [];
  const counters: Record<string, number>[] = [];
  for (let trial = 0; trial < 13; trial++) {
    const state = benchmark.restore(); // Reconstruction is outside the timed interval.
    const start = performance.now();
    benchmark.run(state);
    const elapsed = performance.now() - start;
    const digest = benchmark.digest(state);
    if (digests.length) assert.equal(digest, digests[0], 'authoritative digest differs across trials');
    digests.push(digest);
    if (trial >= 3) { samples.push(elapsed); counters.push(benchmark.counters?.(state) ?? {}); }
  }
  const sorted = [...samples].sort((a,b) => a-b);
  const duration = samples.reduce((a,b) => a+b, 0);
  const report = {
    name: benchmark.name, seed: benchmark.seed, contentId: benchmark.contentId, rulesId: benchmark.rulesId,
    fixtureHash: benchmark.fixtureHash, batchTicks: benchmark.ticks, warmups: 3, trials: 10,
    machine: { cpu: cpus()[0]?.model, logicalCpus: cpus().length, ramBytes: totalmem(), os: `${platform()} ${release()}` },
    node: process.version, commit: execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim(),
    dirty: execFileSync('git', ['status', '--porcelain'], {encoding: 'utf8'}).trim().length > 0,
    buildMode: 'vitest-node', instrumentation: 'monotonic clock, no coverage; counters after timing',
    samplesMs: samples, medianMs: ((sorted[4] ?? 0) + (sorted[5] ?? 0))/2, p95Ms: sorted[9],
    totalTicks: benchmark.ticks * 10, simulatedSeconds: benchmark.ticks * 10,
    durationMs: duration, ticksPerSecond: benchmark.ticks * 10 * 1000 / duration, digests, counters,
  };
  mkdirSync('benchmark-results', {recursive: true});
  writeFileSync(`benchmark-results/${benchmark.name.replace(/[^a-z0-9-]/gi, '-')}.json`, JSON.stringify(report, null, 2)+'\n');
  console.table([{name: report.name, medianMs: report.medianMs, p95Ms: report.p95Ms, trials: 10}]);
  return report;
}
