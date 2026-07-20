# Implementation Plan — Selected Features

Scope: every feature left un-commented in `FEATURE_IDEAS.md` (warranty tracker and real careers listings are excluded per your edit). Phased by dependency, not by category — infrastructure that other features rely on comes first so later phases aren't rebuilt twice.

Stack reminders used throughout: Next.js App Router (`apps/web`), Hono API (`apps/api`), Prisma/Postgres (`packages/database`), Supabase Auth, Razorpay, Zod (`packages/validation`).

---

## Phase 0 — Foundation (unlocks everything else)

These have no direct user-facing value on their own but are required by multiple later features. Build first.

### 0.1 Real file storage backend — ✅ Implemented
- Replaced the in-memory-only `StorageDriver` in `packages/storage` with a real Google Cloud Storage implementation (`GcsStorage`), selected at runtime via `createStorageDriver()` (falls back to in-memory when GCS env vars aren't set — local dev/tests).
- Interface: `upload(key, data, opts)`, `getUrl(key, opts)` (private objects, signed URLs, 15 min default TTL), `delete(key)`.
- Verified with a live round-trip against the real bucket (`apps/api/scripts/test-storage.mjs`).
- Needed by: before/after photo gallery, document vault, technician job photos, blog images, **0.2 invoice PDFs**.

### 0.2 Invoice/report PDF generation — ✅ Implemented
- Server-side only: `apps/api/src/lib/invoice-pdf.ts` renders an HTML invoice (inline CSS, no external assets) and prints it to PDF via headless Puppeteer, triggered from `verifyPayment()` right after an `Invoice` flips to `PAID`. A PDF generation failure is caught/logged and never fails the payment confirmation itself.
- Stored via 0.1's `createStorageDriver()` under `invoices/{number}.pdf`; the invoice row keeps the storage **key** (`Invoice.pdfKey`, renamed from `pdfUrl` via migration), never a URL, since GCS objects are private and any stored URL would expire.
- Fetch-by-number: `GET /v1/invoices/:number/pdf` (auth'd, owner or ADMIN) looks up the invoice, lazily generates the PDF if missing (self-healing if generation failed earlier), and returns a fresh 5-minute signed URL (`{ url, expiresAt }`) with `Content-Disposition: attachment`. The client fetches this JSON with its bearer token, then navigates to `url` — a plain `<a href>` can't be used since auth is header-based, not cookie-based.
- Verified end-to-end against the real GCS bucket (`apps/api/scripts/test-invoice-pdf.mjs`): generate → upload → signed-download → valid `%PDF-` bytes → delete.
- Needed by: document vault, bookings invoice download (already referenced in UI but not backed).

### 0.3 Payment webhooks
- Add `POST /v1/payments/webhook` in `apps/api` verifying Razorpay's webhook signature (separate secret from checkout HMAC).
- On `payment.captured`/`payment.failed` events, update `Invoice.status` server-side — makes payment state authoritative even if the client never calls `/v1/payments/verify` (tab closed, network drop).
- Idempotent by Razorpay event ID to avoid double-processing.

### 0.4 Notification infrastructure
- A single internal `notify(userId, type, payload)` service in `apps/api` that fans out to whatever channels are configured (email now via existing `mailer.ts`; SMS/WhatsApp later — stub the interface, don't build SMS yet unless you want it now).
- Add a `Notification` Prisma model (id, userId, type, title, body, read, createdAt) so the in-app notification center (Phase 2) has something to read from.
- Call sites to wire immediately: booking status change, invoice paid, support ticket reply.

**Phase 0 effort:** M–L (storage + PDF + webhook + notification model). Do 0.1 and 0.4 first — they unblock the most downstream work.

---

## Phase 1 — Customer-facing quick wins

Lower effort, no new infra dependencies beyond Phase 0, high conversion/retention impact.

### 1.1 Booking modification (reschedule/cancel)
- `PATCH /v1/bookings/:id` — body: `{ action: 'reschedule' | 'cancel', newDate?, reason? }`.
- Validate booking is in a cancellable/reschedulable status (e.g. not already `COMPLETED`); write a `BookingStatusEvent` row for the change; trigger 0.4 notification.
- UI: add reschedule/cancel actions to `ActiveJobCard` and `BookingsTabs`.

### 1.2 Live/verified review submission
- Extend `Testimonial` (or add a `Review` model if you want reviews separate from curated testimonials) with `bookingId`, `rating`, `body`, `customerId`, `verified` (true only if tied to a `COMPLETED` booking).
- `POST /v1/reviews` (auth, must own the referenced booking, booking must be `COMPLETED`, one review per booking).
- Public: `GET /v1/reviews?serviceId=` for `/services/explore`; aggregate rating displayed there and on homepage.
- Prompt for a review from the portal once a booking flips to `COMPLETED` (ties into 0.4 notification → "rate your service" CTA).

### 1.3 Service area check
- No new backend needed if the four service cities are a static list — a simple client-side/API lookup (`GET /v1/service-areas?city=`) returning coverage + estimated response time.
- Surface it as a small widget on `/` and before the `/book` form to filter out out-of-area leads early.

### 1.4 Instant estimate calculator
- Client-side only to start: a form (property size, severity, service type) mapped to a static pricing table already implicit in `/services/explore`'s listed prices. No backend required for v1 — just clear that estimates are "starting from" ranges, not quotes.
- If you want it dynamic/logged later, add `POST /v1/estimates` to persist submissions as leads.

### 1.5 WhatsApp / live chat widget
- Simplest version: a floating button linking to `https://wa.me/<number>?text=<prefilled message>` — no backend, no new dependency. Ship this first.
- If a true in-app chat is wanted later, that's a much bigger scope (needs a chat provider or custom WebSocket infra) — treat as a separate, later decision, not bundled here.

**Phase 1 effort:** S–M per item; can be built in parallel by different people since they touch mostly-disjoint files.

---

## Phase 2 — Portal depth

Builds on Phase 0 infra (storage, PDFs, notifications).

### 2.1 Real-time job tracking
- Wire `ActiveJobCard` to actual `BookingStatusEvent` records instead of static timeline data: `GET /v1/bookings/:id/status` (or extend existing booking-fetch endpoint to include events).
- Start with polling (e.g. every 15–30s) rather than WebSockets — much less infra, acceptable UX for a service with hour-scale status changes, not sub-second ones.
- Technician GPS/ETA is a bigger lift (needs technician mobile location reporting from Phase 3) — sequence after 3.2 if you want live location, not just status text.

### 2.2 Notifications center (UI)
- A bell icon + dropdown/page in the portal reading from the `Notification` model (0.4), `PATCH /v1/notifications/:id/read`.
- This is the UI half of 0.4 — 0.4 without this is invisible to users, so don't let it lag far behind.

### 2.3 Document vault
- A single `/account/documents` (or a tab) listing invoices (PDF via 0.2) — warranty certificates are out of scope since that feature was cut, so this is just invoices + any inspection-report attachments already on the booking.
- Backend: `GET /v1/documents` aggregating invoice PDFs + booking attachments for the current user.

### 2.4 Multi-property health dashboard
- `PropertyHealthMetric` already exists in the schema with no API. Add `GET /v1/properties/:id/health` and `GET /v1/properties` (list all of a user's properties) — needed since `/account` already shows `SavedProperties` but portal dashboard health ring is currently mock data for one property only.
- UI: extend `PropertyInsight` to accept a property selector once a user has more than one.

### 2.5 Support ticket flow
- `SupportTicket` model exists, unused. `POST /v1/support-tickets`, `GET /v1/support-tickets` (own tickets + status), and a basic reply mechanism (could just be email-based replies logged manually at first if you don't want a full threaded UI yet).
- Replace the static cards on `/support` with an actual "submit a ticket" form + a list of the user's open/past tickets.

### 2.6 Before/after photo gallery per job
- Needs 0.1 (storage). Add an "after photos" upload step for technicians (ties to Phase 3 technician view) or, short term, let admin/staff upload manually until a technician app exists.
- Add a `featured: boolean` flag on attachments so staff can opt specific photos into the public `/projects` gallery; requires customer consent — add a simple consent checkbox at upload time tied to the booking.

**Phase 2 effort:** M overall; 2.2 is small, 2.4/2.5 are medium (new CRUD surfaces), 2.6 depends on Phase 3 for full value.

---

## Phase 3 — Technician / field operations

### 3.1 "Become a Technician" application flow
- Lowest-effort item in this phase and unblocks nothing else, so do it first if you want a quick technician-pipeline win.
- `POST /v1/technician-applications` (public or lightly authed), simple form (experience, city, certifications, availability). Store in a new `TechnicianApplication` model; no auto-approval — reviewed manually until an admin app exists.

### 3.2 Technician mobile-first view
- Requires the `TECHNICIAN` role (already in `UserRole` enum) to actually be assignable — first wire `requireRole` (already written in `apps/api/src/middleware/auth.ts`, currently unused) onto new technician-only routes.
- `GET /v1/technician/jobs` (today's assigned bookings), `PATCH /v1/technician/jobs/:id/status` (en route/arrived/completed), photo/notes upload reusing 0.1.
- UI: a lightweight mobile-first route, e.g. `/technician` — could live in the same Next.js app behind role-based middleware rather than a separate app, since scope is small to start.

### 3.3 Technician performance/ratings
- Once 1.2 (reviews) exist and bookings have an assigned technician, this is mostly a query: aggregate average rating per technician from reviews on their completed bookings.
- `GET /v1/technicians/:id/rating` for internal use in assignment logic later (Phase 4 admin can use this when manually assigning jobs).

**Phase 3 effort:** M; 3.2 is the biggest piece since it's the first real technician-facing surface.

---

## Phase 4 — Admin / staff operations

No admin app exists yet. Per `PROJECT_PLAN.md`'s own open question, recommend a **separate app** (`apps/admin`) rather than a role-gated section of the customer-facing Next.js app — keeps staff tooling from bloating the customer bundle and simplifies auth/role assumptions.

Build order within this phase (each depends on the last existing):
1. **Auth + shell** — Supabase auth reused, `requireRole('ADMIN')` on all admin API routes, basic layout/nav.
2. **Booking assignment board** — list bookings by status, assign/reassign technician (uses 3.3 ratings to inform choice), day/technician calendar view.
3. **Customer management** — search/list users, booking history per customer, notes field.
4. **Service catalog CRUD** — `POST/PATCH/DELETE /v1/admin/services` — services are currently seeded directly in the DB with no management UI.
5. **Invoice/refund oversight** — view all invoices, manually adjust/void, trigger refunds via Razorpay refund API.
6. **Content management** — CRUD for `BlogPost` (feeds Phase 5 blog) and `Testimonial` curation (which reviews from 1.2 get featured).
7. **Basic analytics** — bookings/week, revenue, avg job value, quote→booking→paid funnel. Start as SQL queries + simple charts; don't build a full BI tool.

**Phase 4 effort:** L — this is the largest single phase; consider scoping an MVP (steps 1–2 only) before committing to the full set.

---

## Phase 5 — Content & growth

### 5.1 Real blog
- `BlogPost` model exists; `/blog` is currently static. Build `GET /v1/blog` (public, published posts) and wire the existing page to real data. Authoring happens via Phase 4.6 admin CMS — don't build a separate authoring UI before the admin app exists.

### 5.2 Search
- Start narrow: filter/search on `/services/explore` (already has category filters — extend to free-text search over title/description) and on `/bookings` (search past bookings by date/service).
- Postgres full-text search (`tsvector`) is sufficient at this scale — no need for Elasticsearch/Algolia.

### 5.3 FAQ / knowledge base search
- Depends on 5.2's search approach. If FAQ content stays small (current `/projects` FAQ section), a simple client-side filter is enough; only build server-side search if content grows substantially.

### 5.4 Referral / loyalty program
- New models: `ReferralCode` (per user), `Referral` (referrer, referee, status, reward-applied). Reward mechanism ties into Razorpay checkout as a discount applied at invoice creation.
- Simplest v1: referral code field at signup + a flat discount on the referee's first invoice, credited back to the referrer's next invoice — avoid building a points/tiers system until there's usage data to justify it.

### 5.5 Multi-language support (i18n)
- Next.js App Router i18n routing (`next-intl` or built-in) for Odia/Hindi/English. This is a cross-cutting effort touching every page's copy, not a bolt-on — scope it as its own project once the above features stabilize, since adding i18n after new pages are built is cheaper than translating and then adding more pages.

### 5.6 Analytics/telemetry
- Product analytics (page views, funnel drop-off) — a lightweight tool (e.g. Plausible/PostHog) dropped into `apps/web`, distinct from Phase 4's business-metrics dashboard (that one's about bookings/revenue; this one's about site behavior).

**Phase 5 effort:** varies widely — 5.1/5.2 are M, 5.4 is M, 5.5 is L and best done last.

---

## Suggested sequencing summary

| Phase | Theme | Relative effort | Blocks |
|---|---|---|---|
| 0 | Storage, PDFs, webhooks, notifications | M–L | Nearly everything else |
| 1 | Reschedule/cancel, reviews, area check, estimate calc, WhatsApp | S–M | Phase 3.3 (ratings) needs 1.2 |
| 2 | Real-time tracking, notification UI, documents, property health, support tickets, photo gallery | M | Phase 3 for full photo-gallery value |
| 3 | Technician application, mobile view, ratings | M | Phase 4 assignment uses 3.3 |
| 4 | Admin app | L | Phase 5.1 (blog authoring) |
| 5 | Blog, search, referrals, i18n, analytics | S–L | — |

Recommended starting point given effort vs. impact: **Phase 0.1 + 0.4, then Phase 1 in full** — gets you real storage/notifications plus five customer-facing wins before touching the larger admin/technician builds.
