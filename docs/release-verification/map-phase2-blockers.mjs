import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import business from '../../src/content/business.json' with { type: 'json' };
import { businessPages } from '../../src/content/businessPages.js';
import { getReadinessIssues, getDraftContentIssues } from '../../src/content/readiness.js';

const configuration = getReadinessIssues(business);
const copy = getDraftContentIssues(businessPages);
const issues = [...configuration, ...copy];
const previous = JSON.parse(fs.readFileSync(new URL('./fixed-delivery-readiness.json', import.meta.url)));
const actions = {
  registeredName: 'Provide the legal seller name, business type/registration status and registration number if applicable. The brand/trading name is already confirmed.',
  'refund.damagedItems': 'Decide inspection, remedy selection and dispute procedure for wrong/damaged/faulty items; retain confirmed reporting and business-paid return delivery.',
  'refund.requestProcedure': 'Provide the actual return destination, authorization and detailed instructions. Do not assume the business contact address is the return address.',
  'refund.refundMethod': 'Choose the COD refund method and inspection/outcome communication/dispute process; receipt and inspection before refund are already confirmed.',
  'refund.refundTimeline': 'Specify refund processing duration and its start event.',
  'refund.cancellations': 'Specify how a pre-dispatch cancellation is confirmed. Do not re-approve the confirmed cancellation rule.',
  'refund.exchanges': 'Specify exchange processing time and treatment of a lower-priced replacement; retain the confirmed seven-day/condition/cost rules.',
  'refund.consumerRights': 'Supply appropriately reviewed mandatory consumer-rights wording and remedies; no blanket hygiene exclusion or waiver.',
  'shipping.processing': 'Specify order processing/dispatch time, working days and any cut-off.',
  'shipping.deliveryEstimate': 'Specify whether the confirmed 2–3-business-day estimate begins at confirmation or dispatch, and the weekend/holiday calendar.',
  'shipping.tracking': 'Specify whether tracking is available and the actual customer communication channel; do not claim an unimplemented integration.',
  'shipping.delays': 'Specify customer notification/support procedure for courier delays.',
  'shipping.failedDelivery': 'Specify attempts, unavailable recipients, wrong addresses, redelivery/returned-parcel procedure and related charges.',
  'privacy.controller': 'Identify the responsible legal data controller using verified seller identity.',
  'privacy.processingLocations': 'Operator verifies actual provider-account regions, access/transfers and service arrangements; owner approves the resulting disclosure. Do not infer regions from provider names.',
  'privacy.retention': 'Decide category-specific retention and deletion/backup/log treatment for accounts, orders, reviews and support.',
  'privacy.rightsProcedure': 'Define access/correction/deletion requests, identity checks, responsible staff and response times. Support email is already confirmed.',
  'terms.orderAcceptance': 'Decide legal acceptance point and stock/price-error handling/customer notice.',
  'terms.pricesAndTaxes': 'Confirm tax status and whether prices include applicable taxes; approve pricing-error/price-change treatment. Do not invent tax obligations.',
  'terms.paymentMethods': 'Decide COD collection confirmation, failed collection and eligibility rules. COD itself and pending PayHere status need no new approval.',
  'terms.intellectualProperty': 'Verify brand/website/image/supplier-content rights and approve use terms.',
  'terms.liability': 'Obtain reviewed liability wording preserving mandatory consumer rights.',
  'terms.complaints': 'Define complaint acknowledgement, resolution/escalation and response time. Confirmed contacts/hours are unchanged.',
  'terms.governingLaw': 'Provide appropriately reviewed governing-law/dispute provisions.',
  'terms.updates': 'Approve policy version/change notifications and actual effective/publication dates after final review.',
  contactsConfirmed: 'Verify supplied contacts in the implementation and complete missing legal identity. Do not ask the owner to re-confirm existing contact facts or set this flag automatically.',
  policiesApproved: 'Owner/legal review of all six completed pages and actual dates; set true only after genuine final approval.',
  catalogReviewed: 'Review genuine SKUs, variants, descriptions/claims, authorized relevant images, LKR prices/discounts and actual stock. No production catalog mutation is authorized.',
  paymentSafetyReviewed: 'Finish security/inventory/session/abuse controls and verify the reviewed deployed revisions/runtime settings. Passing local tests alone cannot approve this flag.',
};
const dependencies = {
  'refund-policy#damaged-items': 'refund.damagedItems',
  'refund-policy#request': 'refund.requestProcedure',
  'refund-policy#refunds': 'refund.refundMethod; refund.refundTimeline',
  'refund-policy#cancellations': 'refund.cancellations',
  'refund-policy#exchanges': 'refund.exchanges',
  'refund-policy#rights': 'refund.consumerRights',
  'privacy-policy': 'All privacy sections; policiesApproved',
  'privacy-policy#controller': 'registeredName; privacy.controller',
  'privacy-policy#services': 'privacy.processingLocations; operator dashboard verification (D)',
  'privacy-policy#payments': 'Payment-data policy approval; historical records/log exposure review (D)',
  'privacy-policy#retention': 'privacy.retention',
  'privacy-policy#rights': 'privacy.rightsProcedure',
  'privacy-policy#updates': 'terms.updates; actual final dates',
  'terms-and-conditions': 'All Terms sections; policiesApproved',
  'terms-and-conditions#identity': 'registeredName; business type/status',
  'terms-and-conditions#products': 'catalogReviewed; genuine catalog and image/claim rights (E)',
  'terms-and-conditions#prices': 'terms.pricesAndTaxes',
  'terms-and-conditions#orders': 'terms.orderAcceptance',
  'terms-and-conditions#payments': 'terms.paymentMethods; verified COD collection procedure (D)',
  'terms-and-conditions#ownership': 'terms.intellectualProperty',
  'terms-and-conditions#liability': 'terms.liability',
  'terms-and-conditions#complaints': 'terms.complaints',
  'terms-and-conditions#law': 'terms.governingLaw',
  'terms-and-conditions#changes': 'terms.updates; actual final dates',
  'shipping-policy#processing': 'shipping.processing',
  'shipping-policy#timelines': 'shipping.deliveryEstimate; retain confirmed estimate/fee',
  'shipping-policy#tracking': 'shipping.tracking',
  'shipping-policy#delays': 'shipping.delays',
  'shipping-policy#failed-delivery': 'shipping.failedDelivery',
  'about#care': 'Final policy completion and policiesApproved',
  'about#business': 'registeredName; verified business type/status',
  'contact#availability': 'registeredName; verified legal identity (contacts/hours already supplied)',
};
const configurationText = fs.readFileSync(new URL('../../src/content/business.json', import.meta.url), 'utf8');
const pagesText = fs.readFileSync(new URL('../../src/content/businessPages.js', import.meta.url), 'utf8');
const line = (text, offset) => text.slice(0, offset).split('\n').length;
const records = issues.map((message, index) => {
  if (index < configuration.length) {
    const key = message.startsWith('Confirm business.') ? message.replace('Confirm business.', '')
      : message.startsWith('Review ') ? message.replace('Review ', '') : message.split(': ')[1];
    if (!actions[key]) throw Error(`Unmapped field ${key}`);
    const leaf = key.split('.').at(-1);
    const offset = configurationText.indexOf(`"${leaf}"`);
    const category = key === 'policiesApproved' ? 'C' : key === 'catalogReviewed' ? 'E' : key === 'paymentSafetyReviewed' ? 'D' : 'B';
    return { id: index + 1, message, category, source: 'src/content/business.json', line: line(configurationText, offset), field: key, action: actions[key] };
  }
  const target = message.split(': /')[1];
  if (!dependencies[target]) throw Error(`Unmapped page ${target}`);
  const [route, anchor] = target.split('#');
  const pageStart = pagesText.indexOf(route.includes('-') ? `'${route}':` : `  ${route}:`);
  const offset = pagesText.indexOf(anchor ? `section('${anchor}',` : 'intro:', pageStart);
  if (pageStart < 0 || offset < 0) throw Error(`Missing source for ${target}`);
  return { id: index + 1, message, category: target === 'terms-and-conditions#products' ? 'E' : 'C',
    source: 'src/content/businessPages.js', line: line(pagesText, offset), field: target,
    dependencies: dependencies[target], action: `Complete and obtain approval for /${target} after: ${dependencies[target]}. Keep draft markers until approved.` };
});
const counts = Object.fromEntries(['A','B','C','D','E'].map(category => [category, records.filter(item => item.category === category).length]));
const result = { date: '2026-11-16', count: issues.length, configurationCount: configuration.length, renderedCopyCount: copy.length,
  categoryCounts: counts, clearedSinceFixedDelivery: previous.current.filter(message => !issues.includes(message)),
  addedSinceFixedDelivery: issues.filter(message => !previous.current.includes(message)),
  approvals: Object.fromEntries(['contactsConfirmed','policiesApproved','catalogReviewed','paymentSafetyReviewed'].map(key => [key, business[key]])), records };
fs.writeFileSync(new URL('./phase2-blocker-map.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
const sections = [
  '# Remaining Production blocker map - phase 2',
  'Verified 16 November 2026. **61 checker messages: 29 configuration/sign-off and 32 rendered-copy checks.** Security work cleared no business/policy check. All approvals remain false. This map includes every live checker message with its exact source and action. It groups primary responsibility; dependencies can span groups, and multiple messages often share one missing decision.',
  '| Category | Checker messages |\n| --- | --- |\n| A. Local technical defects | 0 directly represented |\n| B. Business facts/decisions and complete identity/contact review | 26 |\n| C. Policy sections and final policy approval | 32 |\n| D. Backend security/deployment sign-off | 1 |\n| E. Product catalog and corresponding Terms section | 2 |\n| **Total** | **61** |',
  '## A. Technical issues fixed or still requiring local implementation',
  'The checker is a content/sign-off gate, not a security scanner. Zero category-A checker messages does not mean zero technical risk. Backend paths in the table are relative to `Backend/src/main/java/com/cosmetic/ecommerce/`; frontend paths are relative to `Frontend/frontend/`. See [the phase-2 report](PRODUCTION_PHASE2_REPORT.md) for completed fixes and [backend release/security instructions](RENDER_SECURITY_RUNBOOK.md) for verification.',
  '| Remaining technical task | Exact backend source | Required action |\n| --- | --- | --- |\n| Concurrent inventory/cart integrity | `service/OrderService.java`, `service/CartService.java`, `repository/ProductRepository.java`, `repository/CartRepository.java` | Add and test stock/cart locking or conditional updates, deterministic multi-product lock order and transaction rollback under concurrency. |\n| Duplicate order requests | `controller/OrderController.java`, `service/OrderService.java`, `entity/Order.java`, `repository/OrderRepository.java` | Design persistent idempotency keys with a reviewed migration and safe replay semantics; frontend in-flight guards do not cover retries. |\n| Session and abuse controls | `util/JwtUtil.java`, `controller/AuthController.java`, `entity/User.java`; frontend `src/services/api.js` | Review seven-day localStorage sessions, password policy, targeted revocation, login/reset protection and rate limiting. No per-user revocation/disable/reset mechanism is implemented. |\n| COD collection and status transition workflow | `service/OrderService.java`, `controller/OrderController.java`, `entity/Order.java` | Implement an auditable authorized collection workflow after operations are decided; define allowed transitions/cancellation stock effects. Fulfilment allowlist does not establish valid transitions or payment collection. |\n| Price/quote changes and response minimization | `service/OrderService.java`, `controller/OrderController.java`; frontend `src/pages/Checkout.jsx` | Consider reserved/accepted price quotes and dedicated order DTOs; pre-submit totals remain estimates and raw order entities still need minimization. |',
];
sections[sections.length - 1] += '\n| Admin all-order reporting | Frontend `src/pages/AdminDashboard.jsx`; backend `controller/AdminController.java`, `service/AdminService.java` | Replace customer-scoped reporting calls with a dedicated protected admin order DTO/endpoint and test customer/guest rejection. |';
for (const [category, title] of [['B','Business decisions and complete identity review'],['C','Owner-approved policy sections'],['D','Backend security and deployment sign-off'],['E','Product catalog review']]) {
  const rows = ['| # | Exact checker message | Source | Required action / dependency |', '| --- | --- | --- | --- |'];
  for (const item of records.filter(item => item.category === category)) {
    rows.push(`| ${item.id} | ${item.message} | [${item.source}:${item.line}](../${item.source}#L${item.line}) — \`${item.field}\` | ${item.action} |`);
  }
  sections.push(`## ${category}. ${title}`, rows.join('\n'));
}
sections.push('## Additional hosted verification, outside the 61-message count',
  '- Verify Render runtime JWT/database/CORS settings, current roles/accounts, previous exposure, actual processing regions and schema validation on an isolated staging database. Do not print credentials or rewrite historical ownership/amounts automatically.\n- Verify the exact reviewed backend revision, Vercel Production API URL/root/build/output/system variables, SPA refreshes, approved origin list and assigned source SHA/domain. Real merchant/Production builds must reach zero issues.\n- Complete genuine catalog/image/price/stock approval without inventing or changing production products in this task.\n- Keep live card/KOKO/PayHere disabled. No successful local check establishes a deployed security or owner sign-off.',
  'The [short remaining questionnaire](PAYHERE_BUSINESS_QUESTIONNAIRE.md) does not repeat supplied facts. The [phase-2 report](PRODUCTION_PHASE2_REPORT.md) distinguishes local completion from hosted and owner work. This file is generated by `node docs/release-verification/map-phase2-blockers.mjs`; no validator/configuration is modified.');
fs.writeFileSync(fileURLToPath(new URL('../PAYHERE_BLOCKER_INVENTORY.md', import.meta.url)), sections.join('\n\n') + '\n');
console.log(JSON.stringify({count: result.count, configuration: configuration.length, copy: copy.length, categories: counts,
  cleared: result.clearedSinceFixedDelivery, added: result.addedSinceFixedDelivery, approvals: result.approvals}, null, 2));
