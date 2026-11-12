/**
 * Premium SaaS layout system — container axis, section rhythm, card/CTA emphasis.
 * Scoped via [data-lp-layout] + renderer tokens; no per-slug rules.
 */

export const LP_PREMIUM_FOUNDATION_CSS = `
/* —— Unified container axis —— */
[data-lp-canvas-root] {
  --lp-gutter: clamp(1rem, 3.5vw, 1.5rem);
  --lp-section-y: calc(var(--lp-section-space, 2.5rem) * var(--lp-section-mult, 1));
  --lp-grid-gap: clamp(0.875rem, 2vw, 1.25rem);
  --lp-card-border: 1px solid color-mix(in srgb, var(--lp-border, #e2e8f0) 85%, transparent);
  --lp-card-shadow: var(--lp-shadow-md, var(--lp-shadow));
  --lp-heading-font: var(--lp-font-heading, inherit);
  --lp-body-font: var(--lp-font-body, inherit);
  font-family: var(--lp-body-font, system-ui, sans-serif);
}
[data-lp-canvas-root] h1,
[data-lp-canvas-root] h2,
[data-lp-canvas-root] h3,
[data-lp-canvas-root] [data-lp-section-head] h2 {
  font-family: var(--lp-heading-font, inherit);
}

[data-lp-canvas-root] [data-lp-container-inner],
[data-lp-category="agency"] [data-lp-canvas-root] .max-w-3xl,
[data-lp-category="agency"] [data-lp-canvas-root] .max-w-5xl,
[data-lp-category="agency"] [data-lp-canvas-root] .max-w-6xl,
[data-lp-category="clinic"] [data-lp-canvas-root] .max-w-3xl,
[data-lp-category="clinic"] [data-lp-canvas-root] .max-w-5xl,
[data-lp-category="clinic"] [data-lp-canvas-root] .max-w-6xl,
[data-lp-category="saas"] [data-lp-canvas-root] .max-w-3xl,
[data-lp-category="saas"] [data-lp-canvas-root] .max-w-5xl,
[data-lp-category="saas"] [data-lp-canvas-root] .max-w-6xl {
  width: 100%;
  max-width: min(var(--lp-container, 68rem), 100%);
  margin-inline: auto;
  padding-inline: var(--lp-gutter);
  box-sizing: border-box;
}

/* Single horizontal axis — section shell padding lives on container (all categories) */
[data-lp-canvas-root] [data-lp-section-chrome] > section[class*="px-"],
[data-lp-canvas-root] [data-lp-section-chrome] > header[class*="px-"],
[data-lp-canvas-root] [data-lp-section-chrome] > footer[class*="px-"] {
  padding-inline: 0 !important;
}

/* Section rhythm — tighter, less dead space */
[data-lp-canvas-root] [data-lp-section-chrome] > section,
[data-lp-canvas-root] [data-lp-section-chrome] > header,
[data-lp-canvas-root] [data-lp-section-chrome] > footer {
  padding-block: calc(var(--lp-section-y) * 0.85);
}
[data-lp-block-slot] + [data-lp-block-slot] [data-lp-section-chrome] > section {
  margin-top: 0;
}

/* —— Section hierarchy: eyebrow → heading → body —— */
[data-lp-section-eyebrow] {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.65rem;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--lp-primary);
}
[data-lp-section-eyebrow]::before {
  content: "";
  width: 1.5rem;
  height: 2px;
  border-radius: 2px;
  background: currentColor;
  opacity: 0.85;
}
[data-lp-section-head][data-lp-align="center"] [data-lp-section-eyebrow] {
  justify-content: center;
}
[data-lp-section-head][data-lp-align="center"] [data-lp-section-eyebrow]::before {
  display: none;
}
[data-lp-section-head] h2 {
  font-size: clamp(1.35rem, 2.6vw, 1.875rem);
  font-weight: var(--lp-fw-heading, 800);
  line-height: var(--lp-lh-heading, 1.18);
  letter-spacing: -0.025em;
}
[data-lp-section-head] p {
  font-size: clamp(0.9375rem, 1.8vw, 1.0625rem);
  line-height: 1.55;
  max-width: var(--lp-text-width, 40rem);
}
[data-lp-section-head][data-lp-align="center"] p {
  margin-inline: auto;
}

/* —— Cards / features / gallery grid —— */
[data-lp-cards-grid] {
  gap: var(--lp-grid-gap) !important;
}
[data-lp-card-item] {
  border: var(--lp-card-border);
  box-shadow: var(--lp-card-shadow);
  background: var(--lp-surface);
  border-radius: var(--lp-radius-md, var(--lp-radius));
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
[data-lp-card-item]:hover {
  transform: translateY(-2px);
  box-shadow: var(--lp-shadow-lg, var(--lp-shadow));
}
[data-lp-category="agency"] [data-lp-gallery-variant] [data-lp-content-image],
[data-lp-category="agency"] [data-lp-gallery-featured] img,
[data-lp-category="clinic"] [data-lp-gallery-variant] [data-lp-content-image],
[data-lp-category="clinic"] [data-lp-gallery-featured] img {
  border-radius: var(--lp-radius-md, var(--lp-radius));
  box-shadow: var(--lp-shadow-sm, var(--lp-shadow));
}

/* Clinic — speaker credentials & booking focal */
[data-lp-category="clinic"]:not([data-lp-gold-standard]) section[aria-label="Speaker"] .flex.flex-col.gap-4 {
  border: 1px solid color-mix(in srgb, var(--lp-primary) 18%, var(--lp-border)) !important;
  box-shadow: var(--lp-card-shadow) !important;
  border-radius: var(--lp-radius-md, var(--lp-radius)) !important;
}
[data-lp-category="clinic"]:not([data-lp-gold-standard]) [data-lp-form-booking-strip="1"] {
  border-bottom-color: color-mix(in srgb, var(--lp-primary) 22%, transparent) !important;
}
[data-lp-category="clinic"]:not([data-lp-gold-standard]) [data-lp-form-variant="booking"] [data-lp-form-card],
[data-lp-category="clinic"]:not([data-lp-gold-standard]) [data-lp-conversion-zone="form"] [data-lp-form-card] {
  border: 2px solid color-mix(in srgb, var(--lp-primary) 28%, transparent);
  border-radius: var(--lp-radius-lg, calc(var(--lp-radius) + 4px));
}
[data-lp-category="clinic"]:not([data-lp-gold-standard]) [data-lp-conversion-zone="form"] button[type="submit"] {
  font-weight: 700 !important;
  min-height: 48px;
}

/* —— Pricing emphasis —— */
[data-lp-pricing-grid] {
  gap: var(--lp-grid-gap) !important;
  align-items: stretch;
}
[data-lp-pricing-card] {
  border: var(--lp-card-border);
  box-shadow: var(--lp-card-shadow);
  border-radius: var(--lp-radius-md, var(--lp-radius));
  position: relative;
  overflow: hidden;
}
[data-lp-pricing-card][data-lp-featured="1"] {
  box-shadow: var(--lp-shadow-lg, var(--lp-shadow));
  border: 2px solid color-mix(in srgb, var(--lp-primary) 40%, transparent);
  transform: translateY(-4px);
}
[data-lp-pricing-card][data-lp-featured="1"]::before {
  content: "Phổ biến";
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.25rem 0.65rem;
  font-size: 0.625rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: var(--lp-primary);
  color: #fff;
  border-bottom-left-radius: var(--lp-radius-sm, 6px);
}
[data-lp-pricing-table] {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: var(--lp-card-border);
  box-shadow: var(--lp-card-shadow);
  border-radius: var(--lp-radius-md, var(--lp-radius));
  overflow: hidden;
  background: var(--lp-surface);
}
[data-lp-pricing-table] th[data-lp-featured="1"] {
  background: color-mix(in srgb, var(--lp-primary) 10%, var(--lp-surface));
  box-shadow: inset 0 3px 0 var(--lp-primary);
}

/* —— Form card —— */
[data-lp-form-card] form#lead-form,
[data-lp-form-block] {
  border: var(--lp-card-border);
  box-shadow: var(--lp-shadow-lg, var(--lp-shadow));
  border-radius: var(--lp-radius-lg, calc(var(--lp-radius) + 4px));
  background: var(--lp-surface) !important;
}
[data-lp-variant="floating-card"] [data-lp-hero-float] [data-lp-form-card] form#lead-form {
  border: 2px solid color-mix(in srgb, var(--lp-primary) 25%, var(--lp-border));
}

/* —— CTA focal point —— */
[data-lp-cta-band],
[data-lp-cta-split] {
  border-radius: var(--lp-radius-lg, calc(var(--lp-radius) + 4px)) !important;
  box-shadow: var(--lp-shadow-lg, var(--lp-shadow)) !important;
  overflow: hidden;
}
[data-lp-cta-variant]:not([data-lp-cta-variant="minimal"]) [data-lp-cta-band],
[data-lp-cta-variant="split"] [data-lp-cta-split] {
  outline: 1px solid color-mix(in srgb, #fff 18%, transparent);
}
[data-lp-cta-band] a,
[data-lp-cta-action-panel] a {
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18);
  min-width: 10.5rem;
  justify-content: center;
}
[data-lp-hero-cta] a {
  box-shadow: 0 10px 28px color-mix(in srgb, var(--lp-primary) 35%, transparent);
}

/* —— Hero compositions —— */
[data-lp-category="agency"] [data-lp-variant="floating-card"] [data-lp-hero-grid] {
  display: grid !important;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr) !important;
  grid-template-areas:
    "copy form"
    "visual visual";
  align-items: start !important;
  gap: clamp(1rem, 2.5vw, 1.5rem) !important;
}
[data-lp-category="agency"] [data-lp-variant="floating-card"] [data-lp-hero-copy] {
  grid-area: copy;
}
[data-lp-category="agency"] [data-lp-variant="floating-card"] [data-lp-hero-float] {
  grid-area: form;
  max-width: 24rem;
  width: 100%;
  justify-self: end;
}
[data-lp-category="agency"] [data-lp-variant="floating-card"] [data-lp-hero-visual] {
  grid-area: visual;
  max-width: min(36rem, 100%);
  margin-inline: auto;
  width: 100%;
}
[data-lp-variant="floating-card"] [data-lp-hero-grid] {
  align-items: center !important;
  gap: var(--lp-grid-gap) !important;
}
[data-lp-variant="floating-card"]:not([data-lp-layout]) [data-lp-hero-visual] {
  max-width: 18rem;
  margin-inline: auto;
  width: 100%;
}
[data-lp-variant="floating-card"] [data-lp-hero-float] {
  max-width: 22rem;
  width: 100%;
  margin-inline: auto;
}
[data-lp-variant="split-left"] [data-lp-hero-grid],
[data-lp-variant="split-right"] [data-lp-hero-grid] {
  align-items: center;
  gap: clamp(1.25rem, 3vw, 2rem);
}
[data-lp-variant="editorial-overlay"] [data-lp-container-inner] {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: min(52vh, 440px);
}

/* —— Process / testimonials grids —— */
[data-lp-process-grid],
[data-lp-testimonials-grid] {
  gap: var(--lp-grid-gap) !important;
}

/* —— Footer alignment —— */
[data-lp-footer-inner] {
  width: 100%;
  max-width: min(var(--lp-container, 68rem), 100%);
  margin-inline: auto;
  padding-inline: var(--lp-gutter);
  box-sizing: border-box;
}

/* —— Header alignment —— */
[data-lp-header-inner] {
  width: 100%;
  max-width: min(var(--lp-container, 68rem), 100%);
  margin-inline: auto;
  padding-inline: var(--lp-gutter);
  box-sizing: border-box;
}
`.trim();
