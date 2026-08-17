# Feature Ideas — Seepage Doctor

Based on a full survey of the codebase (marketing site, customer portal, API, and data model) as of 2026-07-20. Existing work is already tracked in `PROJECT_PLAN.md` (bookings, invoices, Razorpay payments, portal dashboard). This file lists **additional features not yet planned there**, organized by priority/impact.

---

## 1. Trust & Conversion (marketing site)

<!-- - **Warranty tracker** — the brand's core promise is 5–15 year warranties, but nothing in the data model or UI tracks warranty start/end dates per booking. Add a `Warranty` model tied to `Booking`/`Service`, show expiry countdown in the customer portal, and auto-remind customers before expiry (upsell re-inspection). -->
- **Live/verified review submission** — `Testimonial` is currently seeded/static. Let customers leave a rating + review after a booking is marked `COMPLETED`, gate it to verified bookings only, and surface an aggregate rating on `/services/explore` and the homepage.
- **Before/after photo gallery per job** — the portal already collects booking attachments; extend this so technicians can upload "after" photos, and (with customer consent) feed strong ones into the public `/projects` gallery.
- **Instant estimate calculator** — a simple form on `/services/explore` (property size, leak severity, service type) that returns a rough price range before requiring a full booking — reduces bounce from anxious first-time visitors.
- **Live chat / WhatsApp widget** — WhatsApp/SMS/call links already appear in the UI but are unwired; a real chat widget (even a simple "click to WhatsApp" deep link with prefilled message) would convert faster than the booking form for urgent leaks.
- **Referral / loyalty program** — not modeled at all today. A simple "refer a friend, get X% off next service" would suit a repeat-service business like this.
- **Service area check** — a postcode/address lookup that confirms coverage (Bhubaneswar/Cuttack/Puri/Rourkela) before a user fills out the full booking form.

## 2. Customer Portal

- **Booking modification** — no reschedule or cancel endpoint exists once a booking is created. Add `PATCH /v1/bookings/:id` for reschedule/cancel with reason capture.
- **Real-time job tracking** — `ActiveJobCard` shows a status timeline but it's static; wiring `BookingStatusEvent` to a live feed (polling or WebSocket) with technician GPS/ETA would match the "live tracking" feel implied by the design.
- **Notifications center** — in-app + email/SMS notifications on status changes (assigned, en route, completed, invoice ready, warranty expiring). No notification system exists beyond the one booking-confirmation email.
- **Document vault** — a single place in `/account` to download all invoices, warranty certificates, and inspection reports (PDF), instead of just the invoice list in `/bookings`.
- **Multi-property health dashboard** — `PropertyHealthMetric` model exists but has no API/UI beyond a mock ring; build it out so property managers (a named target persona) can track multiple properties at a glance.
- **Support ticket flow** — `SupportTicket` model exists unused; `/support` is currently just static cards. Wire an actual ticket creation + status-tracking flow.

## 3. Technician / Field Operations

- **Technician mobile-first view** — "my assigned jobs today," navigation link, one-tap status updates (en route → arrived → completed), and photo/notes upload from the field.
- **"Become a Technician" application flow** — the CTA already exists in `SettingsSidebar` but goes nowhere; build the actual application form + review pipeline.
- **Technician performance/ratings** — tie completed-job reviews to individual technicians, feed into assignment logic (best-fit technician for a job type/location).

## 4. Admin / Staff Operations

*(No admin app exists yet — this is a bigger, later-phase item, but worth listing as a feature category.)*

- Booking assignment board (drag jobs to technicians, view by day/technician/status)
- Customer management (search, history, notes)
- Service catalog CRUD (currently services are presumably seeded directly in the DB)
- Invoice/refund oversight and manual invoice adjustments
- Content management for blog/careers/testimonials (models exist, no CMS UI)
- Basic analytics: bookings per week, revenue, average job value, conversion funnel from quote → booking → paid

## 5. Content & Growth

- **Real blog** — `BlogPost` model exists but `/blog` is a static placeholder. SEO-driven articles ("how to spot early signs of seepage") would drive organic traffic given the diagnostic-first positioning.
<!-- - **Careers page with real listings** — `JobPosting` model exists, `/careers` is static. Wire listing + application intake (could double as the technician-application flow above). -->
- **Multi-language support (i18n)** — relevant given the Odisha-region target cities; Odia/Hindi alongside English could widen reach.
- **FAQ/knowledge base search** — `/projects` already has an FAQ section; a searchable knowledge base would help both SEO and support deflection.

## 6. Platform / Infrastructure (enables several features above)

- **Real file storage backend** — `packages/storage` is in-memory only; booking photo uploads and generated invoice/warranty PDFs need S3/R2 (or Supabase Storage) to actually persist.
- **Invoice/report PDF generation** — invoices exist as DB records only; no PDF is generated today.
- **Payment webhooks** — Razorpay verification is currently client-side signature check only; a server-side webhook would catch payment status changes even if the client never calls back (e.g., user closes tab mid-payment).
- **Search** — no search exists anywhere (services, blog, or portal history). Even a simple filter/search on `/services/explore` and `/bookings` would help as content grows.
- **Analytics/telemetry** — no product analytics anywhere (page views, funnel drop-off, booking conversion rate) — useful for prioritizing future work.

---

### Suggested next step
If useful, I can turn any one of these into a proper implementation plan (data model changes, API routes, UI) — the warranty tracker, review submission flow, and booking reschedule/cancel are probably the highest-impact, lowest-effort wins given what's already built.
