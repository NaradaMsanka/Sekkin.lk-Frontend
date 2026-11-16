import fs from 'node:fs';
import crypto from 'node:crypto';

export function catalogSourceIssues({ release, snapshot, business, sourceBusiness, sourceEvidence, pages, assetHash }) {
  const issues = [];
  if (release.mode !== 'PUBLIC_CATALOG') issues.push('Catalog mode must be explicitly selected.');
  for (const key of ['orderingEnabled', 'accountsEnabled', 'onlinePaymentsEnabled']) if (release[key] !== false) issues.push(`${key} must be false.`);
  if (release.frontendOrigin !== 'https://sekkin-lk-frontend.vercel.app' || release.backendOrigin !== 'https://sekkin-lk-backend.onrender.com') issues.push('Preserve the approved existing service origins.');
  if (!sourceBusiness.contactsConfirmed || !sourceBusiness.catalogReviewed || !sourceBusiness.catalogReviewApproval?.temporaryPlaceholderImagesAccepted) issues.push('Confirmed contacts and the owner-approved temporary catalog are required.');
  if (snapshot.sourceCatalogVersionSha256 !== sourceBusiness.catalogReviewApproval?.catalogVersionSha256) issues.push('The static snapshot must match the reviewed catalog version.');
  if (!snapshot.products?.length) issues.push('A verified nonempty product snapshot is required.');
  for (const key of Object.keys(business)) {
    const original = ['refund', 'shipping'].includes(key) ? sourceBusiness[key] : key === 'terms' ? Object.fromEntries(['liability', 'governingLaw', 'updates'].map(field => [field, sourceBusiness.terms[field]])) : sourceBusiness[key];
    if (JSON.stringify(business[key]) !== JSON.stringify(original)) issues.push(`Catalog business field ${key} must match the approved source.`);
  }
  for (const item of snapshot.products || []) {
    if (!Number.isSafeInteger(item.id) || item.id <= 0 || !item.name?.trim() || !Number.isFinite(item.price) || item.price < 0) issues.push('Invalid snapshot product identity/price.');
    for (const image of [item.imageUrl, ...(item.images || [])].filter(Boolean)) if (!/^\/catalog\/[a-z0-9-]+\.webp$/.test(image)) issues.push('Catalog images must be local reviewed assets.');
    const original = sourceEvidence?.products?.find(product => product.id === item.id);
    if (!original || ['id', 'name', 'description', 'price', 'discountPrice', 'brand', 'stockQuantity', 'skinType', 'ingredients', 'status'].some(key => item[key] !== original[key])) issues.push(`Product ${item.id} does not match the actual reviewed snapshot.`);
  }
  if (snapshot.products?.length !== sourceEvidence?.products?.length) issues.push('Do not add or remove approved snapshot products without review.');
  for (const asset of snapshot.assetProvenance || []) if (assetHash(asset.path) !== asset.sha256) issues.push(`Reviewed image hash mismatch: ${asset.path}`);
  for (const page of Object.values(pages)) if (/REVIEW REQUIRED|\bThis (?:is a )?draft\b/i.test(JSON.stringify(page))) issues.push('Catalog disclosures must be complete and truthful for catalog mode.');
  return issues;
}

export function containmentEvidenceIssues(evidence, expectedOrigin, now = Date.now()) {
  if (!evidence || evidence.backendOrigin !== expectedOrigin || !/^[a-f0-9]{40}$/.test(evidence.backendRevision || '') || evidence.mode !== 'PUBLIC_CATALOG') return ['Actual reviewed backend containment evidence is required.'];
  const age = now - Date.parse(evidence.verifiedAtUtc);
  const issues = [];
  if (!Number.isFinite(age) || age < -60_000 || age > 24 * 60 * 60 * 1000) issues.push('Backend containment verification must be current.');
  if (evidence.databaseInitialized !== false || evidence.jwtInitialized !== false) issues.push('Containment must not initialize database/JWT services.');
  for (const path of ['/api/orders/direct', '/api/orders', '/api/auth/login', '/api/auth/register']) if (!evidence.mutationChecks?.some(check => check.path === path && check.status === 503)) issues.push(`Verified direct mutation denial required: ${path}`);
  return issues;
}

export async function verifyLiveContainment(evidence, origin, fetcher = fetch) {
  const response = await fetcher(`${origin}/.well-known/sekkin-release`, { redirect: 'error', signal: AbortSignal.timeout(30_000), cache: 'no-store' });
  if (!response.ok) throw new Error('The backend containment marker is unavailable.');
  const marker = await response.json();
  if (marker.releaseMode !== 'PUBLIC_CATALOG' || marker.ordering !== 'DISABLED' || marker.accounts !== 'DISABLED' || marker.payments !== 'DISABLED' || marker.databaseInitialized !== false || marker.jwtInitialized !== false || marker.revision !== evidence.backendRevision) throw new Error('The deployed backend does not match the reviewed non-transactional containment revision.');
  return marker;
}

export function readCatalogInputs() {
  const json = relative => JSON.parse(fs.readFileSync(new URL(`../${relative}`, import.meta.url), 'utf8'));
  return {
    release: json('config/release.json'), snapshot: json('src/catalog/catalogSnapshot.json'),
    business: json('src/catalog/catalogBusiness.json'), sourceBusiness: json('src/content/business.json'),
    sourceEvidence: json('docs/release-verification/final-catalog-snapshot.json'),
    assetHash: image => crypto.createHash('sha256').update(fs.readFileSync(new URL(`../public${image}`, import.meta.url))).digest('hex'),
  };
}
