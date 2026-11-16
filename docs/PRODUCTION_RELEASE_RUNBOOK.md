# SEKKIN.LK manual production release runbook

**Latest owner-approval prerequisite:** follow [the current report](OWNER_APPROVAL_PHASE_REPORT.md) and [Render security runbook](RENDER_SECURITY_RUNBOOK.md) before the older manual Git/deployment blocks below. **36** messages remain; operational approval does not supply undecided legal/tax/catalog/hosting facts. New session/order schema must be reviewed and staged before the matching backend/frontend release. Production validation remains strict. Local fixes do not verify hosted revisions or authorize deployment. Earlier counts, commands and results below describe historical revisions where superseded.

Updated 16 November 2026 after the owner response. **Do not release yet.** The current content gate reports 61 unresolved messages (77 originally; 17 cleared, one new visible disclosure). Confirmed facts are applied; fixed LKR 350 shipping is implemented locally; remaining policy decisions, actual catalog remediation and critical backend security work remain outstanding. This document provides commands and acceptance criteria, not permission to bypass them. No commit, branch switch, push, merge or deployment was performed.

## Repository and deployed-state evidence

| Item | Observed state |
| --- | --- |
| Frontend Git root | `D:\sekking lk development\sekkinLk\Frontend\frontend` (the workspace parent is not a Git repository) |
| Current/latest local UI branch | `main`, initial clean HEAD `2001fe8c06fa5f06d612475e68119b0c4a8b8afb` |
| Recorded `origin/main` | Same SHA; no commits ahead or behind and no initial source diff |
| Current GitHub `main` | Public GitHub API independently returned that same SHA on 16 November 2026; `git ls-remote` failed to connect from this environment, so no fetch was performed |
| Local new work | Uncommitted confirmed contacts/policy clauses, fixed delivery calculations/displays, readiness tests, COD savings correction and audit/release documents; no newer UI branch was found locally |
| Backend Git root / local branch | `D:\sekking lk development\sekkinLk\Backend`; `main` at `fd19ed1` with uncommitted fixed-shipping and key/bootstrap/password-response safety patches and tests; no deployment |
| Production homepage | HTTP 200, references `/assets/index-vTzcjmWK.js` |
| Production deep links | All six information pages, `/cart`, `/checkout`, `/orders`, `/product/1` return HTTP 404 on direct GET |
| Deployed commit | **Unverified.** A bundle filename or HTTP 200 cannot establish a Git SHA. Current production behavior lacks the reviewed local routes/payment remediation. |

Read-only evidence is in [release-verification](release-verification/). No production write or real customer transaction was made. Existing merchant approval and dashboard settings were not available for inspection.

## Release conditions

1. Complete only [the remaining owner decisions](PAYHERE_BUSINESS_QUESTIONNAIRE.md); confirmed answers are already implemented. Review all six rendered pages. Remove placeholders and stale draft/proposed/unconfirmed wording only after the relevant content is confirmed; supply approved policy dates. Do not just remove regex matches.
2. Replace generic catalog listings through a separately authorized catalog update with genuine approved products, appropriate authorized images, prices/discounts, descriptions and actual stock. The code's automatic product-stub creation must also be remediated. Current live data has three generic products and two missing main images.
3. Review the prepared local backend patches and remaining [security plan](BACKEND_PAYMENT_SECURITY_REVIEW.md). Before a manual backend deployment, provision a new JWT_SECRET, coordinate old-session invalidation, reset/disable existing default-admin accounts and review required schema/role migrations. Complete ownership/inventory integrity and test in isolation. Review historical simulated payments without automatically editing records. Verify the compatible Render revision before enabling a frontend release.
4. Set each approval flag only on its evidence: contacts verified; actual final policy text approved; genuine catalog reviewed; payment/security checks passed for the code being released. Keep live PayHere disabled until merchant/domain approval and separately reviewed Sandbox/provider-notification checks.
5. Review the implemented [fixed LKR 350 calculation](SHIPPING_CALCULATION_PLAN.md) and coordinate backend/frontend releases while ordering is unavailable on incompatible old clients. Run the 23 readiness tests, 9 delivery tests, builds and isolated browser checks against the final source. Both real strict merchant and Production builds must now exit 0 with zero issues. Verify production API settings, public policy links, all direct refreshes and owner acceptance of the current responsive UI. Synthetic test fixtures are not permission to release.

## Save reviewed audit/UI changes on a review branch

Run these commands yourself after reviewing the diff. This block commits the current audit work; it does **not** publish a merchant-ready site or merge `main`.

```powershell
Set-Location 'D:\sekking lk development\sekkinLk\Frontend\frontend'
git status --short
git fetch origin
git log --oneline --left-right origin/main...HEAD
git diff --stat origin/main
git switch -c release/payhere-readiness
git diff --check
git diff
git add -- scripts/readiness.test.mjs scripts/delivery.test.mjs src/content/business.json src/content/businessPages.js src/content/businessContacts.js src/content/delivery.js src/components/BusinessFooter.jsx src/components/SiteChrome.jsx src/components/DeliveryPricingNotice.jsx src/components/DirectCheckoutModal.jsx src/components/storefront/ProductQuickView.jsx src/pages/BusinessPage.jsx src/pages/Cart.jsx src/pages/Checkout.jsx src/pages/Home.jsx src/pages/OrderHistory.jsx src/pages/AdminDashboard.jsx src/pages/Register.jsx src/components/storefront/ProductReviews.jsx src/services/api.js
git add -- docs/PAYHERE_BUSINESS_QUESTIONNAIRE.md docs/PAYHERE_OWNER_CONFIRMATIONS.md docs/PAYHERE_OWNER_RESPONSE_REPORT.md docs/PAYHERE_BLOCKER_INVENTORY.md docs/BACKEND_PAYMENT_SECURITY_REVIEW.md docs/SHIPPING_CALCULATION_PLAN.md docs/FIXED_DELIVERY_IMPLEMENTATION.md docs/PRODUCTION_PHASE2_REPORT.md docs/RENDER_SECURITY_RUNBOOK.md docs/PRODUCTION_RELEASE_RUNBOOK.md docs/PAYHERE_READINESS_REPORT.md docs/PAYHERE_READINESS_AUDIT.md docs/VERCEL_DEPLOYMENT.md docs/release-verification
git diff --cached --check
git diff --cached
git commit -m "Apply confirmed business details and preserve merchant release safeguards"
# Optional: this push can trigger a Vercel Preview build with draft policies.
git push -u origin release/payhere-readiness
```

If `git fetch` fails, restore GitHub connectivity before comparing/merging. The previously recorded origin ref must not be assumed current indefinitely. Review new remote commits before proceeding; do not reset, force-push or overwrite the latest UI.

## Final content commit and production-build verification

After owner answers, the separately reviewed implementation and actual final approvals, add only the files that were reviewed. The following command assumes the two content files hold the final reviewed changes; explicitly stage any additional approved checkout/API files when required by the real business rules. Backend changes belong to their separate repository/review.

```powershell
Set-Location 'D:\sekking lk development\sekkinLk\Frontend\frontend'
git switch release/payhere-readiness
git diff --check
git diff
git add -- src/content/business.json src/content/businessPages.js
git diff --cached
git commit -m "Finalize approved business contacts and merchant policies"

Remove-Item Env:VERCEL, Env:VERCEL_ENV -ErrorAction SilentlyContinue
npm run test:readiness
node --test scripts/delivery.test.mjs
if ($LASTEXITCODE -ne 0) { throw 'Readiness tests failed.' }
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Local build failed.' }
npm run build:merchant
if ($LASTEXITCODE -ne 0) { throw 'Merchant readiness is incomplete.' }

try {
    $env:VERCEL = '1'
    $env:VERCEL_ENV = 'preview'
    npm run build:vercel
    if ($LASTEXITCODE -ne 0) { throw 'Preview build failed.' }
    $env:VERCEL_ENV = 'production'
    npm run build:vercel
    if ($LASTEXITCODE -ne 0) { throw 'Production readiness is incomplete. Stop release.' }
} finally {
    Remove-Item Env:VERCEL, Env:VERCEL_ENV -ErrorAction SilentlyContinue
}
```

The recorded current run is different: merchant and Production intentionally fail at 61 items. Do not execute the merge block until the **real final source**, security review, reviewed shipping rollout and required checks pass. Recheck deployment settings and API environment values; local `.env` cannot establish Vercel's configured Production values.

## Merge only after review and all release conditions pass

Pushing `main` may immediately trigger a Vercel Production build. Treat the final push as the manual deployment action; do not run it early to test whether Vercel blocks.

```powershell
git switch release/payhere-readiness
git status --short
# Require a clean working tree before continuing.
git fetch origin
git log --oneline --left-right origin/main...HEAD
git diff --stat origin/main...HEAD
git diff origin/main...HEAD
git merge --no-edit origin/main
# Resolve/review any conflicts, then rerun the entire final verification above.
git push -u origin release/payhere-readiness
git switch main
git pull --ff-only origin main
git merge --ff-only release/payhere-readiness
git log -1 --format='%H %s'
git push origin main
```

A failed fast-forward merge means the branches changed: review and update the branch instead of weakening the command. Re-run validation after any conflicts or source/environment change. Use the repository's reviewed PR workflow if branch protection requires it; no force push is needed.

## Vercel settings and manual deployment

Use the existing project connected to `NaradaMsanka/Sekkin.lk-Frontend`, not a new project/site. Verify these settings in the dashboard:

| Setting | Required value |
| --- | --- |
| Repository root | `./` / empty root field; `Frontend/frontend` is only the local workspace path |
| Framework | Vite |
| Production branch | `main` |
| Build command | `npm run build:vercel` (also committed in `vercel.json`) |
| Install / output | `npm ci` / `dist` |
| Node | `22.x`, compatible with the verified local Node 22.21.0 |
| Production API variable | `VITE_API_BASE_URL=https://sekkin-lk-backend.onrender.com` |
| Preview API variable | Explicit intended backend URL; avoid real transactions during Preview QA |
| System variables | Expose Vercel system environment variables; let Vercel supply `VERCEL_ENV` |
| SPA routes | Preserve the existing `/(.*)` to `/index.html` rewrite |

Never manually force `VERCEL_ENV=preview` for Production and never replace the build command with `vite build` to bypass readiness. Keep merchant/JWT/database secrets server-only. The frontend's currently tracked `.env` contains only the public backend URL; ignoring a file does not untrack it or sanitize Git history.

After the reviewed `main` push, open **Deployments**, select the deployment whose source is `main` at the printed final SHA, confirm the **Production** environment, and inspect the build log. It must run the strict command, report no business-content issues and complete Vite successfully. If automatic deployment is disabled, create/redeploy that verified `main` revision with Production settings. Confirm the existing domain `https://sekkin-lk-frontend.vercel.app/` is assigned to that successful deployment. Preserve the previous deployment for a reviewed rollback; do not use an old or draft Preview promotion as a gate workaround.

Official references checked 16 November 2026: [Vercel configuration](https://vercel.com/docs/project-configuration/vercel-json), [system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables), [deployment promotion](https://vercel.com/docs/deployments/promoting-a-deployment).

## Verify the released commit and public site

Record the successful deployment ID, its source commit SHA, environment and assigned domain from Vercel. Compare that SHA with `git rev-parse main` and `git ls-remote origin refs/heads/main`. Then use a clean browser on the domain and reload `/refund-policy`, `/privacy-policy`, `/terms-and-conditions`, `/shipping-policy`, `/about`, `/contact`, `/cart`, `/checkout`, `/orders` and a real product URL. Public policy pages must remain public; protected shopping pages may require sign-in, but must not return the hosting 404. Check all footer links, approved contacts, effective dates, responsive layout and intended indexability.

Inspect browser Network requests to confirm the approved Render host, verify the backend revision independently, and inspect checkout without submitting a real order or payment. Use isolated mocks or PayHere Sandbox for transaction tests. A reachable homepage or changed asset hash alone does not verify a commit, merchant approval or successful settlement. Live commit verification remains outstanding until the owner performs the manual release and makes its deployment metadata available.
