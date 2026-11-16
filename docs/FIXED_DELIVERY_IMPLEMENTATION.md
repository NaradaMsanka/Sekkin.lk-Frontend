# Fixed LKR 350 delivery - implementation and release report

**Later owner-approval update:** the fixed LKR 350 rule and historical stored totals are preserved. Readiness is **36**, down from 61 after approved procedures were applied. Use [the current report](OWNER_APPROVAL_PHASE_REPORT.md) for subsequent order/security changes, schema requirements and current verification. Earlier shipping-only counts and unchanged-file statements below describe that historical phase.

Verified locally on 16 November 2026. **The confirmed delivery rule is implemented. Production remains blocked by 61 unrelated readiness messages.** No push, merge, deployment, production order/customer change or live payment activation occurred.

## Root cause and calculation

Previously, normal cart order creation subtracted coupons without adding delivery, leaving the entity's default fee at zero. Direct order creation explicitly assigned `deliveryCharge = 0.0`. Cart and checkout copied those assumptions; the previous range disclosure could not supply an actual price rule.

The backend now has one immutable configuration: `OrderPricing.DELIVERY_CHARGE = new BigDecimal("350.00")`. Both checkout paths use the same pricing function and explicitly persist that fee once per order, regardless of product count, quantity, location or order value.

```text
Effective merchandise subtotal = sum(catalog effective unit price x quantity)
Order total = effective merchandise subtotal - valid merchandise coupon + 350.00
```

Valid product sale prices are already included in the effective unit price. They are not deducted twice. GLOW10/WELCOME10 remain 10% of effective merchandise subtotal; SAVE500 remains LKR 500 when that subtotal is at least LKR 2,500. Unknown codes retain zero discount. The coupon is bounded by merchandise subtotal and never reduces delivery. No new tax rule or shipping promotion was invented.

All order arithmetic uses BigDecimal, with unit prices/coupon amounts rounded to two decimals using HALF_UP. Existing Double persistence/API fields are retained for compatibility; the calculated two-decimal results are converted only when saved. The cart path reloads products and ignores cart/client prices and totals. Both paths reject empty/invalid orders, including nonpositive quantities, prices that are invalid or round to zero, and combined cart quantities beyond stock before writes.

Cart HTTP monetary extras cannot override the fee or total. Direct checkout rejects unsupported submitted amount fields with HTTP 400; it never accepts a forged zero fee. A valid direct request always receives the backend-calculated fee. No new PAID path was added: COD is `PENDING_COD` in both flows.

## Frontend and historical orders

The shared frontend estimator reads `business.deliveryCharge.amount` (350), mirrors the existing merchandise coupon rules and adds delivery once to a nonempty order. Cart, normal checkout and Direct Buy Now display **Delivery Charge: Rs. 350.00** before submission. Changing quantities or coupons updates totals without changing delivery.

Pre-submit product/coupon totals remain estimates; the backend recalculates current catalog prices and stock at order creation. A reserved-price/quote workflow is not implemented. Cart confirmation uses the returned order's stored fee/total. Direct confirmation and downloaded receipt show stored subtotal, coupon reduction, fee and total, with combined savings separately described as already included.

Customer order history now receives the stored delivery field through its existing DTO. Customer/admin views use each order's stored fee and total, including old zero or other fees. Missing historical delivery amounts display "Not recorded"; they never default to 350. The existing drawer is a navigation drawer linking to `/cart`; no separate Cart Drawer with monetary calculations exists, so none was added.

## Database and compatibility

**No shipping database migration is required.** `Order.deliveryCharge`, `totalAmount`, `discountAmount` and line unit prices already exist. Only new order creation assigns the new fee; history reads and unrelated status updates do not recalculate amounts. The entity's old zero initializer is retained for legacy compatibility, while both creation paths explicitly overwrite it with 350.

The history response adds `deliveryCharge`; the direct response adds `couponDiscount` derived from saved effective line prices, saved delivery and saved total. Neither derives a historical amount from today's product price or shipping configuration. An isolated H2 test saves both new checkout types and reloads an unchanged historical order. This verifies local persistence behavior, not a hosted PostgreSQL deployment.

Pre-existing JWT/bootstrap/schema/security changes remain in the backend working tree and require their own review. The absence of a shipping migration does not resolve that separate schema/startup review.

## Shipping policy and readiness

The storefront now uses the owner-approved wording:

**Delivery Coverage**

We deliver products islandwide across Sri Lanka.

**Delivery Charges**

A fixed delivery charge of LKR 350 applies to every order. The delivery charge is displayed at checkout before you confirm your order.

**Estimated Delivery Time**

Orders are estimated to be delivered within 2–3 business days. Actual delivery times may vary due to courier operations, public holidays or other delivery delays.

The estimate's start event, dispatch/processing time, weekend arrangements, tracking, delays/customer notices and failed-delivery procedures remain marked for review. The existing return/refund/exchange delivery responsibilities are unchanged. Current storefront copy has no free-delivery/range/provisional-fee promise. Koombiyo Delivery spelling is retained from the earlier official-source verification; no tracking integration is claimed.

Exactly two checker messages cleared: `Review shipping.charges` and `Approve final policy text: /shipping-policy#charges`. **63 -> 61**, comprising 29 configuration/sign-off and 32 rendered-copy checks. No unrelated message cleared or new message appeared. Of the original 77, 17 are cleared and 60 remain, plus one later legal-identity disclosure. All four global approval flags remain false, policy effective/approval dates remain null, and the strict build gate is unchanged. The charges section passes its existing field/copy checks; the complete Shipping policy is still unapproved.

## Actual verification

| Check | Result |
| --- | --- |
| `node --test scripts/delivery.test.mjs scripts/readiness.test.mjs` | **32/32 pass**: 9 delivery, 23 existing readiness tests |
| Maven wrapper selected isolated suite and package | **87 tests pass**, no failures/errors/skips; JAR packaging succeeds |
| Built-preview browser harness | **66/66 pass**, including fixed delivery, quantity/coupon changes, confirmations/download, historical fees and admin display |
| `npm run build` | Exit 0, local draft build with 61 unresolved messages |
| `npm run build:merchant` | Exit 1 at 61, before Vite; expected blocked result |
| `npm run build:vercel`, no hosted environment | Exit 1 at 61, before Vite |
| `VERCEL=1`, `VERCEL_ENV=preview`, `npm run build:vercel` | Exit 0, draft build; 61 unresolved |
| `VERCEL=1`, `VERCEL_ENV=production`, `npm run build:vercel` | Exit 1 at 61, before Vite; expected blocked result |

Backend tests cover 1,000 -> 1,350; 5,000 -> 5,350; 10,000 -> 10,350 in both flows; multiple products/quantities; 5,000 minus 500 plus 350 -> 4,850; product/coupon savings; coupon thresholds/rounding; empty/invalid orders; forged cart amounts and rejected direct amount fields; stored response parity and unchanged old orders. Persistence tests use replaced embedded H2 with an explicit H2 dialect. No full backend app or hosted database was started. Browser APIs are entirely intercepted and other external requests aborted; no real order or login was submitted. The existing Vite bundle-size warning remains non-failing.

Evidence: [readiness comparison](release-verification/fixed-delivery-readiness.json), [build matrix](release-verification/fixed-delivery-builds.json), [frontend tests](release-verification/fixed-delivery-frontend-tests.json), [backend tests/package](release-verification/fixed-delivery-backend-tests.json), [browser checks](release-verification/browser-smoke.json). Earlier 63/77-message and 62-test artifacts are historical.

## Files changed for this task

Frontend:

- `src/content/business.json`, `businessPages.js`, `delivery.js`: fixed fee, approved shipping wording and shared estimates.
- `src/components/DeliveryPricingNotice.jsx`, `DirectCheckoutModal.jsx`: fee disclosure, direct total, stored confirmation/download and coupon breakdown.
- `src/pages/Cart.jsx`, `Checkout.jsx`, `OrderHistory.jsx`, `AdminDashboard.jsx`: current checkout estimates and saved order amounts.
- New `scripts/delivery.test.mjs`; updated `docs/release-verification/browser-smoke.cjs` and verification JSON/screenshots.
- This report; shipping plan, remaining questionnaire, owner confirmations, blocker inventory, current readiness/owner reports, status notice in the original readiness audit, release runbook, Vercel guide and verification README.

Backend paths under `src/main/java/com/cosmetic/ecommerce/`:

- New `service/OrderPricing.java`; updated `service/OrderService.java`.
- `controller/OrderController.java`, `dto/OrderResponseDTO.java`, `dto/DirectOrderResponseDTO.java`.
- Updated `src/test/java/com/cosmetic/ecommerce/service/OrderServiceTest.java` and `DirectOrderPaymentSafetyTest.java`.
- New `OrderShippingTest.java`, `OrderShippingPersistenceTest.java` in that test directory; new `SHIPPING_RELEASE_NOTES.md`.

Earlier contact/UI/security working-tree edits were preserved. `CartService`, the Order schema, Cloudinary/authentication code, readiness validator/script, package/build commands and Vercel architecture were not changed by this shipping task.

## Safe manual release sequence

1. Review both repository diffs, including earlier security patches. Complete the [61 remaining requirements](PAYHERE_BLOCKER_INVENTORY.md), genuine catalog and approvals. Run final strict merchant/Production checks with zero issues before a customer-facing release. Do not force Production into Preview mode or promote an unapproved Preview.
2. Before a Render rollout, provide the required high-entropy server-only `JWT_SECRET`, coordinate rotation/session invalidation and existing admin credential reset, and review separate Hibernate/migration findings in `Backend/SECURITY_RELEASE_NOTES.md`. Never place secrets in Vite/Vercel public variables or Git. Verify the Java 21/Maven build and the exact reviewed backend revision.
3. Use a controlled release window in which incompatible old checkout clients cannot accept orders. Deploy the reviewed Render backend first, then the matching frontend; otherwise old clients can show zero while the new backend charges 350, or new clients can show 350 while the old backend records zero. An automatic maintenance switch was not added. Restore ordering only after both revisions and amounts are verified in an authorized test environment. Do not create a production test order without separate authorization.
4. For Vercel, retain the existing frontend repository/project, root `./` relative to that repository, Node 22.x, `npm run build:vercel`, output `dist`, SPA rewrites and the correct public Render API URL. Keep genuine Vercel Preview/Production system environment values. Review a Preview first; Production must independently pass the strict gate.
5. Commit/push/merge/deploy only manually when authorized. After release, verify Render's revision and Vercel's successful Production source SHA/domain, footer/policy links, direct URL refreshes, mobile checkout and stored totals. Roll back compatible backend/frontend versions together while ordering is unavailable; never rewrite old order totals.

See [the manual runbook](PRODUCTION_RELEASE_RUNBOOK.md) and backend `SHIPPING_RELEASE_NOTES.md` for commands. Completing delivery pricing does not establish merchant approval or payment/security readiness. Live PayHere/card/KOKO payments remain disabled.
