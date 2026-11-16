import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname, resolve, basename } from 'node:path';
import { getReadinessIssues, getDraftContentIssues } from '../src/content/readiness.js';
import { businessPages } from '../src/content/businessPages.js';

const draft = JSON.parse(readFileSync(new URL('../src/content/business.json', import.meta.url), 'utf8'));
// Negative tests must remain valid after the real owner content is finalized.
// Only this in-memory fixture is made incomplete; application files stay intact.
Object.assign(draft, { registeredName: null, supportEmail: null, postalAddress: null, contactsConfirmed: false, policiesApproved: false, catalogReviewed: false, paymentSafetyReviewed: false });
for (const group of ['refund', 'shipping', 'privacy', 'terms']) for (const key of Object.keys(draft[group])) draft[group][key] = null;
const draftPages = Object.fromEntries(Object.entries(businessPages).map(([route, page]) => [route, {
  intro: 'Test-only draft introduction.',
  sections: page.sections.map(section => ({ id: section.id, body: ['REVIEW REQUIRED — test-only unfinished policy text.'] })),
}]));
const completeFixture = () => {
  const data = structuredClone(draft);
  Object.assign(data, { registeredName: 'Test-only business', supportPhone: 'Test-only phone', supportEmail: 'owner@example.test', postalAddress: 'Test-only address', contactsConfirmed: true, policiesApproved: true, catalogReviewed: true, paymentSafetyReviewed: true });
  for (const group of ['refund', 'shipping', 'privacy', 'terms']) for (const key of Object.keys(data[group])) data[group][key] = 'Owner-approved test-only text';
  return data;
};

test('missing business decisions block readiness', () => {
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
  assert.ok(getDraftContentIssues(draftPages).length > 0);
  assert.deepEqual(getDraftContentIssues({ example: { intro: 'Confirmed information.', sections: [{ id: 'approved', body: ['Approved information.'] }] } }), []);
});
function runPreflight(args, variables = {}) {
  return runApprovedFixture({ business: draft, pages: draftPages, args, variables });
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

test('normal build also blocks Production and unidentified Vercel environments', () => {
  for (const variables of [{ VERCEL_ENV: 'production' }, { VERCEL: '1' }]) {
    assert.equal(runPreflight(['--build'], variables).status, 1);
  }
});

test('Vercel configuration uses a marked build that cannot fall back to local draft behavior', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(config.buildCommand, 'npm run build:vercel');
  assert.equal(pkg.scripts.build, 'node scripts/build-release.mjs');
  assert.equal(pkg.scripts['build:vercel'], 'node scripts/build-release.mjs --vercel');
  assert.equal(pkg.scripts['build:merchant'], 'node scripts/check-merchant-readiness.mjs && vite build --mode merchant');
  assert.equal(pkg.scripts['check:cod'], 'node scripts/check-merchant-readiness.mjs');
});

// Run the real checker against synthetic approvals outside the checkout. These
// fixtures never approve real business content or modify the working tree.
function runApprovedFixture({ business = completeFixture(), pages, variables = { VERCEL: '1', VERCEL_ENV: 'production' }, args = ['--build', '--vercel'] } = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'sekkin-readiness-'));
  try {
    const put = (name, contents) => {
      const path = join(directory, name);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, contents);
    };
    put('package.json', JSON.stringify({ type: 'module' }));
    for (const path of ['scripts/check-merchant-readiness.mjs', 'src/content/readiness.js', 'src/components/DirectCheckoutModal.jsx']) {
      put(path, readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
    }
    put('src/content/business.json', JSON.stringify(business));
    const finalPages = pages || Object.fromEntries(Object.entries(businessPages).map(([route, page]) => [route, {
      intro: 'Test-only approved introduction.',
      sections: page.sections.map(section => ({ id: section.id, body: ['Test-only approved policy text.'] })),
    }]));
    put('src/content/businessPages.js', `export const businessPages = ${JSON.stringify(finalPages)};`);
    const env = { ...process.env };
    delete env.VERCEL;
    delete env.VERCEL_ENV;
    return spawnSync(process.execPath, [join(directory, 'scripts/check-merchant-readiness.mjs'), ...args], {
      cwd: directory, encoding: 'utf8', env: { ...env, ...variables }, timeout: 10000,
    });
  } finally {
    assert.equal(dirname(resolve(directory)), resolve(tmpdir()));
    assert.ok(basename(directory).startsWith('sekkin-readiness-'));
    rmSync(directory, { recursive: true, force: true });
  }
}

test('real preflight accepts complete synthetic content in strict Production and merchant environments', () => {
  for (const options of [{}, { variables: {} }, { args: [], variables: {} }, { variables: { VERCEL: '1', VERCEL_ENV: 'preview' } }]) {
    const result = runApprovedFixture(options);
    assert.equal(result.status, 0, result.error?.message || result.stderr);
    assert.match(result.stdout, /Business-content checks passed/);
    assert.doesNotMatch(result.stderr, /draft build only/);
  }
});

test('strict Production rejects each unapproved flag even with complete synthetic content', () => {
  for (const flag of ['contactsConfirmed', 'policiesApproved', 'catalogReviewed', 'paymentSafetyReviewed']) {
    for (const value of [false, '', 'false', undefined]) {
      const business = completeFixture();
      business[flag] = value;
      const result = runApprovedFixture({ business });
      assert.equal(result.status, 1, result.error?.message || result.stderr);
      assert.ok(result.stderr.includes(`sign-off required: ${flag}`));
    }
  }
});

test('strict Production rejects rendered draft text after every synthetic configuration approval', () => {
  for (const text of ['REVIEW REQUIRED', 'This policy is a draft.']) {
    const result = runApprovedFixture({ pages: { 'privacy-policy': { intro: 'Test-only introduction.', sections: [{ id: 'payments', body: [text] }] } } });
    assert.equal(result.status, 1, result.error?.message || result.stderr);
    assert.match(result.stderr, /Approve final policy text: \/privacy-policy#payments/);
  }
});

test('partially confirmed shipping and exchange decisions still block strict Production', () => {
  const business = completeFixture();
  business.shipping.charges = 'Free to LKR 350. REVIEW REQUIRED — exact pricing rules are undecided.';
  business.refund.exchanges = 'Seven-day requests confirmed. REVIEW REQUIRED — timing and lower-priced replacements are undecided.';
  const result = runApprovedFixture({ business });
  assert.equal(result.status, 1, result.error?.message || result.stderr);
  assert.match(result.stderr, /Review shipping.charges/);
  assert.match(result.stderr, /Review refund.exchanges/);
});

test('individual confirmed contact facts cannot replace the complete contact sign-off', () => {
  const business = completeFixture();
  business.contactsConfirmed = false;
  business.confirmedContactFields = ['supportPhone', 'whatsappNumber', 'supportEmail', 'postalAddress', 'businessHours'];
  const result = runApprovedFixture({ business });
  assert.equal(result.status, 1, result.error?.message || result.stderr);
  assert.match(result.stderr, /sign-off required: contactsConfirmed/);
});
