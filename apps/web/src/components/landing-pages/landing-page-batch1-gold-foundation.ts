/**
 * Batch 1 premium visual system — service, consulting, seo, website.
 * Scoped via [data-lp-gold-standard]; extends shared gold base rules.
 */

export const LP_BATCH1_GOLD_FOUNDATION_CSS = `
/* ═══ SERVICE — local trades / booking ═══ */
[data-lp-gold-standard="local-book"] [data-lp-canvas-root],
[data-lp-gold-standard="neighborhood-trust"] [data-lp-canvas-root],
[data-lp-gold-standard="package-pro"] [data-lp-canvas-root] {
  --lp-heading-font: "Manrope", "Segoe UI", system-ui, sans-serif;
  --lp-body-font: "DM Sans", "Segoe UI", system-ui, sans-serif;
}
[data-lp-gold-standard="local-book"] [data-lp-section-tone="local"],
[data-lp-gold-standard="team-video"] [data-lp-section-tone="local"] {
  color: #134E4A;
}
[data-lp-gold-standard="job-proof"] [data-lp-section-tone="work"] {
  color: #F8FAFC;
}

/* ═══ CONSULTING — B2B advisory ═══ */
[data-lp-gold-standard="audit-cta"] [data-lp-canvas-root],
[data-lp-gold-standard="trust-credentials"] [data-lp-canvas-root],
[data-lp-gold-standard="retainer-pricing"] [data-lp-canvas-root] {
  --lp-heading-font: "IBM Plex Sans", "Segoe UI", system-ui, sans-serif;
  --lp-body-font: "IBM Plex Sans", "Segoe UI", system-ui, sans-serif;
}
[data-lp-gold-standard="audit-cta"] [data-lp-canvas-root] {
  --lp-section-y: calc(var(--lp-section-space, 2.85rem) * 0.88);
}
[data-lp-gold-standard="trust-credentials"] [data-lp-canvas-root] {
  --lp-heading-font: "Fraunces", "Palatino Linotype", Georgia, serif;
}

/* ═══ SEO — organic / data authority ═══ */
[data-lp-gold-standard="audit-kpi"] [data-lp-canvas-root],
[data-lp-gold-standard="problem-first"] [data-lp-canvas-root],
[data-lp-gold-standard="pricing-packages"] [data-lp-canvas-root] {
  --lp-heading-font: "IBM Plex Sans", "Segoe UI", system-ui, sans-serif;
  --lp-body-font: "IBM Plex Sans", "Segoe UI", system-ui, sans-serif;
}
[data-lp-gold-standard="audit-kpi"] [data-lp-section-tone="organic"] {
  color: #064E3B;
}
[data-lp-gold-standard="portfolio-gallery"] [data-lp-section-tone="authority"],
[data-lp-gold-standard="audit-kpi"] [data-lp-section-tone="authority"] {
  color: #ECFDF5;
}

/* ═══ WEBSITE — studio / craft / dev ═══ */
[data-lp-gold-standard="build-quote"] [data-lp-canvas-root],
[data-lp-gold-standard="portfolio-trust"] [data-lp-canvas-root],
[data-lp-gold-standard="package-first"] [data-lp-canvas-root] {
  --lp-heading-font: "Fraunces", "Palatino Linotype", Georgia, serif;
  --lp-body-font: "Manrope", "Segoe UI", system-ui, sans-serif;
}
[data-lp-gold-standard="build-quote"] [data-lp-section-tone="studio"],
[data-lp-gold-standard="showcase"] [data-lp-section-tone="studio"] {
  color: #F8FAFC;
}
[data-lp-gold-standard="demo-video"] [data-lp-canvas-root] {
  --lp-heading-font: "Manrope", "Segoe UI", system-ui, sans-serif;
}
[data-lp-gold-standard="minimal-quote"] [data-lp-canvas-root],
[data-lp-gold-standard="quick-book"] [data-lp-canvas-root] {
  --lp-section-y: calc(var(--lp-section-space, 2.25rem) * 0.72);
}
`.trim();
