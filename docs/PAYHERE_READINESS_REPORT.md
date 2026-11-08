# SEKKIN.LK merchant readiness report

Reviewed 9 November 2026. **Not ready for merchant submission or production publication.** Local implementation is complete for the requested page scaffolding and the approved COD safety changes; owner decisions, legal review, catalog work, security remediation and deployment remain outstanding. Website changes do not guarantee PayHere approval.

## What changed

- Created six public routes: `/refund-policy`, `/privacy-policy`, `/terms-and-conditions`, `/contact`, `/about`, `/shipping-policy`.
- Added a shared premium page layout, responsive/collapsible contents navigation, per-page titles/descriptions/canonical links, draft warnings and `noindex`. Unknown routes now show a useful page.
- Reworked the global footer into Customer support, Company and Business information groups while retaining shop/cart/orders navigation and the brand logo.
- Added policy links before both cart and direct order submission. No fake contact form, address, email, testimonials or products were added.
- The owner supplied the business name **sekkinLK**. Existing phone/WhatsApp and hours appear in Contact as unconfirmed; the registered name, address and email remain REVIEW REQUIRED. Unconfirmed external contacts and guessed social links are not activated.
- At the owner's explicit request, removed simulated CARD/KOKO collection and retained COD. The backend rejects unsupported payment methods before product lookup/stock/order changes. Removed card fields are rejected if populated; older COD clients may still send those unused keys as null.
- Direct checkout no longer collects or sends card/CVC/expiry values or fabricates PAID/KOKO approvals. Downloads are order confirmations, not proof of payment; customer text is HTML-escaped. The dummy receipt phone was removed. Product buttons now say Buy now rather than implying online payment.
- Added local/merchant build checks. Vercel uses the strict merchant command, independent of whether its system environment variables are exposed. Configuration flags alone cannot approve copy that still contains draft/REVIEW REQUIRED markers.
- No database schema migration, production data editing, push, deployment, PayHere credentials or live payment processing was performed. Historical order/payment records were preserved.

## Website checklist

“Verified” below refers to the local code and stated tests, not the live deployment.

| Item | Status | What remains |
|---|---|---|
| Six public routes and usable navigation | Complete and verified | Deploy only after review |
| Three core policy structures | Implemented but awaiting business information | Fill decisions, replace draft copy and obtain legal approval |
| Contact business fields | Implemented but awaiting business information | Confirm legal name, full address, email, phone, hours, WhatsApp |
| About page | Implemented but awaiting business information | Confirm legal identity; no invented history/certification |
| Shipping policy | Implemented but awaiting business information | Coverage, charges, estimates and operations |
| Footer and checkout policy links | Complete and verified | Confirm any external social/contact links before enabling |
| Draft titles, metadata and noindex | Complete and verified | Approved effective dates/copy and final indexability review |
| SPA direct refresh | Requires manual review | Local built-preview routes pass; Vercel rewrite added, actual deployed refresh not tested |
| Draft publication guard | Complete and verified | `build:merchant` intentionally fails while unresolved |
| Card/CVC removal and COD-only guard | Complete and verified locally | Old deployed code remains unsafe until reviewed backend/frontend release |
| Product images/content | Not completed | Live catalog has three generic names and two missing main images |
| Pricing/coupons/order request regression | Complete and verified in isolated tests | Confirm real business charges/taxes and live operational behaviour |
| Stock/concurrent purchases | Requires manual review | Backend cart quantity/stock issues below |
| Customer authentication/privacy/security | Requires manual review | Existing exposure/secret/ownership findings below; real customer login was not exercised |
| Tracking and emailed confirmations | Not completed | No implemented provider/service verified; no promises added |
| Live PayHere integration | Not completed — intentionally outside this task | Follow the separate Sandbox plan after review |
| Merchant documents/bank/agreement/approval | Requires manual review outside VS Code | Business owner and PayHere/partner bank |

The required website criteria are complete actual goods/content, visible Terms/Returns/Privacy and business contact details. About/Shipping pages, the new styling and accessibility refinements support clarity but are not separately named mandatory pages in the cited list. [Official application criteria](https://support.payhere.lk/application-process), [policy guidance](https://support.payhere.lk/policy-samples).

## Information the owner must supply

Edit `src/content/business.json`; all null values are deliberately unresolved. The supplied business name is not evidence of registration. Confirm the registered name and business type (company, sole proprietor, partnership, home-based, etc.).

| Area | Decisions required |
|---|---|
| Identity/contact | Registered/legal name, full postal address, support email; confirm existing +94 78 815 3473 / WhatsApp and Mon–Sat 9 AM–7 PM; verified social URLs if used |
| Category | Cosmetics/skincare/beauty is the supplied category; confirm legal business classification and products offered |
| Returns | Eligible products/reasons, return window/start date, damaged/incorrect goods, evidence, packaging/condition, hygiene rules and exceptions, authorisation and return address |
| Refunds | Refund method, approval/inspection procedure, processing times/start event, return shipping responsibility, cancellations and exchanges |
| Delivery | Coverage/exclusions, working days/cut-offs, processing and delivery estimates, charges/conditions, carriers, tracking, delay notices, failed deliveries and repeat-attempt costs |
| Privacy | Legal controller/contact, vendors/locations/transfers/access, retention/deletion/backups/logs, request/identity-verification procedure and applicable rights |
| Terms | Order acceptance, price errors/taxes/charges, supported payment/fulfilment methods, asset rights, complaints/escalation, lawful liability/governing-law provisions and change notices |
| Approval | Final effective dates and approved copy; owner/legal/technical sign-offs. Clear draft text in `businessPages.js` as well as completing configuration |

Do not merely flip the confirmation flags. They are review records, not PayHere approval or a substitute for technical/legal checks. The build checker also detects unresolved rendered policy copy. Existing static draft introductions/status wording must be reviewed and changed before final publication.

## Catalog and payment/security findings

Read-only live `GET /api/products` returned HTTP 200 during this task: **3 products, all generic names**, descriptions “Cosmetics item”, **2 missing main images**. The remaining Cloudinary main image returned HTTP 200 to a HEAD request. This proves reachability only, not authenticity or suitability. Nothing was deleted, renamed, repriced or restocked. Image editing/upload functionality is unchanged.

The initial audit found card/CVC collection, automatic PAID/KOKO_APPROVED assignments and false receipt language. These are corrected **locally** as described above. The deployed service was not changed; it must not be treated as protected by an un-deployed patch. Earlier simulated-payment orders require owner reconciliation against actual transactions; do not rewrite them automatically.

Remaining launch/security review items, not silently fixed during this scoped task:

- **Critical:** `Cart.getUser()` exposes a `User` with a password getter and no password exclusion. Review serialization and use safe DTOs/explicit exclusions; never expose password hashes. Order.user itself has `@JsonIgnore`, so this finding specifically concerns Cart/User, not a claim that every order response exposes it.
- **Critical:** JWT signing material is hard-coded in `JwtUtil.java`. Move to server-only configuration and plan rotation/session invalidation. The secret is not reproduced here.
- Guest direct orders associate an account by a supplied email without proving email ownership. Review account association, guest order access and customer notifications before launch.
- Public review DTOs include reviewer email. Minimise public personal information and approve review-identification policy before claiming privacy protections.
- `CartService` can create a generic stub for an unknown product ID; this can reintroduce placeholder catalog records. It also checks incoming rather than combined quantity when adding an existing line. Review these paths and concurrent stock handling without editing production records in this task.
- Cart checkout collects an address but no delivery phone. Direct COD collects name, phone, email and postcode. Confirm operational requirements before changing contracts.
- Existing `.env` is tracked in the frontend repository; the inspected key list contains only the public API base URL. New ignore rules do not untrack that file. Keep credentials out of it and never place server secrets in `VITE_*` variables. No credential values are recorded in this report.
- Real login, email delivery, courier tracking, product authenticity, bank settlement and historical records were not verified. Runtime/idle complaints still require time-matched Render logs; these page changes are not a backend availability fix.

## Tests actually executed

| Check | Result |
|---|---|
| `npm run build` | Pass for a local draft preview; existing large-bundle warning remains |
| Focused ESLint on all frontend code changed in this task | Pass |
| `npm run lint` | Fails with 26 existing errors and 1 warning in older code; no claim of a clean full-project lint |
| `npm run test:readiness` | 7 pass, including strict publication blocking and configuration-only bypass prevention |
| `npm run build:merchant` with unresolved business data | Expected refusal before Vite; not a build defect |
| Vercel-environment preflight with unresolved data | Expected refusal |
| Backend selected Maven suite | 56 pass, including 10 payment-safety cases plus review/image/product/order-service regressions |
| Backend `mvn -o -B -DskipTests package` | Pass; packaging does not run the application |
| Browser readiness run | 55 pass: six unauthenticated routes, desktop/mobile layouts, footer, metadata, local built-preview direct loading, product/cart/order regressions, no custom card fields, COD body, one-request guard, escaped confirmation and reduced motion |
| Additional accessibility run | 8 pass: native keyboard disclosure, named controls, 44px footer targets and selected text colour-pair contrast ratios ≥4.5 |

The six pages were checked at 1440 and 320px; privacy at 768px; direct COD dialog at 1440/375/320px. Screenshots and JSON reports are in the workspace `ui-review/merchant-readiness` folder. Browser/API fixtures exist only in isolated testing; no fake products were inserted into the application or database and no real orders were placed. Existing legacy full-context OrderController tests were not rerun in this selected suite; a previous run required an unavailable local PostgreSQL server. No frontend automated-test script existed before the new readiness script.

## Outside VS Code: merchant application

Complete the activation details; provide business registration or appropriate business proof, the applicable local bank account and account proof, and a properly signed merchant agreement. Business type affects documentation and account requirements. PayHere/partner-bank review and approval happen separately. These tasks cannot be completed by adding website pages. [Official application process](https://support.payhere.lk/application-process).

## Future integration and release

See [PAYHERE_SANDBOX_PLAN.md](PAYHERE_SANDBOX_PLAN.md) for hosted checkout, server-generated hashes, signature/amount/order/currency verification, duplicate notifications, safe transitions and customer states. No live integration was implemented.

1. Review the diff against the existing uncommitted work and preview locally with `npm run dev`; start at `/about` or `/contact`. `npm run build` followed by `npm run preview` is for local draft review only.
2. Resolve the catalog/security findings and fill/approve the real business values and all final policy copy. Remove draft markers only after genuine approval, including effective dates and applicable legal provisions.
3. Re-run tests, `npm run check:merchant` and `npm run build:merchant`. The latter two must pass before publication. The checker is an aid, not merchant approval.
4. **Obtain owner approval before any push or production deployment.** The local COD backend guard needs a reviewed Render release to protect the live endpoint. Older COD clients with null legacy fields remain compatible; unsupported online methods will be rejected intentionally.
5. Vercel's root must be the directory containing `package.json` and `vercel.json` (`Frontend/frontend` in this workspace). Its configured build command is `npm run build:merchant`, output `dist`. Keep the existing public API URL and Cloudinary settings; no new payment secrets are needed in this task.
6. After an approved release, manually verify all six public URLs, hard refresh, footer links, actual images, account/cart/checkout behaviour and Render logs. The SPA rewrite follows [Vercel's Vite guidance](https://vercel.com/docs/frameworks/frontend/vite); no actual Vercel deployment/refresh was performed here.

## File manifest — this task only

Pre-existing storefront, cart, checkout, theme and review changes remain in the working tree. The list below describes additions/modifications made for this request, not every earlier uncommitted file.

| File (frontend paths relative to `Frontend/frontend`) | Change |
|---|---|
| `.gitignore` | Ignore local environment files, keep example template |
| `index.html` | Default description metadata |
| `package.json` | Local/strict merchant build and readiness test commands; no new dependencies |
| `vercel.json` | Strict build command, output and SPA rewrite |
| `src/App.jsx` | Six public routes, fallback and route scroll helper |
| `src/content/business.json` | Owner-editable facts, policy decisions and review flags |
| `src/content/businessPages.js` | All six page contents and business links |
| `src/content/readiness.js` | Missing-fact/sign-off and unresolved-copy checks |
| `src/pages/BusinessPage.jsx` | Shared responsive pages, contact fields and metadata |
| `src/components/BusinessFooter.jsx` | New footer layout |
| `src/components/SiteChrome.jsx` | Footer integration and verified-contact fallback |
| `src/components/PolicyLinks.jsx` | Shared checkout policy links |
| `src/components/RouteScroll.jsx` | Route/anchor scroll handling |
| `src/components/DirectCheckoutModal.jsx` | COD-only UI/body, policy links, submission guard and safe order confirmation |
| `src/pages/Checkout.jsx` | Policy links before cart order submission |
| `src/pages/ProductDetail.jsx` | Accurate Buy now/COD wording |
| `src/components/storefront/ProductCard.jsx` | Buy now label |
| `scripts/check-merchant-readiness.mjs` | Publication preflight |
| `scripts/readiness.test.mjs` | Seven focused guard tests |
| `docs/PAYHERE_READINESS_AUDIT.md` | Before-change requirement matrix |
| `docs/PAYHERE_SANDBOX_PLAN.md` | Future integration roadmap |
| `docs/PAYHERE_READINESS_REPORT.md` | This report, checklist and deployment instructions |
| `Backend/src/main/java/com/cosmetic/ecommerce/dto/DirectOrderRequestDTO.java` | COD validation and rejection of populated removed/unknown fields |
| `Backend/src/main/java/com/cosmetic/ecommerce/service/OrderService.java` | Early COD guard and unpaid COD status |
| `Backend/src/main/java/com/cosmetic/ecommerce/controller/OrderController.java` | Honest order-confirmation message/comments |
| `Backend/src/test/java/com/cosmetic/ecommerce/service/DirectOrderPaymentSafetyTest.java` | Payment bypass, stock, pricing, HTTP and legacy-null compatibility tests |

Additional review artifacts are copied under `ui-review/merchant-readiness`: the main and accessibility JSON reports, six page previews (contact/refund/about at desktop/mobile), COD confirmation preview and README. Temporary browser harnesses remain outside the repositories. No production deployment was approved or performed.
