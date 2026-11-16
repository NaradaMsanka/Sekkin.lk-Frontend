import fs from 'node:fs';
import business from '../../src/content/business.json' with { type: 'json' };
import { businessPages } from '../../src/content/businessPages.js';
import { getReadinessIssues, getDraftContentIssues } from '../../src/content/readiness.js';

const configuration = getReadinessIssues(business);
const copy = getDraftContentIssues(businessPages);
const issues = [...configuration, ...copy];
const previous = JSON.parse(fs.readFileSync(new URL('./phase2-blocker-map.json', import.meta.url)));
const original = JSON.parse(fs.readFileSync(new URL('./original-blockers.json', import.meta.url))).issues;
const actions = {
  registeredName: 'Supply the actual legal seller name, business type/registration status and registration number if applicable. Approval of procedures does not supply these unknown facts.',
  'refund.consumerRights': 'Provide appropriately reviewed consumer-rights/remedy wording. Existing rights-preservation statements and approved return procedures remain; no legal review is inferred from general approval.',
  'shipping.failedDelivery': 'Verify the actual courier attempt limit, redelivery availability and failed-delivery/returned-parcel charges. Contact-before-reshipping and disclosed/accepted additional charges are already approved.',
  'privacy.controller': 'Identify the verified legal party responsible for personal information after the actual legal seller is supplied.',
  'privacy.processingLocations': 'Deployment operator verifies actual Vercel/Render/Supabase/Cloudinary account regions, administrative access, transfers and service arrangements; approve the accurate resulting disclosure. Do not guess locations.',
  'privacy.retention': 'Choose category-specific retention periods and verify feasible deletion/anonymization, log and backup-expiration treatment. Necessity/required-record principles and the manual request process are already approved.',
  'terms.pricesAndTaxes': 'Supply tax registration status and inclusive-pricing treatment; approve actual coupon eligibility, expiry, usage and stacking terms after inspecting supported controls. Price-error consent and merchandise-only discounts are already approved.',
  'terms.paymentMethods': 'Verify actual courier COD collection evidence/settlement, authorized reconciliation, failed-payment handling and any eligibility restrictions. COD/pending-until-verified principles are already approved; do not invent an operational settlement process.',
  'terms.intellectualProperty': 'Confirm permissions/rights for the brand, website assets, product images and supplier descriptions and approve appropriate use terms. A reachable image URL is not permission.',
  'terms.liability': 'Provide appropriately reviewed liability wording preserving mandatory consumer rights; no blanket exclusion is approved.',
  'terms.governingLaw': 'Provide appropriately reviewed governing-law and dispute-resolution wording based on the actual business.',
  'terms.updates': 'Complete final policy/legal review and supply the intended effective date; record publication/last-updated dates only for actual approved publication. Update/notification procedures are already approved.',
  contactsConfirmed: 'Complete verified legal seller identity and review the implemented contact/identity disclosures. Existing supplied contacts need no repeated approval; a complete sign-off is still unearned.',
  policiesApproved: 'Complete outstanding facts/legal sections and dates, then obtain approval of the finished six pages. Approval of proposed procedures is recorded but does not finalize unresolved policy text.',
  catalogReviewed: 'Review the genuine records against actual SKU/variant/description/claim/image-right/price/stock/fulfilment evidence in CATALOG_APPROVAL_REVIEW.md. No production catalog change or automatic approval is authorized.',
  paymentSafetyReviewed: 'Complete local security/inventory/idempotency/session/abuse/COD controls and independent runtime/credential/schema/hosted verification. No successful local test alone earns the full sign-off.',
};
const dependencies = {
  'refund-policy#rights': 'refund.consumerRights; appropriately reviewed mandatory remedies',
  'privacy-policy': 'all remaining privacy sections and complete policy approval',
  'privacy-policy#controller': 'registeredName; privacy.controller',
  'privacy-policy#services': 'privacy.processingLocations; actual provider-account verification',
  'privacy-policy#payments': 'payment-data disclosure approval and historical record/log exposure review; current COD-only code does not establish historical absence of collection',
  'privacy-policy#retention': 'privacy.retention; feasible deletion and backup treatment',
  'privacy-policy#updates': 'terms.updates; final policy approval and actual dates',
  'terms-and-conditions': 'remaining Terms sections and completed policy approval',
  'terms-and-conditions#identity': 'registeredName; actual legal business type/status',
  'terms-and-conditions#products': 'catalogReviewed; genuine catalog and image/claim rights',
  'terms-and-conditions#prices': 'terms.pricesAndTaxes; supported and approved coupon terms',
  'terms-and-conditions#payments': 'terms.paymentMethods; actual COD evidence/settlement and technical workflow',
  'terms-and-conditions#ownership': 'terms.intellectualProperty',
  'terms-and-conditions#liability': 'terms.liability; mandatory consumer rights',
  'terms-and-conditions#law': 'terms.governingLaw',
  'terms-and-conditions#changes': 'terms.updates; final policy approval and actual dates',
  'shipping-policy#failed-delivery': 'shipping.failedDelivery; verified courier attempt/charge/availability facts',
  'about#care': 'completion and approval of the remaining policy text',
  'about#business': 'registeredName; actual legal business type/status',
  'contact#availability': 'registeredName; verified legal identity and any merchant-required address details',
};
const configurationText = fs.readFileSync(new URL('../../src/content/business.json', import.meta.url), 'utf8');
const pagesText = fs.readFileSync(new URL('../../src/content/businessPages.js', import.meta.url), 'utf8');
const line = (text, offset) => text.slice(0, offset).split('\n').length;
const records = issues.map((message, index) => {
  if (index < configuration.length) {
    const key = message.startsWith('Confirm business.') ? message.replace('Confirm business.', '')
      : message.startsWith('Review ') ? message.replace('Review ', '') : message.split(': ')[1];
    if (!actions[key]) throw Error(`Unmapped configuration field ${key}`);
    const offset = configurationText.indexOf(`"${key.split('.').at(-1)}"`);
    if (offset < 0) throw Error(`Missing configuration source ${key}`);
    const category = key === 'policiesApproved' ? 'C' : key === 'catalogReviewed' ? 'E' : key === 'paymentSafetyReviewed' ? 'D' : 'B';
    return { id: index + 1, message, category, source: 'src/content/business.json', line: line(configurationText, offset), field: key, action: actions[key] };
  }
  const target = message.split(': /')[1];
  if (!dependencies[target]) throw Error(`Unmapped policy section ${target}`);
  const [route, anchor] = target.split('#');
  const pageStart = pagesText.indexOf(route.includes('-') ? `'${route}':` : `  ${route}:`);
  const offset = pagesText.indexOf(anchor ? `section('${anchor}',` : 'intro:', pageStart);
  if (pageStart < 0 || offset < 0) throw Error(`Missing source for ${target}`);
  return { id: index + 1, message, category: target === 'terms-and-conditions#products' ? 'E' : 'C',
    source: 'src/content/businessPages.js', line: line(pagesText, offset), field: target,
    dependencies: dependencies[target], action: `Complete and approve /${target} after resolving: ${dependencies[target]}. Keep the remaining review/draft disclosure until that review is complete.` };
});
const categoryCounts = Object.fromEntries(['A', 'B', 'C', 'D', 'E'].map(category => [category, records.filter(item => item.category === category).length]));
const previousIssues = previous.records.map(item => item.message);
const resolvedOriginal = original.filter(message => !issues.includes(message));
const remainingOriginal = original.filter(message => issues.includes(message));
const newMessages = issues.filter(message => !original.includes(message));
const result = {
  date: '2026-11-16', phase: 'owner-operational-approval', count: issues.length,
  configurationCount: configuration.length, renderedCopyCount: copy.length, categoryCounts,
  previousPhaseCount: previous.count,
  clearedSincePhase2: previousIssues.filter(message => !issues.includes(message)),
  addedSincePhase2: issues.filter(message => !previousIssues.includes(message)),
  originalCount: original.length, resolvedOriginalCount: resolvedOriginal.length,
  remainingOriginalCount: remainingOriginal.length, newMessageCount: newMessages.length,
  resolvedOriginal, remainingOriginal, newMessages,
  approvals: Object.fromEntries(['contactsConfirmed', 'policiesApproved', 'catalogReviewed', 'paymentSafetyReviewed'].map(key => [key, business[key]])),
  records,
};
fs.writeFileSync(new URL('./owner-approval-blocker-map.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
const sections = [
  '# Remaining Production blocker map - operational approval',
  `Verified 16 November 2026. **${issues.length} checker messages: ${configuration.length} configuration/sign-off and ${copy.length} rendered-copy checks.** The owner approved the proposed operational procedures; ${result.clearedSincePhase2.length} messages cleared from the previous ${previous.count}, and ${result.addedSincePhase2.length} were added. All four full approval flags remain false. This map lists every live message with its exact source/action and groups primary responsibility once; dependencies span groups.`,
  `| Category | Checker messages |\n| --- | ---: |\n| A. Local technical controls | ${categoryCounts.A} directly represented |\n| B. Missing facts/decisions and complete identity/contact review | ${categoryCounts.B} |\n| C. Remaining policy text and final policy approval | ${categoryCounts.C} |\n| D. Backend security/deployment sign-off | ${categoryCounts.D} |\n| E. Real catalog and corresponding Terms section | ${categoryCounts.E} |\n| **Total** | **${issues.length}** |`,
  `The original 77-message baseline now has **${resolvedOriginal.length} genuinely resolved original messages, ${remainingOriginal.length} original messages remaining, and ${newMessages.length} later identity-disclosure message** (${remainingOriginal.length} + ${newMessages.length} = ${issues.length}; net decrease ${original.length - issues.length}). Historical phase-2 evidence remains unchanged. See [operational approval](OWNER_APPROVAL_RECORD.md), [the current report](OWNER_APPROVAL_PHASE_REPORT.md) and [the real catalog review](CATALOG_APPROVAL_REVIEW.md).`,
  '## A. Local technical work and verification outside the content count',
  'The checker is a content/sign-off gate, not a backend vulnerability scanner. Zero category-A messages does not establish zero technical risk. Local order/session controls and their verification are recorded in OWNER_APPROVAL_PHASE_REPORT.md; actual PostgreSQL, hosted integration and operational review remain required. This source map awards no deployed approval. Backend paths below are relative to `Backend/src/main/java/com/cosmetic/ecommerce/`.',
  '**Additional technical blocker:** `Backend/pom.xml` still uses the old Spring Boot 3.3.3 dependency set. Complete the maintained dependency migration, effective-graph vulnerability scan and container/runtime verification described in [DEPENDENCY_SECURITY_REVIEW.md](DEPENDENCY_SECURITY_REVIEW.md). The local password-input guard is not a library patch. This requirement is outside the 36 content messages.',
  '| Technical requirement | Exact source / scope | Required completion or evidence |\n| --- | --- | --- |\n| Inventory/cart concurrency | `service/OrderService.java`, `CartService.java`, `repository/ProductRepository.java`, `CartRepository.java` | Review atomic locking/conditional updates, deterministic multi-product lock order, stock rollback and concurrent cart changes with meaningful isolated persistence/concurrency tests. |\n| Durable request replay | `controller/OrderController.java`, `service/OrderService.java`, `entity/Order.java`, `repository/OrderRepository.java` and any new idempotency service/migration | Persist and test idempotency scope, changed-input rejection, concurrent duplicates and response replay. Review/apply any schema migration only through the authorized operator process. Browser in-flight guards alone are insufficient. |\n| Sessions and abuse controls | `util/JwtUtil.java`, `config/JwtFilter.java`, `controller/AuthController.java`, `entity/User.java`, `config/AbuseRateLimitFilter.java` and related services; frontend `src/services/api.js` | Verify current-account authority/session/disable/revocation rules, token expiry, password rules, login/checkout limits and generic failures. Review multi-instance enforcement and migration requirements; no deployed effectiveness is inferred. |\n| Auditable COD and fulfilment | `controller/OrderController.java`, `service/OrderService.java`, `entity/Order.java` and corresponding admin workflow | Verify authorized evidence-backed collection, allowed transitions and audit records against the actual courier settlement procedure. DELIVERED or a client request alone must not mark PAID. Verify cancellation stock effects and historical immutability. |\n| Price consent and minimized responses | `service/OrderService.java`, `controller/OrderController.java`, response DTOs; frontend `src/pages/Checkout.jsx`, `src/components/DirectCheckoutModal.jsx` | Verify agreement to current prices before creation, safe quote/retry behaviour, owned/admin response boundaries and unchanged historical totals. No raw entities or totals should be trusted merely because a fixture passes. |\n| Admin order reporting | Frontend `src/pages/AdminDashboard.jsx`; backend `controller/AdminController.java`, `service/AdminService.java` | Verify a protected admin all-order response and guest/customer rejection against actual authorization. Mocked browser data does not establish hosted completeness. |',
];
for (const [category, title] of [['B', 'Missing business facts and complete identity review'], ['C', 'Remaining policy sections and final approval'], ['D', 'Backend security and deployment sign-off'], ['E', 'Genuine product catalog review']]) {
  const rows = ['| # | Exact checker message | Exact source | Required action / dependency |', '| --- | --- | --- | --- |'];
  for (const item of records.filter(record => record.category === category)) {
    rows.push(`| ${item.id} | ${item.message} | [${item.source}:${item.line}](../${item.source}#L${item.line}) — \`${item.field}\` | ${item.action} |`);
  }
  sections.push(`## ${category}. ${title}`, rows.join('\n'));
}
sections.push('## Hosted and operator evidence still required',
  '- Verify actual Render JWT/datasource/CORS/logging/profile/schema settings and migrations on isolated staging; perform coordinated credential rotation and old-session invalidation and review historical exposure without printing secrets.\n- Verify actual provider-account regions/access, courier COD collection/settlement and genuine inventory/image rights. General approval cannot supply these facts.\n- Verify exact matching Render/Vercel revisions, real Preview/Production environment values, SPA direct refresh, API ownership/admin 401/403 boundaries, exact browser origins and stored totals in an authorized isolated arrangement.\n- Earn each full sign-off only from its real requirements; merchant and Production checks must independently reach zero. Keep PayHere/KOKO/card payments disabled and preserve fixed LKR 350 plus stored historical totals. No automatic deployment or production writes are authorized.',
  'Regenerate with `node docs/release-verification/map-owner-approval-blockers.mjs`. The [machine-readable map](release-verification/owner-approval-blocker-map.json) records all messages, sources, actions and exact original/phase-2 comparisons. The checker, build commands and validation rules are unchanged; historical phase-2 artifacts are not regenerated by this script.');
fs.writeFileSync(new URL('../PAYHERE_BLOCKER_INVENTORY.md', import.meta.url), sections.join('\n\n') + '\n');
console.log(JSON.stringify({count: result.count, configuration: configuration.length, renderedCopy: copy.length,
  categoryCounts, clearedSincePhase2: result.clearedSincePhase2.length, addedSincePhase2: result.addedSincePhase2.length,
  resolvedOriginal: resolvedOriginal.length, remainingOriginal: remainingOriginal.length, newMessages, approvals: result.approvals}, null, 2));
