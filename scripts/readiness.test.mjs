import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { getReadinessIssues, getDraftContentIssues } from '../src/content/readiness.js';
import { businessPages } from '../src/content/businessPages.js';

const draft = JSON.parse(readFileSync(new URL('../src/content/business.json', import.meta.url), 'utf8'));
const completeFixture = () => {
  const data = structuredClone(draft);
  Object.assign(data, { registeredName: 'Test-only business', supportPhone: 'Test-only phone', supportEmail: 'owner@example.test', postalAddress: 'Test-only address', contactsConfirmed: true, policiesApproved: true, catalogReviewed: true, paymentSafetyReviewed: true });
  for (const group of ['refund', 'shipping', 'privacy', 'terms']) for (const key of Object.keys(data[group])) data[group][key] = 'Owner-approved test-only text';
  return data;
};

test('current missing business decisions block readiness', () => {
  const issues = getReadinessIssues(draft);
  assert.ok(issues.includes('Confirm business.registeredName'));
  assert.ok(issues.includes('Confirm business.supportEmail'));
  assert.ok(issues.includes('Review refund.returnWindow'));
  assert.ok(issues.includes('Review shipping.charges'));
});
test('complete business values still require every sign-off', () => {
  const data = completeFixture(); assert.deepEqual(getReadinessIssues(data), []);
  for (const flag of ['contactsConfirmed', 'policiesApproved', 'catalogReviewed', 'paymentSafetyReviewed']) {
    assert.ok(getReadinessIssues({ ...data, [flag]: false }).some(issue => issue.includes(flag)));
  }
});
test('invalid email and placeholder decisions cannot pass as final values', () => {
  const data = completeFixture(); data.supportEmail = 'not-an-email'; data.refund.returnWindow = 'REVIEW REQUIRED';
  assert.ok(getReadinessIssues(data).includes('Provide a valid support email'));
  assert.ok(getReadinessIssues(data).includes('Review refund.returnWindow'));
});
test('filling configuration alone cannot publish draft policy copy', () => {
  assert.deepEqual(getReadinessIssues(completeFixture()), []);
  assert.ok(getDraftContentIssues(businessPages).length > 0);
  assert.deepEqual(getDraftContentIssues({ example: { intro: 'Confirmed information.', sections: [{ id: 'approved', body: ['Approved information.'] }] } }), []);
});
test('Vercel build preflight rejects current drafts before Vite runs', () => {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('./check-merchant-readiness.mjs', import.meta.url)), '--build'], { encoding: 'utf8', env: { ...process.env, VERCEL: '1' } });
  assert.equal(result.status, 1); assert.match(result.stderr, /NOT ready for merchant submission/);
});
test('local build preflight permits explicitly labelled draft review', () => {
  const env = { ...process.env }; delete env.VERCEL;
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('./check-merchant-readiness.mjs', import.meta.url)), '--build'], { encoding: 'utf8', env });
  assert.equal(result.status, 0); assert.match(result.stderr, /Local draft build only/);
});
test('Vercel always uses the strict merchant command even without system environment variables', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(config.buildCommand, 'npm run build:merchant');
  assert.equal(pkg.scripts['build:merchant'], 'node scripts/check-merchant-readiness.mjs && vite build');
  const env = { ...process.env }; delete env.VERCEL;
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('./check-merchant-readiness.mjs', import.meta.url))], { encoding: 'utf8', env });
  assert.equal(result.status, 1);
});
