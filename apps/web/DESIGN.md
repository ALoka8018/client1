---
name: Seepage Doctor
description: Diagnostic-first leak-detection and structural-inspection service platform
colors:
  deep-violet: "#240046"
  deep-violet-container: "#3c096c"
  deep-violet-fixed: "#ecdcfa"
  ignition-orange: "#b34a00"
  ignition-orange-container: "#ff6d00"
  ignition-orange-fixed: "#ffe0c2"
  amber-badge: "#8a5700"
  amber-badge-container: "#ff9e00"
  badge-accent: "#ff7900"
  charcoal: "#222222"
  body-on-dark: "#e0e0e0"
  alert-red: "#ba1a1a"
  alert-red-container: "#ffdad6"
  surface: "#f8f9fa"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f2f3f5"
  surface-container: "#eceef0"
  surface-container-high: "#e6e7ea"
  surface-container-highest: "#e0e1e5"
  ink: "#222222"
  ink-variant: "#434652"
  outline: "#747783"
  outline-variant: "#c4c6d3"
typography:
  brand:
    fontFamily: "Sonsie One, cursive"
    fontSize: "13px mobile -> 24px desktop"
    fontWeight: 400
    lineHeight: 1.15
    usage: "Logo wordmark only. The face is unusually wide, so the wordmark drops to its own 13px step below md to stay inside the 64px header bar."
  h1:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "42px-56px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    color: "White (#ffffff) or Bright Gold (#ff9e00) over Deep Purple backgrounds"
  h2:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "32px-40px"
    fontWeight: 700
    lineHeight: 1.2
    color: "Deep Violet (#240046) on light backgrounds"
  h3:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "20px-24px"
    fontWeight: 600
    lineHeight: 1.3
    color: "Deep Purple (#3c096c) or White depending on card background"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
    color: "Charcoal (#222222) on light canvas, #e0e0e0 on dark sections"
  body-lg:
    fontFamily: "Inter, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
  cta:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontWeight: "600-700"
    fontSize: "16px"
    transform: "uppercase"
    color: "Dark Purple (#240046) text on Vibrant Orange (#ff6d00) background"
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "12px-14px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.05em"
    transform: "uppercase"
    color: "Vibrant Orange (#ff7900) on soft purple background pill"
rounded:
  sm: "0.25rem"
  md: "0.5rem"
  lg: "0.75rem"
  xl: "1rem"
  2xl: "1.5rem"
  full: "9999px"
spacing:
  gutter: "24px"
  margin-mobile: "16px"
  section-mobile: "64px"
  section-desktop: "120px"
components:
  button-primary:
    backgroundColor: "{colors.deep-violet}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "44px"
  button-accent:
    backgroundColor: "{colors.ignition-orange-container}"
    textColor: "#240046"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "44px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.deep-violet}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "44px"
  card-elevated:
    backgroundColor: "{colors.surface-container-lowest}"
    rounded: "{rounded.2xl}"
    padding: "24px"
  input-field:
    backgroundColor: "{colors.surface-container-lowest}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
---

# Design System: Seepage Doctor

## 1. Overview

**Creative North Star: "The Certified Inspector"**

This system reads as the visual identity of a credentialed inspector's toolkit, not a mass-market plumber's flyer. Deep Violet carries institutional authority — the color of a report cover, a uniform, a stamped credential — while Ignition Orange is spent sparingly, reserved for the one thing on screen that actually needs a visitor's attention: the primary CTA. Badge Accent orange on a soft violet pill is a distinct, separately-scoped highlight color used only for badges/micro-copy, so it never competes with the CTA for attention. Plus Jakarta Sans's geometric, extra-bold headlines give big titles ("30-Min Pipeline Scanning & Seepage Resolution") a sharp, modern tech edge against the dark violet backgrounds; Inter carries the body copy with the plainness of a technical write-up rather than marketing copy. Shadows are never pure black — they're tinted with the primary violet (`rgb(36 0 70 / …)`), so even elevation feels like it belongs to this specific system rather than a generic UI kit.

This system explicitly rejects the generic AI-SaaS template: no gradient text, no tiny uppercase tracked eyebrows repeated above every section, no identical icon-plus-heading card grids marching down the page, no hero-metric clichés (big number, small label, gradient accent). It equally rejects the cheap-local-contractor aesthetic — no stock plumber photography, no garish saturated colors, no cluttered WordPress-template density.

**Key Characteristics:**
- Violet-dominant, orange-rare — the accent's scarcity is what makes it legible as "pay attention here"
- Violet-tinted shadows, never neutral-gray or pure-black elevation
- Plus Jakarta Sans display type (extra-bold) for a sharp modern-tech edge, Inter body type for plain-spoken clarity
- Pill-shaped accent CTAs vs. rounded-rectangle primary/outline buttons — shape itself signals hierarchy
- Glass (blurred, semi-transparent) surfaces reserved for floating chrome — sticky nav, overlays — never for static content cards

## 2. Colors

The palette is Restrained-to-Committed: deep violet is the dominant surface/authority color, orange is a true CTA accent kept under roughly 10% of any given screen, and amber is a separately-scoped badge/highlight tone that never doubles as a button fill.

### Primary
- **Deep Violet** (#240046): The system's authority color. Navbar/header background, hero background start, primary buttons, section headlines, active nav state, primary icon fills.
- **Deep Violet Container** (#3c096c): Hero gradient end. Also the dark fill for Service Cards that use the solid-dark card treatment, and lifted-violet containers that need to read as "primary but softer" (primary-tinted badges, hover states).
- **Deep Violet Fixed** (#ecdcfa): Pale violet-tinted background for primary-colored badges/pills on light surfaces.

### Secondary (CTA)
- **Ignition Orange** (#b34a00): The alert/flag color — text-on-orange, error-adjacent emphasis. Used at low frequency by design.
- **Ignition Orange Container** (#ff6d00): The primary-button/CTA fill ("Book Now", "Book a Survey") — the single most saturated interactive color in the system, reserved for the one primary action per view. Text on this fill is Deep Violet (#240046) for contrast; white is an acceptable alternate per brand guidance.
- **Ignition Orange Fixed** (#ffe0c2): Pale orange tint for accent-adjacent soft highlight chips.

### Tertiary (Badge / Highlight)
- **Amber Badge** (#8a5700) / **Amber Badge Container** (#ff9e00): Legacy highlight pair, still available as the "Bright Gold" alternate H1 color over Deep Purple hero backgrounds.
- **Badge Accent** (#ff7900): The current badge/micro-copy text color — e.g. "30-Min Diagnosis", "Non-Destructive" — set on a soft Deep Violet Fixed (#ecdcfa) pill background. Deliberately distinct from Ignition Orange Container so a badge never reads as a second competing CTA on the same screen.

### Neutral
- **Surface** (#f8f9fa): Page/body background — the surface long-form body copy sits on. Never put body text on Deep Violet or Deep Violet Container.
- **Surface Container Lowest** (#ffffff): Pure white for elevated cards and inputs sitting on top of the surface.
- **Surface Container / Container High / Container Highest** (#eceef0 → #e0e1e5): Ascending tonal steps for nested containers, hover backgrounds, and disabled/inactive icon chips.
- **Ink / Charcoal** (#222222): Primary body text on light surfaces.
- **Ink Variant** (#434652): Secondary/supporting text — captions, metadata, de-emphasized labels.
- **Body on Dark** (#e0e0e0): Body copy color when it must sit on a Deep Violet / Deep Violet Container section (e.g. hero lead paragraphs) — headings stay white, body text uses this softer off-white instead.
- **Outline / Outline Variant** (#747783 / #c4c6d3): Borders, dividers, and outline-button strokes. Also used for the light-card Service Card border treatment (paired with a Deep Violet border tint for stronger emphasis).

### Named Rules
**The Signal Scarcity Rule.** Ignition Orange Container (#ff6d00) fills no more than one interactive element per view — the single primary action. If two elements both reach for orange, one of them is wrong; demote it to outline, ghost, or the Amber Badge tone if it's actually a highlight, not an action.

**The Badge-Is-Not-a-Button Rule.** Badge Accent (#ff7900) on a soft violet pill is reserved for badges/micro-copy and never used as a button fill — keeping it distinct from Ignition Orange Container is what lets a page have one CTA and several highlights without them competing.

**The Tinted Shadow Rule.** Every shadow carries the primary violet hue (`rgb(36 0 70 / opacity)`), never a neutral or pure-black shadow. A gray drop-shadow on this system reads as an off-brand import.

## 3. Typography

**Brand Font:** Sonsie One, cursive (single weight, 400) — logo wordmark only.
**Heading Font:** Plus Jakarta Sans, sans-serif — H1, H2, H3, and CTA button labels.
**Body Font:** Inter, sans-serif — paragraphs, labels, badge micro-copy.

**Character:** Sonsie One is scoped to exactly one place — the header/footer logo wordmark — giving the brand a distinct signature mark without turning every heading into a script font. Every actual heading, including the hero H1, runs on Plus Jakarta Sans: its geometric, extra-bold weight gives big titles ("30-Min Pipeline Scanning & Seepage Resolution") a sharp, modern-tech edge against the dark violet hero backgrounds. Inter's plain, highly legible forms — designed specifically for modern web interfaces — carry body copy and technical detail lists with high readability on mobile.

### Hierarchy
- **Brand** (400, Sonsie One): Logo wordmark only (header, footer) — never used for any heading tier.
- **H1 / Hero Main Title** (800, 42px mobile → 56px desktop, 1.1 line-height, -0.02em tracking): The one Display-tier headline per page ("30-Min Pipeline Scanning & Seepage Resolution"). White text by default over Deep Violet/Deep Violet Container hero backgrounds; Bright Gold (#ff9e00) is an acceptable alternate for extra emphasis.
- **H2 / Section Titles** (700, 32px mobile → 40px desktop, 1.2 line-height): Deep Violet (#240046) text on light backgrounds ("Our Advanced Diagnostic Services").
- **H3 / Card & Feature Headings** (600, 20px–24px, 1.3 line-height): Deep Violet Container (#3c096c) on light card backgrounds, or white when the card itself is solid-dark ("Drain Endoscopy (Camera Inspection)").
- **Body Large** (400, 18px, 1.6 line-height): Lead paragraphs under hero headlines; cap prose at 65–75ch.
- **Body** (400, 16px, 1.6 line-height): Default UI and paragraph text — Charcoal (#222222) on light canvas, Body on Dark (#e0e0e0) on dark sections.
- **CTA Button Label** (600–700, Plus Jakarta Sans, uppercase, 16px): "Call Now", "Book Inspection" — Deep Violet (#240046) text on Vibrant Orange (#ff6d00) fill.
- **Label / Badge Micro-Copy** (600, Inter, uppercase, 12px–14px, 0.05em tracking): "30-Min Diagnosis", "Non-Destructive" — Badge Accent orange (#ff7900) text on a soft Deep Violet Fixed pill background.

### Named Rules
**The One Eyebrow Exception Rule.** Uppercase tracked labels (Label style, 0.05em tracking) are reserved for functional UI (badges, nav, buttons) — never stacked decoratively above every marketing-page section heading as a rhythm device. If it isn't a badge, a nav item, or a button, it doesn't get uppercase-tracked treatment.

**The One Signature Font Rule.** Sonsie One renders in exactly one place sitewide (the logo). Every heading — including the hero H1 — is Plus Jakarta Sans; don't reach for the brand font to "spice up" any other heading tier.

## 4. Elevation

The system uses tonal layering as the default (surface-container steps for nested content) with a small, deliberate shadow vocabulary for genuinely floating elements — shadows are structural signals of "this is lifted off the page," not ambient decoration applied everywhere.

### Shadow Vocabulary
- **Level 1** (`box-shadow: 0 4px 20px 0 rgb(36 0 70 / 0.06)`): Default elevated card shadow — subtle, close, barely-there lift for standard content cards.
- **Level 2** (`box-shadow: 0 8px 30px 0 rgb(36 0 70 / 0.12)`): Reserved for genuinely prominent floating elements — modals, prominent hover states.
- **Glass** (`backdrop-filter: blur(20px)` + inset white ring + Level 1 shadow): The sticky header and floating overlay chrome only — never applied to static content cards.

### Named Rules
**The Floating-Chrome-Only Rule.** Glass/blur treatment is reserved for elements that float over scrolling content (sticky nav, overlays). A static card using glass instead of a flat Level-1 shadow is a misuse of the pattern.

## 5. Components

Buttons feel confident and rectilinear for primary/outline actions, but shift to a pill shape specifically for the one accent CTA — shape difference reinforces color scarcity as a hierarchy signal. Cards are flat-to-softly-lifted, never glassy. Inputs are plain and legible, with a deliberate two-stage focus ring rather than a glow effect.

### Buttons
- **Shape:** Rounded-rectangle (0.5rem / 8px radius) by default; fully pill-shaped (`rounded-full`) only for the `accent` variant.
- **Type:** All buttons run Plus Jakarta Sans, bold, uppercase, tracked wide — buttons are the one other place (besides the logo) with a distinct typographic identity from body copy.
- **Primary:** Deep Violet fill (#240046), white text, Level-1 shadow, `hover:brightness-110`.
- **Accent (the single CTA):** Ignition Orange Container fill (#ff6d00), Deep Violet text (#240046) for contrast, pill shape, Level-1 shadow, `hover:brightness-95`. This is the only button variant that should appear once per view.
- **Outline / Outline-inverse:** Transparent fill, 1px outline-color border, text in primary (or white on dark backgrounds); hover fills with a low-opacity surface-container tint.
- **Ghost:** No border, no fill; text-primary with a low-opacity hover background. Used for tertiary/dismissive actions (Sign Out, secondary nav).

### Badges
- **Accent badge:** Deep Violet Fixed (#ecdcfa) soft-purple pill fill, Badge Accent orange (#ff7900) text — the "30-Min Diagnosis", "Non-Destructive" style micro-copy. Distinct from the accent button (orange fill) so a badge never reads as a second CTA on the page.
- **Primary badge:** Deep Violet Container (#3c096c) at 10% opacity fill, Deep Violet text — used for status/property tags.

### Cards / Containers
- **Corner Style:** 1rem (16px) to 1.5rem (24px) radius depending on prominence — larger radius for hero-level cards, smaller for compact list items.
- **Background:** Elevation 0 = plain surface color (page-level sections); Elevation 1 = surface-container-lowest (white) with Level-1 shadow (the default content card); Elevation 2 = glass, reserved per the Floating-Chrome-Only Rule.
- **Service Cards:** Either solid-dark (Deep Violet Container #3c096c fill, white text) or light (surface-container-lowest fill with a Deep Violet #240046 border) — pick one treatment per card grid, don't mix within the same grid.
- **Shadow Strategy:** See Elevation section — Level 1 is the default card shadow; never a neutral-gray shadow.
- **Border:** Optional 1px outline-variant border on cards that sit directly against a same-toned background (needed for definition without shadow).
- **Internal Padding:** 24px (gutter) standard; compact list rows use less.

### Inputs / Fields
- **Style:** White (surface-container-lowest) background, 1px outline-variant border, 8px (0.5rem→ actually 4px/`rounded` token) corner radius, comfortable 12–16px padding.
- **Focus:** Border widens from 1px to 2px and shifts to primary violet, with a compensating 1px padding reduction so the field doesn't visibly shift size — a deliberate "field snaps to attention" cue rather than an outer glow.
- **Error / Disabled:** Error state should reuse the Alert Red role (#ba1a1a text / #ffdad6 container), not a generic browser-default red.

### Navigation
- **Style:** Fixed glass header (blurred, semi-transparent, Deep Violet-tinted) at all scroll positions. Logo wordmark in the Brand font (Sonsie One) at headline-md size, nav links in Label style, active link gets bold weight + primary color (no underline). Mobile collapses into a slide-down panel from the same glass surface.

### Hero
- **Background:** Linear gradient from Deep Violet (#240046) to Deep Violet Container (#3c096c) — the premium, high-tech banner treatment. White text throughout.

### Signature Component: Status Timeline (ActiveJobCard)
A horizontal step tracker (Requested → Assigned → En Route → Completion) where completed/current steps fill solid Deep Violet with a Level-2-style glow ring on the current step, and future steps sit in a flat surface-container-high chip. This is the system's clearest expression of "diagnostic report made interactive" — it should be the reference pattern for any other progress/status UI added later.

## 6. Do's and Don'ts

### Do:
- **Do** keep Ignition Orange Container (#ff6d00) to one interactive element per screen — the Signal Scarcity Rule.
- **Do** keep Badge Accent (#ff7900) scoped to badges/micro-copy, never as a button fill — the Badge-Is-Not-a-Button Rule.
- **Do** tint every shadow with the primary violet hue (`rgb(36 0 70 / opacity)`) — the Tinted Shadow Rule.
- **Do** reserve glass/blur for floating chrome only (sticky nav, overlays) — the Floating-Chrome-Only Rule.
- **Do** use uppercase-tracked Label styling only on functional UI (badges, nav, buttons), never as a decorative section-heading eyebrow — the One Eyebrow Exception Rule.
- **Do** keep body copy on the Surface background (#f8f9fa), never directly on Deep Violet or Deep Violet Container.
- **Do** ground copy in the diagnostic/root-cause process (sensors, credentials, warranty terms) rather than generic service-menu language, per PRODUCT.md's positioning.

### Don't:
- **Don't** use gradient text (`background-clip: text` + gradient) anywhere — decorative, and explicitly named as an anti-reference in PRODUCT.md.
- **Don't** stack a tiny uppercase tracked eyebrow above every section heading — the generic AI-SaaS scaffold PRODUCT.md calls out by name.
- **Don't** repeat identical icon-plus-heading card grids down a page — vary card content and layout instead.
- **Don't** use the hero-metric template (big number, small label, gradient accent) — also a named PRODUCT.md anti-reference.
- **Don't** use a neutral-gray or pure-black shadow anywhere; it reads as an off-brand import into this violet-tinted system.
- **Don't** reach for stock plumber photography, garish saturated colors, or cluttered WordPress-template density — the "cheap local contractor" anti-reference from PRODUCT.md.
- **Don't** use `border-left`/`border-right` greater than 1px as a colored accent stripe on cards or list items.
