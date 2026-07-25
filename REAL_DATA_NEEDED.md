# Real Data Needed Before Go-Live

Inventory of every placeholder / mock / test value in the codebase that must be replaced with real business data before launch.

## 1. Company Info (contact details, service area)

| File | Current (placeholder) | Needed |
|---|---|---|
| `apps/web/src/components/Footer.tsx` | Name "Seepage Leakage All Solutions", "© 2024" | Real legal business name; dynamic/current year |
| `apps/web/src/components/Header.tsx` | Hardcoded brand text logo | Real brand name / logo image |
| `apps/web/src/components/book/ContactDetails.tsx` | Phone `+91 674 230 4500`, WhatsApp `+91 94370 00000`, email `solutions@aiasengineering.com`, address "Infocity Road, Patia, Bhubaneswar, Odisha 751024" | Real phone, WhatsApp, email, HQ address |
| `apps/web/src/lib/whatsapp.ts` | `WHATSAPP_NUMBER = "919437000000"` | Real WhatsApp business number |
| `apps/web/src/lib/serviceAreas.ts` | Cities: Bhubaneswar, Cuttack, Puri, Rourkela + made-up response times | Real serviceable cities + real SLAs |
| `apps/web/src/components/book/ServiceZoneMap.tsx` | "Covering 50km radius" | Real coverage radius |
| `packages/database/prisma/seed.ts` | Pincodes 751001/751024/753001/752001/769001 | Real serviceable pincodes |
| privacy/terms pages | Same contact info repeated; no business hours or social links exist anywhere | Confirm contact info; add hours/social if wanted |

## 2. Images (all currently Google-Stitch AI placeholder URLs — `lh3.googleusercontent.com/aida-public/...`)

- `apps/web/src/components/about/OurStory.tsx` — office/team photo
- `apps/web/src/components/book/ServiceZoneMap.tsx` — fake "map" image (not a real map)
- `apps/web/src/app/(marketing)/blog/page.tsx` — 4 blog post images
- `apps/web/src/components/projects/Testimonials.tsx` — 4 customer avatars
- `apps/web/src/components/projects/FaqAndInsights.tsx` — 2 images
- `apps/web/src/components/projects/ProjectGallery.tsx` — fallback before/after project photos
- `home/CoreSolutions.tsx`, `services/AdvancedEquipment.tsx`, `VisibleResults.tsx`, `account/ProfileHero.tsx`, `book/BookingHero.tsx` — more of the same

**Every one of these needs real, owned photography** (team, office, completed jobs, customers) before launch.

## 3. Sample / Fabricated Content

| File | What's fake |
|---|---|
| `packages/database/prisma/seed.ts` | Full service catalog + ₹ pricing — this is what populates the live Services page and pricing, not just test data |
| `apps/web/src/app/(marketing)/careers/page.tsx` | 3 hardcoded job listings — need real current openings |
| `apps/web/src/components/projects/Testimonials.tsx` | 4 made-up customers/quotes, "4.9/5", "Trusted by 5000+ Clients" | Real reviews + verified numbers |
| `apps/web/src/components/home/TrustIndicators.tsx` | "10+ Years", "5000+ Repairs" — unverifiable stats | Real, defensible numbers |
| `apps/web/src/app/(marketing)/blog/page.tsx` | 4 fake blog posts, no CMS | Real content or CMS wiring |
| `apps/web/src/app/(marketing)/safety-standards/page.tsx` | Claims "ISO 9001 Certified" with no cert number | Real certificate or remove the claim (false certification risk) |
| `apps/web/src/components/about/OurStory.tsx` | Fabricated founding story ("started 2008...") | Real company history |
| `about/page.tsx` | "Engineering Trust Since 2008" | Confirm real founding year |

No team bios section exists at all — only generic testimonials/values.

## 4. Payment / Infra Credentials (currently committed to `.env` / `.env.example`)

| Variable | File | Status |
|---|---|---|
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `apps/web/.env` | Live **test-mode** key committed to repo — rotate before/after go-live |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | `apps/web/.env` | Real-looking project ref + JWT committed to git — verify whether this repo path is gitignored; rotate if exposed |
| `DATABASE_URL` | `apps/api/.env.example`, `packages/database/.env` | Placeholder Postgres URL |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | `apps/api/.env.example` | Placeholders |
| `SMTP_HOST/PORT/USER/PASS`, `MAIL_FROM` | `apps/api/.env.example` | Placeholders (`smtp.example.com`) |
| `RAZORPAY_KEY_ID/KEY_SECRET/WEBHOOK_SECRET` | `apps/api/.env.example` | Placeholders |
| `GCS_PROJECT_ID/BUCKET_NAME/CREDENTIALS_JSON` | `apps/api/.env.example` | Placeholders (photo/document storage) |
| `SUPPORT_INBOX_EMAIL` | `apps/api/.env.example` | Defaults to fake email |
| `NEXT_PUBLIC_API_URL` | `.env` | `http://localhost:4000` |
| Canonical domain | `layout.tsx`, `docs/flow/page.tsx` | `buildMetadata("https://example.com", ...)` — needs real production domain |

No Maps API key or analytics ID (GA/GTM) exists anywhere — add if a live map or analytics is wanted.

## 5. Legal / Compliance

- No plumbing/contractor license number displayed anywhere.
- No insurance policy number/carrier displayed anywhere.
- No GSTIN displayed, despite Terms mentioning GST.
- "ISO 9001 Certified" claim on safety-standards page has no backing certificate.
- Privacy/Terms reference "payment processor" and "email service" generically — should name Razorpay explicitly and get a legal review pass.

## Highest-Priority Before Go-Live

1. Replace all placeholder images sitewide (photos of the real team, office, completed jobs).
2. Replace hardcoded phone/WhatsApp/email/address across Footer, ContactDetails, whatsapp.ts, privacy/terms.
3. Replace fabricated testimonials, trust stats, and the unsubstantiated ISO 9001 claim.
4. Replace `prisma/seed.ts` with the real service catalog, pricing, and service-area pincodes.
5. Rotate Razorpay/Supabase keys currently committed in `apps/web/.env`; fill in real prod credentials in `apps/api`.
6. Fix `example.com` canonical domain to the real production domain.
7. Add real GSTIN/license/insurance info referenced by legal pages but never shown.
8. Replace careers page listings with real current openings.
