import { readFileSync } from 'node:fs';
import { getReadinessIssues, getDraftContentIssues } from '../src/content/readiness.js';
import { businessPages } from '../src/content/businessPages.js';

const business = JSON.parse(readFileSync(new URL('../src/content/business.json', import.meta.url), 'utf8'));
const issues = [...getReadinessIssues(business), ...getDraftContentIssues(businessPages)];
const directCheckout = readFileSync(new URL('../src/components/DirectCheckoutModal.jsx', import.meta.url), 'utf8');
if (/autoComplete=["']cc-(number|csc|exp)/.test(directCheckout)) issues.push('Remove legacy custom card-data inputs before deployment');

// Vite uses production mode for Preview builds too. Only Vercel's deployment
// environment identifies a Preview. The --vercel marker keeps hosted builds
// strict even when all Vercel system environment variables are unavailable.
const isPreviewBuild = process.env.VERCEL_ENV === 'preview';
const isLocalBuild = !process.argv.includes('--vercel') && !process.env.VERCEL && !process.env.VERCEL_ENV;
const allowDraftBuild = process.argv.includes('--build') && (isPreviewBuild || isLocalBuild);

if (issues.length) {
  console.warn(`\nSEKKIN.LK is NOT ready for merchant submission: ${issues.length} unresolved items.`);
  for (const issue of issues) console.warn(`- ${issue}`);
  if (allowDraftBuild) {
    console.warn(`${isPreviewBuild ? 'Preview' : 'Local'} draft build only. Do not publish these policies as final. Production and merchant releases remain blocked until review is complete.\n`);
  } else {
    process.exitCode = 1;
    console.warn('Production and merchant builds require all readiness items to be resolved. Only explicit Vercel Preview or local UI builds may proceed with draft content.\n');
  }
} else console.log('Business-content checks passed. PayHere approval and manual security/deployment verification are still required.');
