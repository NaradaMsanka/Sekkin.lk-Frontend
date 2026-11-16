# Public catalog release

The owner explicitly authorized the catalog fallback, commits, pushes and deployment to the existing services. The selected mode is **PUBLIC_CATALOG**; checkout, accounts and all online payments are **DISABLED**. The complete COD implementation is retained.

## Verified before frontend publication

- Render backend revision: `8ab50ff8c603e7e164a684bb8fb4fee5c31c2b11`, independently observed on the existing HTTPS service.
- Eight real mutation requests returned 503, including both order-creation paths, registration, login and admin collection. Four potentially sensitive GET routes returned only the identical non-personal maintenance JSON. The reviewed entrypoint starts no Spring/datasource/JWT components. Evidence: [actual containment](release-verification/catalog-backend-containment.json).
- Frontend: 50 tests pass; 94 browser checks pass at 320/375/1440px with the actual CSP, old browser-token fixtures and zero external requests. Local images have the approved original hashes; approved product names, descriptions and prices match the reviewed snapshot.
- Genuine `VERCEL_ENV=production npm run build:vercel` passes the separate catalog gate, including a live matching backend-revision check. Only the isolated catalog entry graph is bundled. API connections and form submission are also prohibited by CSP.
- `npm run build:merchant` still fails correctly with ten unresolved transactional/policy requirements. `policiesApproved` and `paymentSafetyReviewed` remain false. Catalog mode does not claim working COD checkout or PayHere readiness.
- Changed catalog/build files pass scoped ESLint. Existing unrelated whole-repository lint debt remains deferred by the owner. The non-failing bundle-size warning remains.

Frontend publication status and the actual deployed source identity will be recorded after public verification, not inferred from a push or build. No calendar publication date has been invented.

## Remaining requirements classified

| Scope | Required action |
| --- | --- |
| Essential before COD activation | Complete actual provider regions/access/transfer and retention/deletion/backup evidence; historical payment/log and administrator/ownership review; credential containment/rotation; reviewed additive production migration and unique-index/schema checks; verified hosted authorization/TLS/proxy/rate/logging and matching transactional revisions. The exact ten content messages remain in PAYHERE_BLOCKER_INVENTORY.md. |
| PayHere only | Merchant approval and a verified server-side payment integration, notifications, amounts/signatures and reconciliation before enabling online payments. Pending approval alone is not used to block COD. |
| Post-publication improvements | Replace owner-accepted illustrative images, unrelated existing lint findings and non-blocking bundle/performance work. Review the unsuppressed Medium BusyBox advisory or a tested supported image; the catalog release does not claim a new clean runtime scan. |

## Future activation and repeat releases

`config/release.json` explicitly selects catalog mode. The build preserves the strict merchant/COD checker; it never makes Production behave like Preview. A catalog Production build needs containment evidence less than 24 hours old **and** a current matching safe Render response. Refresh evidence through actual checks for later releases; do not edit timestamps to bypass it.

Changing to COD requires coordinated review of the backend's baked `public-release.properties`, frontend mode and CSP, followed by genuine transactional sign-offs and Production gates. The catalog CSP deliberately blocks API connections/forms. Do not merely flip the mode and enable ordering.

Sensitive production migrations, credential rotation and account changes still require the separately consolidated authorization requested by the owner. None occurred in this phase. Keep the contained backend revision running until a safe reviewed successor exists; do not roll back to the exposed legacy binary.
