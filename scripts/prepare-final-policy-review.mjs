import fs from 'node:fs';
import crypto from 'node:crypto';
import business from '../src/content/business.json' with { type: 'json' };
import { businessPages } from '../src/content/businessPages.js';
import { getReadinessIssues, getDraftContentIssues } from '../src/content/readiness.js';

const target = new URL('../docs/FINAL_POLICY_REVIEW_PACKAGE.md', import.meta.url);
const existing = fs.readFileSync(target, 'utf8');
const start = existing.indexOf('## Prepared page text');
const finish = existing.indexOf('## Approval and release limits');
if (start < 0 || finish < start) throw new Error('Policy review document structure changed; review before regenerating.');
const version = crypto.createHash('sha256')
  .update(fs.readFileSync(new URL('../src/content/business.json', import.meta.url)))
  .update(fs.readFileSync(new URL('../src/content/businessPages.js', import.meta.url)))
  .digest('hex');
const count = getReadinessIssues(business).length + getDraftContentIssues(businessPages).length;
let prefix = existing.slice(0, start)
  .replace(/SHA-256 of business\.json followed by businessPages\.js: `[a-f0-9]{64}`/, `SHA-256 of business.json followed by businessPages.js: \`${version}\``)
  .replace(/Current strict readiness: \d+ unresolved messages/, `Current strict readiness: ${count} unresolved messages`);
if (business.soleProprietorLegalName) {
  prefix = prefix.replace(/^Only two owner-supplied values[^\n]+/m,
    `The legal seller and data controller is now confirmed as **${business.soleProprietorLegalName}**, sole proprietor carrying on business as **${business.registeredName}**. That fact is applied and is not requested again. The remaining owner date decision is **the intended approved final policy effective date**. The actual publication/last-updated date will be recorded at the authorized publication event, not guessed in advance or substituted with the operational approval date.`)
    .replace('The personal contracting/controller identity remains the specific missing fact above.', `The confirmed legal seller and responsible data controller is **${business.soleProprietorLegalName}**, carrying on business as **${business.registeredName}**.`);
}
const text = ['## Prepared page text', 'The following text is generated from the actual existing policy components. REVIEW REQUIRED/draft statements remain only for outstanding factual/operator disclosures and final wording approval. This package is prepared for one consolidated review; it is not evidence of publication.'];
for (const [route, page] of Object.entries(businessPages)) {
  text.push(`### ${page.title} - /${route}`, page.intro);
  for (const section of page.sections) text.push(`#### ${section.title} - #${section.id}`, ...section.body);
}
fs.writeFileSync(target, prefix + text.join('\n\n') + '\n\n' + existing.slice(finish));
console.log(JSON.stringify({ version, unresolved: count, proprietor: business.soleProprietorLegalName, policyEffectiveDate: business.policyEffectiveDate, policyPublicationDate: business.policyPublicationDate }));
