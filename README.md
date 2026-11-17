# SEKKIN.LK frontend

React 19, Vite and Material UI storefront/admin interface for a cosmetics e-commerce project.

## Local submission demo

Requires Node.js 22. Start the backend's `start-demo.ps1` in another terminal; it prints the temporary admin credentials and serves a temporary sample catalog on port 8080.

From this repository root (`Frontend/frontend` in the shared workspace):

```powershell
npm ci
npm run dev:demo
```

Open `http://localhost:5173`. Demo mode explicitly sends API requests to `http://localhost:8080`, even when an existing `.env` points to Render. Port 5173 must be free. Sign in with the printed admin account, visit `/admin`, and register a separate customer to demonstrate cart checkout. Backend demo data resets when the backend stops.

The backend repository's `docs/DEMO_SUBMISSION.md` contains the presentation walkthrough and submission checklist.

## Features and routes

| Route | Feature |
| --- | --- |
| `/` | Responsive catalog, search/filter controls and product quick view |
| `/product/:id` | Product details, reviews and direct COD checkout |
| `/register`, `/login` | Customer accounts |
| `/cart`, `/checkout` | Cart quantities, coupons, delivery estimates and COD orders |
| `/orders` | Customer order history |
| `/admin` | Products/stock, reporting and order operations |
| `/about`, `/contact` and policy routes | Business information; unresolved content is visibly marked as draft |

The demo supports cash on delivery. Online payments, automated email/courier integrations and final merchant policies remain future work. Cloudinary uploads need separately configured backend credentials.

## Checks and normal development

```powershell
npm run lint
npm test
npm run build
```

`npm test` runs all existing delivery, order retry and business-readiness tests. `npm run test:readiness` runs only the readiness tests. A successful build does not approve merchant content.

For ordinary development, configure the public `VITE_API_BASE_URL` from `.env.example`, then run `npm run dev`. Restart Vite after environment changes. Never put backend secrets in `VITE_*` variables.

Use `npm run check:merchant` and `npm run build:merchant` when preparing a commercial launch. These intentionally fail while business details, policies and sign-offs remain unresolved. Drafts can be demonstrated for submission without claiming commercial readiness.

See [Vercel deployment settings](docs/VERCEL_DEPLOYMENT.md). The normal build and hosting commands remain separate from `dev:demo`.
