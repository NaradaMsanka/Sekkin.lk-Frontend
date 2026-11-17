# Vercel deployment

Use the frontend repository root, which is `Frontend/frontend` in this local workspace.

| Setting | Value |
| --- | --- |
| Framework | Vite |
| Git repository | `NaradaMsanka/Sekkin.lk-Frontend` |
| Production branch | `main` |
| Root directory | `./` (repository root) |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js | `22.x` |

Set `VITE_API_BASE_URL` to your backend URL. Keep backend secrets on the backend.

The app builds directly with Vite. `vercel.json` includes the SPA rewrite so routes such as `/admin`, `/login`, and `/cart` load directly.

To check locally, run `npm run build`, then `npm run preview`.

`npm run build:vercel` remains a compatibility alias for the same normal build. Production builds do not invoke the optional merchant-content checker.

Create a deployment from the latest verified Git revision. Clicking Redeploy on the old failed `2001fe8` deployment rebuilds that old source, including its old blocking build script.

The local demo uses `npm run dev:demo` with the backend's temporary demo profile. This does not verify a hosted deployment. Record the deployed source revision and repeat frontend/API checks before claiming the hosted store is operational.
