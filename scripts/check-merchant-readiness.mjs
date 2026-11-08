import { readFileSync } from 'node:fs';
import { getReadinessIssues, getDraftContentIssues } from '../src/content/readiness.js';
import { businessPages } from '../src/content/businessPages.js';

const business = JSON.parse(readFileSync(new URL('../src/content/business.json', import.meta.url), 'utf8'));
const issues = [...getReadinessIssues(business), ...getDraftContentIssues(businessPages)];
const directCheckout = readFileSync(new URL('../src/components/DirectCheckoutModal.jsx', import.meta.url), 'utf8');
if (/autoComplete=["']cc-(number|csc|exp)/.test(directCheckout)) issues.push('Remove legacy custom card-data inputs before deployment');
if (issues.length) {
  console.warn(`\nSEKKIN.LK is NOT ready for merchant submission: ${issues.length} unresolved items.`);
  for (const issue of issues) console.warn(`- ${issue}`);
  if (process.env.VERCEL || !process.argv.includes('--build')) process.exitCode = 1;
  else console.warn('Local draft build only. Do not publish these policies as final. Vercel builds are blocked until review is complete.\n');
} else console.log('Business-content checks passed. PayHere approval and manual security/deployment verification are still required.');
