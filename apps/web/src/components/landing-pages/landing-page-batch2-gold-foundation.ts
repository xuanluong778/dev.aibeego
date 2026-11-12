/**
 * Batch 2 premium visual system — product, fashion, cosmetics (ecommerce).
 * Scoped via [data-lp-gold-standard]; extends shared gold base rules.
 */

export const LP_BATCH2_GOLD_FOUNDATION_CSS = `
/* ═══ PRODUCT — SKU / buy-first ═══ */
[data-lp-gold-standard="buy-path"] [data-lp-canvas-root],
[data-lp-gold-standard="trust-reviews"] [data-lp-canvas-root],
[data-lp-gold-standard="price-compare"] [data-lp-canvas-root] {
  --lp-heading-font: "Manrope", "Segoe UI", system-ui, sans-serif;
  --lp-body-font: "DM Sans", "Segoe UI", system-ui, sans-serif;
}
[data-lp-gold-standard="buy-path"] [data-lp-section-tone="showcase"],
[data-lp-gold-standard="lookbook"] [data-lp-section-tone="showcase"] {
  color: #F8FAFC;
}
[data-lp-gold-standard="trust-reviews"] [data-lp-section-tone="dark"] {
  color: #F5F5F4;
}
[data-lp-gold-standard="how-it-works"] [data-lp-canvas-root],
[data-lp-gold-standard="demo-reel"] [data-lp-canvas-root] {
  --lp-heading-font: "Manrope", "Segoe UI", system-ui, sans-serif;
}
[data-lp-gold-standard="lookbook"] [data-lp-canvas-root] {
  --lp-heading-font: "Fraunces", "Palatino Linotype", Georgia, serif;
  --lp-body-font: "DM Sans", "Segoe UI", system-ui, sans-serif;
}
[data-lp-gold-standard="minimal-buy"] [data-lp-canvas-root],
[data-lp-gold-standard="early-order"] [data-lp-canvas-root] {
  --lp-section-y: calc(var(--lp-section-space, 2.25rem) * 0.72);
}

/* ═══ FASHION — editorial / limited drop ═══ */
[data-lp-gold-standard="drop-buy"] [data-lp-canvas-root],
[data-lp-gold-standard="trust-fit"] [data-lp-canvas-root],
[data-lp-gold-standard="price-drop"] [data-lp-canvas-root] {
  --lp-heading-font: "Fraunces", "Palatino Linotype", Georgia, serif;
  --lp-body-font: "DM Sans", "Segoe UI", system-ui, sans-serif;
}
[data-lp-gold-standard="drop-buy"] [data-lp-section-tone="editorial"],
[data-lp-gold-standard="runway-video"] [data-lp-section-tone="editorial"] {
  color: #FAFAF9;
}
[data-lp-gold-standard="style-guide"] [data-lp-canvas-root] {
  --lp-heading-font: "Manrope", "Segoe UI", system-ui, sans-serif;
}
[data-lp-gold-standard="lookbook"] [data-lp-section-tone="editorial"] {
  color: #1C1917;
}
[data-lp-gold-standard="minimal-drop"] [data-lp-canvas-root],
[data-lp-gold-standard="early-preorder"] [data-lp-canvas-root] {
  --lp-section-y: calc(var(--lp-section-space, 2.25rem) * 0.72);
}

/* ═══ COSMETICS — beauty / clinical routine ═══ */
[data-lp-gold-standard="trust-skin"] [data-lp-canvas-root],
[data-lp-gold-standard="kit-pricing"] [data-lp-canvas-root] {
  --lp-heading-font: "Cormorant Garamond", "Palatino Linotype", Georgia, serif;
  --lp-body-font: "DM Sans", "Segoe UI", system-ui, sans-serif;
}
[data-lp-gold-standard="buy-path"] [data-lp-section-tone="beauty"],
[data-lp-gold-standard="routine"] [data-lp-section-tone="beauty"] {
  color: #1A1A1A;
}
[data-lp-gold-standard="trust-skin"] [data-lp-section-tone="clinical"] {
  color: #F8FAFC;
}
[data-lp-gold-standard="tutorial"] [data-lp-canvas-root] {
  --lp-heading-font: "Manrope", "Segoe UI", system-ui, sans-serif;
}
[data-lp-gold-standard="minimal-buy"] [data-lp-canvas-root] {
  --lp-section-y: calc(var(--lp-section-space, 2.2rem) * 0.7);
}
`.trim();
