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
  assert.ok(issues.includes('Review shipping.partners'));
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
function runPreflight(args, variables = {}) {
  const env = { ...process.env };
  delete env.VERCEL;
  delete env.VERCEL_ENV;
  return spawnSync(process.execPath, [fileURLToPath(new URL('./check-merchant-readiness.mjs', import.meta.url)), ...args], {
    encoding: 'utf8', env: { ...env, ...variables },
  });
}

for (const [name, variables, status] of [
  ['Preview', { VERCEL: '1', VERCEL_ENV: 'preview' }, 0],
  ['Preview without VERCEL', { VERCEL_ENV: 'preview' }, 0],
  ['Production', { VERCEL: '1', VERCEL_ENV: 'production' }, 1],
  ['Production without VERCEL', { VERCEL_ENV: 'production' }, 1],
  ['missing deployment environment', { VERCEL: '1' }, 1],
  ['all system variables missing', {}, 1],
  ['unknown environment', { VERCEL: '1', VERCEL_ENV: 'custom' }, 1],
  ['unknown environment without VERCEL', { VERCEL_ENV: 'custom' }, 1],
  ['development environment', { VERCEL: '1', VERCEL_ENV: 'development' }, 1],
]) {
  test(`Vercel build preflight: ${name}`, () => {
    const result = runPreflight(['--build', '--vercel'], variables);
    assert.equal(result.status, status, result.error?.message || result.stderr);
    assert.match(result.stderr, /NOT ready for merchant submission/);
    if (status === 0) assert.match(result.stderr, /Preview draft build only/);
    else assert.doesNotMatch(result.stderr, /draft build only/);
  });
}

test('local build preflight permits explicitly labelled draft review', () => {
  const result = runPreflight(['--build']);
  assert.equal(result.status, 0); assert.match(result.stderr, /Local draft build only/);
});

for (const [name, variables] of [
  ['local', {}],
  ['Preview', { VERCEL: '1', VERCEL_ENV: 'preview' }],
]) {
  test(`explicit merchant validation remains strict in ${name}`, () => {
    const result = runPreflight([], variables);
    assert.equal(result.status, 1); assert.match(result.stderr, /NOT ready for merchant submission/);
  });
}

test('optional readiness preflight blocks Production and unidentified Vercel environments', () => {
  for (const variables of [{ VERCEL_ENV: 'production' }, { VERCEL: '1' }]) {
    assert.equal(runPreflight(['--build'], variables).status, 1);
  }
});
