# Clinic Appointment API

Express/Mongoose backend using ES modules, MongoDB Atlas, JWT authentication, and role-based access control.

## Setup

Use Node.js 20.19 or newer. From the `backend` directory:

```powershell
npm ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, and `CLIENT_ORIGIN` in `.env`. Generate a secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. For multiple frontend origins, provide a comma-separated list of exact origins (scheme and host, without a path). `TRUST_PROXY` defaults to `0`; set it to the number of trusted reverse proxies in front of the API if your host requires it.

To create the first administrator, temporarily set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `.env`, then run:

```powershell
npm run seed:admin
```

The seed script is a private command-line task; there is no public admin-registration route. Remove the `ADMIN_*` values after provisioning. Never commit `.env` or use the seed password as a permanent deployment secret.

Start the API locally with:

```powershell
npm run dev
```

For production:

```powershell
$env:NODE_ENV = "production"
npm start
```

The API listens on `http://localhost:5000` by default. `GET /api/health` is a health check and becomes available after MongoDB connects. Production requires `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_ORIGIN`; configure the frontend origin in the hosting provider's environment settings. Ensure MongoDB Atlas allows connections from the API host.

## Routes

| Method | Path | Access |
| --- | --- | --- |
| POST | `/api/auth/register` | Public; always creates a patient |
| POST | `/api/auth/login` | Public |
| GET | `/api/doctors?search=name-or-specialization` | Public |
| GET | `/api/doctors/:id` | Public |
| POST | `/api/appointments` | Patient |
| GET | `/api/appointments/my` | Patient |
| GET | `/api/appointments/doctor` | Doctor |
| PATCH | `/api/appointments/:id/status` | Assigned doctor; `approved` or `rejected` |
| PATCH | `/api/appointments/:id/cancel` | Owning patient; pending appointments only |
| GET | `/api/admin/users` | Admin; optional `role` and `isActive` filters |
| POST | `/api/admin/doctors` | Admin |
| PATCH | `/api/admin/users/:id/active` | Admin; JSON `{ "isActive": false }` or `true` |
| DELETE | `/api/admin/users/:id` | Admin; doctors and patients only |
| GET | `/api/admin/appointments` | Admin |
| GET | `/api/admin/stats` | Admin |

Send authenticated requests with `Authorization: Bearer <token>`. Appointment dates use `YYYY-MM-DD` and appointment times use 24-hour `HH:mm`. Booking rejects past dates and occupied active slots. Cancelling or rejecting an appointment releases its slot.

## Deployment

Deploy this folder as a Node.js service. Install with `npm ci` and start with `npm start`. Configure these environment variables in the host (do not upload `.env`):

- `NODE_ENV=production`
- `MONGODB_URI` — Atlas connection string; URL-encode special characters in the database user's password.
- `JWT_SECRET` — unique random secret of at least 32 characters (generate 32 random bytes).
- `CLIENT_ORIGIN` — exact HTTPS frontend origin, such as `https://clinic.example.com`.
- `TRUST_PROXY` — set only to the number of trusted proxies required by the host.
- `PORT` — use the host-provided value when available.

Run the admin seed as a one-off command with temporary `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` variables, then remove those variables from the service environment. The auth endpoints are rate-limited; if the API is behind a proxy, configure `TRUST_PROXY` correctly so client IPs are handled safely.

## API examples

Register a patient:

```powershell
curl.exe -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"Sam Patient\",\"email\":\"sam@example.com\",\"password\":\"change-me-now\"}"
```

Login (use the returned token as `$TOKEN`):

```powershell
curl.exe -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"sam@example.com\",\"password\":\"change-me-now\"}"
```

Find doctors, then book with a doctor ID:

```powershell
curl.exe "http://localhost:5000/api/doctors?search=cardiology"
curl.exe -X POST http://localhost:5000/api/appointments `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $TOKEN" `
  -d "{\"doctor\":\"DOCTOR_OBJECT_ID\",\"appointmentDate\":\"2027-01-15\",\"appointmentTime\":\"10:30\",\"reason\":\"Consultation\"}"
```

View the patient's appointments:

```powershell
curl.exe http://localhost:5000/api/appointments/my `
  -H "Authorization: Bearer $TOKEN"
```

For admin operations, log in with the seeded admin account and replace `$TOKEN` with the returned token. For example, create a doctor:

```powershell
curl.exe -X POST http://localhost:5000/api/admin/doctors `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $TOKEN" `
  -d "{\"name\":\"Alex Doctor\",\"email\":\"alex@example.com\",\"password\":\"change-me-now\",\"specialization\":\"Cardiology\",\"experience\":8}"
```
