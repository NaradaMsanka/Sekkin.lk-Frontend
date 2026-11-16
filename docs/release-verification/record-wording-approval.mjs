import fs from 'node:fs';
import crypto from 'node:crypto';

const configPath = new URL('../../src/content/business.json', import.meta.url);
const pagesPath = new URL('../../src/content/businessPages.js', import.meta.url);
const configSource = fs.readFileSync(configPath, 'utf8');
const pagesSource = fs.readFileSync(pagesPath, 'utf8');
const business = JSON.parse(configSource);
const approvedVersion = 'abe2b80743126ab944c021e860b0a1f83ae220312b98642e629b617a4f0cf69b';
if (business.policyWordingApproval?.sourceVersion === approvedVersion) {
  console.log('This exact owner wording approval is already recorded; no changes made.');
} else {
  // Recover the exact requested version before the two subsequent factual
  // wishlist/abuse-counter disclosures. Verify bytes before recording approval.
  const approvedPages = pagesSource
    .replace(", 'Saved wishlist records link your account to selected products and the time they were saved. The reviewed backend also keeps short-lived request counters in memory, keyed by hashes of the request address and, for login controls, the submitted login identity. These counters support abuse prevention; actual hosted proxy and logging behavior still require verification.'", '')
    .replace('their cart, saved wishlist choices, orders and reviews.', 'their cart, orders and reviews.')
    .replace('Short-lived security request counters help limit abusive login, registration and order submissions. ', '');
  const hash = value => crypto.createHash('sha256').update(configSource).update(value).digest('hex');
  const candidates = [approvedPages, approvedPages.replace(/\r?\n/g, '\r\n'), approvedPages.replace(/\r\n/g, '\n')];
  const exactApprovedSource = candidates.find(value => hash(value) === approvedVersion);
  if (!exactApprovedSource) throw new Error('Cannot reproduce approved abe2b807 source bytes; no approval or policy source was changed.');
  const evidence = {
    recordedDate: '2026-11-16',
    sourceVersion: approvedVersion,
    sourceVersionVerified: true,
    approvalSource: 'Authorized owner response approving the consolidated abe2b807 package, including consumer remedies, liability and Sri Lankan law/dispute clauses',
    intendedEffectiveDate: 'Actual public launch date of SEKKIN.LK',
    actualEffectiveDate: null,
    actualPublicationDate: null,
    fullPolicyCatalogSecuritySignoffsGranted: false,
    subsequentTechnicalDisclosure: 'Source-verified wishlist and short-lived hashed abuse counters; no changed commercial or approved legal clauses',
    sourceBusiness: configSource,
    sourcePages: exactApprovedSource,
  };
  fs.writeFileSync(new URL('approved-policy-wording.json', import.meta.url), JSON.stringify(evidence, null, 2) + '\n');
  for (const [group, field] of [['refund', 'consumerRights'], ['terms', 'liability'], ['terms', 'governingLaw']]) {
    business[group][field] = business[group][field].replace(/ REVIEW REQUIRED —.*$/, '');
  }
  business.terms.updates = 'These policies take effect on the actual public launch date of SEKKIN.LK. Their actual effective date and publication/last-updated date will be displayed on the relevant pages when published. Material changes will be communicated to affected customers where appropriate. No date is backdated or substituted with the earlier business-confirmation or wording-approval date.';
  business.policyWordingApproval = {
    sourceVersion: approvedVersion,
    recordedDate: '2026-11-16',
    scope: 'Consolidated prepared wording, including consumer remedies, liability, Sri Lankan governing-law and dispute-resolution provisions; actual provider, retention, catalog and security evidence remains separate',
  };
  business.policyEffectiveDateBasis = 'actual-public-launch-date';
  fs.writeFileSync(configPath, JSON.stringify(business, null, 2) + '\n');
  console.log(JSON.stringify({ approvedVersion, exactSourceVerified: true, intendedEffectiveDate: business.policyEffectiveDateBasis, actualEffectiveDate: business.policyEffectiveDate, actualPublicationDate: business.policyPublicationDate, policiesApproved: business.policiesApproved }));
}
