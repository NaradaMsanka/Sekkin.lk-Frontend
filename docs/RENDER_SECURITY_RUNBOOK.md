> **Current public mode: PUBLIC_CATALOG, deployed 16 November 2026.** See [the verified catalog release](PUBLIC_CATALOG_RELEASE_RESULT.md). Its static frontend and no-database/JWT backend maintenance entrypoint are explicitly separate from the retained COD activation instructions below. Keep full merchant/COD approvals and gates intact; they are not satisfied by catalog publication.

# Render security configuration and coordinated release

Prepared 16 November 2026. **Instructions only: no dashboard settings, credentials, roles, data or deployments were changed.** The current final-business phase is recorded in the readiness report and source map; earlier 36-message counts describe the preceding operational-approval revision. Local security changes do not revoke anything accepted by the current deployed revision. **Follow [urgent containment](URGENT_SECURITY_CONTAINMENT.md) now, independently of unrelated business approvals, through the authorized operator.** Containment and enabling public shopping are separate release decisions.

## Required configuration for the reviewed backend

| Render environment variable | Required action |
| --- | --- |
| `JWT_SECRET` | Supply a new cryptographically random server-only value; this implementation requires at least 32 UTF-8 bytes and uses the literal UTF-8 string, without Base64 decoding. Use a separate key for staging. |
| `SPRING_DATASOURCE_URL` | Supply the verified Supabase PostgreSQL JDBC URL and required connection/TLS parameters from the actual account. There is no embedded localhost fallback. |
| `SPRING_DATASOURCE_USERNAME` | Supply the correct server-only database user. |
| `SPRING_DATASOURCE_PASSWORD` | Supply the correct server-only database credential through Render's secret environment settings. No source fallback remains. |
| `JPA_DDL_AUTO` | Set `validate` for Production. Also inspect any existing `SPRING_JPA_HIBERNATE_DDL_AUTO` override; Spring overrides must not silently restore `update`/`create`/`create-drop`. Resolve schema differences through a reviewed migration before starting this revision. |
| `CORS_ALLOWED_ORIGINS` | Comma-separated exact approved browser origins. Default includes the existing `https://sekkin-lk-frontend.vercel.app` and localhost/127.0.0.1 ports 5173/4173. Add only verified custom domains and specific Preview URLs needed for testing. No paths, trailing slash, wildcard, userinfo, query or fragment. |
| `SPRING_PROFILES_ACTIVE` | Verify the deployed profile; never enable `local-admin-bootstrap`. No automatic admin account is created. |
| `CHECKOUT_ENABLED` | Set `false` during an authorized containment/coordinated rollout of the new backend. Creation returns 503 with Retry-After before order lookup, reservation or placement writes; authentication may still read account data. Set `true` only after the matching frontend/backend and complete release checks are verified. An older deployed binary does not implement this switch. |
| Existing Cloudinary configuration | Retain verified server-only Cloudinary credentials/integration; do not copy their values into Vite or reports. |

`application.yml` defaults to schema validation, disables SQL output, limits framework request/security/bind logging and hides server error details. Audit existing Render `SPRING_*`, `LOGGING_*`, environment-group and profile overrides: external values can override safe source defaults. **This revision requires new session and order-safety columns and a unique retry-key index.** Review [the manual SQL proposal](../../../Backend/docs/migrations/2026-11-16-order-session-safety.sql) and [schema/integration instructions](../../../Backend/docs/ORDER_SESSION_RELEASE_PREPARATION.md) against the real schema, test them on isolated PostgreSQL, and apply only during an authorized release. Do not switch back to automatic schema writes merely to make startup pass.

The browser continues using Bearer headers. CORS does not allow credential cookies. Public product reads and guest COD checkout remain public; protected endpoints require authentication and admin mutations require the current database `ADMIN` authority. CORS allows the new `Idempotency-Key` header. CORS is a browser boundary, not a replacement for authorization. Preview builds still allow drafts, but live Preview API access needs the exact Preview origin in the allowlist. Verify Vercel Deployment Protection in the actual project; draft metadata and build checks do not protect a Preview URL from public access.

## Generate a replacement key without printing it

Run this manually in a trusted local PowerShell session. This block was **not executed** by the agent. It copies a fresh value to the clipboard and prints no key:

```powershell
$taskJwtBytes = New-Object byte[] 64
$taskJwtRng = [Security.Cryptography.RandomNumberGenerator]::Create()
try { $taskJwtRng.GetBytes($taskJwtBytes) } finally { $taskJwtRng.Dispose() }
$taskJwtSecret = [Convert]::ToBase64String($taskJwtBytes)
Set-Clipboard -Value $taskJwtSecret
[Array]::Clear($taskJwtBytes, 0, $taskJwtBytes.Length)
Remove-Variable taskJwtBytes, taskJwtRng, taskJwtSecret
```

Paste only into the intended Render `JWT_SECRET` value/approved secret manager. Do not echo it, include it in terminal arguments, commit it, put it in a `VITE_*` variable, or send it in a questionnaire. Clear the clipboard after securely saving it (`Set-Clipboard -Value ''`). Minimum length validation does not itself prove entropy; the random generator supplies that entropy.

## Save settings without an accidental deployment

1. Select the existing backend service in Render and inspect **Settings -> Auto-Deploy**. When staging a coordinated release, arrange an authorized controlled release window; changing the production auto-deploy setting itself is an operator action and was not done here.
2. Open **Environment**, add/edit the required values and check environment-group/service-level overrides. Choose **Save only** while preparing the reviewed revision. Other save choices can deploy immediately. Saved settings become active only with a subsequent deployment. [Render environment-variable documentation](https://render.com/docs/configure-environment-variables).
3. Test the reviewed backend against an isolated staging database/account with its own secret and exact staging frontend origin. Check startup/schema validation, real Bearer 401/403 boundaries, current account roles, CORS preflight and fixed/stored totals. Do not test against production customers or manufacture production orders.
4. For an independently authorized urgent containment release, deploy the reviewed compatible backend with ordering paused after its migration/security staging checks; do not wait for unrelated business approval. For public sales, complete every release condition before enabling ordering. Confirm the exact revision and successful startup in Render's Deploys view. A restart uses the running deployment's configuration; use the appropriate deployment to apply newly saved configuration. [Render deployment documentation](https://render.com/docs/deploys).

## Rotate signing material and invalidate old sessions

1. Treat previously committed signing material as exposed. Do not copy its value out of Git. Generate a fresh independent key, and record only operator/date/revision and a nonsecret change reference.
2. During the coordinated release, prevent protected traffic from being served by old instances with the old key. Drain/replace all instances and any other service accepting these JWTs. This implementation intentionally has one active key and no old-key grace period.
3. Configure and deploy the new key on every accepting instance. A JWT signed with the old key then fails validation, irrespective of its seven-day expiry. Verify an old controlled test token is rejected in staging and a new login works; never put customer tokens in logs or reports.
4. Customers must sign in again. The app uses localStorage Bearer tokens and stateless server security; no server session table is purged. Clearing a browser token logs out that browser only and cannot invalidate an attacker-held token.
5. Database role, enabled-state and session-version changes take effect on the next authenticated request. Every new token requires the current numeric `sessionVersion`; legacy tokens without it are rejected. Authenticated `POST /api/auth/logout-all` atomically advances that account's session version. The explicit **Log out on all devices** action calls this endpoint and clears the local token only after success. Ordinary **Log out** still clears only that browser. Operator-only account revocation/disable capabilities must be used through the guarded administrator routes or a reviewed service procedure; never expose arbitrary-email revocation publicly. Disabling and re-enabling both invalidate existing tokens. This is account-wide revocation, not a per-token denylist. No password-reset endpoint or automatic password-reset revocation is claimed.
6. Never restore an exposed old key during rollback. A rollback must use a reviewed compatible binary with the new key; otherwise keep the service unavailable until compatibility is restored. Do not assume an earlier hardcoded-key deployment honors `JWT_SECRET`.

The reviewed account routes use Bearer authentication and current database authority. `POST /api/auth/logout-all` revokes the caller's sessions. ADMIN-only `POST /api/admin/users/{id}/revoke-sessions` revokes the selected account's sessions; `PATCH /api/admin/users/{id}/enabled` accepts JSON `{"enabled":false}` to disable it or `{"enabled":true}` to re-enable it, invalidating sessions in both cases. Successful operations return 204; unavailable/self-disable cases return generic 409. Verify IDs and preserve at least the operator's access; never guess customer IDs, change roles or call these routes against Production as a test. Record the authorized operation externally without tokens/passwords.

## Review previously exposed accounts and records

- Inventory secret *locations* (current source, Git history, CI/build logs/artifacts, deployment environment groups, local files and any shared exports) without printing values. The removed fixed admin credential and old JWT material remain in history unless separately remediated; history rewriting is not performed here and never replaces rotation.
- An authorized operator must review existing administrators/roles, revoke or disable compromised accounts through the reviewed account-security service, and rotate the signing key to revoke old tokens globally. Do not run guessed SQL, silently change roles or delete accounts referenced by orders. No automatic password-reset feature is claimed.
- Review suspicious authentication/admin changes, affected carts, exposed password hashes and public reviewer emails. Review possible order associations created by the former submitted-email linkage. The patch prevents new associations but does not rewrite historical orders or establish which old records are affected.
- Review historical simulated card/payment submissions and logs/backups without exporting raw sensitive data into the repo. This release keeps live card/KOKO/PayHere disabled and creates COD as `PENDING_COD`. No fulfilment update marks payment collected. An explicit authorized COD collection action must check the saved amount and record the collection reference, operator and time; the courier's actual evidence and settlement procedure still need verification.
- Replace other credentials only if the location review shows exposure; do not assume a development fallback was an actual production password. Coordinate any database/Cloudinary credential changes with the corresponding service. Record completion without secret values.

## Coordinate Vercel and Render

The local abuse controls limit login, registration and order submissions and return HTTP 429 with `Retry-After`. They use the actual servlet remote address and ignore caller-supplied forwarded headers. Verify how Render's trusted proxy exposes client addresses before release; a shared proxy address could throttle unrelated customers. Counters are bounded, in memory, reset on restart and apply to one process. Add and verify shared edge/distributed limits before horizontal scaling. These controls do not replace hosted abuse monitoring.

Keep ordering unavailable on incompatible clients during rollout. Establish and verify an operator-controlled block before starting; the new reviewed backend additionally supports `CHECKOUT_ENABLED=false`, which an old binary does not honor. Release the paused Render backend and then its matching frontend. Old clients lack the required retry header and can display zero delivery; the new frontend requires the new order/administrator APIs. New UI against the old backend lacks the reviewed stock, retry and collection protections. Existing historical totals must never be rewritten. Additive columns alone do not make an old binary safe to restore. Enable checkout through the separately authorized runtime change only after verifying the complete pair.

For Vercel, preserve the existing project/repository, frontend-repository root `./`, Node 22.x, `npm run build:vercel`, `dist`, SPA rewrites and the intended public Render API URL. Add exact Preview browser origins for any integration checks. Keep real Preview/Production environment values; the Production gate must pass independently at zero unresolved checks. [Vercel environment documentation](https://vercel.com/docs/deployments/environments).

After the eventual authorized release, verify both source revisions, runtime settings, assigned domain, public routes/footer/direct refresh, 401/403 behavior, CORS, mobile checkout and stored order amounts in an authorized test arrangement. Roll back compatible revisions together while ordering is unavailable. Complete [the remaining source map](PAYHERE_BLOCKER_INVENTORY.md), [maintained dependency/container review](DEPENDENCY_SECURITY_REVIEW.md), catalog/policy decisions and outstanding technical controls before earning `paymentSafetyReviewed` or other sign-offs.
