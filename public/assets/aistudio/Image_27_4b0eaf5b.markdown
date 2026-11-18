---
name: Archival Jurisprudence
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#574142'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#8b7171'
  outline-variant: '#debfbf'
  surface-tint: '#a93441'
  primary: '#6b0119'
  on-primary: '#ffffff'
  primary-container: '#8b1e2d'
  on-primary-container: '#ff9da0'
  inverse-primary: '#ffb3b4'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2e1'
  on-secondary-container: '#656464'
  tertiary: '#323333'
  on-tertiary: '#ffffff'
  tertiary-container: '#494949'
  on-tertiary-container: '#b9b8b8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdada'
  primary-fixed-dim: '#ffb3b4'
  on-primary-fixed: '#40000b'
  on-primary-fixed-variant: '#881c2b'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c9c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#e4e2e2'
  tertiary-fixed-dim: '#c7c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display:
    fontFamily: Newsreader
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 36px
    fontWeight: '500'
    lineHeight: 44px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Newsreader
    fontSize: 26px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  headline-sm:
    fontFamily: Newsreader
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.08em
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
This design system marries the gravitas of classical legal documentation with modern cryptographic precision. Tailored for legal verification, contract certification, and institutional registry interfaces, the visual tone is uncompromisingly authoritative, forensic, and enduring. It treats the digital screen as archival vellum—unapologetically typographic, structured by strict 1px architectural rules, and defined by intellectual restraint.

The aesthetic philosophy draws directly from high-end broadsheet editorial design and archival ledger typography. Zero superfluous ornamentation, zero rounded corners, and zero synthetic lighting artifacts (drop shadows or blurs) exist within this environment. Visual weight is communicated strictly through typographic scale contrast, geometric density, and precise hairline rules.

## Colors
The palette evokes traditional registry ink, crisp paper stock, and institutional wax verification marks:

- **Primary (`#8B1E2D` - Oxblood):** Reserved for institutional seals, primary action buttons, verified badge seals, and formal state indicators. It carries historical authority without modern synthetic aggression.
- **Secondary / Ink Black (`#0A0A0A`):** The primary typographic ink and background tone for inverted verification banners. It provides stark, high-contrast legibility.
- **Tertiary / Mid Grey (`#5C5C5C`):** Subordinate metadata, metadata labels, table captions, and secondary copy.
- **Neutral / Rule Grey (`#E8E8E8`):** Dividing hairlines, panel backings, subtle cell highlights, and structural grid rules.
- **Canvas / Paper White (`#FFFFFF`):** The stark, unblemished background sheet that houses records and data grids.

## Typography
Typographic hierarchy is built on a tripartite structure that balances literary tradition with technical precision:

1. **Headlines (`Newsreader`):** An authoritative, optical-sized transitional serif delivering literary weight and judicial finality. Used for case titles, record summaries, and section headers.
2. **Body Text (`Inter`):** Crisp, objective, and neutral. It handles dense legal clauses, long-form briefs, and multi-row document content without visual fatigue.
3. **Forensic Labels & Tokens (`JetBrains Mono`):** Dedicated to ledger verification data—contract addresses, cryptographic hashes, timestamps, case numbers, and status indicators. Always uppercase when used for metadata categorizations (`label-caps`).

## Layout & Spacing
The layout adheres to a 12-column architectural grid on desktop and tablet, collapsing to a single-column sequence on mobile. Alignment mimics formal printed gazettes and archival registries:

- **Desktop (1024px+):** Outer canvas margins of 3rem (`margin`), fixed 1.5rem gutters (`gutter`), and strict horizontal hairline guides separating consecutive sections. Data cards and registry tables span exact fractional increments (3, 4, 6, 8, or 12 columns).
- **Tablet (768px - 1023px):** Margins reduce to 2rem; columns scale fluidly. Dual-column verification blocks remain paired.
- **Mobile (<768px):** Outer margins shift to 1rem (`margin-mobile`), with gutters at 1rem (`gutter-mobile`). Multicolumn legal metadata collapses into a stacked key-value index separated by hairline borders.
- **Grid Rhythm:** Sections do not rely on dynamic floating spacing; all content sits inside borders that interlock like physical printer's furniture.

## Elevation & Depth
Depth in this system is deliberately two-dimensional. Drop shadows, atmospheric blurs, and pseudo-3D elevations are strictly prohibited to maintain an authentic physical paper and printed document feel:

- **Hierarchy via Rules:** Visual separation is achieved exclusively through 1px solid borders (`#E8E8E8` for subtle field demarcations, `#0A0A0A` for primary boundaries and structural header blocks).
- **Tonal Inversion:** Emphasis and focal elevation are created using solid `#0A0A0A` fills with white typography, or `#8B1E2D` for urgent legal validation states.
- **Layering:** When overlays, drawers, or modal verification sheets appear, they do not float on soft shadows; they feature an opaque white surface bounded by a sharp 1px `#0A0A0A` border, positioned above a solid 30% `#0A0A0A` flat scrim with zero blur.

## Shapes
Every geometric boundary possesses an absolute radius of 0px (`rounded-none`). This applies universally:

- Buttons, form fields, badges, modals, table cells, and system alerts are cut at exact 90-degree right angles.
- Square corners evoke the physical edges of trimmed archival parchment, microfiche, legal dockets, and stamp impressions.
- No soft corners or pill shapes may appear, ensuring the interface remains uncompromisingly formal and technical.

## Components

### Buttons
- **Primary:** Background `#8B1E2D` (Oxblood), text `#FFFFFF`, 0px border radius, 1px solid `#8B1E2D`. Hover state darkens slightly to `#731825`. Monospaced or uppercase sans label with letter-spacing.
- **Secondary:** Background `#FFFFFF`, text `#0A0A0A`, border 1px solid `#0A0A0A`. Hover inverts to background `#0A0A0A` and text `#FFFFFF`.
- **Tertiary / Destructive:** Background transparent, text `#8B1E2D`, border 1px dashed `#8B1E2D`.

### Verification Seals & Status Badges
- **Verified / Sealed:** Solid `#8B1E2D` fill, crisp `#FFFFFF` monospaced text, padding `space-xs` `space-sm`, zero border radius.
- **Pending / In Review:** White background, 1px solid `#5C5C5C`, text `#5C5C5C`, uppercase monospaced font.
- **Cryptographic Stamp / Seal Element:** An etched, square, bordered badge displaying validation hashes, block height, and timestamp in `JetBrains Mono`.

### Input Fields & Controls
- **Text Inputs:** Background `#FFFFFF`, 1px solid `#E8E8E8`, text `#0A0A0A`, sharp corners. Focused state elevates border to 1px solid `#0A0A0A` (no glow rings). Labels rendered in `label-caps` (`JetBrains Mono`, uppercase).
- **Checkboxes & Radios:** Strictly square 16x16px boxes, 1px solid `#0A0A0A`. Checked checkbox displays an inner solid square of `#8B1E2D` or `#0A0A0A`. Checked radio displays an inner inset square (never a circle).

### Tables & Legal Dockets
- **Data Grids:** Fully encompassed by 1px solid `#E8E8E8` borders with cell walls explicitly ruled. Column headers styled in `label-caps` with `#E8E8E8` background fill and `#0A0A0A` ink. Alternate row striping avoided in favor of hairline dividers.
- **Monospace Cells:** Numerical quantities, transaction hashes, and signature keys rendered strictly in `label-code`.

### Cards & Document Containers
- **Panels:** Pure `#FFFFFF` fill bounded by a continuous 1px solid `#E8E8E8` border. Header bars separated by a continuous 1px horizontal rule. Zero shadow.