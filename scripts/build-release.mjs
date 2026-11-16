import { spawnSync } from 'node:child_process';
import { readReleaseConfiguration } from './release-mode.mjs';

const config = readReleaseConfiguration();
const checker = config.mode === 'PUBLIC_CATALOG' ? 'scripts/check-catalog-readiness.mjs' : 'scripts/check-merchant-readiness.mjs';
const args = ['--build', ...process.argv.slice(2)];
const check = spawnSync(process.execPath, [checker, ...args], { stdio: 'inherit', env: process.env });
if (check.status !== 0) process.exit(check.status || 1);
const build = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build'], { stdio: 'inherit', env: process.env });
process.exitCode = Number.isInteger(build.status) ? build.status : 1;
