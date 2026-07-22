# Gap Analysis & Closure Plan

Audited 2026-07-22 against the original MVP spec (PROJECT_PLAN.md). The product pivoted from
"Booking/Engineer" naming to "Booking/Technician" on Next.js + Hono + Prisma/Supabase — this plan
fills functional gaps in the *current* stack, not a rewrite back to the original naming/architecture.

Stack: Next.js 15 (`apps/web`) + Hono API (`apps/api`) + Prisma/Postgres via Supabase +
Supabase Auth + GCS storage + Razorpay.

---

## Priority 1 — Broken/missing core flows

### 1. Admin dashboard (currently a static placeholder)
- File: `apps/web/src/app/(portal)/admin/page.tsx`
- Build: today's bookings count, pending/assigned/completed/cancelled counts, available technicians
  list, latest reviews feed.
- Backend: one `GET /v1/admin/dashboard` aggregate endpoint (Prisma `groupBy`/`count` on `Booking`,
  `TechnicianProfile` availability, `Review` recent).
- No repository layer needed — one query file under `apps/api/src/lib/dashboard.ts`.

### 2. Password reset flow
- Missing entirely. Supabase Auth supports this natively (`resetPasswordForEmail` +
  `updateUser` on the callback) — do not hand-roll token generation.
- Add: "Forgot password" link → `apps/web/src/app/(auth)/forgot-password/page.tsx` calling
  `supabase.auth.resetPasswordForEmail`.
- Add: reset-password page reading the Supabase recovery session and calling
  `supabase.auth.updateUser({ password })`.
- Wire the existing `notify()` helper isn't needed — Supabase sends its own email; just confirm
  the Supabase email template is configured (dashboard config, not code).

### 3. Service CRUD (admin)
- Currently read-only (`GET /v1/services`).
- Add `POST/PATCH/DELETE /v1/admin/services` in `apps/api/src/index.ts` + `apps/api/src/lib/services.ts`.
- Reuse existing Zod validation package (`packages/validation`) for the input schema.
- Admin UI: simple table + form under `apps/web/src/app/(portal)/admin/services/page.tsx`.

### 4. Review moderation
- `Review` model has no approved/hidden flag.
- Prisma migration: add `status ReviewStatus @default(PENDING)` enum (`PENDING/APPROVED/HIDDEN`)
  to `Review`.
- Public review display filters `status: APPROVED`.
- Admin UI: approve/hide buttons on `apps/web/src/app/(portal)/admin/reviews/page.tsx` (new page)
  hitting `PATCH /v1/admin/reviews/:id`.

---

## Priority 2 — Hardening (security/reliability, small diffs)

### 5. Centralized error handling
- `apps/api/src/index.ts` has no `app.onError(...)`.
- Add one Hono `onError` handler: catch Zod validation errors → 422 with field errors, known
  `AppError` → its status, everything else → 500 with generic message + `logger.error` (stack
  logged, never returned to client).

### 6. Security headers + rate limiting
- Add `hono/secure-headers` middleware (Hono's built-in equivalent of helmet — no new dependency).
- Add rate limiting on auth + booking-create routes only (not global) — check if
  `@hono-rate-limiter` or similar is already a transitive dep before adding one; otherwise a
  simple in-memory token bucket keyed by IP is enough for MVP scale (single-instance deploy).

### 7. Service area / pincode logic
- Replace hardcoded list in `apps/web/src/lib/serviceAreas.ts` with a `ServiceArea` Prisma model
  (city, area, pincode, active).
- Booking flow: if pincode not covered, don't block — capture name/phone/area as a `Lead` record
  (new minimal model) instead of proceeding to full booking.

---

## Priority 3 — Nice-to-have (only if time remains)

### 8. Booking number format
- Change `generateBookingCode()` in `apps/api/src/lib/bookings.ts:27-30` to `PL-YYYYMMDD-00001`
  style if the business actually wants this exact format (confirm with user — current
  `BK-<timestamp>-<random>` is collision-safe and simpler; switching to a sequential daily counter
  needs a DB sequence or transaction-guarded counter table).

### 9. Swagger/OpenAPI docs
- Hono has `@hono/zod-openapi` — since validation is already Zod, this is close to free. Only do
  this once endpoints 1-4 above stabilize (no point documenting a moving target).

### 10. "Materials used" field on job completion
- One column on `Booking` or `BookingAttachment` completion payload. Trivial, add alongside #1-4
  if a technician-facing form change is already in flight.

---

## What's explicitly NOT in this plan
- No rewrite to classic controller/service/repository layering — current route→lib→Prisma
  structure works for this codebase's size; adding a repository abstraction now is premature.
- No custom JWT/password hashing — Supabase Auth already handles this correctly.
- No separate customers/admins/engineers tables — role column on `User` is sufficient at this scale.

## Suggested order
1 → 4 (P1, user-facing gaps) → 5 → 6 (P2, cheap and safety-critical) → 7 (P2, needed for
correct booking flow) → 8/9/10 only if requested.
