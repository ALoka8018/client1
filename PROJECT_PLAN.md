# Seepage Leakage All Solutions — Project Plan & Feature Roadmap

_Last updated: 2026-07-17_

This document tracks what the platform currently does, what's built vs. stubbed, and the
roadmap for new features (backend, customer portal, and the future admin site). Update this
file whenever scope changes — it's the single source of truth for "what exists" vs. "what's next."

---

## 1. What this project is

Seepage Leakage All Solutions is a plumbing / leak-detection / waterproofing / structural-inspection
service company platform (India — Bhubaneswar, Cuttack, Puri, Rourkela). It has:

- A **marketing site** to attract customers and explain services
- A **customer portal** to book services, track jobs, and manage account/billing
- An **admin site** (not yet built — staff-only, planned for later)

## 2. Repo structure

```
apps/
  web/            Next.js 15 app (App Router) — marketing site + customer portal
  api/            Hono API server (currently just a /health endpoint)
packages/
  database/       Prisma schema + client (Postgres) — DONE (this session)
  types/          Shared TS types (ID, Timestamped)
  validation/     Shared Zod schemas
  ui/             Shared UI primitives (Button, Card, Badge, Input, cn)
  storage/        File storage abstraction (currently in-memory placeholder)
  logger/         Shared logger
  seo/            SEO helpers
  utils/          Misc shared utils
  config/         Shared tsconfig base
stitch_advanced_leak_detection_portal/   Design prototypes (Stitch/Figma exports) — reference only
```

Stack: pnpm + Turborepo monorepo, Next.js + Tailwind (Material Symbols icons, Montserrat/Inter
fonts, "glassmorphism" design system — see `structural_integrity/DESIGN.md` for full tokens),
Hono API, Prisma + PostgreSQL (Supabase), Supabase Auth for auth.

---

## 3. Current features (frontend built, backend not yet wired)

Everything below exists as **UI only** right now — static/mock data, no live API calls, no auth
enforcement. Wiring these to real data is the immediate backend priority (see Section 5).

### Marketing site (public)
| Page | Route | Notes |
|---|---|---|
| Home | `/` | Hero, core solutions, trust indicators, inspection process, "visible results", emergency banner |
| Services | `/services` | Service grid overview |
| Explore Services | `/services/explore` | `Marketplace` component — filterable service listings (leakage/waterproofing/inspection/plumbing), pricing, "Book Now" / "Get Quote" / "Inquire" CTAs |
| Book | `/book` | `BookingForm` — name, phone, property type, city, date, problem description, file upload (site images), service-zone map |
| Projects | `/projects` | Before/after slider, testimonials, FAQ & insights |
| About | `/about` | Our story, values grid |
| Blog | `/blog` | Static for now |
| Careers | `/careers` | Static for now |
| Contact | `/contact` | Contact form/details |
| Safety Standards | `/safety-standards` | Static content |
| Privacy / Terms | `/privacy`, `/terms` | Legal document viewer |

### Customer portal (`(portal)` route group — needs auth)
| Page | Route | Notes |
|---|---|---|
| Dashboard | `/dashboard` | `ActiveJobCard` (live job status timeline: Requested → Assigned → En Route → Completion, technician info, call button), `PropertyInsight` (health % ring + per-system status), `MaintenanceHistory` (past services table), `QuickActions`, `Recommendations` |
| Bookings | `/bookings` | `BookingsTabs` — Active / Completed / Invoices tabs; active jobs show technician card + tracking; invoices table with PDF download |
| Account | `/account` | `ProfileHero` (avatar, membership badge), `SavedProperties` (multi-property support, primary flag), `PaymentMethods` (cards, default flag), `SettingsSidebar` (support/privacy/admin links, "Become a Technician" CTA, sign out) |
| Support | `/support` | Static topic cards (bookings, invoices, warranty) + contact info |
| Admin | `/admin` | **Stub only** — "Restricted" placeholder page |

### Backend (`apps/api`)
- Hono server: `GET /health`, `GET /v1/me` (auth-protected)
- `packages/database`: Prisma schema modeling the full domain (see Section 4) — migrated to a live
  Supabase Postgres database
- Supabase Auth wired end-to-end: Next.js middleware (`apps/web/src/middleware.ts`) protects
  `(portal)` routes and refreshes sessions; Hono middleware (`apps/api/src/middleware/auth.ts`)
  verifies the Supabase JWT via `supabase.auth.getUser()` and upserts a `User` row (matched on
  `User.supabaseId`) on first sight, defaulting to the `CUSTOMER` role
- `/login` and `/signup` pages (`apps/web/src/app/(auth)`) using `@supabase/ssr` browser client;
  sign-out wired in `SettingsSidebar`
- `packages/storage`: in-memory placeholder `StorageDriver` interface (put/get/delete) — needs a
  real S3/R2-backed implementation
- No role-gating middleware wired into routes yet beyond the `requireRole` helper (unused so far)

---

## 4. Data model (already designed in `packages/database/prisma/schema.prisma`)

Implemented so far as Prisma models (not yet migrated to a live DB):

- **Identity**: `User` (`supabaseId` links to Supabase Auth's `auth.users.id`; role:
  CUSTOMER/TECHNICIAN/ADMIN), `TechnicianProfile`
- **Properties**: `Property` (multi-property per user, primary flag, geo lat/lng)
- **Catalog**: `ServiceCategory`, `Service`
- **Bookings**: `Booking`, `BookingAttachment`, `BookingStatusEvent` (status timeline)
- **Billing**: `Invoice`, `PaymentMethod`
- **Property health**: `MaintenanceRecord`, `PropertyHealthMetric`
- **Support/content**: `SupportTicket`, `Testimonial`, `BlogPost`, `JobPosting`

---

## 5. Roadmap

### Phase 1 — Backend foundation (in progress)
- [x] Prisma schema modeling the full domain
- [x] Prisma client wired into `packages/database`
- [x] Provision Supabase Postgres and run first migration
- [x] Wire Supabase Auth: Next.js middleware (protects `(portal)` routes) + Hono JWT verification
      middleware in `apps/api`, `User` upsert on first login (role defaults to `CUSTOMER`,
      stored in our own `User.role` column rather than Clerk-style external metadata)
- [ ] Role-gating on real endpoints (the `requireRole` helper exists but nothing uses it yet —
      needed once `ADMIN`/`TECHNICIAN`-only routes are built)
- [ ] Real `StorageDriver` implementation (Cloudflare R2 or S3) for booking image uploads and
      invoice PDFs, replacing the in-memory placeholder

### Phase 2 — Core read APIs (unblock static-looking pages)
- [ ] `GET /v1/services` (+ categories) → powers `Marketplace`, `/services`
- [ ] `GET /v1/properties`, `POST/PATCH/DELETE` → powers `SavedProperties`
- [ ] `GET /v1/properties/:id/health`, `GET /v1/properties/:id/maintenance` → powers
      `PropertyInsight`, `MaintenanceHistory`
- [ ] `GET /v1/invoices` → powers `BookingsTabs` invoices tab
- [ ] `GET/POST/DELETE /v1/payment-methods` → powers `PaymentMethods`

### Phase 3 — Booking flow end-to-end
- [ ] `POST /v1/bookings` (from `BookingForm`, with attachment upload)
- [ ] `GET /v1/bookings?status=` (active/completed split for `BookingsTabs`)
- [ ] `GET /v1/bookings/:id`, `PATCH /v1/bookings/:id` (reschedule/cancel)
- [ ] `POST /v1/bookings/:id/attachments`
- [ ] Booking status timeline events → drives `ActiveJobCard` progress steps live
- [ ] Notifications on status change (email at minimum; SMS/WhatsApp stretch goal — contact
      surfaces already show WhatsApp/SMS/call links)

### Phase 4 — Technician-facing features (net new — no UI yet)
- [ ] Technician login/role, "my assigned jobs" view
- [ ] Update job status + location (drives customer-facing ETA/tracking)
- [ ] "Become a Technician" application flow (CTA already exists in `SettingsSidebar`, unwired)

### Phase 5 — Billing
- [ ] Payment gateway integration (Razorpay — assumption based on ₹ pricing; confirm) for
      booking deposits/full payment
- [ ] Invoice generation (PDF) on job completion, linked to `MaintenanceRecord`
- [ ] Webhook handling for payment status → `Invoice.status`

### Phase 6 — Admin site (planned, build later)
Not started. When picked up, scope will include at minimum:
- [ ] Staff-only auth (`ADMIN` role via Supabase Auth), replacing the current `/admin` "Restricted" stub
- [ ] Bookings management: view/filter all bookings, assign technicians, override status
- [ ] Technician management: onboard/approve applications, manage profiles/active flag
- [ ] Service catalog CRUD (categories, pricing, active/inactive)
- [ ] Customer management: view accounts, properties, booking/invoice history
- [ ] Invoice/payment oversight: manual invoice adjustments, refund handling
- [ ] Content management: blog posts, job postings (careers), testimonials/case studies
- [ ] Basic analytics: bookings volume, revenue, technician utilization

### Phase 7 — Content & growth features (not yet designed)
- [ ] Blog: real CMS-backed posts (model already exists — `BlogPost`)
- [ ] Careers: real job postings + application intake (model exists — `JobPosting`)
- [ ] Reviews/testimonials: customer-submitted reviews tied to completed bookings
- [ ] Referral program / loyalty (not modeled yet — future consideration)
- [ ] Multi-language support (if expanding beyond current Odisha cities)

---

## 6. Open decisions / assumptions to confirm

- **Payments**: assumed Razorpay given ₹ pricing — confirm before building Phase 5
- **Notifications**: which channels are must-have at launch (email vs. SMS vs. WhatsApp)
- **Technician app**: web-only for now, or does the technician role need a dedicated
  mobile-friendly flow sooner than Phase 4 suggests?
- **Admin site**: separate app (`apps/admin`) vs. a role-gated section inside `apps/web` —
  recommend a **separate app** once scoped, to keep staff tooling isolated from the customer
  bundle and allow different auth/session rules
