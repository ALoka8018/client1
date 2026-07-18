# Product

## Register

brand

## Platform

web

## Users

Two audiences in roughly equal weight, both landing on the same marketing surface: homeowners dealing with an active leak, damp wall, or seepage problem right now — anxious, want fast reassurance and a clear next step — and property managers / commercial clients evaluating a vendor for ongoing maintenance, who read more analytically and care about credentials and track record. The customer portal ((portal) routes: dashboard, bookings, account) serves existing customers of either type post-booking, tracking jobs and managing properties/invoices — that surface should be read against **product**-register conventions per task, even though the site's default register below is brand.

## Product Purpose

Seepage Leakage All Solutions is a plumbing / leak-detection / waterproofing / structural-inspection service company (India — Bhubaneswar, Cuttack, Puri, Rourkela). The marketing site exists to convert both anxious homeowners and considered commercial buyers into booked diagnostic visits; the portal exists to give booked customers visibility into job status, property health, and billing without needing to call in.

## Positioning

We diagnose the actual root cause with instrumentation (thermal imaging, acoustic sensors, moisture mapping, borescope inspection) before any repair — a non-destructive, engineering-led alternative to the cement-patch-and-hope approach of generic local plumbers and waterproofers.

## Conversion & proof

- Primary and secondary CTA: **Book a Survey** (schedule a diagnostic visit) is primary; **Explore Services** (browse the service catalog before committing) is the fallback for visitors not ready to book.
- The line a visitor remembers after 10 seconds: *"They find the real cause before they touch a wall."*
- Belief ladder: sees diagnostic technology in use (sensors, imaging, reporting) → sees certified engineers/materials scientists behind the work, not handymen → sees before/after proof and warranty terms → believes a permanent, root-cause fix is actually possible here → books a survey.
- Proof on hand: none supplied yet — testimonials, case studies, or client logos should be added under `.impeccable/assets/proof/` when available; until then, lean on the founding story (`OurStory.tsx`) and written-warranty terms (5–15 years, per `terms/page.tsx`) as the standing proof points.

## Brand Personality

Technical and trustworthy first — precision-engineering, diagnostics, certified expertise — with enough warmth that an anxious homeowner mid-leak doesn't feel talked down to. Confident and calm, never alarmist or hard-sell; the site earns trust by showing its diagnostic process, not by claiming expertise in adjectives.

## Anti-references

Should not read as a generic AI-generated SaaS template: no gradient text, no tiny uppercase tracked eyebrows stacked above every section, no identical icon-plus-heading card grids repeated down the page, no hero-metric clichés. Should also avoid the opposite failure mode — a cheap local-contractor site with stock photography and cluttered layout — the existing dark-blue/orange Material-derived palette and Montserrat/Inter type system already move away from both; extend that direction rather than defaulting back to generic patterns.

## Design Principles

- **Show the diagnostic, don't just claim it** — thermal/acoustic/moisture instrumentation and the inspection process are the actual sales pitch; keep them visible and concrete rather than summarized as a feature bullet.
- **Root-cause language over feature lists** — copy should talk about causes, diagnosis, and permanence, not generic service-menu framing.
- **Proof at the decision point** — warranty terms, credentials, and before/after evidence should sit near CTAs, not buried on a separate page.
- **Calm confidence, not urgency-pressure** — the audience is already anxious about an active leak; the site should reassure through clarity and process, not through scarcity or hard-sell tactics.
- **One system, two speeds** — marketing pages read as brand (persuasive, editorial); portal pages read as product (efficient, task-first) — don't let portal screens inherit marketing-page flourish, and don't let marketing pages flatten into portal-style utility.

## Accessibility & Inclusion

Standard WCAG AA: body text ≥4.5:1 contrast, large text ≥3:1, keyboard navigable, alt text on all imagery, and a `prefers-reduced-motion` alternative for every animation.
