/**
 * Clinic gold-standard visual system — trust-clinical / care-warm / premium-medical.
 * Scoped via [data-lp-gold-standard]; extends agency gold base rules.
 */

export const LP_CLINIC_GOLD_FOUNDATION_CSS = `
/* ═══ Clinic base tokens ═══ */
[data-lp-gold-standard="trust-clinical"] [data-lp-canvas-root] {
  --lp-heading-font: "Manrope", "Segoe UI", system-ui, sans-serif;
  --lp-body-font: "Manrope", "Segoe UI", system-ui, sans-serif;
  --lp-section-y: calc(var(--lp-section-space, 2.75rem) * 0.86);
}
[data-lp-gold-standard="care-warm"] [data-lp-canvas-root] {
  --lp-heading-font: "Fraunces", "Palatino Linotype", Georgia, serif;
  --lp-body-font: "DM Sans", "Segoe UI", system-ui, sans-serif;
  --lp-section-y: calc(var(--lp-section-space, 2.85rem) * 0.9);
  --lp-section-mult: 1;
}
[data-lp-gold-standard="premium-medical"] [data-lp-canvas-root] {
  --lp-heading-font: "Cormorant Garamond", "Palatino Linotype", Georgia, serif;
  --lp-body-font: "DM Sans", "Segoe UI", system-ui, sans-serif;
  --lp-section-y: calc(var(--lp-section-space, 2.85rem) * 0.82);
}

/* Sage tone — care-warm sections */
[data-lp-gold-standard] [data-lp-section-tone="sage"] {
  color: #3D5248;
}
[data-lp-gold-standard] [data-lp-section-tone="sage"] [data-lp-section-head] p,
[data-lp-gold-standard] [data-lp-section-tone="sage"] p {
  color: #6B7A6E !important;
}

/* ═══ TRUST CLINICAL — clean teal, doctor + booking focal ═══ */
[data-lp-gold-standard="trust-clinical"] header[data-lp-header-variant] {
  border-bottom: 1px solid color-mix(in srgb, var(--lp-primary) 22%, transparent) !important;
  background: color-mix(in srgb, var(--lp-surface) 96%, var(--lp-primary) 4%) !important;
}
[data-lp-gold-standard="trust-clinical"] [data-lp-variant="split-left"] [data-lp-hero-grid] {
  gap: clamp(1.5rem, 3vw, 2.75rem) !important;
  align-items: center !important;
}
[data-lp-gold-standard="trust-clinical"] [data-lp-variant="split-left"] [data-lp-hero-copy] h1 {
  font-size: clamp(2rem, 4.2vw, 3rem);
  line-height: 1.12;
  letter-spacing: -0.028em;
  font-weight: 700;
  max-width: 18ch;
}
[data-lp-gold-standard="trust-clinical"] [data-lp-variant="split-left"] [data-lp-hero-copy] p {
  font-size: clamp(0.975rem, 1.85vw, 1.0625rem);
  line-height: 1.65;
  max-width: 44ch;
}
[data-lp-gold-standard="trust-clinical"] [data-lp-hero-trust] li {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--lp-primary) !important;
}
[data-lp-gold-standard="trust-clinical"] [data-lp-hero-cta] a {
  min-width: 12.5rem;
  padding: 0.9rem 1.75rem !important;
  font-weight: 700 !important;
  box-shadow: 0 10px 28px color-mix(in srgb, var(--lp-primary) 35%, transparent);
}
[data-lp-gold-standard="trust-clinical"] [data-lp-list-variant="icon-grid"] [data-lp-card-item] {
  border: 1px solid color-mix(in srgb, var(--lp-primary) 18%, var(--lp-border));
  border-radius: var(--lp-radius-md, var(--lp-radius));
  padding: 1.35rem 1.4rem;
  box-shadow: var(--lp-card-shadow);
  background: var(--lp-surface);
}
[data-lp-gold-standard="trust-clinical"] [data-lp-conversion-zone="form"] [data-lp-form-card] {
  max-width: min(var(--lp-container, 68rem), 100%);
  margin-inline: auto;
  border: 2px solid color-mix(in srgb, var(--lp-primary) 35%, transparent);
  border-radius: var(--lp-radius-lg, calc(var(--lp-radius) + 4px));
  box-shadow: var(--lp-shadow-lg, var(--lp-shadow));
  padding: clamp(1.25rem, 2.5vw, 1.75rem);
}
[data-lp-gold-standard="trust-clinical"] [data-lp-conversion-zone="form"] button[type="submit"] {
  background: var(--lp-primary) !important;
  min-height: 50px;
  font-size: 1rem !important;
}

/* ═══ CARE WARM — empathetic cream/sage ═══ */
[data-lp-gold-standard="care-warm"] [data-lp-variant="centered"] [data-lp-hero-copy] {
  max-width: var(--lp-text-width, 36rem);
  margin-inline: auto;
  padding-block: clamp(1.5rem, 4vw, 2.25rem);
}
[data-lp-gold-standard="care-warm"] [data-lp-variant="centered"] [data-lp-hero-copy] h1 {
  font-size: clamp(2.05rem, 4.6vw, 3.2rem);
  line-height: 1.12;
  letter-spacing: -0.03em;
}
[data-lp-gold-standard="care-warm"] [data-lp-section-tone="cream"] [data-lp-variant="centered"] [data-lp-hero-copy] p {
  color: #6B7A6E !important;
  line-height: 1.7;
}
[data-lp-gold-standard="care-warm"] [data-lp-list-variant="editorial-list"] [data-lp-cards-grid] {
  max-width: var(--lp-text-width, 36rem);
  margin-inline: auto;
}
[data-lp-gold-standard="care-warm"] [data-lp-list-variant="editorial-list"] [data-lp-card-item] {
  border: none;
  box-shadow: none;
  background: transparent;
  padding: 0.85rem 0;
  border-bottom: 1px solid color-mix(in srgb, var(--lp-border) 55%, transparent);
}
[data-lp-gold-standard="care-warm"] [data-lp-process-variant="timeline"] [data-lp-timeline-node] {
  border-left: 2px solid color-mix(in srgb, var(--lp-primary) 45%, transparent);
  padding-left: 1.35rem;
}
[data-lp-gold-standard="care-warm"] [data-lp-testimonials-variant="editorial"] [data-lp-card-item] {
  border: none;
  box-shadow: none;
  padding: 1.25rem 0;
  border-left: 3px solid color-mix(in srgb, var(--lp-primary) 40%, transparent);
  padding-left: 1.25rem;
}
[data-lp-gold-standard="care-warm"] [data-lp-conversion-zone="form"] {
  padding-bottom: calc(var(--lp-section-y) * 0.3) !important;
}
[data-lp-gold-standard="care-warm"] [data-lp-conversion-zone="form"] + [data-lp-conversion-zone="cta"] {
  padding-top: 0 !important;
}

/* ═══ PREMIUM MEDICAL — navy + gold accent ═══ */
[data-lp-gold-standard="premium-medical"] header[data-lp-header-variant] {
  border-bottom: 1px solid color-mix(in srgb, #fff 8%, transparent) !important;
  backdrop-filter: blur(8px);
}
[data-lp-gold-standard="premium-medical"] header[data-lp-header-variant] nav {
  color: #A8B4C4 !important;
}
[data-lp-gold-standard="premium-medical"] [data-lp-variant="editorial-overlay"] {
  min-height: min(86vh, 880px);
  display: flex;
  align-items: flex-end;
}
[data-lp-gold-standard="premium-medical"] [data-lp-variant="editorial-overlay"] [data-lp-hero-copy] h1 {
  font-size: clamp(2.25rem, 5.2vw, 3.65rem);
  line-height: 1.06;
  letter-spacing: -0.02em;
  max-width: 14ch;
  font-weight: 600;
  color: #F5F3EE !important;
}
[data-lp-gold-standard="premium-medical"] [data-lp-variant="editorial-overlay"] [data-lp-hero-copy] p {
  font-size: clamp(1rem, 2vw, 1.125rem);
  line-height: 1.6;
  max-width: 40ch;
  color: #C8D0DC !important;
}
[data-lp-gold-standard="premium-medical"] [data-lp-hero-cta] a {
  min-width: 13rem;
  padding: 0.95rem 1.85rem !important;
  font-weight: 700 !important;
  background: var(--lp-primary) !important;
  color: #0B1A2E !important;
  box-shadow: 0 14px 36px color-mix(in srgb, var(--lp-primary) 45%, transparent);
}
[data-lp-gold-standard="premium-medical"] [data-lp-section-tone="dark"] {
  color: #F5F3EE;
}
[data-lp-gold-standard="premium-medical"] [data-lp-gallery-variant="editorial-mosaic"] [data-lp-gallery-featured] {
  border: 1px solid color-mix(in srgb, var(--lp-primary) 25%, transparent);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
}
[data-lp-gold-standard="premium-medical"] [data-lp-testimonials-variant="metric-plus-quote"] [data-lp-metric] {
  color: var(--lp-primary) !important;
  font-size: clamp(1.75rem, 3vw, 2.25rem);
}
[data-lp-gold-standard="premium-medical"] [data-lp-conversion-zone="cta"] + [data-lp-conversion-zone="form"],
[data-lp-gold-standard="premium-medical"] [data-lp-conversion-zone="form"] + [data-lp-conversion-zone="cta"] {
  padding-top: calc(var(--lp-section-y) * 0.25) !important;
}
[data-lp-gold-standard="premium-medical"] [data-lp-section-tone="dark"] [data-lp-form-block],
[data-lp-gold-standard="premium-medical"] [data-lp-section-tone="dark"] [data-lp-form-card] form#lead-form {
  border: 1px solid color-mix(in srgb, var(--lp-primary) 30%, transparent);
  background: color-mix(in srgb, var(--lp-surface) 92%, #000 8%) !important;
}

/* Speaker / credentials — focal across clinic gold */
[data-lp-gold-standard="trust-clinical"] section[aria-label="Speaker"] .flex.flex-col.gap-4,
[data-lp-gold-standard="care-warm"] section[aria-label="Speaker"] .flex.flex-col.gap-4 {
  border: 1px solid color-mix(in srgb, var(--lp-primary) 20%, var(--lp-border)) !important;
  box-shadow: var(--lp-card-shadow) !important;
  padding: 1.5rem !important;
  border-radius: var(--lp-radius-md, var(--lp-radius)) !important;
}
[data-lp-gold-standard="premium-medical"] section[aria-label="Speaker"] .flex.flex-col.gap-4 {
  border: 1px solid color-mix(in srgb, var(--lp-primary) 35%, transparent) !important;
  background: color-mix(in srgb, var(--lp-surface) 90%, #000 10%) !important;
  padding: 1.65rem !important;
  box-shadow: var(--lp-card-shadow) !important;
}

/* Guarantee trust badges */
[data-lp-gold-standard] [data-lp-guarantee-variant="banner"] > div {
  max-width: min(var(--lp-container, 68rem), 100%);
  margin-inline: auto;
  padding-inline: var(--lp-gutter);
  box-sizing: border-box;
  border-radius: var(--lp-radius-md, var(--lp-radius));
  font-size: clamp(0.9375rem, 1.8vw, 1.025rem);
  line-height: 1.55;
}

/* Booking form emphasis — all clinic gold */
[data-lp-gold-standard="trust-clinical"] [data-lp-form-booking-strip="1"],
[data-lp-gold-standard="care-warm"] [data-lp-form-booking-strip="1"] {
  font-weight: 700;
  letter-spacing: -0.01em;
  border-bottom-color: color-mix(in srgb, var(--lp-primary) 25%, transparent) !important;
}
[data-lp-gold-standard] [data-lp-form-variant="booking"] button[type="submit"],
[data-lp-gold-standard] [data-lp-conversion-zone="form"] button[type="submit"] {
  font-weight: 700 !important;
  min-height: 48px;
  letter-spacing: 0.01em;
}

/* Responsive clinic gold */
[data-lp-viewport="mobile"] [data-lp-gold-standard="premium-medical"] [data-lp-variant="editorial-overlay"] {
  min-height: auto;
}
[data-lp-viewport="mobile"] [data-lp-gold-standard="trust-clinical"] [data-lp-variant="split-left"] [data-lp-hero-copy] h1 {
  max-width: none;
}
`.trim();
