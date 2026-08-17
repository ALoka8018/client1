# Seepage Doctor — Project Plan & Feature Roadmap

_Last updated: 2026-07-21_

This document tracks what the platform currently does, what's built vs. stubbed, and the
roadmap for new features (backend, customer portal, and the future admin site). Update this
file whenever scope changes — it's the single source of truth for "what exists" vs. "what's next."

For a detailed, phase-by-phase build log (what was implemented, how it was verified, gaps found
along the way), see `IMPLEMENTATION_PLAN.md` — it uses its own Phase 0–5 numbering and is the
better source for implementation detail. This document keeps its original Phase 1–7 scheme below;
the two numbering schemes don't map 1:1, but every roadmap item here has been re-checked against
what's actually been built.

---

## 1. What this project is

Seepage Doctor is a plumbing / leak-detection / waterproofing / structural-inspection
service company platform (India — Bhubaneswar, Cuttack, Puri, Rourkela). It has:

- A **marketing site** to attract customers and explain services
- A **customer portal** to book services, track jobs, and manage account/billing
- A **minimal admin surface** (`/admin/photos`, `/admin/assign` — role-gated pages inside the same
  Next.js app, not a separate admin site; see Phase 6)
- A **technician view** (`/technician` — role-gated, mobile-first)

## 2. Repo structure

```
apps/
  web/            Next.js 15 app (App Router) — marketing site + customer portal + admin/technician pages
  api/            Hono API server — ~30 routes across bookings, payments, reviews, notifications,
                  documents, properties, support, attachments, technician, admin
packages/
  database/       Prisma schema + client (Postgres) — DONE, live Supabase DB, 10+ migrations applied
  types/          Shared TS types (ID, Timestamped)
  validation/     Shared Zod schemas (booking, payment, review, support ticket, technician, etc.)
  ui/             Shared UI primitives (Button, Card, Badge, Input, cn)
  storage/        Real Google Cloud Storage-backed StorageDriver (private objects, signed URLs) — DONE
  logger/         Shared logger
  seo/            SEO helpers
  utils/          Misc shared utils
  config/         Shared tsconfig base
stitch_advanced_leak_detection_portal/   Design prototypes (Stitch/Figma exports) — reference only
```

Stack: pnpm + Turborepo monorepo, Next.js + Tailwind (Material Symbols icons, Montserrat/Inter
fonts, "glassmorphism" design system — see `apps/web/DESIGN.md` for full tokens),
Hono API, Prisma + PostgreSQL (Supabase), Supabase Auth for auth, Razorpay for payments,
Google Cloud Storage for file storage, Puppeteer for invoice PDF generation.

---

## 3. Current features

Almost everything below is now wired to real data and a live backend — the "UI only, no live API
calls" state from the last update no longer applies except where explicitly noted as static.

### Marketing site (public)
| Page | Route | Notes |
|---|---|---|
| Home | `/` | Hero, core solutions, trust indicators, inspection process, "visible results", emergency banner, service-area coverage check widget |
| Services | `/services` | Service grid overview |
| Explore Services | `/services/explore` | `Marketplace` — real `GET /v1/services` data (was fully static), real review-based ratings with seed fallback, instant estimate calculator |
| Book | `/book` | `BookingForm` — real `POST /v1/bookings`, service-area check widget, service-zone map (city list now shared/consistent with the booking form) |
| Projects | `/projects` | Before/after gallery — real `GET /v1/projects/gallery` (featured + consented photos), falls back to hardcoded examples until real photos exist; testimonials/FAQ still static |
| Become a Technician | `/become-a-technician` | **New** — real application form, `POST /v1/technician-applications` |
| About | `/about` | Static |
| Blog | `/blog` | Static (no CMS yet — see Phase 7) |
| Careers | `/careers` | Static |
| Contact | `/contact` | Contact form/details |
| Safety Standards | `/safety-standards` | Static content |
| Privacy / Terms | `/privacy`, `/terms` | Legal document viewer |

### Customer portal (`(portal)` route group — auth-enforced via middleware)
| Page | Route | Notes |
|---|---|---|
| Dashboard | `/dashboard` | `ActiveJobCardData` — real assigned booking, live status timeline with real per-stage timestamps from `BookingStatusEvent`, 20s polling; `PropertyInsightData` — real property health (honest "not yet assessed" state, no fake data); `MaintenanceHistory`/`Recommendations` still static |
| Bookings | `/bookings` | `BookingsTabs` — real Active/Completed/Invoices tabs, 20s polling; reschedule/cancel wired; invoice PDF download wired; per-completed-job review submission (`ReviewAction`) |
| Account | `/account` | `ProfileHero` (avatar/membership badge — static); `SavedProperties` — real properties (read-only, "Add New" disabled since properties are only created implicitly via booking); `PaymentMethods` — still static; `SettingsSidebar` — Documents/Support/Privacy/Admin links, working "Become a Technician" link (was dead) |
| Documents | `/account/documents` | **New** — real invoice PDF downloads + booking attachments |
| Support | `/support` | Real ticket submission (`SupportTicketPanel`) + list of past tickets, alongside the existing static topic cards/contact info |
| Notifications | (bell in portal header) | **New** — `NotificationBell`: unread badge, dropdown, mark read/all-read, 60s polling |
| Admin — Photos | `/admin/photos` | **New**, role-gated (`ADMIN`) — upload before/after job photos, feature/consent toggle |
| Admin — Assign | `/admin/assign` | **New**, role-gated (`ADMIN`) — assign a technician to a booking, shows technician ratings inline |
| Admin (legacy stub) | `/admin` | Still just a static "Restricted" placeholder — no real dashboard; `/admin/photos` and `/admin/assign` are separate pages, not linked from here yet |
| Technician | `/technician` | **New**, role-gated (`TECHNICIAN`) — today's assigned jobs, one-tap status updates (en route/arrived/completed), photo upload |

### Backend (`apps/api`)
- Hono server with ~30 routes (bookings, services, reviews, notifications, documents, properties,
  support tickets, technician applications, technician jobs, admin attachment/assignment endpoints,
  invoices, payments, Razorpay webhook)
- `packages/database`: Prisma schema, live Supabase Postgres, 10+ migrations applied incrementally
  (see `IMPLEMENTATION_PLAN.md` for the full history)
- Supabase Auth wired end-to-end: Next.js middleware protects `(portal)` routes (now including
  `/technician`) and refreshes sessions; Hono middleware verifies the Supabase JWT and upserts a
  `User` row on first sight, defaulting to `CUSTOMER`
- `/login` and `/signup` pages using `@supabase/ssr`; sign-out wired in `SettingsSidebar`
- `packages/storage`: **real** Google Cloud Storage-backed driver (private bucket, signed URLs
  generated on demand) — replaces the old in-memory placeholder
- `requireRole` middleware is now actually used — gates `ADMIN`-only attachment/assignment routes
  and `TECHNICIAN`-only job routes. **Caveat**: there is still no code path anywhere that can set a
  user's `role` to `ADMIN` or `TECHNICIAN` — that only happens via a direct database edit today (no
  admin app exists yet to do it through the product)
- Invoice PDFs are generated server-side via Puppeteer and stored through the GCS driver
- Razorpay checkout + a signature-verified webhook (idempotent) keep `Invoice.status` authoritative
  even if the client never confirms
- A single `notify()` service fans out to an in-app `Notification` row + email; wired into booking
  creation/reschedule/cancel, invoice paid, job status changes (including a `REVIEW_REQUESTED`
  prompt on completion), and support ticket creation

---

## 4. Data model (`packages/database/prisma/schema.prisma`, live on Supabase Postgres)

- **Identity**: `User` (`supabaseId` links to Supabase Auth; role: CUSTOMER/TECHNICIAN/ADMIN — only
  CUSTOMER is ever assigned automatically), `TechnicianProfile` (lazily auto-created for a
  TECHNICIAN-role user on first use)
- **Properties**: `Property` (multi-property per user, primary flag, geo lat/lng), `PropertyHealthMetric`
  (schema ready, always empty right now — nothing grades a property yet)
- **Catalog**: `ServiceCategory`, `Service` (real `averageRating`/`reviewCount` computed from `Review`,
  falling back to the seed `rating` until reviews exist)
- **Bookings**: `Booking`, `BookingAttachment` (`fileKey`, `photoType` BEFORE/AFTER, `featured`,
  `consentedAt` — added for the photo gallery), `BookingStatusEvent` (full status timeline with notes)
- **Billing**: `Invoice` (`pdfKey` — renamed from `pdfUrl`, stores a private storage key not a URL),
  `PaymentMethod`, `WebhookEvent` (idempotency ledger for the Razorpay webhook)
- **Property health**: `MaintenanceRecord`, `PropertyHealthMetric`
- **Support/content**: `SupportTicket` (now wired), `Testimonial` (curated marketing copy, separate
  from real reviews), `BlogPost`, `JobPosting` (unused — careers page is explicitly out of scope)
- **Reviews & notifications** (new since last update): `Review` (booking-verified, one per booking,
  `verified` always true since that's the only creation path), `Notification` (in-app notification
  center backing store)
- **Technician pipeline** (new since last update): `TechnicianApplication` (public submission,
  `PENDING`/`APPROVED`/`REJECTED`, no auto-approval)

---

## 5. Roadmap

### Phase 1 — Backend foundation — ✅ Done
- [x] Prisma schema modeling the full domain
- [x] Prisma client wired into `packages/database`
- [x] Provision Supabase Postgres and run first migration (and every migration since)
- [x] Wire Supabase Auth: Next.js middleware + Hono JWT verification middleware, `User` upsert on
      first login
- [x] Role-gating on real endpoints — `requireRole` now gates `ADMIN` (attachments, assignment) and
      `TECHNICIAN` (job status, own attachments) routes. Still no in-product way to grant either
      role; manual DB edit only.
- [x] Real `StorageDriver` implementation — Google Cloud Storage, private bucket + signed URLs,
      replacing the in-memory placeholder

### Phase 2 — Core read APIs — ✅ Done
- [x] `GET /v1/services` (+ categories, + real review aggregates) → powers `Marketplace`, `/services`
- [x] `GET /v1/properties` → powers `SavedProperties` (no `POST/PATCH/DELETE` — properties are only
      created implicitly via the booking flow; no dedicated property-management UI exists)
- [x] `GET /v1/properties/:id/health` → powers `PropertyInsight` (always empty today — no grading
      mechanism exists yet, honest empty state rather than fake data)
- [x] `GET /v1/invoices`, `GET /v1/invoices/:number/pdf` → powers `BookingsTabs` invoices tab +
      the new `/account/documents` download flow
- [ ] `GET/POST/DELETE /v1/payment-methods` → `PaymentMethods` is still fully static; not built

### Phase 3 — Booking flow end-to-end — ✅ Done
- [x] `POST /v1/bookings` (from `BookingForm`; attachment upload at booking-creation time was never
      built — file input in `BookingForm` is still decorative)
- [x] `GET /v1/bookings` (single endpoint, client splits active/completed — no separate `?status=`
      query param needed)
- [x] `PATCH /v1/bookings/:id` (reschedule/cancel, with status-gating and invoice voiding on cancel)
- [x] `POST /v1/bookings/:id/attachments` (built for the photo-gallery feature — `ADMIN`/`TECHNICIAN`
      only, not a general customer-facing attachment upload)
- [x] Booking status timeline events (`BookingStatusEvent`) drive `ActiveJobCard` with real
      per-stage timestamps, 20s polling
- [x] Notifications on status change — email + in-app via `notify()`; SMS/WhatsApp not built (a
      floating WhatsApp deep-link widget exists, but that's a static contact link, not a
      notification channel)

### Phase 4 — Technician-facing features — ✅ Done
- [x] Technician login/role, "my assigned jobs" view (`/technician`, role-gated)
- [x] Update job status (en route/arrived/completed) — drives customer-facing status text; no GPS/
      live location (needs technician mobile location reporting, not built)
- [x] "Become a Technician" application flow — real form + `POST /v1/technician-applications`,
      alerts the support inbox by email (no admin review UI — manual review only)
- [x] Technician assignment — minimal `ADMIN`-gated slice (`/admin/assign`,
      `PATCH /v1/admin/bookings/:id/assign`) since nothing else could ever assign a technician to
      a booking
- [x] Technician performance/ratings — `GET /v1/technicians/:id/rating`, aggregated from real
      reviews, shown inline in the assignment picker

### Phase 5 — Billing — ✅ Done
- [x] Razorpay integration for booking payments (checkout + client-side verify)
- [x] Invoice generation (PDF) on payment confirmation — server-side via Puppeteer, stored via the
      GCS driver, downloadable from `/account/documents`
- [x] Webhook handling for payment status (`POST /v1/payments/webhook`, signature-verified,
      idempotent) → keeps `Invoice.status` authoritative even if the client never calls back

### Phase 6 — Admin site — 🚧 Partially started (minimal slices only, not a real admin app)
Two role-gated pages exist inside the same Next.js app (`/admin/photos`, `/admin/assign`) — built
only as the minimum needed to unblock the photo-gallery and technician-assignment features. This is
**not** the admin site originally scoped here; that recommendation (a separate `apps/admin`) still
stands for when this phase is properly picked up.
- [ ] Staff-only auth/onboarding flow — `ADMIN`/`TECHNICIAN` roles still can't be granted through
      the product, only via direct DB edit. This is the biggest real gap left in the whole platform.
- [x] Bookings: assign technicians (`/admin/assign`) — no broader "view/filter all bookings, adjust
      status" board yet, just the assignment picker
- [ ] Technician management: onboard/approve applications (`TechnicianApplication` rows exist and
      alert by email, but nothing marks them approved/rejected or turns an application into a real
      `TECHNICIAN`-role account)
- [ ] Service catalog CRUD — services are still seeded directly in the DB
- [ ] Customer management: view accounts, properties, booking/invoice history
- [ ] Invoice/payment oversight: manual invoice adjustments, refund handling
- [x] Content management (partial): photo upload + featuring for the `/projects` gallery
      (`/admin/photos`) exists; blog posts, job postings, and testimonial curation are still
      unmanaged
- [ ] Basic analytics: bookings volume, revenue, technician utilization

### Phase 7 — Content & growth features — 🚧 Partially started
- [ ] Blog: real CMS-backed posts (model exists — `BlogPost`; still fully static, no admin UI to
      author posts since Phase 6's content management isn't built)
- [ ] Careers: real job postings + application intake — explicitly out of scope (excluded earlier
      in the process; the "Become a Technician" flow above covers technician recruitment
      specifically, not general job postings)
- [x] Reviews/testimonials: customer-submitted reviews tied to completed bookings — fully built
      (`Review` model, submission UI, real ratings surfaced on `/services/explore`)
- [ ] Referral program / loyalty — not modeled, not started
- [ ] Multi-language support — not started

---

## 6. Open decisions / assumptions to confirm

- **Payments**: confirmed — Razorpay is live (test keys), checkout + webhook both wired.
- **Notifications**: email + in-app are live. SMS/WhatsApp notification channels (as opposed to the
  static WhatsApp deep-link widget) are still not built — confirm if/when actually needed.
- **Technician app**: web-only, role-gated page inside the same Next.js app (`/technician`) — no
  separate mobile app was built, matching the "start small" framing from the original plan.
- **Admin site**: still an open decision. Two standalone role-gated pages exist
  (`/admin/photos`, `/admin/assign`) as minimal unblocks for specific features, not a real admin
  app. The recommendation to eventually build a **separate app** (`apps/admin`) once this phase is
  properly scoped still stands — the current pages are a stopgap, not a foundation to build on.
- **Biggest outstanding gap**: there is no way for anyone to become an `ADMIN` or `TECHNICIAN`
  through the product itself — every test of the admin/technician features in this project so far
  has required a direct database edit or a throwaway Supabase user created via the service-role
  key. Solving this (even a minimal "invite a staff member" flow) is a prerequisite for actually
  using any of Phase 4/6's role-gated features in production.
