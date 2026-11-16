import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const cases = [
  { name: 'local', script: 'build', environment: {}, expectedExitCode: 0 },
  { name: 'merchant', script: 'build:merchant', environment: {}, expectedExitCode: 1 },
  { name: 'vercel-missing-environment', script: 'build:vercel', environment: {}, expectedExitCode: 1 },
  { name: 'vercel-preview', script: 'build:vercel', environment: { VERCEL: '1', VERCEL_ENV: 'preview' }, expectedExitCode: 0 },
  { name: 'vercel-production', script: 'build:vercel', environment: { VERCEL: '1', VERCEL_ENV: 'production' }, expectedExitCode: 1 },
];

// This matrix verifies the present incomplete draft. Never use it to approve a
// release: the independent Production command must eventually succeed at zero.
const results = [];
for (const test of cases) {
  const environment = { ...process.env };
  delete environment.VERCEL;
  delete environment.VERCEL_ENV;
  Object.assign(environment, test.environment);
  const command = `npm run ${test.script}`;
  const execution = process.platform === 'win32'
    ? spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', command], { cwd: root, env: environment, encoding: 'utf8', timeout: 180_000 })
    : spawnSync('npm', ['run', test.script], { cwd: root, env: environment, encoding: 'utf8', timeout: 180_000 });
  const output = `${execution.stdout || ''}${execution.stderr || ''}`;
  const logFile = `final-build-${test.name}.log`;
  fs.writeFileSync(new URL(logFile, import.meta.url), output);
  const result = {
    name: test.name,
    command,
    environment: test.environment,
    exitCode: execution.status,
    unresolved: Number(output.match(/(\d+) unresolved items/)?.[1] ?? NaN),
    viteStarted: /vite v\d/i.test(output),
    draft: /(?:Local|Preview) draft build only/.test(output),
    largeChunkWarning: /Some chunks are larger than/.test(output),
    expectedExitCode: test.expectedExitCode,
    passedExpectedBoundary: execution.status === test.expectedExitCode,
    logFile,
    ...(execution.error ? { error: execution.error.message } : {}),
  };
  results.push(result);
  console.log(JSON.stringify(result));
}
const sourceSha256 = Object.fromEntries([
  'package-lock.json', 'scripts/check-merchant-readiness.mjs',
  'src/content/business.json', 'src/content/businessPages.js',
].map(file => [file, createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex')]));
fs.writeFileSync(new URL('final-builds.json', import.meta.url), JSON.stringify({
  checkedAtUtc: new Date().toISOString(),
  scope: 'Process-scoped local build environment matrix; no Vercel dashboard, Deployment Protection, domain or hosted revision verification',
  expectedIncompleteDraft: true,
  productionReleaseApproved: false,
  sourceSha256,
  results,
}, null, 2) + '\n');
if (results.some(result => !result.passedExpectedBoundary || !Number.isFinite(result.unresolved))) process.exitCode = 1;
