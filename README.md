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
| `/forgot-password`, `/reset-password` | Email-based password recovery |
| `/cart`, `/checkout` | Cart quantities, coupons, delivery estimates and COD orders |
| `/orders` | Customer order history |
| `/admin` | Products/stock, reporting and order operations |
| `/about`, `/contact` and policy routes | Business information; unresolved content is visibly marked as draft |

The demo supports cash on delivery. Online payments, courier integrations and remaining merchant sign-offs require separate work. Cloudinary uploads need separately configured backend credentials. Password recovery email requires the backend SMTP configuration described below.

## Password recovery

The login page links to `/forgot-password`. Recovery requests use the existing Axios API client and public `VITE_API_BASE_URL`, without attaching a saved JWT. No additional frontend secrets or dependencies are needed. Configure Resend SMTP and apply the backend migration before enabling the feature in production; see the [backend password reset and deployment guide](../../Backend/docs/PASSWORD_RESET.md).

Email reset links open `/reset-password#token=...`. The page removes the token from the address bar immediately and keeps it only in component memory. Refreshing the cleaned page requires opening the email link again. Password reset does not sign the customer in; it clears the old browser session and returns to login with a success message. Both recovery pages omit storefront navigation, footer and support content. The HTML sets `no-referrer`, and Vercel applies `no-store`, `no-referrer` and `noindex` headers to the recovery routes.

Deploy the backend and migration first, then deploy this frontend through the existing Vercel project. Keep the current `VITE_API_BASE_URL` pointing to the deployed backend and verify direct visits to both recovery routes. Verify a real email and password reset with a designated test account after runtime SMTP configuration; automated tests use mocks and do not demonstrate real email delivery.

## Checks and normal development

```powershell
npm run lint
npm test
npm run build
```

`npm test` runs delivery, order retry, business-readiness and password recovery validation/token-handling tests. `npm run test:readiness` runs only the readiness tests. A successful build does not approve merchant content.

For ordinary development, configure the public `VITE_API_BASE_URL` from `.env.example`, then run `npm run dev`. Restart Vite after environment changes. Never put backend secrets in `VITE_*` variables.

Use `npm run check:merchant` and `npm run build:merchant` when preparing a commercial launch. These intentionally fail while business details, policies and sign-offs remain unresolved. Drafts can be demonstrated for submission without claiming commercial readiness.

See [Vercel deployment settings](docs/VERCEL_DEPLOYMENT.md). The normal build and hosting commands remain separate from `dev:demo`.
