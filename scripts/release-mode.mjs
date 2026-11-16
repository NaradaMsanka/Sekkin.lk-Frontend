import fs from 'node:fs';

export function readReleaseConfiguration() {
  const config = JSON.parse(fs.readFileSync(new URL('../config/release.json', import.meta.url), 'utf8'));
  if (config.schemaVersion !== 1 || !['PUBLIC_CATALOG', 'COD_STORE'].includes(config.mode)) throw new Error('An explicit supported release mode is required.');
  return config;
}

export function requiresHostedVerification(args, environment = process.env) {
  const local = !args.includes('--vercel') && !environment.VERCEL && !environment.VERCEL_ENV;
  return args.includes('--strict') || !(local || environment.VERCEL_ENV === 'preview');
}
