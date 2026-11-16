> **Current public mode: PUBLIC_CATALOG, deployed 16 November 2026.** See [the verified catalog release](PUBLIC_CATALOG_RELEASE_RESULT.md). Its static frontend and no-database/JWT backend maintenance entrypoint are explicitly separate from the retained COD activation instructions below. Keep full merchant/COD approvals and gates intact; they are not satisfied by catalog publication.

# Vercel Preview and Production builds

**Latest phase-2 update:** 61 messages still block Production. Full backend tests/package 134/134, frontend tests 32/32 and browser checks 67/67 pass. Backend now requires explicit datasource/JWT configuration, schema validation and exact browser origins (including needed Preview URLs). Follow [the phase-2 report](PRODUCTION_PHASE2_REPORT.md) and [Render security runbook](RENDER_SECURITY_RUNBOOK.md); earlier counts below are historical.

Current review, 16 November 2026 after the owner response: local/Preview builds succeed, while merchant and simulated Production builds correctly reject **61** unresolved messages. The readiness suite has **23 passing tests**. Confirmed contacts/policy clauses and the fixed LKR 350 delivery rule are applied locally. Nine delivery tests, 66 browser checks and 87 selected isolated backend tests also pass; packaging succeeds. Unrelated business/security decisions remain pending. The earlier live check found the production homepage reachable but information-page/shopping deep links returning HTTP 404; deployed Git revision remains unverified. Use the [current consolidated report](PAYHERE_OWNER_RESPONSE_REPORT.md) and [manual release runbook](PRODUCTION_RELEASE_RUNBOOK.md). Do not run production commands until content and backend/security blockers are resolved. No push, merge or deployment has been performed.

Preview permits UI review with unfinished merchant content. Production still requires all business details, policy copy and review flags to pass the existing readiness checker. No business values or approval flags are filled by the build.

| Command | Behavior with unfinished content |
| --- | --- |
| `npm run build` | Local draft build; also blocks when a Production or unidentified Vercel environment is detected |
| `npm run build:vercel` | Runs the normal Vite React build only for `VERCEL_ENV=preview`; otherwise blocks |
| `npm run check:merchant` | Always strict, including in Preview |
| `npm run build:merchant` | Always strict; Vite runs only after readiness passes |

The explicit `--vercel` marker prevents the hosted command from mistaking a build with missing system variables for a local review. Only the exact environment `preview` permits hosted draft builds. `NODE_ENV` and Vite's production build mode do not select deployment readiness.

The existing policy pages keep their visible **Draft for business review — REVIEW REQUIRED** warning, draft page titles, unconfirmed details and `noindex` metadata while readiness is incomplete. The footer also retains its business-review draft notice. UI, API and checkout behavior are unchanged by this configuration fix.

## Vercel project settings

For the existing `NaradaMsanka/Sekkin.lk-Frontend` repository, `package.json` and `vercel.json` are at the Git root. In Vercel's **Settings → Build and Deployment**, use:

| Setting | Value |
| --- | --- |
| Root Directory | Repository root (`./`; leave the field empty if the dashboard represents root that way) |
| Framework Preset | Vite |
| Build Command | `npm run build:vercel` |
| Output Directory | `dist` |
| Install Command | `npm ci` |
| Node.js Version | `22.x` (local verification used Node `22.21.0`) |

`Frontend/frontend` is the local workspace path, **not** a subdirectory in this frontend Git repository. Use that subdirectory only if you later connect a different repository that actually contains the whole workspace. Vercel resolves the root relative to the connected repository. See [Vercel build settings](https://vercel.com/docs/builds/configure-a-build) and [supported Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

The committed `vercel.json` overrides the dashboard build command and preserves the existing SPA rewrite. Updating only the dashboard cannot override the old committed merchant command; the fixed files must be committed too. See [Vercel buildCommand](https://vercel.com/docs/project-configuration/vercel-json#buildcommand).

Under the project's **Environment Variables**, enable **Enable access to System Environment Variables** (called **Automatically expose System Environment Variables** in some dashboard versions). Let Vercel supply `VERCEL_ENV`; do not manually set it to `preview` for Production. Missing system variables intentionally block the hosted build. See [Vercel system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables).

Keep the existing `VITE_API_BASE_URL` value for each required environment. The repository's current example is `https://sekkin-lk-backend.onrender.com`. No payment secrets or new backend settings are needed.

In the project's Git / Production environment settings, keep the existing Production branch (`main` if that is what the project currently uses). Use a different branch for UI Preview deployments. Vercel creates Preview deployments from non-production branches when Git deployments are enabled. See [Vercel Git deployments](https://vercel.com/docs/git).

## Git commands for a Preview

Run these yourself in PowerShell after reviewing the changes. The final push can trigger a Vercel Preview build; no commit, push or deployment was performed as part of this fix.

```powershell
Set-Location 'D:\sekking lk development\sekkinLk\Frontend\frontend'
git switch -c fix/vercel-preview-build
git diff --check
git diff
git add package.json vercel.json scripts/check-merchant-readiness.mjs scripts/readiness.test.mjs README.md docs/VERCEL_DEPLOYMENT.md docs/PAYHERE_READINESS_REPORT.md
git diff --cached
git commit -m "Allow draft Vercel previews and keep production readiness strict"
git push -u origin fix/vercel-preview-build
```

Use the resulting Preview URL for UI review. An eventual Production release must build with the Production environment after real approvals and content review. Vercel's Preview-to-Production workflow rebuilds with Production variables, so the readiness gate also applies there. See [Vercel deployment promotion](https://vercel.com/docs/deployments/promoting-a-deployment).

## Local verification

These commands simulate Vercel's environments without contacting Vercel or deploying:

```powershell
npm run test:readiness

$env:VERCEL = '1'
$env:VERCEL_ENV = 'preview'
npm run build:vercel
# Expected: exit 0, draft warning, normal Vite build in dist/.

$env:VERCEL_ENV = 'production'
npm run build:vercel
# Expected with the current content: exit 1, 61 unresolved items, Vite never runs.

Remove-Item Env:VERCEL, Env:VERCEL_ENV -ErrorAction SilentlyContinue
npm run build:vercel
# Expected: exit 1, since hosted builds without system variables remain strict.

npm run build
# Expected: exit 0 for local draft review.
npm run build:merchant
# Expected: exit 1 until genuine business and policy approvals are complete.
```

The readiness tests cover Preview, Production, missing and unexpected system variables, local review, explicit strict checks and deployment configuration. The Vite large-chunk warning is unrelated to readiness and does not fail the Preview build. No live Vercel deployment or browser interaction is verified by these local build checks.
