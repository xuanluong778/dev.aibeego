/**
 * SaaS gold-standard visual system — product-led / enterprise / ai-modern.
 * Scoped via [data-lp-gold-standard]; extends shared gold base rules.
 */

export const LP_SAAS_GOLD_FOUNDATION_CSS = `
/* ═══ SaaS base tokens ═══ */
[data-lp-gold-standard="product-led"] [data-lp-canvas-root] {
  --lp-heading-font: "Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif;
  --lp-body-font: "Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif;
  --lp-section-y: calc(var(--lp-section-space, 2.75rem) * 0.86);
}
[data-lp-gold-standard="enterprise"] [data-lp-canvas-root] {
  --lp-heading-font: "IBM Plex Sans", "Segoe UI", system-ui, sans-serif;
  --lp-body-font: "IBM Plex Sans", "Segoe UI", system-ui, sans-serif;
  --lp-section-y: calc(var(--lp-section-space, 2.85rem) * 0.88);
}
[data-lp-gold-standard="ai-modern"] [data-lp-canvas-root] {
  --lp-heading-font: "Space Grotesk", "Segoe UI", system-ui, sans-serif;
  --lp-body-font: "DM Sans", "Segoe UI", system-ui, sans-serif;
  --lp-section-y: calc(var(--lp-section-space, 2.85rem) * 0.82);
}

/* Glow tone — AI sections */
[data-lp-gold-standard] [data-lp-section-tone="glow"] {
  color: #F8FAFC;
}
[data-lp-gold-standard] [data-lp-section-tone="glow"] [data-lp-section-head] p,
[data-lp-gold-standard] [data-lp-section-tone="glow"] p {
  color: #C4B5FD !important;
}

/* ═══ PRODUCT-LED — clean dashboard SaaS ═══ */
[data-lp-gold-standard="product-led"] header[data-lp-header-variant="minimal"] {
  border-bottom: 1px solid var(--lp-border) !important;
  background: color-mix(in srgb, var(--lp-surface) 94%, transparent) !important;
  backdrop-filter: blur(8px);
}
[data-lp-gold-standard="product-led"] [data-lp-variant="split-left"] [data-lp-hero-grid] {
  gap: clamp(1.5rem, 3vw, 2.75rem) !important;
  align-items: center !important;
}
[data-lp-gold-standard="product-led"] [data-lp-variant="split-left"] [data-lp-hero-copy] h1 {
  font-size: clamp(2rem, 4.5vw, 3.15rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
  font-weight: 800;
  max-width: 16ch;
}
[data-lp-gold-standard="product-led"] [data-lp-variant="split-left"] [data-lp-hero-copy] p {
  font-size: clamp(0.975rem, 1.85vw, 1.0625rem);
  line-height: 1.65;
  max-width: 42ch;
}
[data-lp-gold-standard="product-led"] [data-lp-hero-cta] a {
  min-width: 12.5rem;
  padding: 0.9rem 1.75rem !important;
  font-weight: 700 !important;
  box-shadow: 0 12px 32px color-mix(in srgb, var(--lp-primary) 38%, transparent);
}
[data-lp-gold-standard="product-led"] [data-lp-gallery-variant="masonry"] [data-lp-card-item] {
  border-radius: var(--lp-radius-lg, calc(var(--lp-radius) + 4px));
  overflow: hidden;
  box-shadow: var(--lp-shadow-lg, 0 16px 44px rgba(79, 70, 229, 0.14));
  border: 1px solid color-mix(in srgb, var(--lp-border) 80%, transparent);
}
[data-lp-gold-standard="product-led"] [data-lp-list-variant="alternating"] [data-lp-card-item] {
  border: 1px solid var(--lp-border);
  border-radius: var(--lp-radius-lg, calc(var(--lp-radius) + 4px));
  padding: 1.5rem 1.65rem;
  box-shadow: var(--lp-card-shadow);
}
[data-lp-gold-standard="product-led"] [data-lp-pricing-variant="comparison"] [data-lp-pricing-table] th[data-lp-featured="1"] {
  background: color-mix(in srgb, var(--lp-primary) 12%, var(--lp-surface) 88%);
}
[data-lp-gold-standard="product-led"] [data-lp-conversion-zone="form"] [data-lp-form-split] {
  max-width: min(var(--lp-container, 72rem), 100%);
  margin-inline: auto;
  gap: clamp(1.5rem, 3vw, 2.5rem);
}

/* ═══ ENTERPRISE — corporate trust ═══ */
[data-lp-gold-standard="enterprise"] header[data-lp-header-variant] {
  border-bottom: 1px solid color-mix(in srgb, var(--lp-border) 70%, transparent) !important;
}
[data-lp-gold-standard="enterprise"] [data-lp-variant="centered"] [data-lp-hero-copy] {
  max-width: var(--lp-text-width, 40rem);
  margin-inline: auto;
  padding-block: clamp(1.5rem, 4vw, 2.25rem);
}
[data-lp-gold-standard="enterprise"] [data-lp-variant="centered"] [data-lp-hero-copy] h1 {
  font-size: clamp(2.05rem, 4.2vw, 3rem);
  line-height: 1.12;
  letter-spacing: -0.028em;
  font-weight: 700;
}
[data-lp-gold-standard="enterprise"] [data-lp-section-tone="cream"] [data-lp-hero-trust] li {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--lp-secondary) !important;
}
[data-lp-gold-standard="enterprise"] [data-lp-testimonials-variant="metric-plus-quote"] [data-lp-metric] {
  font-size: clamp(1.5rem, 2.8vw, 2rem);
  font-weight: 800;
  color: var(--lp-primary) !important;
}
[data-lp-gold-standard="enterprise"] [data-lp-list-variant="numbered"] [data-lp-card-item] {
  border: 1px solid var(--lp-border);
  border-radius: var(--lp-radius-md, var(--lp-radius));
  padding: 1.35rem 1.5rem;
  box-shadow: var(--lp-card-shadow);
}
[data-lp-gold-standard="enterprise"] [data-lp-guarantee-variant="banner"] > div {
  font-size: clamp(0.9375rem, 1.8vw, 1.025rem);
  line-height: 1.6;
  max-width: min(var(--lp-container, 68rem), 100%);
  margin-inline: auto;
}
[data-lp-gold-standard="enterprise"] [data-lp-process-variant="timeline"] [data-lp-timeline-node] {
  border-left: 2px solid color-mix(in srgb, var(--lp-primary) 35%, transparent);
  padding-left: 1.35rem;
}
[data-lp-gold-standard="enterprise"] [data-lp-conversion-zone="form"] [data-lp-form-card] {
  max-width: 28rem;
  margin-inline: auto;
  border: 2px solid color-mix(in srgb, var(--lp-primary) 22%, var(--lp-border));
}

/* ═══ AI MODERN — dark gradient workflow ═══ */
[data-lp-gold-standard="ai-modern"] header[data-lp-header-variant="minimal"] {
  border-bottom: 1px solid color-mix(in srgb, #fff 8%, transparent) !important;
  backdrop-filter: blur(10px);
}
[data-lp-gold-standard="ai-modern"] [data-lp-variant="editorial-overlay"] {
  min-height: min(88vh, 900px);
  display: flex;
  align-items: flex-end;
}
[data-lp-gold-standard="ai-modern"] [data-lp-variant="editorial-overlay"] [data-lp-hero-copy] h1 {
  font-size: clamp(2.25rem, 5vw, 3.65rem);
  line-height: 1.06;
  letter-spacing: -0.025em;
  max-width: 14ch;
  font-weight: 700;
  color: #F8FAFC !important;
}
[data-lp-gold-standard="ai-modern"] [data-lp-variant="editorial-overlay"] [data-lp-hero-copy] p {
  color: #C4B5FD !important;
  max-width: 40ch;
  line-height: 1.6;
}
[data-lp-gold-standard="ai-modern"] [data-lp-hero-cta] a {
  background: var(--lp-primary) !important;
  color: #0B0F1A !important;
  font-weight: 700 !important;
  box-shadow: 0 14px 40px color-mix(in srgb, var(--lp-primary) 45%, transparent);
}
[data-lp-gold-standard="ai-modern"] [data-lp-section-tone="dark"],
[data-lp-gold-standard="ai-modern"] [data-lp-section-tone="glow"] {
  color: #F8FAFC;
}
[data-lp-gold-standard="ai-modern"] [data-lp-video-shell] {
  border: 1px solid color-mix(in srgb, var(--lp-primary) 30%, transparent);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
}
[data-lp-gold-standard="ai-modern"] [data-lp-list-variant="icon-grid"] [data-lp-card-item] {
  background: color-mix(in srgb, var(--lp-surface) 92%, #000 8%);
  border: 1px solid color-mix(in srgb, var(--lp-primary) 25%, transparent);
  border-radius: var(--lp-radius-md, var(--lp-radius));
  padding: 1.35rem 1.4rem;
  box-shadow: var(--lp-card-shadow);
}
[data-lp-gold-standard="ai-modern"] [data-lp-gallery-variant="editorial-mosaic"] [data-lp-gallery-featured] {
  border: 1px solid color-mix(in srgb, var(--lp-primary) 35%, transparent);
  box-shadow: 0 22px 55px rgba(0, 0, 0, 0.4);
}
[data-lp-gold-standard="ai-modern"] [data-lp-testimonials-variant="editorial"] [data-lp-card-item] {
  border-left: 3px solid color-mix(in srgb, var(--lp-primary) 50%, transparent);
  padding-left: 1.25rem;
  background: transparent;
  box-shadow: none;
}
[data-lp-gold-standard="ai-modern"] [data-lp-section-tone="dark"] [data-lp-form-split],
[data-lp-gold-standard="ai-modern"] [data-lp-section-tone="dark"] [data-lp-form-card] form#lead-form {
  border: 1px solid color-mix(in srgb, var(--lp-primary) 30%, transparent);
  background: color-mix(in srgb, var(--lp-surface) 90%, #000 10%) !important;
}

/* Shared SaaS gold — pricing, CTA, forms */
[data-lp-gold-standard="product-led"] [data-lp-cta-band],
[data-lp-gold-standard="enterprise"] [data-lp-cta-split],
[data-lp-gold-standard="ai-modern"] [data-lp-cta-band] {
  border-radius: var(--lp-radius-lg, calc(var(--lp-radius) + 4px)) !important;
}
[data-lp-gold-standard] [data-lp-pricing-card][data-lp-featured="1"] {
  border: 2px solid color-mix(in srgb, var(--lp-primary) 45%, transparent);
  box-shadow: var(--lp-shadow-lg, var(--lp-shadow));
}
[data-lp-gold-standard] [data-lp-form-card] button[type="submit"] {
  font-weight: 700 !important;
  min-height: 48px;
}

/* Responsive */
[data-lp-viewport="mobile"] [data-lp-gold-standard="ai-modern"] [data-lp-variant="editorial-overlay"] {
  min-height: auto;
}
[data-lp-viewport="mobile"] [data-lp-gold-standard="product-led"] [data-lp-variant="split-left"] [data-lp-hero-copy] h1 {
  max-width: none;
}

/* ═══ TRUST-FIRST — social proof + integrations ═══ */
[data-lp-gold-standard="trust-first"] [data-lp-canvas-root] {
  --lp-heading-font: "Inter", "Segoe UI", system-ui, sans-serif;
  --lp-body-font: "Inter", "Segoe UI", system-ui, sans-serif;
}
[data-lp-gold-standard="trust-first"] [data-lp-testimonials-variant="metric-plus-quote"] [data-lp-metric] {
  font-size: clamp(1.4rem, 2.6vw, 1.85rem);
  font-weight: 800;
  color: var(--lp-primary) !important;
}
[data-lp-gold-standard="trust-first"] [data-lp-gallery-variant="masonry"] [data-lp-card-item] {
  border: 1px solid color-mix(in srgb, var(--lp-primary) 22%, var(--lp-border));
  box-shadow: var(--lp-card-shadow);
}

/* ═══ WORKFLOW-STORY — process + video demo ═══ */
[data-lp-gold-standard="workflow-story"] [data-lp-canvas-root] {
  --lp-heading-font: "Manrope", "Segoe UI", system-ui, sans-serif;
  --lp-body-font: "Manrope", "Segoe UI", system-ui, sans-serif;
}
[data-lp-gold-standard="workflow-story"] [data-lp-variant="minimal-copy"] [data-lp-hero-copy] h1 {
  font-size: clamp(1.95rem, 4vw, 2.85rem);
  line-height: 1.12;
  max-width: 18ch;
}
[data-lp-gold-standard="workflow-story"] [data-lp-process-variant="timeline"] [data-lp-timeline-node] {
  border-left: 2px solid color-mix(in srgb, var(--lp-primary) 40%, transparent);
  padding-left: 1.25rem;
}

/* ═══ UI-GALLERY — gallery-first product proof ═══ */
[data-lp-gold-standard="ui-gallery"] [data-lp-canvas-root] {
  --lp-heading-font: "Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif;
}
[data-lp-gold-standard="ui-gallery"] [data-lp-gallery-variant="editorial-mosaic"] [data-lp-gallery-featured] {
  border: 1px solid var(--lp-border);
  box-shadow: var(--lp-shadow-lg, 0 20px 50px rgba(124, 58, 237, 0.15));
}
[data-lp-gold-standard="ui-gallery"] [data-lp-section-tone="dark"] [data-lp-gallery-variant="editorial-mosaic"] {
  color: #F8FAFC;
}

/* ═══ FAQ-TRIAL — objection handling ═══ */
[data-lp-gold-standard="faq-trial"] [data-lp-canvas-root] {
  --lp-heading-font: "IBM Plex Sans", "Segoe UI", system-ui, sans-serif;
}
[data-lp-gold-standard="faq-trial"] [data-lp-variant="centered"] [data-lp-hero-copy] {
  max-width: 38rem;
  margin-inline: auto;
}
[data-lp-gold-standard="faq-trial"] [data-lp-faq-variant="accordion"] [data-lp-card-item] {
  border: 1px solid var(--lp-border);
  border-radius: var(--lp-radius-md, var(--lp-radius));
}

/* ═══ NAV-PRODUCT — pricing-forward self-serve ═══ */
[data-lp-gold-standard="nav-product"] [data-lp-canvas-root] {
  --lp-heading-font: "Inter", "Segoe UI", system-ui, sans-serif;
}
[data-lp-gold-standard="nav-product"] header[data-lp-header-variant="default"] {
  border-bottom: 1px solid var(--lp-border) !important;
}
[data-lp-gold-standard="nav-product"] [data-lp-pricing-variant="comparison"] [data-lp-pricing-table] th[data-lp-featured="1"] {
  background: color-mix(in srgb, var(--lp-primary) 14%, var(--lp-surface) 86%);
}

/* ═══ EARLY-TRIAL — form-first conversion ═══ */
[data-lp-gold-standard="early-trial"] [data-lp-canvas-root] {
  --lp-heading-font: "Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif;
}
[data-lp-gold-standard="early-trial"] [data-lp-variant="floating-card"] [data-lp-hero-grid] {
  gap: clamp(1.25rem, 2.5vw, 2rem) !important;
}
[data-lp-gold-standard="early-trial"] [data-lp-conversion-zone="form"] [data-lp-form-inline] {
  max-width: min(var(--lp-container, 72rem), 100%);
  margin-inline: auto;
}

/* ═══ MINIMAL-TRIAL — compact high-intent ═══ */
[data-lp-gold-standard="minimal-trial"] [data-lp-canvas-root] {
  --lp-heading-font: "Inter", "Segoe UI", system-ui, sans-serif;
  --lp-section-y: calc(var(--lp-section-space, 2.25rem) * 0.72);
}
[data-lp-gold-standard="minimal-trial"] [data-lp-variant="minimal-copy"] [data-lp-hero-copy] h1 {
  font-size: clamp(1.85rem, 3.8vw, 2.75rem);
  line-height: 1.15;
  max-width: 20ch;
  margin-inline: auto;
  text-align: center;
}
[data-lp-gold-standard="minimal-trial"] [data-lp-list-variant="minimal-list"] [data-lp-card-item] {
  border: none;
  box-shadow: none;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--lp-border);
}
`.trim();
