import fs from 'node:fs';
import { catalogPages } from '../src/catalog/catalogContent.js';
import { catalogSourceIssues, containmentEvidenceIssues, readCatalogInputs, verifyLiveContainment } from './catalog-readiness.mjs';
import { requiresHostedVerification } from './release-mode.mjs';

try {
  const inputs = readCatalogInputs();
  const issues = catalogSourceIssues({ ...inputs, pages: catalogPages });
  if (issues.length) throw new Error(issues.join('\n'));
  if (requiresHostedVerification(process.argv)) {
    const path = new URL('../docs/release-verification/catalog-backend-containment.json', import.meta.url);
    const evidence = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, 'utf8')) : null;
    const issues = containmentEvidenceIssues(evidence, inputs.release.backendOrigin);
    if (issues.length) throw new Error(issues.join('\n'));
    await verifyLiveContainment(evidence, inputs.release.backendOrigin);
    console.log('PUBLIC_CATALOG Production safety checks passed: static reviewed catalog; ordering/accounts/payments disabled; actual backend containment verified.');
  } else console.log('Local/Preview PUBLIC_CATALOG source checks passed. Production additionally requires actual deployed backend containment; this does not approve a transactional release.');
} catch (error) {
  console.error(`PUBLIC_CATALOG release blocked: ${error.message}`);
  process.exitCode = 1;
}
