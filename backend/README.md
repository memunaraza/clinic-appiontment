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

## MongoDB collections

- `users` stores login accounts and roles (admin, doctor, or patient). Doctor accounts are still users for authentication.
- `doctors` stores doctor-only profile data (`user`, contact details, profile picture URL, specialization, qualification, experience, consultation fee, and biography). The `user` field uniquely references the doctor's account in `users`.
- `doctoravailabilities` stores each doctor's weekly time slots.
- `reviews` stores one patient rating per completed appointment.
- `notifications` stores in-app doctor notifications for new appointment requests and reviews.
- `appointments` stores visits and references patient and doctor accounts by their `users` IDs.

Before deploying this schema change to a database that already contains doctor accounts, back up the database and run the idempotent migration from the `backend` directory:

```powershell
npm run migrate:doctors
```

The migration copies existing doctor specialization and experience into `doctors`, verifies that every doctor account has a profile, and then removes those profile fields from the user documents. It stops without removing legacy fields if any doctor account lacks valid profile data. New doctor accounts are written to both `users` and `doctors` by the admin endpoint.

For local development only, create 12 repeatable sample doctor accounts and profiles with:

```powershell
$securePassword = Read-Host "Temporary sample doctor password" -AsSecureString
$env:DOCTOR_SEED_PASSWORD = [System.Net.NetworkCredential]::new("", $securePassword).Password
npm run seed:doctors
Remove-Item Env:\DOCTOR_SEED_PASSWORD
$securePassword.Dispose()
```

The script refuses to run when `NODE_ENV=production`, never prints the password, does not change existing account passwords, and does not duplicate existing sample profiles. Newly created sample accounts share the supplied temporary password, so use this only with a non-production database.

## Routes

| Method | Path | Access |
| --- | --- | --- |
| POST | `/api/auth/register` | Public; always creates a patient |
| POST | `/api/auth/login` | Public |
| GET | `/api/doctors?search=name-or-specialization` | Public |
| GET | `/api/doctors/:id` | Public |
| GET | `/api/doctors/me/profile` | Doctor |
| PATCH | `/api/doctors/me/profile` | Doctor; update own account and professional details |
| PATCH | `/api/doctors/me/password` | Doctor; verify current password before changing |
| GET | `/api/doctors/me/patients` | Doctor; patients with appointments assigned to that doctor |
| GET, PUT | `/api/doctors/me/availability` | Doctor; read or replace own seven-day schedule |
| GET | `/api/doctors/me/reviews` | Doctor; own reviews and ratings |
| GET | `/api/doctors/me/notifications` | Doctor; own notifications |
| PATCH | `/api/doctors/me/notifications/read-all` | Doctor; mark own notifications as read |
| PATCH | `/api/doctors/me/notifications/:id/read` | Doctor; mark own notification as read |
| POST | `/api/appointments` | Patient |
| GET | `/api/appointments/my` | Patient |
| GET | `/api/appointments/doctor` | Doctor |
| PATCH | `/api/appointments/:id/status` | Assigned doctor; approve or reject pending visits, complete approved visits |
| PATCH | `/api/appointments/:id/cancel` | Owning patient; pending appointments only |
| POST | `/api/appointments/:id/review` | Owning patient; review a completed appointment once |
| GET | `/api/admin/users` | Admin; optional `role` and `isActive` filters |
| POST | `/api/admin/doctors` | Admin |
| PATCH | `/api/admin/doctors/:id` | Admin; update doctor account and professional details |
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
