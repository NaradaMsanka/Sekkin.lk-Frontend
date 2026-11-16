# Release verification evidence - 16 November 2026

**Current final-business phase:** backend **209/209** tests/package, including **14 actual isolated PostgreSQL** cases; **15/15 actual container HTTP/PostgreSQL smoke checks**; frontend **43/43** tests; browser **106/106** intercepted checks. Strict readiness is **10** (36 minus 26 cleared; none added); original 77 now has **67 resolved /10 remaining**. Contacts and scoped temporary catalog approval are true; complete factual policy/security flags remain false. Local/Preview builds pass; merchant/missing-environment/Production builds correctly stop before Vite. The main JS bundle warning remains. No hosted mutation, production SQL migration, key rotation, push or deployment occurred. [Authoritative final report](../FINAL_PRODUCTION_COMPLETION_REPORT.md).

| Final artifact | Evidence / limit |
| --- | --- |
| `final-verification-summary.json`, `final-file-manifest.json` | Cross-checked final source/count/approval/test/build/scan/image evidence and all current uncommitted paths across both repositories; includes preserved earlier work, no staging/commit |
| `final-blocker-map.json`, `map-final-blockers.mjs` | All 10 checker messages, exact sources/actions and original comparisons; contacts/temporary catalog true, complete factual policy/security false |
| `../../../../Backend/docs/verification/postgres-release.json` | Full 209-test Maven/package run; 14 real PostgreSQL 17.12 cases, exact migration twice, Hibernate validation and concurrency/security checks on disposable synthetic data; cleanup verified |
| `final-frontend-tests.json` | 43 current readiness/delivery/order helper tests, zero failures/skips |
| `final-builds.json`, `verify-build-matrix.mjs`, `final-build-*.log` | Five-case process-scoped build matrix; Production/merchant fail at 10 before Vite; not an actual Vercel deployment/protection check |
| `final-browser-smoke.json`, `browser-smoke.cjs`, `final-*.png` | 106 checks against built preview; all API requests intercepted and external traffic blocked; Playwright Core 1.62.0 / Chrome 157.0.8103.52 |
| `final-npm-audit-before.json`, `final-npm-audit-after-{all,production}.json` | Seven affected entries before compatible non-forced updates; both final audits zero known vulnerabilities |
| `final-frontend-sbom.cdx.json` | Actual frontend CycloneDX SBOM, 230 components |
| `final-catalog-snapshot.json` | HTTP 200 snapshot/Cloudinary responses and actual visual review; later explicit owner-approved temporary dummy imagery is recorded in the final catalog review, with original images planned after deployment |
| `../../../../Backend/docs/verification/backend-grype.json`, `backend-runtime.cdx.json` | Current-database Java assessment, zero reported matches and 83 components including the application; separate runtime-image findings/remediation are in the final report |
| `../../../../Backend/docs/verification/runtime-remediated-grype.json`, `dependency-assessment.json`, `runtime-smoke.json` | Runtime findings 38 to 3 Medium matches /1 BusyBox advisory, no Critical/High; exact scanned image passed 15 real container HTTP/PostgreSQL checks; hosted/full source-builder verification remains separate |
| `approved-policy-wording.json`, `record-wording-approval.mjs` | Archived exact abe2b807 source/hash and owner wording approval; actual launch-date basis, no invented effective/publication calendar date |
| `final-eslint.json`, `final-eslint.log` | Whole lint exits 1 with 16 errors/1 warning; all 17 reproduced against Git HEAD under current rules, zero new findings; updated UI focused lint passes |

The browser artifacts are prefixed `final-`; the earlier 77-check `browser-smoke.json` and earlier phase maps remain historical. The build matrix intentionally verifies an incomplete draft; it is not a production-approval command. At release, the genuine independent Production command must succeed at zero. Reproduce real PostgreSQL verification from Backend with `powershell -NoProfile -File scripts/verify-postgres.ps1` using the existing Docker daemon and populated Maven cache (`-Online` only if dependency retrieval is required). It runs the repository wrapper, not the configured hosted application/database.

## Historical owner-approval evidence

The following 36-message/192-test/77-browser snapshot predates the final business confirmations and maintained backend migration.

| Current artifact | Evidence / limit |
| --- | --- |
| `owner-approval-blocker-map.json`, `map-owner-approval-blockers.mjs` | All 36 messages, exact sources/actions and true original/phase-2 comparisons; four flags remain false |
| `owner-approval-backend-tests.json` | Full 192-test Maven/package result, with per-suite counts; isolated MVC/mocks and replaced H2 only |
| `owner-approval-frontend-tests.json` | 23 readiness, 9 delivery and 11 retry/lifecycle helper tests |
| `owner-approval-builds.json` | Final-source five-case process-scoped build matrix; not real Vercel deployment/protection verification |
| `browser-smoke.json`, `browser-smoke.cjs`, refreshed PNGs | 77 current intercepted checks; lost-response/same-key retry, current phone/payload, admin acceptance/COD evidence and logout failure/success; no real collection or hosted authorization |
| `owner-approval-runtime-dependencies.json` | Actual dependency entry names in the final local JAR; confirms old runtime versions, not a full vulnerability or image scan |
| `catalog-current-review.json` | Fresh read-only requests failed before usable HTTP responses. Earlier successful three-product snapshot is explicitly historical; current accuracy, image rights and fulfilment stock are unapproved |

Readiness reproduction: `node docs/release-verification/map-owner-approval-blockers.mjs`. Frontend test reproduction: `node --test scripts/readiness.test.mjs scripts/delivery.test.mjs scripts/order-request.test.mjs`. Backend reproduction from `Backend`: `.\mvnw.cmd -o -B package`. Do not start the full application against the configured hosted database as a local test. Remaining maintained-dependency/SCA/container and real PostgreSQL/hosted requirements are in [the dependency review](../DEPENDENCY_SECURITY_REVIEW.md), [schema guide](../../../../Backend/docs/ORDER_SESSION_RELEASE_PREPARATION.md) and [Render runbook](../RENDER_SECURITY_RUNBOOK.md).

## Historical phase snapshots

The counts below describe earlier revisions. Historical named phase-2/fixed-delivery JSON is retained; the shared browser JSON/screenshots are refreshed to the current 77-check run and are not the former snapshot.

**Current phase 2:** full backend suite/package **134/134**, frontend delivery/readiness **32/32**, built-preview browser **67/67** pass. Strict readiness remains **61**; zero messages added/cleared. No hosted database, production transaction or deployment was used. See [the current report](../PRODUCTION_PHASE2_REPORT.md).

| Current artifact | Evidence |
| --- | --- |
| `phase2-blocker-map.json`, `map-phase2-blockers.mjs` | All 61 messages, categories, exact source lines and actions; approvals remain false |
| `phase2-backend-tests.json` | Entire current Maven suite/package; isolated MVC/mocks and replaced H2 only |
| `phase2-frontend-tests.json` | 9 delivery plus 23 readiness tests |
| `phase2-builds.json` | Local/Preview success; strict merchant/missing/Production exit 1 at 61 before Vite |
| `browser-smoke.json` | Latest 67 mocked/intercepted checks including review-email privacy; screenshots refreshed |

Earlier fixed-delivery and owner-response counts below are historical. The formerly unisolated OrderControllerTest is now MVC-only and included in the full suite. Processing regions and actual Render/Vercel runtime behavior remain operator verification, not results inferred from tests.

Current fixed-delivery verification: **9 delivery tests, 23 readiness tests, 66 browser checks and 87 selected isolated backend tests pass**; wrapper packaging succeeds. Local/Preview builds succeed. Merchant, Production and missing hosted-environment builds correctly block at **61** unresolved messages. No production data or deployment changed. Use [the delivery report](../FIXED_DELIVERY_IMPLEMENTATION.md) and [remaining requirements](../PAYHERE_OWNER_RESPONSE_REPORT.md).

| File | Evidence / limit |
| --- | --- |
| `fixed-delivery-builds.json` | Current local/merchant/missing-environment/Preview/Production exit codes, 61 messages; strict failures occur before Vite |
| `fixed-delivery-frontend-tests.json` | 9 delivery plus 23 readiness tests pass |
| `fixed-delivery-backend-tests.json` | 87 selected tests pass and wrapper package succeeds; includes replaced embedded H2 persistence, not hosted PostgreSQL |
| `fixed-delivery-readiness.json` | Exactly two shipping messages resolved: 63 -> 61, no unrelated/new message changes; 17 original messages now cleared |
| `browser-smoke.json`, `browser-smoke.cjs` | Current 66 built-preview browser checks, with all API requests intercepted and all other external requests aborted |
| Contact/policy/checkout/cart PNGs | Current fixed-fee responsive layouts; product/account/order data are isolated fixtures |
| `original-blockers.json`, `owner-response-readiness.json`, `builds.json`, `backend-tests.json`, `backend-package.json` | Historical pre-fixed-fee baselines; 77/63 messages and 62 backend tests are superseded by the current artifacts above |
| `catalog*.json`, `cloudinary-decode.json` | Earlier read-only public catalog/image reachability and decoding; not authenticity, image rights or stock approval |
| `github-main.json`, `production-routes.json`, `production-bundle.json` | Earlier read-only source/deployment signals; not proof of the present production revision or an order/payment test |

Backend coverage includes both order flows, fixed fee/coupon/quantity boundaries, invalid/empty orders, forged input, saved response parity and unchanged historical fees. H2 test configuration explicitly replaces the datasource/dialect and never starts the full application or admin bootstrap. JWT-only/security tests also remain isolated. The unisolated full-application OrderControllerTest is excluded to avoid configured datasource/startup writes. Actual Render environment/database behavior remains unverified.

Browser coverage includes six public routes/footer/contacts/policies at 1440/375/320, current fixed delivery, product/cart quantity and coupon changes, both checkout paths, stored/unpaid/escaped confirmations and download, historical zero fees and admin saved amounts, mobile layouts, direct refresh and login redirect. The harness waits for responsive media queries/fonts after resizing; it does not add CSS overflow hiding. Synthetic tokens are invalid on the real backend. Temporary logs use `sekkin-shipping-*.log` outside Git.

## Reproduce the browser check locally

Build the local draft (`npm run build`) and serve the build with `npm run preview -- --host 127.0.0.1 --port 4173 --strictPort` in a separate terminal. The final run used Playwright Core **1.62.0** and installed Chrome **157.0.8103.52**, recorded in its JSON; this corrects the unavailable 1.65.1 pin in the older instructions. Install the test driver outside the application dependencies:

```powershell
Set-Location 'D:\sekking lk development\sekkinLk\Frontend\frontend'
$taskBrowserRoot = Join-Path $env:TEMP 'sekkin-release-browser'
npm install --prefix $taskBrowserRoot --no-audit --no-fund --ignore-scripts playwright-core@1.62.0
$env:SEKKIN_PLAYWRIGHT_MODULE = Join-Path $taskBrowserRoot 'node_modules\playwright-core'
$env:SEKKIN_CHROME_EXECUTABLE = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
node docs/release-verification/browser-smoke.cjs
Remove-Item Env:SEKKIN_PLAYWRIGHT_MODULE, Env:SEKKIN_CHROME_EXECUTABLE -ErrorAction SilentlyContinue
```

The harness requires the specific local preview origin; every external request is fulfilled from a fixture or aborted. Its synthetic token is not a valid backend credential. It overwrites only its JSON/screenshot evidence files. It does not call a production order/cart mutation or payment service. Stop the preview server when finished. [Official Playwright network interception documentation](https://playwright.dev/docs/network).

See [the current readiness report](../PAYHERE_READINESS_REPORT.md), [exact blocker inventory](../PAYHERE_BLOCKER_INVENTORY.md), [owner questionnaire](../PAYHERE_BUSINESS_QUESTIONNAIRE.md), [backend plan](../BACKEND_PAYMENT_SECURITY_REVIEW.md), and [manual release runbook](../PRODUCTION_RELEASE_RUNBOOK.md).
