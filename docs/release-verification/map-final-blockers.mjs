import fs from 'node:fs';
import business from '../../src/content/business.json' with { type: 'json' };
import { businessPages } from '../../src/content/businessPages.js';
import { getReadinessIssues, getDraftContentIssues } from '../../src/content/readiness.js';

const configuration = getReadinessIssues(business);
const copy = getDraftContentIssues(businessPages);
const issues = [...configuration, ...copy];
const previous = JSON.parse(fs.readFileSync(new URL('./owner-approval-blocker-map.json', import.meta.url)));
const original = JSON.parse(fs.readFileSync(new URL('./original-blockers.json', import.meta.url))).issues;
const actions = {
  'refund.consumerRights': 'Approve the prepared consumer/remedy wording through the single final policy package; preserve mandatory remedies. No independent legal opinion is claimed.',
  'privacy.processingLocations': 'Verify actual Vercel/Render/Supabase/Cloudinary account regions, access/transfers and relevant service arrangements. No connected account evidence currently establishes them.',
  'privacy.retention': 'Review and demonstrate the proposed support 12-month/log 30-day/backup 30-day targets against actual controls; settle applicable order-record retention and feasible deletion/anonymization. The targets are approved for review, not verified implementation.',
  'terms.liability': 'Approve the prepared rights-preserving liability wording in the consolidated policy package. No blanket exclusion or independent legal opinion is asserted.',
  'terms.governingLaw': 'Approve the prepared Sri Lankan governing-law/dispute wording in the consolidated policy package; preserve access to competent authorities/courts.',
  'terms.updates': 'Record final wording approval and the intended effective-date decision. Record actual publication/last-updated dates only at the authorized publication event after factual disclosures are complete.',
  policiesApproved: 'Complete actual provider/retention/payment-history disclosures. The owner approved consolidated abe2b807 wording and the actual public launch as the effective-date basis; do not request that approval again. Record actual calendar dates only when published, and earn the full flag after the outstanding factual requirements are satisfied.',
  catalogReviewed: 'Correct only the observed listings: ID1 unrelated HACKELITE gallery image/product identity and IDs2/3 absent product images/identification. Owner prices/stock/current-asset authorization is accepted; recheck an authorized corrected snapshot.',
  paymentSafetyReviewed: 'Review actual completed local/real-PostgreSQL/scanner evidence and finish remaining findings, authorized credential containment/rotation, administrator/history review and hosted runtime/TLS/proxy/CORS verification. Local tests do not establish deployed effectiveness.',
};
const dependencies = {
  'refund-policy#rights': 'refund.consumerRights; single final wording review',
  'privacy-policy': 'actual provider/retention/historical-payment verification; prepared wording is owner-approved',
  'privacy-policy#services': 'privacy.processingLocations; verified actual account facts',
  'privacy-policy#payments': 'complete authorized historical simulated-payment/log review and accurate factual disclosure; prepared wording is already owner-approved',
  'privacy-policy#retention': 'privacy.retention; actual controls and lawful retained records',
  'privacy-policy#updates': 'complete factual privacy verification; owner-approved launch-date basis, actual dates recorded at publication',
  'terms-and-conditions': 'specific catalog correction and remaining factual release checks; prepared wording is owner-approved',
  'terms-and-conditions#products': 'specific image/identity corrections in FINAL_CATALOG_REVIEW.md',
  'terms-and-conditions#liability': 'terms.liability; single final wording review',
  'terms-and-conditions#law': 'terms.governingLaw; single final wording review',
  'terms-and-conditions#changes': 'terms.updates; final approval and actual dates',
  'about#care': 'complete actual hosting/retention/catalog/security requirements; prepared policy wording is owner-approved',
};
const configText = fs.readFileSync(new URL('../../src/content/business.json', import.meta.url), 'utf8');
const pagesText = fs.readFileSync(new URL('../../src/content/businessPages.js', import.meta.url), 'utf8');
const sourceLine = (text, offset) => text.slice(0, offset).split('\n').length;
const records = issues.map((message, index) => {
  if (index < configuration.length) {
    const field = message.startsWith('Review ') ? message.slice(7) : message.split(': ')[1];
    if (!actions[field]) throw new Error(`Unmapped current configuration requirement: ${field}`);
    const offset = configText.indexOf(`"${field.split('.').at(-1)}"`);
    if (offset < 0) throw new Error(`Missing configuration source: ${field}`);
    return { id: index + 1, message, category: field === 'policiesApproved' ? 'C' : field === 'catalogReviewed' ? 'E' : field === 'paymentSafetyReviewed' ? 'D' : 'B', source: 'src/content/business.json', line: sourceLine(configText, offset), field, action: actions[field] };
  }
  const target = message.split(': /')[1];
  if (!dependencies[target]) throw new Error(`Unmapped current copy requirement: ${target}`);
  const [route, anchor] = target.split('#');
  const pageOffset = pagesText.indexOf(route.includes('-') ? `'${route}':` : `  ${route}:`);
  const offset = pagesText.indexOf(anchor ? `section('${anchor}',` : 'intro:', pageOffset);
  if (pageOffset < 0 || offset < 0) throw new Error(`Missing rendered source: ${target}`);
  return { id: index + 1, message, category: target === 'terms-and-conditions#products' ? 'E' : 'C', source: 'src/content/businessPages.js', line: sourceLine(pagesText, offset), field: target, action: `Complete /${target} after: ${dependencies[target]}. Retain review/draft disclosure until genuinely complete.` };
});
const previousIssues = previous.records.map(record => record.message);
const categoryCounts = Object.fromEntries(['A', 'B', 'C', 'D', 'E'].map(category => [category, records.filter(record => record.category === category).length]));
const result = { date: '2026-11-16', phase: 'final-business-confirmations', count: issues.length, configurationCount: configuration.length, renderedCopyCount: copy.length, categoryCounts, previousPhaseCount: previous.count, clearedSincePrevious: previousIssues.filter(message => !issues.includes(message)), addedSincePrevious: issues.filter(message => !previousIssues.includes(message)), originalCount: original.length, resolvedOriginal: original.filter(message => !issues.includes(message)), remainingOriginal: original.filter(message => issues.includes(message)), newMessages: issues.filter(message => !original.includes(message)), approvals: Object.fromEntries(['contactsConfirmed', 'policiesApproved', 'catalogReviewed', 'paymentSafetyReviewed'].map(field => [field, business[field]])), wordingApproval: business.policyWordingApproval, catalogReview: business.catalogReviewApproval, effectiveDateBasis: business.policyEffectiveDateBasis, actualEffectiveDate: business.policyEffectiveDate, actualPublicationDate: business.policyPublicationDate, records };
fs.writeFileSync(new URL('./final-blocker-map.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
const text = ['# Remaining Production requirements - final business phase',
  `Verified 16 November 2026. **${issues.length} checker messages: ${configuration.length} configuration/sign-off and ${copy.length} rendered-copy.** Previous ${previous.count} → ${issues.length}: ${result.clearedSincePrevious.length} cleared, ${result.addedSincePrevious.length} added. Legal seller/controller **RAVINDU KAUSHAN**, registered business **SEKKIN LK**, contacts, tax/coupon/courier/COD and current-asset permissions are applied and are not requested again.`,
  `Approval flags: ${Object.entries(result.approvals).map(([key, value]) => `\`${key}=${value}\``).join(', ')}. The content checker is not a vulnerability scanner; technical evidence and actual hosted/operator requirements remain separate.`,
  `Against the original 77: ${result.resolvedOriginal.length} original messages resolved, ${result.remainingOriginal.length} remain, ${result.newMessages.length} later messages remain. Multiple messages share a missing requirement; this is not ${issues.length} independent business questions.`,
  '| Category | Checker messages |\n| --- | ---: |\n' + Object.entries(categoryCounts).map(([category, count]) => `| ${category} | ${count} |`).join('\n'),
  '## A. Technical completion and external verification',
  'The maintained backend migration and actual isolated PostgreSQL checks are recorded in the current final report and Backend/docs/MAINTAINED_BOOT_MIGRATION.md. Use the actual final scanner results, not earlier old-dependency warnings or an unfinished scan. Remaining deployment verification covers the real account TLS/datasource/proxy/CORS/logging/regions, authorized exposed-key/account containment and the matching reviewed revisions. See [urgent containment](URGENT_SECURITY_CONTAINMENT.md) and [Render steps](RENDER_SECURITY_RUNBOOK.md); containment must not wait for unrelated business approval. No production mutation is authorized automatically.',
];
for (const [category, title] of [['B', 'Actual provider and retention evidence'], ['C', 'Completion of the remaining factual policy disclosures'], ['D', 'Full security/deployment sign-off'], ['E', 'Owner-approved temporary catalog presentation']]) {
  const currentRecords = records.filter(record => record.category === category);
  text.push(`## ${category}. ${title}`, currentRecords.length
    ? '| # | Exact checker message | Exact source | Required action |\n| --- | --- | --- | --- |\n' + currentRecords.map(record => `| ${record.id} | ${record.message} | [${record.source}:${record.line}](../${record.source}#L${record.line}) — \`${record.field}\` | ${record.action} |`).join('\n')
    : 'No unresolved checker messages in this category. The actual catalog/image review is complete and the owner explicitly accepts the current dummy/placeholder imagery for the initial release, with original images to follow after launch. catalogReviewed is true for that documented temporary scope; no original-product photography verification or production correction is claimed.');
}
text.push('The owner approved consolidated wording version abe2b807, including consumer remedies, liability and Sri Lankan law/dispute provisions. The approved effective-date basis is the actual public launch; no calendar date has been invented. Use [the versioned policy package and approval record](FINAL_POLICY_REVIEW_PACKAGE.md), [specific catalog review](FINAL_CATALOG_REVIEW.md) and the current final release report. No repeat wording approval or general questionnaire is required. Regenerate with `node docs/release-verification/map-final-blockers.mjs`; historical owner-approval/phase2 maps are preserved.');
fs.writeFileSync(new URL('../PAYHERE_BLOCKER_INVENTORY.md', import.meta.url), text.join('\n\n') + '\n');
console.log(JSON.stringify({count: result.count, configuration: configuration.length, renderedCopy: copy.length, categoryCounts, clearedSincePrevious: result.clearedSincePrevious.length, addedSincePrevious: result.addedSincePrevious.length, resolvedOriginal: result.resolvedOriginal.length, remainingOriginal: result.remainingOriginal.length, newMessages: result.newMessages.length, approvals: result.approvals}));
