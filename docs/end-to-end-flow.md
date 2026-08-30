# End-to-End Flow — Seepage Doctor

Source of truth for how the platform actually works today (as built in code, not the aspirational `docs/flow` marketing page which is stale). Edit this file directly to redline what should change.

## Roles

| Role | Where defined | Access |
|---|---|---|
| `CUSTOMER` | default on signup | public site, `/dashboard`, `/bookings`, `/account`, `/support` |
| `TECHNICIAN` | promoted by `SUPER_ADMIN` after approving an application | everything a customer has + `/technician` job queue |
| `ADMIN` | promoted by `SUPER_ADMIN` | `/admin` dashboard, assign, services, reviews, photos |
| `SUPER_ADMIN` | seeded via `apps/api/src/scripts/seedAdmin.ts` | everything ADMIN has + `/admin/staff` (role management, technician application approval) |

Role is stored on `User.role` (`packages/database/prisma/schema.prisma`). Auth identity lives in Supabase; `apps/api/src/middleware/auth.ts` upserts a local `User` row on first authenticated request, defaulting new users to `CUSTOMER`.

## 1. Visitor → Customer

1. Visitor lands on marketing site (`(marketing)` route group): home, `/services`, `/services/explore`, `/projects`, `/about`, `/blog`, `/careers`, `/contact`, `/safety-standards`, `/privacy`, `/terms`.
2. Checks coverage: `GET /v1/service-areas/check?pincode=` — if uncovered, can leave a lead via `POST /v1/leads`.
3. Signs up at `/signup` (`AuthForm mode="signup"`, in `apps/web/src/components/auth/AuthForm.tsx`):
   - Requires phone number at signup.
   - Supabase sends an OTP to email instead of a confirmation link; user enters the code, `supabase.auth.verifyOtp(...)` completes it.
4. Logs in at `/login`. Password reset via `/forgot-password` → `/reset-password`.
5. First authenticated API call triggers `upsertUserFromSupabase` → local `User` row created with `role = CUSTOMER`.

## 2. Customer books a service

1. Browses `/services` or `/services/explore` (`GET /v1/services`, includes live review aggregates).
2. Books at `/book` → `POST /v1/bookings` (auth required, rate-limited 10/5min). Creates a `Booking` with a unique `code`, status `REQUESTED`, tied to a `Property` and optional `Service`.
3. Confirmation email fires automatically on booking creation.
4. Customer tracks bookings at `/bookings` (`GET /v1/bookings`) and can modify via `PATCH /v1/bookings/:id`.
5. Customer dashboard `/dashboard` shows property health (`GET /v1/properties/:id/health`), notifications (`GET /v1/notifications`), documents (`GET /v1/documents`).
6. Account settings at `/account`, `/account/documents`. Support tickets at `/support` (`POST/GET /v1/support-tickets`).

## 3. Booking lifecycle (status machine)

`REQUESTED → CONFIRMED → ASSIGNED → EN_ROUTE → IN_PROGRESS → COMPLETED` (or `CANCELLED` at any point). Each transition logs a `BookingStatusEvent`.

- **Admin assigns a technician**: `/admin/assign` → `GET /v1/admin/technicians`, `PATCH /v1/admin/bookings/:id/assign` → status becomes `ASSIGNED`.
- **Technician works the job**: `/technician` page → `GET /v1/technician/jobs` (own jobs only) → `PATCH /v1/technician/jobs/:id/status` with action `en_route | arrived | completed` (+ optional note, + materials used on completion).
- **Technician documents the job**: uploads before/after photos via `POST /v1/bookings/:id/attachments` (guarded — must be assigned to that job).

## 4. Payments & invoicing

1. On completion, an `Invoice` exists against the booking (`PENDING`).
2. Customer pays: `POST /v1/payments/orders` (Razorpay order) → client completes checkout → `POST /v1/payments/verify` (signature-checked) marks invoice `PAID`.
3. Razorpay webhook (`POST /v1/payments/webhook`) reconciles async payment events, deduped via `WebhookEvent`.
4. Paid invoice PDF generated on demand and served via signed URL: `GET /v1/invoices/:number/pdf`.

## 5. Reviews

1. Customer submits a review tied to a completed booking: `POST /v1/reviews` — starts `APPROVED` by default but is moderatable.
2. Admin moderates at `/admin/reviews`: `GET /v1/admin/reviews`, `PATCH /v1/admin/reviews/:id` (`APPROVED | HIDDEN | PENDING`).
3. Approved reviews feed the public service ratings (`serviceReviewAggregates`) and `/v1/reviews` (public, filterable by service).

## 6. Photo gallery

1. Technician/admin uploads photos per booking (see §3).
2. Admin curates: `/admin/photos` → `GET /v1/admin/bookings/:id/attachments`, marks `featured` + `consent` for public use.
3. Featured, consented photos surface on the public `/projects` gallery: `GET /v1/projects/gallery`.

## 7. Becoming a technician

1. Visitor applies at `/become-a-technician` → `POST /v1/technician-applications` (public, rate-limited) — creates `TechnicianApplication` (`PENDING`).
2. **SUPER_ADMIN only** reviews at `/admin/staff`: `GET /v1/admin/technician-applications`, `PATCH /v1/admin/technician-applications/:id` → `APPROVED | REJECTED`.
3. Approving creates/promotes the corresponding `User` to `TECHNICIAN` with a `TechnicianProfile` — they can now sign in and see `/technician`.

## 8. Staff & role management (SUPER_ADMIN only)

`/admin/staff` also lists all users (`GET /v1/admin/users`, searchable/filterable by role) and lets SUPER_ADMIN change any user's `role` or toggle a technician's `active` flag (`PATCH /v1/admin/users/:id`).

## 9. Admin operations

`/admin` layout (`apps/web/src/app/(portal)/admin/layout.tsx`) gates on `ADMIN`/`SUPER_ADMIN` by calling `GET /v1/me` client-side.

- `/admin` — dashboard: today's bookings, status counts, available technicians, latest reviews (`GET /v1/admin/dashboard`).
- `/admin/assign` — technician assignment (§3).
- `/admin/services` — CRUD on `Service` catalog (`GET/POST/PATCH/DELETE /v1/admin/services`).
- `/admin/reviews` — review moderation (§5).
- `/admin/photos` — photo curation (§6).
- `/admin/staff` — **SUPER_ADMIN only**: applications + user/role management (§7, §8).

## Known gaps / open questions

- The public `/docs/flow` marketing page (`apps/web/src/app/(marketing)/docs/flow/page.tsx`) still says technician assignment and admin panel are "planned" — they're built. That page should be updated or removed once this doc is finalized.
- No customer-facing technician tracking (map/ETA) beyond status labels.
- No in-app messaging between customer and technician — phone number is just displayed.

---
*Edit this file to mark what should change — add a `## Proposed changes` section or inline comments and I'll implement from there.*
