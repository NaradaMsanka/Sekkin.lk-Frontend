import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { catalogPages } from '../src/catalog/catalogContent.js';
import { catalogSourceIssues, containmentEvidenceIssues, readCatalogInputs, verifyLiveContainment } from './catalog-readiness.mjs';
import { requiresHostedVerification } from './release-mode.mjs';
import { getReadinessIssues } from '../src/content/readiness.js';

const inputs = readCatalogInputs();
const proof = () => ({ backendOrigin: inputs.release.backendOrigin, backendRevision: 'a'.repeat(40), mode: 'PUBLIC_CATALOG', verifiedAtUtc: new Date().toISOString(), databaseInitialized: false, jwtInitialized: false, mutationChecks: ['/api/orders/direct', '/api/orders', '/api/auth/login', '/api/auth/register'].map(path => ({ path, status: 503 })) });

test('catalog source matches the actual approved business, products and local image bytes', () => {
  assert.deepEqual(catalogSourceIssues({ ...inputs, pages: catalogPages }), []);
});
test('catalog gate rejects enabled transactions, edited prices and unreviewed images', () => {
  for (const field of ['orderingEnabled', 'accountsEnabled', 'onlinePaymentsEnabled']) assert.ok(catalogSourceIssues({ ...inputs, pages: catalogPages, release: { ...inputs.release, [field]: true } }).length);
  const snapshot = structuredClone(inputs.snapshot); snapshot.products[0].price++;
  assert.match(catalogSourceIssues({ ...inputs, snapshot, pages: catalogPages }).join(), /reviewed snapshot/);
  assert.match(catalogSourceIssues({ ...inputs, pages: catalogPages, assetHash: () => 'wrong' }).join(), /hash mismatch/);
});
test('catalog approval does not grant complete merchant/COD policy or payment sign-offs', () => {
  const issues = getReadinessIssues(inputs.sourceBusiness);
  assert.ok(issues.some(issue => issue.includes('policiesApproved')));
  assert.ok(issues.some(issue => issue.includes('paymentSafetyReviewed')));
  assert.equal(inputs.sourceBusiness.payhereApplicationStatus, 'Pending');
});
test('Production and missing/unknown Vercel environments always require actual containment', () => {
  for (const environment of [{ VERCEL_ENV: 'production' }, { VERCEL: '1' }, { VERCEL_ENV: 'custom' }, {}]) assert.equal(requiresHostedVerification(['--vercel'], environment), true);
  assert.equal(requiresHostedVerification([], {}), false);
  assert.equal(requiresHostedVerification(['--vercel'], { VERCEL_ENV: 'preview' }), false);
  assert.equal(requiresHostedVerification(['--strict'], { VERCEL_ENV: 'preview' }), true);
});
test('missing, stale, partial and wrong-origin backend evidence fails closed', () => {
  assert.ok(containmentEvidenceIssues(null, inputs.release.backendOrigin).length);
  assert.deepEqual(containmentEvidenceIssues(proof(), inputs.release.backendOrigin), []);
  for (const patch of [{ verifiedAtUtc: '2020-01-01' }, { backendOrigin: 'http://localhost' }, { databaseInitialized: undefined }, { jwtInitialized: true }, { mutationChecks: [] }]) assert.ok(containmentEvidenceIssues({ ...proof(), ...patch }, inputs.release.backendOrigin).length);
});
test('a safe historical report cannot replace matching current deployed containment', async () => {
  const expected = proof();
  const marker = { releaseMode: 'PUBLIC_CATALOG', ordering: 'DISABLED', accounts: 'DISABLED', payments: 'DISABLED', databaseInitialized: false, jwtInitialized: false, revision: expected.backendRevision };
  const response = value => async () => ({ ok: true, json: async () => value });
  assert.deepEqual(await verifyLiveContainment(expected, inputs.release.backendOrigin, response(marker)), marker);
  for (const patch of [{ revision: 'b'.repeat(40) }, { ordering: 'ENABLED' }, { accounts: 'ENABLED' }, { databaseInitialized: true }]) await assert.rejects(verifyLiveContainment(expected, inputs.release.backendOrigin, response({ ...marker, ...patch })));
});
test('catalog security headers prohibit API connections and form submission', () => {
  const config = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url)));
  const csp = config.headers[0].headers.find(header => header.key === 'Content-Security-Policy').value;
  assert.match(csp, /connect-src 'none'/); assert.match(csp, /form-action 'none'/);
});

test('catalog launch date comes from actual public verification and does not approve COD policies', () => {
  const json = path => JSON.parse(fs.readFileSync(new URL(`../${path}`, import.meta.url)));
  const publication = json('src/catalog/publication.json');
  const receipt = json('docs/release-verification/catalog-publication.json');
  assert.equal(publication.effectiveDate, receipt.effectiveDate);
  assert.equal(publication.publicationVerifiedAtUtc, receipt.firstPublicVerificationAtUtc);
  assert.equal(publication.firstPublishedFrontendCommit, receipt.frontendCommit);
  assert.equal(receipt.manifest.mode, 'PUBLIC_CATALOG');
  assert.equal(receipt.manifest.checkout, 'DISABLED');
  assert.equal(inputs.sourceBusiness.policiesApproved, false);
  assert.equal(inputs.sourceBusiness.paymentSafetyReviewed, false);
});
