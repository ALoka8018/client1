---
name: Structural Integrity
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#434652'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#747783'
  outline-variant: '#c4c6d3'
  surface-tint: '#345baf'
  primary: '#002869'
  on-primary: '#ffffff'
  primary-container: '#0b3d91'
  on-primary-container: '#8dadff'
  inverse-primary: '#b1c5ff'
  secondary: '#a04100'
  on-secondary: '#ffffff'
  secondary-container: '#fe6b00'
  on-secondary-container: '#572000'
  tertiary: '#1d2d41'
  on-tertiary: '#ffffff'
  tertiary-container: '#334358'
  on-tertiary-container: '#9fb0c9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b1c5ff'
  on-primary-fixed: '#001947'
  on-primary-fixed-variant: '#144296'
  secondary-fixed: '#ffdbcc'
  secondary-fixed-dim: '#ffb693'
  on-secondary-fixed: '#351000'
  on-secondary-fixed-variant: '#7a3000'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 56px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  section-padding-desktop: 120px
  section-padding-mobile: 64px
---

## Brand & Style
The design system is engineered to evoke an atmosphere of absolute reliability, technical mastery, and forward-thinking precision. It targets high-stakes stakeholders in infrastructure and development who require a partner that balances heavy-industry expertise with modern digital sophistication. 

The aesthetic is **Corporate Modern** with a focus on **Tonal Depth**. It leverages wide-open whitespace to signify clarity of thought, punctuated by high-fidelity glassmorphism to represent transparency in process. The emotional response is one of "calm capability"—where complex engineering "issues" find elegant, definitive "solutions."

## Colors
This design system utilizes a high-contrast palette to drive user confidence. 
- **Primary (Dark Blue):** Represents the foundation, authority, and the legacy of engineering excellence. Used for headers, primary navigation, and grounding elements.
- **Accent (Orange):** Reserved strictly for critical calls to action (CTAs) and interactive highlights. It represents energy, problem-solving, and visibility.
- **Surface Palette:** Employs a range of cool grays (`#F8FAFC` to `#E2E8F0`) to create a clean, clinical environment that allows technical diagrams and project photography to stand out.

## Typography
The typographic hierarchy is built on a dual-font strategy. **Montserrat** provides a geometric, architectural feel for headlines, echoing the structural nature of civil engineering. **Inter** is used for all body text and data-heavy interfaces to ensure maximum legibility and a systematic, modern feel. Large display type should be used sparingly to frame key value propositions, while labels should maintain a higher letter-spacing for a refined, technical look.

## Layout & Spacing
The design system follows a **12-column fluid grid** for desktop and a **4-column grid** for mobile. We prioritize generous vertical rhythm to prevent the technical content from feeling overwhelming. 

- **Desktop:** 24px gutters with 80px side margins or a max-width container of 1280px.
- **Sectioning:** Use large 120px padding blocks to separate major service areas, allowing the "Glass" components to breathe against the background.
- **Consistency:** All spacing must be multiples of the 8px base unit to maintain a rigorous engineering-grade alignment.

## Elevation & Depth
Depth is a core signifier of the "solution" in this design system. We use a **tiered elevation model**:
1.  **Level 0 (Base):** Light gray background (`#F8FAFC`).
2.  **Level 1 (Cards):** White surfaces with a very soft, diffused shadow (`Y: 4, Blur: 20, Opacity: 0.05`).
3.  **Level 2 (Interactive/Glass):** Semi-transparent white (`rgba(255, 255, 255, 0.7)`) with a `20px` backdrop-blur and a subtle `1px` white inner stroke. This is used for navigation bars and floating service overlays.

Shadows should never be pure black; they are tinted with the Primary Blue to maintain a premium, cohesive look.

## Shapes
To soften the inherent rigidity of "construction" and "engineering," the design system employs highly rounded corners for container elements. 
- **Standard UI (Buttons/Inputs):** 8px (0.5rem).
- **Service Cards:** Use `rounded-2xl` (16px) or `rounded-3xl` (24px) to create a friendly, modern container for complex data.
- **Accent Shapes:** Subtle circular motifs or large-radius pill shapes for trust badges to contrast with the sharp lines of engineering diagrams.

## Components
- **Interactive Service Cards:** Feature a `rounded-3xl` corner radius, Level 2 elevation, and a hover state that slightly increases the shadow depth and reveals the Accent Orange in a small icon or border-bottom.
- **Accordions:** Flat, bordered headers that use the Primary Blue for text. On expansion, the background shifts to a very light blue tint to highlight the "solution" text.
- **Before/After Sliders:** A high-contrast handle in Accent Orange. The container must have a `rounded-2xl` clipping mask to maintain shape consistency.
- **Booking Form:** A multi-step interface using "Surface-Container" styling. Inputs are clean with 1px borders that transition to 2px Primary Blue on focus. The primary CTA button is a large, high-contrast Orange block.
- **Trust Badges:** Minimalist, monochromatic icons paired with `label-md` typography, housed in a light-gray "pill" container.