# Vercel deployment

Use the frontend repository root, which is `Frontend/frontend` in this local workspace.

| Setting | Value |
| --- | --- |
| Framework | Vite |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |

Set `VITE_API_BASE_URL` to your backend URL. Keep backend secrets on the backend.

The app builds directly with Vite. `vercel.json` includes the SPA rewrite so routes such as `/admin`, `/login`, and `/cart` load directly.

To check locally, run `npm run build`, then `npm run preview`.
