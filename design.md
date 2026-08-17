---
name: Seepage Doctor
description: Color and typography system for the marketing/booking website
typography:
  brand:
    fontFamily: "Sonsie One, cursive"
    fontWeight: 400
    usage: "Logo wordmark only"
  h1:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontWeight: "700-800"
    fontSize: "42px-56px"
    color: "White (#FFFFFF) or Bright Gold (#FF9E00) over Deep Purple backgrounds"
  h2:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontWeight: 700
    fontSize: "32px-40px"
    color: "Deep Violet (#240046) on light backgrounds"
  h3:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontWeight: 600
    fontSize: "20px-24px"
    color: "Deep Purple (#3C096C) or White depending on card background"
  body:
    fontFamily: "Inter, sans-serif"
    fontWeight: 400
    fontSize: "16px"
    lineHeight: 1.6
    color: "Charcoal (#222222) on light canvas, #E0E0E0 on dark sections"
  cta:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontWeight: "600-700"
    fontSize: "16px"
    transform: uppercase
    color: "Dark Purple (#240046) text on Vibrant Orange (#FF6D00) background"
  badge:
    fontFamily: "Inter, sans-serif"
    fontWeight: 600
    fontSize: "12px-14px"
    transform: uppercase
    color: "Vibrant Orange (#FF7900) text on soft purple background pill"
colors:
  navbar: "#240046"
  hero-gradient-start: "#240046"
  hero-gradient-end: "#3C096C"
  cta-primary: "#FF6D00"
  cta-primary-text: "#FFFFFF"
  body-background: "#F8F9FA"
  card-dark: "#3C096C"
  card-border: "#240046"
  badge-highlight: "#FF9E00"
  badge-text: "#FF7900"
---

# Design: Color & Typography

## Typography

**Logo:** Sonsie One (Google Fonts), weight 400 — the site's one signature/brand mark, used only for the header/footer logo wordmark. Not used for any heading tier, so it stays a distinctive accent rather than the everyday type.

> Originally requested with the "Allesya" font, but that file is licensed "Demo for Personal Use" only (`allesya-font/iFonts-License.txt`) — not cleared for this commercial site. Sonsie One is a properly Google-Fonts-licensed (SIL Open Font License) alternative with a similar bold script/display character.

### 👑 Headings (Plus Jakarta Sans)

**H1 (Hero Main Title):** Bold/ExtraBold (800), 42px–56px. White (`#FFFFFF`) or Bright Gold (`#FF9E00`) over Deep Purple backgrounds. Example: "30-Min Pipeline Scanning & Seepage Resolution".

**H2 (Section Titles):** Bold (700), 32px–40px. Deep Violet (`#240046`) on light backgrounds. Example: "Our Advanced Diagnostic Services".

**H3 (Card & Feature Headings):** SemiBold (600), 20px–24px. Deep Purple (`#3C096C`) or White depending on card background. Example: "Drain Endoscopy (Camera Inspection)".

### 📝 Body & UI Elements (Inter)

**Body Paragraphs:** Regular (400), 16px, line-height 1.6. Charcoal (`#222222`) on light canvas, `#E0E0E0` on dark sections. Used for service descriptions, diagnostic explanations, and company overview copy.

**CTA Buttons ("Call Now" / "Book Inspection"):** Plus Jakarta Sans SemiBold (600) or Bold (700), uppercase, 16px. Dark Purple (`#240046`) text on Vibrant Orange (`#FF6D00`) background.

**Badges & Micro-Copy ("30-Min Diagnosis", "Non-Destructive"):** Inter SemiBold (600), uppercase, 12px–14px. Vibrant Orange (`#FF7900`) text on a soft purple background pill.

```css
@import url('https://fonts.googleapis.com/css2?family=Sonsie+One&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');

.brand {
  font-family: 'Sonsie One', cursive;
  font-weight: 400;
}
h1 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: clamp(42px, 6vw, 56px);
  color: #ffffff; /* or #ff9e00 for the Bright Gold alternate, over Deep Purple */
}
h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: clamp(32px, 4vw, 40px);
  color: #240046;
}
h3 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 600;
  font-size: clamp(20px, 2vw, 24px);
  color: #3c096c; /* or #ffffff on solid-dark cards */
}
body {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.6;
  color: #222222; /* or #e0e0e0 on dark sections */
}
.cta-button {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 16px;
  color: #240046;
  background: #ff6d00;
}
.badge {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 14px;
  color: #ff7900;
  background: #ecdcfa; /* soft purple pill */
}
```

## Colors

| Website Element | Color | Why It Works |
|---|---|---|
| Navbar / Header | `#240046` | Solid, dark anchor at the top of the screen with crisp white text. |
| Hero Background | Gradient: `#240046` → `#3C096C` | Sleek, premium, high-tech background for the main banner. |
| Primary Buttons (CTA) | `#FF6D00` (text: `#240046`) | High-contrast pop against dark purple that commands attention. |
| Body Background | Off-white / soft light grey `#F8F9FA` | Keeps long paragraphs of body text easy to read — never put body copy on a dark surface. |
| Service Cards | Dark `#3C096C`, or light card with `#240046` borders | Separates pipeline, endoscopy, and leak detection services cleanly. |
| Badges / Highlights | `#FF7900` text on soft purple pill | Makes callouts like "30-Min Diagnosis" pop out instantly, without reading as a second CTA. |

### Usage rules
- Navbar and hero always sit on the purple scale (`#240046`/`#3C096C`) with white text (Bright Gold `#FF9E00` as an occasional H1 accent).
- `#FF6D00` is reserved for primary CTAs (e.g. "Book Now") — don't dilute it by using it on secondary buttons or decorative elements.
- `#FF7900` (badge text) is distinct from `#FF6D00` (CTA) — badges highlight information, CTAs trigger action. Don't swap them.
- Body/content sections use the light `#F8F9FA` background, never the dark purple, so paragraph text stays legible.
- Service cards may go either route (solid dark `#3C096C` fill, or light fill with a `#240046` border) — stay consistent within a single grid of cards.
- H1 is Plus Jakarta Sans like every other heading — Sonsie One is reserved for the logo only, so the brand mark stays distinctive without turning every big title into a script font.

## Status

Implemented sitewide. `apps/web/src/app/globals.css` theme tokens and `apps/web/DESIGN.md` have been migrated to this palette and typography: logo on Sonsie One (`font-brand`), H1/H2/H3 on Plus Jakarta Sans (`font-display`) with H3 recolored to Deep Purple Container (`text-primary-container`), body on Inter with Charcoal/`#e0e0e0` split (`--color-on-surface`/`--color-inverse-on-surface`), CTA buttons uppercase Plus Jakarta Sans bold, badges on a soft-violet pill with new Badge Accent orange (`--color-badge-accent: #ff7900`).
