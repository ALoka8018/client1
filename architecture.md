# Architecture

Plumbing/leak-detection/waterproofing services platform (India — Bhubaneswar/Cuttack/Puri/Rourkela). pnpm + Turborepo monorepo.

For product scope/roadmap see `PROJECT_PLAN.md`, for feature build history see `IMPLEMENTATION_PLAN.md`, for known gaps see `GAP.md`.

## Stack

- **API:** Hono (`@hono/node-server`), TypeScript, built with `tsup`
- **Web:** Next.js 16 (App Router), React 19, Tailwind CSS 4
- **DB:** Postgres via Supabase, accessed through Prisma (`@repo/database`)
- **Auth:** Supabase Auth (migrated from Clerk — see migration `20260717114200_rename_clerk_id_to_supabase_id`)
- **Storage:** Google Cloud Storage (invoice PDFs, booking attachment photos), with in-memory fallback for local dev
- **Payments:** Razorpay (orders, webhook-verified payments)
- **PDF generation:** Puppeteer (invoices)

## Repo layout

```
apps/
  api/            Hono API — apps/api/src/index.ts
  web/            Next.js frontend
packages/
  database/       Prisma schema, migrations, client (@repo/database)
  types/          shared TS types
  validation/     shared Zod schemas
  config/         shared tsconfig.base.json
  utils/          shared utility functions
  logger/         shared logger
  seo/            SEO helpers (used by web)
  storage/        storage driver abstraction (GCS / in-memory)
  ui/             shared React component library (used by web)
```

Workspaces: `apps/*`, `packages/*` (pnpm-workspace.yaml). Turbo pipeline: `build` (depends on `^build`), `dev` (persistent, uncached), `lint`, `check-types` — see `turbo.json`.

## apps/api

Single-file router: all routes registered in `src/index.ts` (no separate routes/controllers split). Business logic lives in `src/lib/*.ts`, one module per domain (bookings, payments, razorpay, invoice-pdf, reviews, services, dashboard, serviceAreas, notifications, documents, properties, support, attachments, technician-applications, technician, mailer, supabase).

- **Middleware:** `src/middleware/auth.ts` (`requireAuth`, `requireRole`), `src/middleware/rateLimit.ts` (applied to leads/bookings/reviews/support/technician-application routes)
- **Auth flow:** client sends `Authorization: Bearer <supabase-access-token>` → `requireAuth` calls `supabaseAdmin.auth.getUser(token)` → JIT-upserts a local Prisma `User` row keyed by `supabaseId` on first request
- **CORS:** `hono/cors`, origins from `CORS_ORIGIN` env var (comma-separated), `credentials: true`
- **API docs:** hand-built OpenAPI spec (`src/openapi.ts`) served at `/openapi.json`, Swagger UI at `/docs`
- **Testing:** manual scripts in `scripts/*.mjs` run against a live server (no formal test suite)

### Key endpoints (all under `/v1`, plus `/health`, `/openapi.json`, `/docs`)

- `GET /v1/me`
- `GET /v1/service-areas/check`, `POST /v1/leads`
- `POST /v1/bookings`, `GET /v1/bookings`, `PATCH /v1/bookings/:id`
- `POST /v1/bookings/:id/attachments` (multipart, ADMIN/TECHNICIAN)
- `GET /v1/services`
- `POST|GET /v1/reviews`
- `GET|PATCH /v1/notifications`
- `GET /v1/documents`, `GET /v1/properties`, `GET /v1/properties/:id/health`
- `POST|GET /v1/support-tickets`
- `POST /v1/technician-applications`
- `GET /v1/technician/jobs`, `PATCH /v1/technician/jobs/:id/status`, `GET /v1/technicians/:id/rating`
- `GET /v1/invoices`, `GET /v1/invoices/:number/pdf` (Puppeteer-generated, signed GCS URL)
- `POST /v1/payments/orders`, `POST /v1/payments/verify`, `POST /v1/payments/webhook` (Razorpay HMAC-verified, idempotent via `WebhookEvent`)
- `GET /v1/admin/dashboard`, `/v1/admin/services` (CRUD), `/v1/admin/reviews`, `/v1/admin/bookings`, `/v1/admin/bookings/:id/attachments`, `/v1/admin/technicians`, `PATCH /v1/admin/bookings/:id/assign`
- `GET /v1/projects/gallery`

## apps/web

Next.js App Router with route groups:

- `(auth)` — login, signup, forgot-password, reset-password
- `(marketing)` — home, about, services, book, projects, blog, careers, become-a-technician, contact, safety-standards, privacy, terms
- `(portal)` — role-gated app: dashboard, bookings, account, support, technician, admin

Talks to the API via `NEXT_PUBLIC_API_URL`, calling `/v1/*` with `Authorization: Bearer <token>` headers (not cookie-forwarded).

Auth via `@supabase/ssr` + `@supabase/supabase-js`:
- `src/lib/supabase/client.ts` (browser), `src/lib/supabase/server.ts` / `middleware.ts` (server/session refresh)
- `src/middleware.ts` protects `/dashboard, /bookings, /account, /support, /admin, /book, /technician`, redirecting unauthenticated users to `/login?next=...`
- `src/components/auth/AuthForm.tsx` — shared login/signup form (signup triggers Supabase email confirmation)

## packages/database

Prisma schema at `packages/database/prisma/schema.prisma`, client generated to `src/generated/client` (custom output path, for Docker/Linux binary targets). Key models: `User`, `TechnicianProfile`, `Property`, `ServiceCategory`, `Service`, `Booking` (status flow: REQUESTED → CONFIRMED → ASSIGNED → EN_ROUTE → IN_PROGRESS → COMPLETED/CANCELLED), `BookingAttachment`, `BookingStatusEvent`, `Invoice`, `WebhookEvent`, `Notification`, `PaymentMethod`, `MaintenanceRecord`, `PropertyHealthMetric`, `ServiceArea`, `Lead`, `SupportTicket`, `TechnicianApplication`, `Testimonial`, `Review`, `BlogPost`, `JobPosting`.

Migrations in `prisma/migrations/`. Seed script: `prisma/seed.ts` (`pnpm db:seed`).

## Deployment

- **API:** containerized via root `Dockerfile` (`node:22-slim`, installs Chromium for Puppeteer, runs `node apps/api/dist/index.js`, port 4000). Currently deployed to **Google Cloud Run** (see `backendguide.md` — project `slas-103f1`, region `us-central1`). `render.yaml` and `DEPLOYMENT.md` describe an earlier Render-based deployment target; treat those as legacy/superseded by the Cloud Run setup unless verified otherwise.
- **Web:** deployed to Vercel (dashboard-configured, Root Directory = `apps/web`), no `vercel.json` in repo.
- **DB:** Supabase Postgres (both deployment docs agree).

Note: `DEPLOYMENT.md` still references Clerk env vars — stale, since auth runs on Supabase now.
