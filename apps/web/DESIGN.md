---
name: Seepage Leakage All Solutions
description: Diagnostic-first leak-detection and structural-inspection service platform
colors:
  midnight-blueprint: "#002869"
  midnight-blueprint-container: "#0b3d91"
  midnight-blueprint-fixed: "#dae2ff"
  signal-orange: "#a04100"
  signal-orange-container: "#fe6b00"
  signal-orange-fixed: "#ffdbcc"
  slate-tertiary: "#1d2d41"
  slate-tertiary-container: "#334358"
  alert-red: "#ba1a1a"
  alert-red-container: "#ffdad6"
  surface: "#f7f9fb"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f2f4f6"
  surface-container: "#eceef0"
  surface-container-high: "#e6e8ea"
  surface-container-highest: "#e0e3e5"
  ink: "#191c1e"
  ink-variant: "#434652"
  outline: "#747783"
  outline-variant: "#c4c6d3"
typography:
  display:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "56px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.2
  headline-sm:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  body-lg:
    fontFamily: "Inter, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.05em"
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
    backgroundColor: "{colors.midnight-blueprint}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "44px"
  button-accent:
    backgroundColor: "{colors.signal-orange-container}"
    textColor: "#572000"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "44px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.midnight-blueprint}"
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

# Design System: Seepage Leakage All Solutions

## 1. Overview

**Creative North Star: "The Certified Inspector"**

This system reads as the visual identity of a credentialed inspector's toolkit, not a mass-market plumber's flyer. Midnight Blueprint navy carries institutional authority — the color of a report cover, a uniform, a stamped credential — while Signal Orange is spent sparingly, reserved for the one thing on screen that actually needs a visitor's attention: the primary CTA, an in-progress status, a flagged finding. Montserrat's confident, slightly condensed weight on headlines reads as a report's section titles; Inter carries the body copy with the plainness of a technical write-up rather than marketing copy. Shadows are never pure black — they're tinted with the primary navy (`rgb(0 40 105 / …)`), so even elevation feels like it belongs to this specific system rather than a generic UI kit.

This system explicitly rejects the generic AI-SaaS template: no gradient text, no tiny uppercase tracked eyebrows repeated above every section, no identical icon-plus-heading card grids marching down the page, no hero-metric clichés (big number, small label, gradient accent). It equally rejects the cheap-local-contractor aesthetic — no stock plumber photography, no garish saturated colors, no cluttered WordPress-template density.

**Key Characteristics:**
- Navy-dominant, orange-rare — the accent's scarcity is what makes it legible as "pay attention here"
- Blue-tinted shadows, never neutral-gray or pure-black elevation
- Montserrat display type for authority, Inter body type for plain-spoken clarity
- Pill-shaped accent CTAs vs. rounded-rectangle primary/outline buttons — shape itself signals hierarchy
- Glass (blurred, semi-transparent) surfaces reserved for floating chrome — sticky nav, overlays — never for static content cards

## 2. Colors

The palette is Restrained-to-Committed: navy is the dominant surface/authority color, orange is a true accent kept under roughly 10% of any given screen, and slate/tertiary exists only as a quiet supporting neutral-adjacent tone.

### Primary
- **Midnight Blueprint** (#002869): The system's authority color. Header logo wordmark, primary buttons, section headlines, active nav state, primary icon fills. Reads as the "navy blueprint paper" the whole system is drawn on.
- **Midnight Blueprint Container** (#0b3d91): Slightly lifted navy for containers that need to read as "primary but softer" — e.g. primary-tinted badges, hover states.
- **Midnight Blueprint Fixed** (#dae2ff): Pale navy-tinted backgrounds for primary-colored badges/pills on light surfaces (e.g. "PRIMARY" property tag, in-progress tints).

### Secondary
- **Signal Orange** (#a04100): The alert/flag color — text-on-orange, error-adjacent emphasis, the "look here" signal. Used at low frequency by design.
- **Signal Orange Container** (#fe6b00): The actual accent-button fill — the single most saturated color in the system, reserved for the primary CTA ("Book Now", "Book a Survey") and nothing else competing for that same attention.
- **Signal Orange Fixed** (#ffdbcc): Pale orange tint for accent-adjacent badges and soft highlight chips.

### Tertiary
- **Slate Tertiary** (#1d2d41): A quiet navy-slate used sparingly for tertiary containers/icons that need to feel "related to navy" without competing with the primary color itself.

### Neutral
- **Surface** (#f7f9fb): Page background — a cool near-white, not a warm cream/sand tone.
- **Surface Container Lowest** (#ffffff): Pure white for elevated cards and inputs sitting on top of the surface.
- **Surface Container / Container High / Container Highest** (#eceef0 → #e0e3e5): Ascending tonal steps for nested containers, hover backgrounds, and disabled/inactive icon chips.
- **Ink** (#191c1e): Primary body/heading text on light surfaces.
- **Ink Variant** (#434652): Secondary/supporting text — captions, metadata, de-emphasized labels.
- **Outline / Outline Variant** (#747783 / #c4c6d3): Borders, dividers, and outline-button strokes.

### Named Rules
**The Signal Scarcity Rule.** Signal Orange Container (#fe6b00) fills no more than one interactive element per view — the single primary action. If two elements both reach for orange, one of them is wrong; demote it to outline or ghost.

**The Tinted Shadow Rule.** Every shadow carries the primary navy hue (`rgb(0 40 105 / opacity)`), never a neutral or pure-black shadow. A gray drop-shadow on this system reads as an off-brand import.

## 3. Typography

**Display Font:** Montserrat, sans-serif
**Body Font:** Inter, sans-serif

**Character:** Montserrat's geometric confidence carries every headline like a section title on an inspection report; Inter's plain, highly legible forms carry body copy the way a technical document does — the pairing avoids both playful-marketing-sans and cold-corporate-sans.

### Hierarchy
- **Display** (700, 56px / clamp on mobile, 1.1 line-height, -0.02em tracking): Hero headlines only — one per page.
- **Headline** (700, 40px desktop / 32px mobile, 1.2 line-height): Section titles ("About Seepage Leakage All Solutions", "The Seepage Leakage All Solutions Inspection Process").
- **Headline Small** (600, 24px, 1.3 line-height): Card/component-level headings — footer brand name, dashboard card titles.
- **Body Large** (400, 18px, 1.6 line-height): Lead paragraphs under hero headlines; cap prose at 65–75ch.
- **Body** (400, 16px, 1.6 line-height): Default UI and paragraph text.
- **Label** (600, 14px, 1 line-height, 0.05em tracking, uppercase where used for badges): Nav links, button labels, badge text.

### Named Rules
**The One Eyebrow Exception Rule.** Uppercase tracked labels (Label style, 0.05em tracking) are reserved for functional UI (badges, nav, buttons) — never stacked decoratively above every marketing-page section heading as a rhythm device. If it isn't a badge, a nav item, or a button, it doesn't get uppercase-tracked treatment.

## 4. Elevation

The system uses tonal layering as the default (surface-container steps for nested content) with a small, deliberate shadow vocabulary for genuinely floating elements — shadows are structural signals of "this is lifted off the page," not ambient decoration applied everywhere.

### Shadow Vocabulary
- **Level 1** (`box-shadow: 0 4px 20px 0 rgb(0 40 105 / 0.06)`): Default elevated card shadow — subtle, close, barely-there lift for standard content cards.
- **Level 2** (`box-shadow: 0 8px 30px 0 rgb(0 40 105 / 0.12)`): Reserved for genuinely prominent floating elements — modals, prominent hover states.
- **Glass** (`backdrop-filter: blur(20px)` + inset white ring + Level 1 shadow): The sticky header and floating overlay chrome only — never applied to static content cards.

### Named Rules
**The Floating-Chrome-Only Rule.** Glass/blur treatment is reserved for elements that float over scrolling content (sticky nav, overlays). A static card using glass instead of a flat Level-1 shadow is a misuse of the pattern.

## 5. Components

Buttons feel confident and rectilinear for primary/outline actions, but shift to a pill shape specifically for the one accent CTA — shape difference reinforces color scarcity as a hierarchy signal. Cards are flat-to-softly-lifted, never glassy. Inputs are plain and legible, with a deliberate two-stage focus ring rather than a glow effect.

### Buttons
- **Shape:** Rounded-rectangle (0.5rem / 8px radius) by default; fully pill-shaped (`rounded-full`) only for the `accent` variant.
- **Primary:** Midnight Blueprint fill (#002869), white text, Level-1 shadow, `hover:brightness-110`.
- **Accent (the single CTA):** Signal Orange Container fill (#fe6b00), dark-brown-orange text (#572000) for contrast, pill shape, Level-1 shadow, `hover:brightness-95`. This is the only button variant that should appear once per view.
- **Outline / Outline-inverse:** Transparent fill, 1px outline-color border, text in primary (or white on dark backgrounds); hover fills with a low-opacity surface-container tint.
- **Ghost:** No border, no fill; text-primary with a low-opacity hover background. Used for tertiary/dismissive actions (Sign Out, secondary nav).

### Cards / Containers
- **Corner Style:** 1rem (16px) to 1.5rem (24px) radius depending on prominence — larger radius for hero-level cards, smaller for compact list items.
- **Background:** Elevation 0 = plain surface color (page-level sections); Elevation 1 = surface-container-lowest (white) with Level-1 shadow (the default content card); Elevation 2 = glass, reserved per the Floating-Chrome-Only Rule.
- **Shadow Strategy:** See Elevation section — Level 1 is the default card shadow; never a neutral-gray shadow.
- **Border:** Optional 1px outline-variant border on cards that sit directly against a same-toned background (needed for definition without shadow).
- **Internal Padding:** 24px (gutter) standard; compact list rows use less.

### Inputs / Fields
- **Style:** White (surface-container-lowest) background, 1px outline-variant border, 8px (0.5rem→ actually 4px/`rounded` token) corner radius, comfortable 12–16px padding.
- **Focus:** Border widens from 1px to 2px and shifts to primary navy, with a compensating 1px padding reduction so the field doesn't visibly shift size — a deliberate "field snaps to attention" cue rather than an outer glow.
- **Error / Disabled:** Error state should reuse the Alert Red role (#ba1a1a text / #ffdad6 container), not a generic browser-default red.

### Navigation
- **Style:** Fixed glass header (blurred, semi-transparent) at all scroll positions. Logo wordmark in Montserrat headline-sm weight, nav links in Label style, active link gets bold weight + primary color (no underline). Mobile collapses into a slide-down panel from the same glass surface.

### Signature Component: Status Timeline (ActiveJobCard)
A horizontal step tracker (Requested → Assigned → En Route → Completion) where completed/current steps fill solid navy with a Level-2-style glow ring on the current step, and future steps sit in a flat surface-container-high chip. This is the system's clearest expression of "diagnostic report made interactive" — it should be the reference pattern for any other progress/status UI added later.

## 6. Do's and Don'ts

### Do:
- **Do** keep Signal Orange Container (#fe6b00) to one interactive element per screen — the Signal Scarcity Rule.
- **Do** tint every shadow with the primary navy hue (`rgb(0 40 105 / opacity)`) — the Tinted Shadow Rule.
- **Do** reserve glass/blur for floating chrome only (sticky nav, overlays) — the Floating-Chrome-Only Rule.
- **Do** use uppercase-tracked Label styling only on functional UI (badges, nav, buttons), never as a decorative section-heading eyebrow — the One Eyebrow Exception Rule.
- **Do** ground copy in the diagnostic/root-cause process (sensors, credentials, warranty terms) rather than generic service-menu language, per PRODUCT.md's positioning.

### Don't:
- **Don't** use gradient text (`background-clip: text` + gradient) anywhere — decorative, and explicitly named as an anti-reference in PRODUCT.md.
- **Don't** stack a tiny uppercase tracked eyebrow above every section heading — the generic AI-SaaS scaffold PRODUCT.md calls out by name.
- **Don't** repeat identical icon-plus-heading card grids down a page — vary card content and layout instead.
- **Don't** use the hero-metric template (big number, small label, gradient accent) — also a named PRODUCT.md anti-reference.
- **Don't** use a neutral-gray or pure-black shadow anywhere; it reads as an off-brand import into this navy-tinted system.
- **Don't** reach for stock plumber photography, garish saturated colors, or cluttered WordPress-template density — the "cheap local contractor" anti-reference from PRODUCT.md.
- **Don't** use `border-left`/`border-right` greater than 1px as a colored accent stripe on cards or list items.
