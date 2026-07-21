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

### 0.3 Payment webhooks — ✅ Implemented
- `POST /v1/payments/webhook` (no bearer auth — authenticated by verifying Razorpay's signature instead, via a separate `RAZORPAY_WEBHOOK_SECRET` from the checkout HMAC secret). Reads the raw body text before any JSON parsing so the HMAC is computed over Razorpay's exact bytes.
- Idempotent via a new `WebhookEvent` model keyed on `` `${event}:${payment.id}` `` (unique constraint) — a duplicate delivery just returns `"already processed"` without reprocessing.
- `payment.captured` marks the invoice `PAID` + generates its PDF through a shared `markInvoicePaid()` (extracted out of `verifyPayment` in `payments.ts`) — idempotent regardless of whether the client's `/v1/payments/verify` call or this webhook lands first. `payment.failed` is logged only; invoice stays `PENDING` so the customer can retry checkout. Other event types are acknowledged and ignored.
- Verified against a real running server (`apps/api/scripts/test-payment-webhook.mjs`): missing/invalid signatures rejected with 400, `payment.captured` flips status + generates the PDF, a duplicate delivery is caught by the idempotency guard, `payment.failed` is a no-op on invoice state.
- **Still needed from you:** add the webhook in the Razorpay Dashboard (Settings → Webhooks) pointing at `<public-api-url>/v1/payments/webhook`, select `payment.captured` + `payment.failed`, and set the webhook secret there to match `RAZORPAY_WEBHOOK_SECRET` in `.env` (currently a locally-generated placeholder). Needs a public URL (deployed API, or an ngrok tunnel for testing) since Razorpay can't reach `localhost`.

### 0.4 Notification infrastructure — ✅ Implemented
- `notify(userId, type, { title, body, email? })` in `apps/api/src/lib/notifications.ts` — always writes a `Notification` row; if an `email` payload is passed, sends it via the existing `mailer.ts` (failure is caught/logged, never blocks the caller). SMS/WhatsApp not built — `notify()` is the extension point when that's wanted.
- `Notification` Prisma model (`id`, `userId`, `type` — plain `String`, not an enum, since new types will keep appearing every phase — `title`, `body`, `read`, `createdAt`), indexed on `userId` for Phase 2.2's notification center to query later.
- Wired call sites: `createBooking` (`bookings.ts`) now routes its confirmation through `notify()` instead of calling `sendMail` directly, so it also creates the in-app row; `markInvoicePaid` (`payments.ts`) notifies on `INVOICE_PAID`.
- **Not wired:** support-ticket-reply — that feature (Phase 2.5) doesn't exist yet. Wire `notify(userId, "SUPPORT_TICKET_REPLY", ...)` when building it.
- API exposure (`GET`/`PATCH /v1/notifications`) is intentionally **not** built here — that's Phase 2.2 (the bell/dropdown UI); this phase only lays the pipe.
- Verified via `apps/api/scripts/test-notifications.mjs`: real `createBooking()` call produces a `BOOKING_STATUS_CHANGED` row, a simulated `payment.captured` webhook produces an `INVOICE_PAID` row, invoice ends up `PAID`.

**Phase 0 effort:** M–L (storage + PDF + webhook + notification model). Do 0.1 and 0.4 first — they unblock the most downstream work.

---

## Phase 1 — Customer-facing quick wins

Lower effort, no new infra dependencies beyond Phase 0, high conversion/retention impact.

### 1.1 Booking modification (reschedule/cancel) — ✅ Implemented
- Turned out `ActiveJobCard`/`BookingsTabs` were fully hardcoded mockups with no bookings-list endpoint at all — scope expanded to include that plumbing, not just the PATCH.
- `GET /v1/bookings` (list, own bookings, includes service/property/invoice) and `PATCH /v1/bookings/:id` (`{ action: 'reschedule' | 'cancel', newDate?, reason? }`) in `apps/api`.
- Status gating in `modifyBooking()` (`bookings.ts`): cancellable = `REQUESTED`/`CONFIRMED`/`ASSIGNED`/`EN_ROUTE`; reschedulable = `REQUESTED`/`CONFIRMED`/`ASSIGNED` (not `EN_ROUTE` — technician already dispatched, cancel-and-rebook instead). Cancelling voids a `PENDING` invoice (no refund flow yet, so a `PAID` invoice is left for Phase 4's admin tooling). Both write a `BookingStatusEvent` and notify via 0.4.
- UI: `BookingsTabs`' active/completed tabs now fetch real data instead of hardcoded cards; the previously-dead "Reschedule" button is wired to an inline `datetime-local` form, a new "Cancel" action added the same way (inline reason field) — no modal component exists in `@repo/ui` so this stays inline rather than introducing new modal infra. Client shows whatever error the server returns rather than duplicating the status-gating rules (though buttons are hidden client-side too, for UX, when an action clearly wouldn't apply).
- `ActiveJobCard` now takes an optional real `Booking` prop (empty state when there's none) instead of a hardcoded "Marcus Chen" mockup — the fake technician-contact block was dropped since no real technician-contact data exists yet (Phase 3). A small `bookingStatus.ts` util was extracted since the status→label/step mapping is now shared between `ActiveJobCard` and `BookingsTabs`. Dashboard page uses a new `ActiveJobCardData` client wrapper that fetches bookings and picks the most relevant one.
- Verified: `apps/api/scripts/test-booking-modify.mjs` (reschedule/cancel/invoice-void/re-cancel-rejection, direct library calls) and a real HTTP round trip against the running server using an actual Supabase-issued session token for a seeded test account (list, reject-reschedule-while-EN_ROUTE, reschedule-while-CONFIRMED all confirmed). Could not visually drive the browser UI itself — no browser-automation tool was available this session — so the actual rendered pages are unverified by me; see the note below.

### 1.2 Live/verified review submission — ✅ Implemented
- Went with a separate `Review` model rather than extending `Testimonial` — `Testimonial` is unrelated curated marketing copy (`clientName` free text, no user/booking link); `Review` has `bookingId` (unique — one per booking), `userId`, `serviceId` (denormalized from the booking), `rating` (1–5 int), `body`, `verified` (always `true`, since the only creation path requires a `COMPLETED` booking — no unverified path exists), `createdAt`.
- `POST /v1/reviews` (auth): booking must belong to the user and be `COMPLETED`; one review per booking enforced via a DB-level unique constraint on `bookingId`.
- `GET /v1/reviews?serviceId=` (public): list + computed average/count — no denormalized counter to keep in sync.
- `GET /v1/services` extended to include `reviewCount`/`averageRating` per service (via a single `groupBy` query), falling back to the curated seed `Service.rating` until a service has real reviews.
- **Not wired:** the "prompt on COMPLETED" notification — nothing in the codebase transitions a booking to `COMPLETED` yet (that's Phase 3.2's technician status-update endpoint). Whoever builds that should add `notify(userId, "REVIEW_REQUESTED", ...)` there.
- Frontend scope turned out bigger than the plan implied — `/services/explore`'s `Marketplace.tsx` was **fully static/hardcoded** with zero connection to `Service`/`Review` data (its `rating` field wasn't even the real DB column), and the homepage has **no testimonials section at all** (the one on `/projects` is unrelated hardcoded decoration, left untouched). Converted `Marketplace.tsx` to fetch real `GET /v1/services`, with a graceful icon-placeholder fallback for services with no `imageUrl` (none are seeded with one yet).
- `BookingsTabs`' completed tab gets a new `ReviewAction` component: star picker + body textarea inline, or a read-only "Your review ★★★★★" display once submitted.
- Verified: `apps/api/scripts/test-reviews.mjs` (gating, verified flag, duplicate rejection, aggregate math, direct library calls) plus a real HTTP round trip against the running server with an actual Supabase session token (create → 201, duplicate → 400, public list reflects it). Browser UI itself not visually verified by me — no browser-automation tool available this session.

### 1.3 Service area check — ✅ Implemented
- Client-side only, no API endpoint — `apps/web/src/lib/serviceAreas.ts` is a plain constant list (4 cities + response-time label); a `GET /v1/service-areas` wrapping the same static array would've added nothing over what `BookingForm`'s city list already did as a constant.
- Found and fixed a real data bug while wiring this: `ServiceZoneMap.tsx` (on `/book`) listed `["Bhubaneswar", "Cuttack", "Puri", "Khordha"]` — inconsistent with `BookingForm.tsx`'s `[..., "Rourkela", "Other"]`, and Khordha is the *district containing* Bhubaneswar, not a separate service city. Both now consume the same `SERVICE_AREA_CITIES` source.
- New `ServiceAreaCheck` component: a select (not free-text — only 4 real cities, no fuzzy-matching needed) with an instant result via `@repo/ui`'s `Badge` — covered shows the response-time label + a "Book Now" CTA; not-yet-covered still invites booking anyway ("we're expanding") rather than hard-blocking the lead, per the plan's "reduce bounce" framing.
- Placed on the homepage (right after `Hero`, before `TrustIndicators` — an early qualifying step) and on `/book` (between `BookingHero` and the form grid, as an explicit pre-form gate).
- Verified: `pnpm exec tsc --noEmit` and `eslint` clean; a full production build (`next build`) succeeds across all 23 routes including `/book` and `/services/explore`; confirmed the widget's copy actually renders via `curl` against the live dev server (homepage is public/unauthenticated, so this exercised real SSR, not just a type-check).

### 1.4 Instant estimate calculator — ✅ Implemented
- Client-side only, no backend — `EstimateCalculator.tsx` fetches the real `GET /v1/services` list (same pattern as `Marketplace`/`BookingForm`) and multiplies `service.priceAmount` by static size (0.8/1.0/1.5×) and severity (0.9/1.0/1.35×) multipliers, showing an instant ±15% range as the selections change (no submit step). Clearly labeled "starting-from estimate, not a final quote."
- Placed on `/services/explore` between `ExploreHero` and `Marketplace` — a lead-in gate before browsing the full pricing table.
- `POST /v1/estimates` (persisting submissions as leads) intentionally not built — explicitly a "later, if wanted" per the plan, not v1.
- Verified: `tsc`/`eslint` clean, full `next build` succeeds, live SSR render confirmed via `curl` against the running dev server, and the multiplier math sanity-checked against a real seeded service (₹18,000 base → large+severe range ₹30,983–₹41,918, correctly above the base price).

### 1.5 WhatsApp / live chat widget — ✅ Implemented
- Floating `WhatsAppWidget` linking to `https://wa.me/<number>?text=<prefilled message>`, mounted in both `(marketing)/layout.tsx` and `(portal)/layout.tsx` (positioned above `MobileBottomNav` on mobile). No backend, no new dependency.
- Number/message logic extracted into `lib/whatsapp.ts` (`getWhatsAppUrl()`) — found and fixed **two other spots that needed the same fix**: `MobileBottomNav`'s "WhatsApp" nav item was a dead/mislabeled link pointing at `/contact` (which has no WhatsApp functionality at all), and `ContactDetails.tsx` had the number hardcoded a second time. All three now read from one source.
- Uses the site's existing `secondary` accent token rather than WhatsApp's brand green — the codebase doesn't use raw brand hex colors anywhere, and `ContactDetails.tsx` already treated WhatsApp as a `secondary`-accented item.
- In-app live chat (real-time, needs a chat provider or WebSocket infra) intentionally not built — explicitly a bigger, separate decision per the plan, not v1.
- Verified: `tsc`/`eslint` clean, full `next build` succeeds across all 23 routes, and the rendered deep link confirmed correct via `curl` against the live dev server (`wa.me/919437000000?text=...`, properly URL-encoded).

**Phase 1 effort:** S–M per item; can be built in parallel by different people since they touch mostly-disjoint files.

---

## Phase 2 — Portal depth

Builds on Phase 0 infra (storage, PDFs, notifications).

### 2.1 Real-time job tracking — ✅ Implemented
- `listBookings()` (`GET /v1/bookings`) extended to include `statusEvents` (status/note/createdAt, ascending) — went with extending the existing booking-fetch endpoint rather than a new `GET /v1/bookings/:id/status`, avoiding an extra round trip.
- `ActiveJobCard` now shows a real timestamp per stage (earliest event that reached that step) instead of a done/current-only progress bar with no times.
- Polling (20s) added to both `ActiveJobCardData` and `BookingsTabs`' bookings fetch — this is the actual "real-time" part; until now both only fetched once on mount. No WebSockets, matching the plan's stated preference.
- Technician GPS/ETA intentionally not built — needs Phase 3.2 technician location reporting, which doesn't exist.
- Verified: direct library test (create → reschedule → confirms 2 ascending `REQUESTED`-status events with the reschedule note captured) plus a real HTTP round trip against the running server showing actual event timelines for seeded bookings (including a double-`CONFIRMED` timeline from an earlier reschedule test). `tsc`/`eslint` clean (one pre-existing lint error in `BookingsTabs`'s invoices effect, confirmed via `git show HEAD` to predate this change), full `next build` succeeds across all 24 routes.

### 2.2 Notifications center (UI) — ✅ Implemented
- Backend: `GET /v1/notifications` (`{ notifications, unreadCount }`, most recent 50), `PATCH /v1/notifications/:id/read`, `PATCH /v1/notifications/read-all` (a "mark all as read" bulk action — not in the plan verbatim, but near-free to add alongside the single-mark endpoint and standard for any bell dropdown).
- `NotificationBell` component: bell icon + unread-count badge in the portal header only (marketing visitors aren't logged in), dropdown listing notifications with per-type icons and relative timestamps, click-to-mark-read, "mark all read", empty state, light 60s poll while mounted.
- Wired into `Header.tsx` via a new `showNotifications` prop, set only from `(portal)/layout.tsx` — the marketing `Header` usage is untouched.
- Verified: direct library smoke test (gating, cross-user rejection, count math) plus a real HTTP round trip against the running server with the seeded test account's actual session (list → mark one read → mark-all-read → unread count correctly zero). `tsc`/`eslint` clean, full `next build` succeeds across all 23 routes.

### 2.3 Document vault — ✅ Implemented
- `GET /v1/documents` (`apps/api/src/lib/documents.ts`) aggregates `PAID` invoices (with booking code/amount/dates) and `BookingAttachment` rows for the current user. Attachments come back as an empty array for now — nothing populates that table yet (photo gallery is Phase 2.6, technician uploads are Phase 3.2) — the response shape is just ready for whenever that lands.
- New `/account/documents` page (`DocumentsList` component), linked from `SettingsSidebar`. This turned out to be **the first real UI wiring of invoice PDF downloads anywhere in the app** — 0.2 built `GET /v1/invoices/:number/pdf` but nothing in the frontend had ever called it. Clicking "Download PDF" fetches the signed URL and opens it via `window.open()` (not `window.location.href` — that trips the `react-hooks/immutability` lint rule as an external mutation).
- Verified: direct library smoke test (empty state, PAID-only filtering, attachment inclusion) plus a full real HTTP round trip against the running server — list documents → fetch signed PDF URL → download it → confirmed genuine `%PDF-` bytes. `tsc`/`eslint` clean, full `next build` succeeds across all 24 routes (new `/account/documents` route included).

### 2.4 Multi-property health dashboard — ✅ Implemented
- `GET /v1/properties` (list, primary first) and `GET /v1/properties/:id/health` (ownership-checked) in `apps/api/src/lib/properties.ts`. `PropertyHealthMetric` has **zero rows anywhere** — nothing grades a property yet (that's an admin/technician flow, Phase 3/4 territory) — so this always returns an empty array for now; no fake data was fabricated to fill the gap.
- Turned out `SavedProperties` (`/account`) was just as fully hardcoded as `PropertyInsight` (fake addresses, dead "Details"/"Add New" buttons) — scope expanded to wire both, not just the dashboard ring, since 2.4 is fundamentally about real multiple properties.
- `PropertyInsight` (presentational, split from data-fetching like the `ActiveJobCard`/`ActiveJobCardData` pattern from 1.1) now shows an honest "Not yet assessed" state per system instead of a fake green ring when no `PropertyHealthMetric` rows exist. New `PropertyInsightData` wrapper fetches properties + health and renders a selector once a user has more than one property. `SavedProperties` now lists real properties (read-only — "Add New" is disabled since properties are currently only created implicitly via the booking flow, no dedicated creation form exists).
- Verified: direct library smoke test (list ordering, cross-user rejection, empty-then-populated health metrics) plus a real HTTP round trip against the running server with the seeded test account (real property returned, health correctly empty). `tsc`/`eslint` clean, full `next build` succeeds across all 24 routes.

### 2.5 Support ticket flow — ✅ Implemented
- `POST /v1/support-tickets`, `GET /v1/support-tickets` (own tickets). On creation: `notify()`s the customer (confirmation, in-app + email) and separately emails the real support inbox directly — no admin app exists yet, so that email is the only way a human currently learns a ticket exists. No threaded reply UI built (matches the plan — email-based replies for now, not a full thread).
- Support inbox address is now `SUPPORT_INBOX_EMAIL`-overridable (defaults to `solutions@aiasengineering.com`) — added after an early smoke test sent two real test emails to that real inbox; the override currently sits in `.env` pointed at a test address per an explicit ask, and **must be removed/repointed at the real inbox before any real customer-facing use**, or new-ticket alerts won't reach staff.
- New `SupportTicketPanel` on `/support`: submission form (topic + message) plus a list of the user's past/open tickets with status badges. Left the existing topic cards and phone/email contact block above it untouched.
- Verified: direct library smoke test (creation, notification fan-out, list ordering) plus a real HTTP round trip against the running server (create → 201 → appears first in the list) — using the safe test-inbox override, not the real one. `tsc`/`eslint` clean, full `next build` succeeds across all 24 routes.

### 2.6 Before/after photo gallery per job — ✅ Implemented
- Confirmed before building: no technician app (Phase 3), no admin app (Phase 4), and **no code path anywhere could ever set a user's role to `ADMIN`** — not even the seed script. Went with the "short term: let admin/staff upload manually" option from the plan, built as a minimal slice: `POST /v1/bookings/:id/attachments` gated by `requireRole(ADMIN)` (that middleware existed since early on but was never used until now), a bare `/admin/photos` page (role-checked client-side, shows the same "Restricted" message as `/admin` if not ADMIN), and `GET /v1/admin/bookings` for the booking picker.
- Renamed `BookingAttachment.fileUrl` → `fileKey` (same reasoning as `Invoice.pdfKey` in 0.2 — it's a private GCS storage key, not a URL; safe rename since the table was still empty). Added `photoType` (`BEFORE`/`AFTER`), `featured`, `consentedAt`.
- `featured` can only actually be `true` when consent was given — enforced server-side in `uploadBookingAttachment()`, not just as a UI gate, since this determines public visibility.
- `GET /v1/projects/gallery` (public) pairs up featured+consented `BEFORE`/`AFTER` photos per booking with fresh signed URLs (1hr TTL) generated on each request — a booking needs *both* photos featured to qualify, since the slider UI needs both. `ProjectGallery.tsx` (previously 100% hardcoded marketing content) now fetches this and **falls back to the existing hardcoded examples if the real gallery is empty**, so the page never looks broken while nothing's been featured yet.
- Verified: direct library smoke test (consent-gates-featured enforcement, complete-pair-required exclusion of solo photos, admin listing) plus a full real HTTP round trip — created a dedicated throwaway ADMIN test user (didn't touch the shared customer test account's role), uploaded a real before/after pair to real GCS storage, confirmed the public unauthenticated gallery endpoint returned the pair with real signed URLs, confirmed a non-admin gets 403, then cleaned up all test data including the underlying GCS objects (caught and fixed one real cleanup miss — the first pass deleted the DB rows but left two orphaned test images in the bucket). `tsc`/`eslint` clean, full `next build` succeeds across all 25 routes.

**Phase 2 effort:** M overall; 2.2 is small, 2.4/2.5 are medium (new CRUD surfaces), 2.6 depends on Phase 3 for full value.

---

## Phase 3 — Technician / field operations

### 3.1 "Become a Technician" application flow — ✅ Implemented
- New `TechnicianApplication` model (name, email, phone, city, experience, certifications, availability, status defaulting `PENDING` — no auto-approval). `POST /v1/technician-applications` — fully public, no auth, since prospective technicians aren't necessarily existing customers.
- Alerts the support inbox by email on submission (same pattern as 2.5's support tickets) — still the only way a human learns about a new application until an admin app exists.
- New public page `/become-a-technician` with the application form. Fixed the dead "Become a Technician" button in `SettingsSidebar` (`/account`) — it had no `onClick` at all — to link there.
- Verified: direct library smoke test (creation, persistence) plus a real HTTP round trip against the running server (`POST /v1/technician-applications` with no auth token → 201), using the safe test-inbox override from 2.5, not the real support address. `tsc`/`eslint` clean, full `next build` succeeds across all 26 routes.

### 3.2 Technician mobile-first view — ✅ Implemented
- Same dead-end as `ADMIN` before 2.6: nothing anywhere could assign a technician to a booking, so the job list would've been permanently empty. Built the same size minimal unblock: `PATCH /v1/admin/bookings/:id/assign` (ADMIN-gated) + `GET /v1/admin/technicians` (picker list), plus a bare `/admin/assign` page.
- `TechnicianProfile` is lazily auto-created for a `TECHNICIAN`-role user on first use (`getOrCreateTechnicianProfile`) — same pattern as customer auto-provisioning on login, since nothing else creates one.
- `GET /v1/technician/jobs` (own assigned bookings), `PATCH /v1/technician/jobs/:id/status` (`en_route`→`EN_ROUTE`, `arrived`→`IN_PROGRESS`, `completed`→`COMPLETED`, optional note stored on the existing `BookingStatusEvent`). Completing a job finally gives a real trigger for the "rate your service" notification flagged as unbuildable back in 1.2 — added a `REVIEW_REQUESTED` notification type for it.
- Extended the 2.6 attachment-upload endpoint to also accept `TECHNICIAN` (their own assigned bookings only, ownership-checked) — but a technician's `featured`/`consent` input is always forced to `false`/ignored server-side regardless of what's sent; only `ADMIN` via `/admin/photos` can actually feature/publish a photo publicly.
- New `/technician` page: job cards with one-tap status-advance buttons, an optional note field, and inline photo upload — kept in the same Next.js app behind role checks (client-side, matching `/admin/photos`), not a separate app, per the plan.
- Found and fixed a real gap while verifying: `/technician` was missing from the auth middleware's `PROTECTED_PREFIXES` (unlike `/admin`, `/account`, etc.) — anonymous visitors got a client-side "Restricted" screen instead of the usual redirect to `/login`. Not a security hole (all data still required a verified bearer token), but inconsistent; fixed.
- Verified: direct library smoke test (full lifecycle assign→en_route→arrived→completed, cross-technician isolation, idempotent profile creation) plus a full real HTTP round trip with three dedicated throwaway users (ADMIN/TECHNICIAN/CUSTOMER, all cleaned up afterward including Supabase auth users and the uploaded GCS object) — confirmed a technician's attempt to set `featured=true` is correctly ignored server-side, and non-admins get 403 from the assign endpoint. `tsc`/`eslint` clean, full `next build` succeeds across all 28 routes.

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
