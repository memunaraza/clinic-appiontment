# ClinicFlow frontend

React, Vite, Tailwind CSS, and React Router frontend for the ClinicFlow API.

## Run locally

Use Node.js 20.19 or newer. From the `frontend` directory:

```powershell
npm ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

The Vite development server proxies `/api` to `VITE_API_PROXY_TARGET` (default `http://localhost:5000`). Keep `VITE_API_BASE_URL=/api` for local development. For a separately hosted frontend, set `VITE_API_BASE_URL` to the full backend API root (for example `https://api.example.com/api`).

```powershell
npm run dev
```

Build and lint with:

```powershell
npm run build
npm run lint
```

The backend must be running and connected to MongoDB. Public registration creates patient accounts only; use the backend's private admin seed script to create the first administrator. Admins create doctor accounts inside the dashboard.

## Deployment

Build the frontend as a static site:

```powershell
npm ci
npm run build
```

Publish the generated `dist` directory. Before building, set `VITE_API_BASE_URL` in the hosting provider to the backend API root, including `/api` (for example `https://api.example.com/api`). `VITE_API_PROXY_TARGET` is only for the local Vite development server. Vite variables are included in browser code; never put secrets in `VITE_*` variables.

Configure the static host to rewrite application routes to `/index.html` so direct visits and refreshes on `/admin/dashboard`, `/doctor/dashboard`, and `/patient/dashboard` load the React app. If the frontend and API use different origins, add the exact frontend origin to the backend's `CLIENT_ORIGIN`.

## API integration

The Axios client sends the stored JWT as `Authorization: Bearer <token>`. Auth responses use `{ token, user }`; list pages consume the backend's `{ doctors }`, `{ appointments }`, and `{ users }` responses, while clinic statistics consume `{ stats }`. All dashboard lists and totals are fetched from the API.

Role-based route roots are `/patient`, `/doctor`, and `/admin`. An expired/invalid token clears the local session and returns the user to sign-in.
