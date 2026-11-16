# Operational approval and remaining release requirements

**Current status, 16 November 2026: 10 unresolved readiness messages; public Production remains NO-GO.** Use [FINAL_PRODUCTION_COMPLETION_REPORT.md](FINAL_PRODUCTION_COMPLETION_REPORT.md) as the authoritative current report and [the current source/action inventory](PAYHERE_BLOCKER_INVENTORY.md). Of the original 77 messages, 67 are resolved and 10 remain. The owner approved the exact consolidated policy wording and the actual public-launch date as its effective-date basis; no further owner date decision is requested and no publication date is invented. `contactsConfirmed` and `catalogReviewed` are true. Catalog approval expressly accepts temporary illustrative/dummy imagery for the initial release, with replacement planned after deployment; `actualProductPhotographyVerified` remains false. Complete policy and payment-safety sign-offs remain false while factual/operator requirements remain. The full backend package passed 209 tests, including 14 real isolated PostgreSQL cases; actual hosted settings and deployment effectiveness remain unverified. Current browser/build/scan results are recorded only in the final report as they complete. **All 13/21/36/61-message phase snapshots and earlier test results below are historical.**

## Historical operational-approval snapshot

Recorded 16 November 2026 before the final registration, tax, courier and proprietor confirmations. The owner's approval of the proposed operational procedures reduced readiness from 61 to 36 messages at that revision. The remaining facts and flags described below reflect that historical phase; they are not the current status.

The [approval record](OWNER_APPROVAL_RECORD.md) retains the approval history. The [historical 36-message source map](release-verification/owner-approval-blocker-map.json) records that phase's exact source/actions. Later successful catalog/image inspection and specific discrepancies are recorded in [the current catalog review](FINAL_CATALOG_REVIEW.md); the earlier request failures below are historical.

## Approved content applied

- Return authorization and instructions, approved Mahawattha/Batapola return destination, two-business-day inspection, outcome communication and further-review process; COD bank-transfer refunds within seven business days after completed inspection and approval.
- Cancellation confirmation and two-business-day exchange processing after receipt/inspection, subject to stock; lower-priced replacement differences refunded through the approved method.
- Normally dispatch within one business day after confirmation, subject to stock. The estimated two-to-three-business-day delivery period begins at confirmation; Saturdays, Sundays and Sri Lankan public holidays are excluded. Conditional manual courier-reference sharing and known-delay notification are approved; no automated tracking/messaging feature is claimed.
- Failed-delivery customer contact and agreed/disclosed additional-charge principles; actual courier attempt/charge facts remain unresolved.
- Manual acceptance after stock/detail checks and communicated confirmation, pre-acceptance stock/price error handling and customer agreement to changed prices.
- Manual privacy requests through support, authorized administrator/proportionate identity checks and a 30-calendar-day response aim; complaint acknowledgement within two business days and resolution/progress within seven are aims, not guarantees.
- Necessary-retention and policy-update principles, with specific periods, implementation, final legal text and actual effective/publication dates still unresolved.

Previously confirmed contacts, COD, fixed LKR 350 delivery, islandwide coverage, seven-day return/exchange conditions and pending PayHere status are preserved. `policyEffectiveDate` and `policyApprovedDate` remain null; recording operational approval on 16 November does not invent a policy effective/publication date. All four full approval flags remain false.

## Exact readiness accounting

| Measure | Current result |
| --- | ---: |
| Configuration and complete sign-offs | 16 |
| Rendered-copy sections/introductions | 20 |
| **Total unresolved** | **36** |
| Cleared from the phase-2 set of 61 | 25 (13 configuration fields and 12 rendered sections) |
| Added since phase 2 | 0 |
| Original 77 messages genuinely resolved | 42 |
| Original messages remaining | 35 |
| Later contact identity-disclosure message remaining | 1 |

Thus 35 original + 1 later = 36, a net decrease of 41 from the original 77. Multiple messages depend on the same missing fact; this is a validator-message count, not 36 independent business decisions. Historical 61-message phase-2 and earlier artifacts remain historical records.

## Only remaining owner/operator requirements

The [consolidated questionnaire](PAYHERE_BUSINESS_QUESTIONNAIRE.md) now contains six missing topics and excludes approved procedures:

1. Actual legal seller/type/registration details and legal controller identity.
2. Tax status/inclusive prices and approved coupon eligibility, expiry, usage and stacking terms matched to supported controls.
3. Real courier attempt/failed-delivery/redelivery charges/availability and COD collection evidence, reconciliation and settlement arrangements.
4. Specific retention periods and feasible deletion/log/backup treatment; actual provider-account regions/access/transfer arrangements verified by the deployment operator.
5. Product/brand/content permissions, appropriately reviewed consumer-rights/liability/governing-law/dispute wording, completed policy approval and actual effective/publication dates.
6. Genuine SKU/variant/description/claim/image/price/discount/stock/fulfilment evidence for the existing catalog. Do not invent products or change production inventory.

Technical work cannot be earned through owner approval. The following controls are now implemented locally; actual hosted effectiveness is still unverified. The content checker is not a vulnerability scanner, so these technical requirements do not alter its 36-message count.

## Local technical changes and their limits

- **Stock/cart concurrency:** transactions lock the owning account/cart workflow and lock distinct product rows in a stable order. Current product state is refreshed under the lock before stock checks. Product updates/deletes share the product lock; product creation rejects a supplied existing ID. Cancellation restores only new explicitly reserved stock once. Historical reservation metadata remains NULL and requires manual review.
- **Durable order retries:** both HTTP creation routes require a UUIDv4 `Idempotency-Key`. A unique persisted hash and intent fingerprint bind retries to the authenticated account ID or guest retry capability. Cart intents include product quantities and the delivery phone. A successful retry returns saved receipt amounts; changed intent conflicts. Recovery starts after the failed transaction rolls back. Frontend session storage contains only a digest, random key and completion marker, with a warning if storage fails. Uncertain retries retain their key; an explicit new purchase after a received receipt gets a new key. A different key represents a new request, and changing details after an uncertain result can create another order.
- **Price consent:** the backend calculates catalog/coupon/350 totals and compares the customer's displayed total before reservation. Changed quotes return 409 for refresh and review. Cart GET refreshes prices; both flows compare saved backend amounts. Existing Double columns are preserved; unsupported precision must reject before inventory writes. Cart checkout now collects a reachable delivery phone instead of leaving the courier without one.
- **Acceptance/fulfilment/COD:** new orders are PENDING requests. Staff verify details/stock, communicate acceptance and record its reference before PROCESSING. Ordinary cancellation is limited to pre-dispatch states; SHIPPED can become DELIVERED. Delivery status never collects money. An explicit ADMIN collection action requires delivered COD, exact stored amount and a nonsecret reference, recording operator/time; repeated identical recording is idempotent. Legacy ambiguous payment/reservation states require manual review. Local audit fields do not verify courier evidence or settlement. The administrator metric is **Verified COD collections**, excluding unpaid requests and legacy simulated PAID records without collection audit.
- **Sessions/abuse/password inputs:** JWTs require the current numeric session version, enabled state and database role. All-device logout and guarded administrator revoke/disable routes invalidate account tokens; ordinary local logout remains available. Bounded single-process throttles return 429/Retry-After. The password boundary rejects more than 72 UTF-8 bytes and malformed Unicode before BCrypt; it is not a dependency patch. Real proxy attribution, distributed limits before scaling and old-key replacement still need operator verification.
- **Response/authorization boundaries:** creation receipts use DTOs, customer entity JSON hides retry/audit metadata, administrator all-order reporting has its own protected endpoint, and guest emails never establish ownership. Existing raw-card rejection, COD-only processing, sanitized errors/logging and historical stored fees remain preserved.

**Remaining technical blocker:** [the dependency review](DEPENDENCY_SECURITY_REVIEW.md) records the old Spring Boot 3.3.3 / Security 6.3.3 / Tomcat 10.1.28 managed set and applicable published advisory ranges. Complete a maintained dependency migration and current effective-graph/container vulnerability review. No complete SCA/container scan or maintained framework upgrade is claimed.

**Remaining operator evidence:** review/rehearse [the additive migration](../../../Backend/docs/migrations/2026-11-16-order-session-safety.sql), verify the actual unique retry-key index as well as Hibernate schema validation, and run the [isolated PostgreSQL/integration cases](../../../Backend/docs/ORDER_SESSION_RELEASE_PREPARATION.md). Confirm actual regions, TLS/datasource/pool settings, CORS including Idempotency-Key, trusted proxy/rate behavior, logging overrides, image/JDK/runtime and exact deployed revisions. Rotate exposed JWT material on every accepting instance, review affected administrators/credentials/history and validate old-token rejection. These actions were not executed against Production.

## Verification status

| Check | Actual result |
| --- | --- |
| Live merchant checker | Exit 1, exactly 36 unresolved; strict Production blocking preserved. |
| Focused frontend ESLint | Passed for the changed policy, checkout, order helper, admin and navigation source and mapper. |
| `git diff --check` | Passed; normal existing line-ending notices do not change the result. |
| Frontend tests | **43/43 pass**: 23 readiness, 9 delivery and 11 request/lifecycle helper tests. |
| Built-preview browser checks | **77/77 pass** after the delivery-phone addition. All API requests intercepted, other external requests aborted; includes lost response/same-key retry, acceptance and COD evidence controls, historical zero fee, all-device logout failure/success, policy links and responsive layouts. No real collection or hosted authorization is established. |
| Local build | Exit 0, draft with 36 messages. Final source rebuild after the phone/metric changes also passed. Large bundle warning remains (about 923 kB main JS before gzip); it is a performance warning, not a readiness bypass. |
| Merchant build | Exit 1 at 36, before Vite. |
| `build:vercel` without deployment environment / with Production | Both exit 1 at 36, before Vite. |
| `build:vercel` with explicit Preview | Exit 0, clearly a draft at 36. This is a process-scoped simulation, not a real hosted build or verified Preview protection. |
| Full backend suite/package | **192 tests, zero failures/errors/skips; offline Maven package exit 0.** Includes 11 H2 persistence/concurrency cases, 10 lifecycle cases, verified-collection reporting, password boundaries, authority/session/throttle checks and preserved shipping/ownership/history coverage. No hosted PostgreSQL or Docker startup was used. |

The new [map JSON](release-verification/owner-approval-blocker-map.json) and [reproduction script](release-verification/map-owner-approval-blockers.mjs) capture every remaining message and actual baseline comparisons. The content/checker/build architecture and strict sign-off semantics are preserved.

## Modified policy/readiness files

- `src/content/business.json`, `src/content/businessPages.js`: approved procedures and accurate rendered policy copy; remaining markers preserved.
- `docs/OWNER_APPROVAL_RECORD.md`, `docs/PAYHERE_BUSINESS_QUESTIONNAIRE.md`: approval evidence and missing-only questionnaire.
- `docs/PAYHERE_BLOCKER_INVENTORY.md`, this report, `docs/release-verification/map-owner-approval-blockers.mjs`, `owner-approval-blocker-map.json`: current source/action inventory and count accounting. Historical phase-2 artifacts remain unchanged.

Technical modified files include backend `entity/User.java`, `entity/Order.java`, JWT/filter/security/auth configuration, credential/checkout/receipt/admin DTOs, repositories, `CartService`, `OrderService`, `ProductService`, `AdminService`, new `OrderPlacementService`, `AccountSecurityService`, throttle/filter and password-validation classes, plus their isolated tests. The new backend manual migration and release preparation documents are instructions only. Frontend changes are `Checkout.jsx`, `DirectCheckoutModal.jsx`, `AdminDashboard.jsx`, `SiteChrome.jsx`, new `services/orderRequest.js`, its tests and the `test:orders` script. The [working-tree file list](release-verification/owner-approval-working-tree-files.json) records all outstanding local files across the existing phases, rather than pretending they were all introduced in this turn. The [verification README](release-verification/README.md) links exact evidence and reproduction commands.

## Coordinated release conditions

1. Complete the missing facts, genuine catalog review, legal/policy approval/dates, maintained dependency migration/scan and verified technical controls. Record only earned full sign-offs. Merchant and actual Production builds must reach zero unresolved checks.
2. Follow [the Render security runbook](RENDER_SECURITY_RUNBOOK.md): prepare required runtime secrets/datasource/origins/logging/profile/schema configuration without printing values or triggering an accidental release; review/apply only approved migrations and verify isolated staging.
3. Review previous credential/account/record exposure, rotate JWT signing material across every accepting instance and invalidate old sessions. Source removal and local tests do not revoke deployed credentials.
4. During a manually authorized release window, prevent ordering on incompatible clients, deploy the reviewed matching Render revision and then the Vercel frontend. Preserve LKR 350 for new orders and stored historical amounts; verify both exact revisions and runtime settings. Never restore an exposed key during rollback.
5. Preserve the current Vercel project, strict `npm run build:vercel`, genuine environment values, SPA rewrites and intended API URL. Preview supports draft review; it does not earn Production approval. Verify approved exact origins, direct route refresh, owned/admin API boundaries and stored totals using an authorized isolated arrangement.

No push, merge, deployment, secret/dashboard change or production record modification is authorized by the operational approval. PayHere remains pending and live card/KOKO/PayHere processing stays disabled.
