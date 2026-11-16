# Phase 2 - remaining blockers and local security fixes

Verified 16 November 2026. **61 readiness messages remain and Production is blocked.** This phase implemented local security fixes, mapped every checker message to its source/action and reduced the owner questionnaire to eight unanswered topics. No approval, production record, secret setting, Git commit/push/merge or deployment was changed.

## Exact readiness result and responsibility

`node scripts/check-merchant-readiness.mjs` exits **1** with **61 messages**: 29 configuration/sign-off and 32 rendered-copy checks. The set exactly matches the previous fixed-delivery result: **zero messages added or cleared**. Business content/sign-offs were not fabricated to lower the count. The checker/build commands and Vercel gate are unchanged.

| Requested group | Checker messages | Meaning |
| --- | --- | --- |
| A. Technical issues fixable locally | 0 directly represented | Technical defects are listed separately below; this content checker does not scan backend security. |
| B. Business facts/decisions and complete identity/contact review | 26 | 25 missing/partial configuration fields plus complete identity/contact sign-off. Previously confirmed contacts are not requested again. |
| C. Policy sections requiring approval | 32 | 31 rendered sections/introductions plus final policy approval. Many depend on the same B decisions. |
| D. Backend security and deployment verification | 1 | `paymentSafetyReviewed`; hosted checks and additional technical controls also remain outside the message count. |
| E. Product catalog review | 2 | `catalogReviewed` and the Terms product section dependent on genuine inventory/claims/images. |
| **Total** | **61** | Primary ownership is counted once; dependencies span categories. |

**All 61 exact messages, their files/line numbers, configuration fields/routes and required actions are in [the complete source map](PAYHERE_BLOCKER_INVENTORY.md).** The [machine-readable map](release-verification/phase2-blocker-map.json) and [reproduction script](release-verification/map-phase2-blockers.mjs) are included. No message is omitted. `contactsConfirmed`, `policiesApproved`, `catalogReviewed` and `paymentSafetyReviewed` all remain false; policy effective/approval dates remain null.

## Security changes completed locally

| Finding | Local change and practical limit |
| --- | --- |
| JWT signing secret | Reverified the earlier removal of embedded JWT material. Runtime `JWT_SECRET` is mandatory; missing/blank/short values fail startup. Old-key tokens fail under a rotated key in tests. Source removal does not revoke deployed tokens or erase history. |
| Stale/forged role claims | `JwtFilter` verifies the JWT, resolves its subject account and uses its **current database role**, never the token's role as authority. Deleted/missing/unsupported-role accounts do not authenticate; role demotion takes effect on the next request. Database lookup failure returns generic 503 without authentication or exception details. |
| Authentication/registration | Credentials require nonblank valid fields; passwords are excluded from DTO log representation. Login rejects unsupported roles without silently repairing database rows. Registration still forces USER, hashes passwords and accepts its dedicated DTO. |
| Admin protection | Admin routes, product/upload mutations and order-status mutations have explicit HTTP authorization, with existing method guards retained. Tests cover unauthenticated/customer rejection, valid admin access and role demotion. Public reads/guest COD remain available. |
| Guest/account ownership | Direct guest contact email no longer attaches an order to an existing account. Only the authenticated principal can supply account ownership. Owner checks handle guest/null/other-owner records safely with 403. Existing historical associations are not rewritten and require operator review. |
| Raw cards / fake payment | Direct checkout still collects no raw card details; backend rejects unsupported online methods, credential fields and client amount/status fields. Both creation paths stay COD/PENDING_COD. No live provider or new PAID path exists. |
| Arbitrary order status | Only the existing PENDING, PROCESSING, SHIPPED, DELIVERED and CANCELLED fulfilment values are accepted. PAID/KOKO_APPROVED/REFUNDED/unknown values cannot become fulfilment states. Updates do not change stored payment state, fees, totals or stock. This is an allowlist, not a full transition/collection workflow. |
| Fabricated cart products/stock | Missing products now return an error rather than creating purchasable stubs. Positive quantities and actual stock are required; combined quantities are checked and price/stock fallbacks are removed. Cart prices use trusted effective merchandise prices; LKR 350 is still added only at order creation. No existing product/stock data changed. |
| Sensitive responses | Cart no longer serializes its User association. User passwords remain excluded. Public review DTOs no longer include account emails; the storefront labels authors as Customer, even when an older response includes an email. Ratings/comments/date/IDs remain available. Hosted/public caches and historical exposure still need review. |
| Logging/errors | Removed authentication identity/role/exception prints and full frontend error-object logs. Request credential DTOs exclude passwords from toString; validation errors are generic. SQL/bind/request/security logging and server error details have safer defaults. Existing environment logging overrides and actual hosted logs remain unverified. |
| Broad CORS | Wildcard hosting tenants are replaced by exact configured origins; only required headers/methods are allowed and credential cookies are disabled. Bearer authentication remains. **Specific Preview URLs must be allowlisted for real API integration.** CORS does not replace authorization. |
| Embedded database settings/startup writes | Removed source database credential/localhost fallbacks in favor of required runtime datasource variables. Schema mode defaults to `validate`, not automatic `update`; SQL printing is off. Earlier explicit local-only admin bootstrap remains off by default. Existing schema/role differences require review/migration before deployment; no schema was changed here. |

The [Render security runbook](RENDER_SECURITY_RUNBOOK.md) gives exact environment, secret generation without console output, Save-only preparation, coordinated rotation/session invalidation, previous-credential review and rollback instructions. No secret value is included. Backend `SECURITY_RELEASE_NOTES.md` records the same current release conditions.

## Remaining technical problems

These remain actual work despite the passing local suite; they cannot be approved through policy wording:

- **Concurrent stock/cart writes:** `Backend/.../service/OrderService.java`, `CartService.java`, `repository/ProductRepository.java`, `CartRepository.java` still need atomic locking/conditional stock operations and concurrent rollback tests. Transactional validation alone does not prevent overselling or lost updates.
- **Persistent idempotency:** `OrderController.java`, `OrderService.java`, `entity/Order.java`, `repository/OrderRepository.java` need safe request replay keys and a reviewed migration. Browser in-flight guards do not prevent duplicates after retries/timeouts. No such column/migration was invented or applied in this phase.
- **Session/abuse protection:** `JwtUtil.java`, `AuthController.java`, `entity/User.java` and frontend browser storage need session/password/reset/abuse review, rate limiting and a supported per-account disable/revocation process. Current JWT lifetime is seven days; password change alone does not revoke tokens. Database roles are refreshed, but individual token revocation is not implemented.
- **COD collection and valid status transitions:** `OrderService.java`, `OrderController.java`, `Order.java` need an auditable collection workflow and approved operational transition/cancellation-stock rules. DELIVERED is not proof of payment.
- **Current-price consent/DTOs:** Checkout estimates can differ if catalog prices change before creation; no reserved/accepted quote workflow exists. Some order endpoints still expose entities and need narrower DTOs. Fixed delivery and historical stored totals are correct; these broader issues remain.
- **Admin order reporting:** `src/pages/AdminDashboard.jsx` currently calls customer-scoped `/api/orders`; a dedicated protected all-order admin response is still needed for complete order reporting. The browser's admin display check uses intercepted fixtures and does not establish that hosted reporting works for all orders.
- **Actual runtime/integration verification:** no Render/Supabase/Vercel dashboard credentials or deployment access was used. Verify configured datasource/TLS/schema/roles, service regions, logging overrides, exact CORS origins, real 401/403 boundaries, API compatibility and both deployed revisions in isolated staging. Existing deployed issues remain until an authorized release.

The catalog still needs genuine owner review of SKUs/variants, claims, images/rights, prices/discounts and stock. Earlier public-catalog evidence is historical and was not interpreted as approval. No production catalog or customer order was changed.

## Only missing business decisions

The [short consolidated questionnaire](PAYHERE_BUSINESS_QUESTIONNAIRE.md) asks only eight remaining topics: legal seller identity; return/refund procedures; cancellation/exchange procedures; delivery operations/calendar; order/tax/COD-collection/coupon rules; privacy operations; legal/complaints/actual policy dates; genuine catalog.

It does not ask again for contacts, COD, fixed LKR 350, islandwide delivery, the 2–3-day estimate, seven-day conditions, confirmed cancellation rules or pending PayHere status. Actual hosting regions and technical deployment evidence are operator verification, not something to guess or turn into business policy. Completed rendered policies still need genuine approval after the missing decisions are incorporated.

## Actual tests and builds

| Check | Actual result |
| --- | --- |
| Full backend `./mvnw.cmd -o -B package` | **134 tests, zero failures/errors/skips; package success.** The full current suite is now isolated. |
| Frontend delivery/readiness suite | **32/32 pass**: 9 delivery and 23 readiness tests. |
| Built-preview browser suite | **67/67 pass**, including the new review-email privacy check. All API calls intercepted and other external requests aborted. |
| `npm run build` | Exit 0, local draft; 61 issues and non-failing existing bundle-size warning. |
| `npm run build:merchant` | Exit 1 at 61, before Vite. |
| `npm run build:vercel`, environment absent | Exit 1 at 61, before Vite. |
| Simulated `VERCEL=1`, `VERCEL_ENV=preview` | Exit 0, draft build; 61 issues. |
| Simulated `VERCEL=1`, `VERCEL_ENV=production` | Exit 1 at 61, before Vite. |
| Strict readiness script | Exit 1 with exactly the original 61-message set. |

The old full-application `OrderControllerTest` is now an isolated security MVC slice using actual authority names; embedded H2 repository/persistence tests explicitly replace the datasource/dialect. No full application or hosted database was started. Full real-filter tests exercise valid, forged, malformed and expired tokens; current DB roles/missing accounts; role demotion; generic failures; CORS; auth/admin restrictions; credential/log redaction. Additional tests cover guest ownership, saved history/status/payment integrity, cart inputs/stubs and public review privacy. Existing shipping, historical order, review and Cloudinary tests remain passing.

Evidence: [full backend tests/package](release-verification/phase2-backend-tests.json), [frontend tests](release-verification/phase2-frontend-tests.json), [build matrix](release-verification/phase2-builds.json), [browser results](release-verification/browser-smoke.json), [exact blocker map](release-verification/phase2-blocker-map.json). Earlier fixed-delivery 87-test/66-browser results remain valid historical records, not the current totals.

## Modified files in this phase

Backend paths below `src/main/java/com/cosmetic/ecommerce/`:

- `config/JwtFilter.java`, `SecurityConfig.java`: DB-backed authority, sanitized errors and explicit CORS/route rules.
- `controller/AuthController.java`; new `controller/RequestValidationAdvice.java`: validated credentials, supported roles and generic validation errors.
- `dto/UserLoginDto.java`, `UserRegistrationDto.java`, `ReviewResponseDTO.java`; `entity/Cart.java`: credential log exclusion and response minimization.
- `service/OrderService.java`, `CartService.java`, `ReviewService.java`; `util/JwtUtil.java`: ownership/status/cart/privacy protections and safe invalid subject extraction.
- `src/main/resources/application.yml`: mandatory datasource settings, schema validation, CORS and log/error defaults.
- New `src/test/java/com/cosmetic/ecommerce/security/AuthorizationBoundaryTest.java`, `OrderOwnershipSafetyTest.java`, `CartIntegrityTest.java`, `PublicReviewPrivacyTest.java`.
- Updated `security/UserSerializationSafetyTest.java`, controller image/review security tests, service `OrderControllerTest.java`, `ReviewServiceTest.java`; `SECURITY_RELEASE_NOTES.md`, `SHIPPING_RELEASE_NOTES.md` status references.

Frontend:

- `src/components/storefront/ProductReviews.jsx`, `DirectCheckoutModal.jsx`, `src/pages/Register.jsx`, `src/services/api.js`: account-email masking and sanitized logging; UI/loading/error flow retained.
- `src/content/businessPages.js`: privacy text reflects reviewed local code while keeping deployment/history and final policy review unresolved. `business.json` and its confirmed rules/flags were not changed.
- `docs/PAYHERE_BUSINESS_QUESTIONNAIRE.md`, `PAYHERE_BLOCKER_INVENTORY.md`, this report, new `RENDER_SECURITY_RUNBOOK.md`; current-status notices in audit/readiness/owner/security/release/Vercel/fixed-delivery documents.
- Verification mapper, JSON evidence, browser harness/results/screenshots and evidence README.

All prior UI/contact/security/shipping working-tree edits were preserved. Cloudinary functionality, fixed delivery configuration/calculation, saved historical orders, build commands and strict readiness validator/script were not altered by this phase.

## Coordinated release plan

1. Complete the eight owner topics, genuine catalog and outstanding technical controls; review final policy text/dates and record only earned sign-offs. Strict merchant and Production builds must pass with zero issues.
2. Follow [the Render security runbook](RENDER_SECURITY_RUNBOOK.md): review existing accounts/exposure, configure required datasource/JWT/origins and schema validation, test an isolated staging deployment, prepare coordinated signing-key rotation. No automatic schema/role/data repair is authorized.
3. Keep incompatible clients from accepting orders during the eventual manual release. Replace/drain all old JWT-accepting backend instances with the reviewed Render revision/new key, verify it, then release the matching Vercel frontend. Never roll back to an exposed key or rewrite stored orders.
4. Preserve the existing Vercel architecture and genuine Preview/Production variables. Preview remains for draft review; its API access requires explicit origin configuration. Production must independently pass the gate.
5. Verify exact Render/Vercel revisions, domain/source SHA, public policy routes/footer/direct refresh, API/CORS/401/403 behavior and stored amounts in an authorized test setup. No real production transaction is included in this task. Live PayHere remains pending and disabled.
