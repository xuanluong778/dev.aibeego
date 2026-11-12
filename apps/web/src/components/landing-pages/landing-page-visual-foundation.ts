/**
 * Global visual quality system — all 200 catalog templates.
 * Scoped via [data-lp-canvas-root]; no per-slug rules.
 *
 * v21: section shells live inside [data-lp-block-slot] > [data-lp-section-chrome] > section
 * (not direct children of canvas root).
 */

/** Block-level section shell — matches renderer DOM (SelectableShell wrapper). */
const LP_SECTION = '[data-lp-canvas-root] [data-lp-section-chrome] > section';
const LP_HEADER = '[data-lp-canvas-root] [data-lp-section-chrome] > header';
const LP_FOOTER = '[data-lp-canvas-root] [data-lp-section-chrome] > footer';
const LP_SECTION_SHELL = `${LP_SECTION}, ${LP_HEADER}, ${LP_FOOTER}`;

export const LP_VISUAL_FOUNDATION_CSS = `
/* ═══ Page container axis (all categories) ═══ */
[data-lp-canvas-root] {
  --lp-gutter: clamp(1rem, 3.2vw, 1.5rem);
  --lp-section-y: clamp(1.35rem, calc(var(--lp-section-space, 2.5rem) * var(--lp-section-mult, 1) * 0.82), 4.25rem);
  --lp-text-on-light: #0f172a;
  --lp-muted-on-light: #475569;
  --lp-muted-safe: color-mix(in srgb, var(--lp-text-on-light) 72%, var(--lp-surface, #fff) 28%);
  --lp-card-shadow-elevated: 0 10px 28px rgba(15, 23, 42, 0.11), 0 2px 8px rgba(15, 23, 42, 0.06);
  overflow-x: clip;
  width: 100%;
  max-width: 100%;
}
/* Every *-gold-system.ts file (agency/clinic/consulting/cosmetics/fashion/
   product/saas/seo/service/website) assigns each section a tone name whose
   background is EITHER a literal, fixed hex gradient (always light, or
   always dark, regardless of the page's theme) OR var(--lp-surface)/var(
   --lp-canvas) (which correctly tracks the theme, light or dark). Only the
   literal ones need pinning here — "surface"/"canvas" must keep inheriting
   the theme-aware value from extendedTokenStyle. Enumerated from every
   goldSectionBackground() across all ten files; "glow" means opposite things
   in two different verticals (light in cosmetics, dark in saas) so it's
   scoped by data-lp-category instead of matched bare. */
[data-lp-section-tone="cream"],
[data-lp-section-tone="sage"],
[data-lp-section-tone="corporate"],
[data-lp-section-tone="warm"],
[data-lp-section-tone="beauty"],
[data-lp-section-tone="clinical"],
[data-lp-section-tone="editorial"],
[data-lp-section-tone="showcase"],
[data-lp-section-tone="organic"],
[data-lp-section-tone="data"],
[data-lp-section-tone="local"],
[data-lp-section-tone="trust"],
[data-lp-section-tone="craft"],
[data-lp-section-tone="dev"],
[data-lp-category="cosmetics"] [data-lp-section-tone="glow"] {
  --lp-text-on-light: #0f172a;
  --lp-muted-on-light: #475569;
}
/* Cards' own background is var(--lp-surface) (see [data-lp-card-item] below)
   — theme-wide, so it tracks the SAME dark value on an all-dark theme even
   when the card happens to sit inside one of these always-literally-light
   bands. Force a plain light card background here so the (correctly dark,
   from the rule above) card text isn't dark-on-dark again. */
[data-lp-section-tone="cream"] [data-lp-card-item],
[data-lp-section-tone="sage"] [data-lp-card-item],
[data-lp-section-tone="corporate"] [data-lp-card-item],
[data-lp-section-tone="warm"] [data-lp-card-item],
[data-lp-section-tone="beauty"] [data-lp-card-item],
[data-lp-section-tone="clinical"] [data-lp-card-item],
[data-lp-section-tone="editorial"] [data-lp-card-item],
[data-lp-section-tone="showcase"] [data-lp-card-item],
[data-lp-section-tone="organic"] [data-lp-card-item],
[data-lp-section-tone="data"] [data-lp-card-item],
[data-lp-section-tone="local"] [data-lp-card-item],
[data-lp-section-tone="trust"] [data-lp-card-item],
[data-lp-section-tone="craft"] [data-lp-card-item],
[data-lp-section-tone="dev"] [data-lp-card-item],
[data-lp-category="cosmetics"] [data-lp-section-tone="glow"] [data-lp-card-item] {
  background: #ffffff !important;
}
[data-lp-canvas-root] [data-lp-container-inner],
[data-lp-canvas-root] [data-lp-header-inner],
[data-lp-canvas-root] [data-lp-footer-inner],
[data-lp-canvas-root] .max-w-3xl,
[data-lp-canvas-root] .max-w-5xl,
[data-lp-canvas-root] .max-w-6xl {
  width: 100%;
  max-width: min(var(--lp-container, 68rem), 100%);
  margin-inline: auto;
  padding-inline: var(--lp-gutter);
  box-sizing: border-box;
}
${LP_SECTION}[class*="px-"],
${LP_HEADER}[class*="px-"],
${LP_FOOTER}[class*="px-"] {
  padding-inline: 0 !important;
}
${LP_SECTION_SHELL} {
  padding-block: var(--lp-section-y);
  box-sizing: border-box;
}
${LP_SECTION}:empty,
${LP_HEADER}:empty,
${LP_FOOTER}:empty {
  display: none !important;
  padding: 0 !important;
  min-height: 0 !important;
}

/* Same-tone adjacency — tighten vertical rhythm between consecutive blocks */
[data-lp-block-slot]:has([data-lp-section-tone="cream"]) + [data-lp-block-slot]:has([data-lp-section-tone="cream"]) ${LP_SECTION},
[data-lp-block-slot]:has([data-lp-section-tone="surface"]) + [data-lp-block-slot]:has([data-lp-section-tone="surface"]) ${LP_SECTION},
[data-lp-block-slot]:has([data-lp-section-tone="canvas"]) + [data-lp-block-slot]:has([data-lp-section-tone="canvas"]) ${LP_SECTION} {
  padding-top: calc(var(--lp-section-y) * 0.4) !important;
}

/* ═══ Media — object-fit, aspect ratio, no broken chrome ═══ */
[data-lp-content-image] {
  object-fit: cover;
  object-position: center;
  max-width: 100%;
  vertical-align: middle;
}
[data-lp-img-fallback] {
  width: 100%;
  min-height: 0;
  object-fit: cover;
}
[data-lp-img-fallback-label] {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
[data-lp-hero-visual] [data-lp-content-image],
[data-lp-hero-visual] [data-lp-img-fallback] {
  width: 100%;
  max-height: min(520px, 72vh);
}
[data-lp-gallery-fallback],
[data-lp-img-fallback] {
  border-radius: var(--lp-image-radius, var(--lp-radius));
  border: 1px solid color-mix(in srgb, var(--lp-border, #e2e8f0) 65%, transparent);
}
[data-lp-video-shell] {
  aspect-ratio: 16 / 9;
  min-height: 0;
  background: color-mix(in srgb, var(--lp-secondary) 8%, var(--lp-surface));
}
[data-lp-video-shell] iframe,
[data-lp-video-shell] img[data-lp-content-image] {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ═══ Typography + contrast + overflow guard ═══ */
[data-lp-section-tone="cream"],
[data-lp-section-tone="canvas"],
[data-lp-section-tone="surface"],
[data-lp-section-tone="editorial"] {
  color: var(--lp-text-on-light);
}
[data-lp-section-tone="cream"] [data-lp-section-head] h2,
[data-lp-section-tone="canvas"] [data-lp-section-head] h2,
[data-lp-section-tone="surface"] [data-lp-section-head] h2,
[data-lp-section-tone="editorial"] [data-lp-section-head] h2 {
  color: var(--lp-text-on-light) !important;
}
[data-lp-section-tone="cream"] [data-lp-section-head] p,
[data-lp-section-tone="canvas"] [data-lp-section-head] p,
[data-lp-section-tone="surface"] [data-lp-section-head] p,
[data-lp-section-tone="editorial"] [data-lp-section-head] p {
  color: var(--lp-muted-on-light) !important;
}
[data-lp-canvas-root] p,
[data-lp-canvas-root] li,
[data-lp-canvas-root] [data-lp-section-head] p {
  color: var(--lp-muted-safe);
}
[data-lp-section-tone="dark"] p,
[data-lp-section-tone="dark"] li,
[data-lp-section-tone="accent"] p,
[data-lp-section-tone="accent"] li,
[data-lp-gold-standard] [data-lp-section-tone="dark"] p,
[data-lp-gold-standard] [data-lp-section-tone="dark"] li {
  color: inherit;
}
[data-lp-hero-copy] p,
[data-lp-hero-copy] [data-lp-inline-field="subheadline"] {
  color: var(--lp-muted-safe) !important;
}
[data-lp-section-tone="cream"] [data-lp-hero-copy] p,
[data-lp-gold-standard="cream-editorial"] [data-lp-variant="centered"] [data-lp-hero-copy] p {
  color: var(--lp-muted-safe) !important;
}
[data-lp-canvas-root] h1,
[data-lp-canvas-root] h2,
[data-lp-canvas-root] h3,
[data-lp-section-head] h2 {
  text-wrap: balance;
  overflow-wrap: break-word;
  hyphens: auto;
  max-width: 100%;
}
[data-lp-section-head] {
  margin-bottom: clamp(1rem, 2.2vw, 1.5rem);
}
[data-lp-section-head] h2 {
  font-size: clamp(1.375rem, 2.6vw, 2rem);
  font-weight: var(--lp-fw-heading, 800);
  line-height: 1.18;
  letter-spacing: -0.025em;
}

/* ═══ Grid / card balance ═══ */
[data-lp-cards-grid],
[data-lp-pricing-grid],
[data-lp-testimonials-grid],
[data-lp-process-grid],
[data-lp-stats-grid] {
  align-items: stretch;
  gap: var(--lp-grid-gap, clamp(0.875rem, 2vw, 1.25rem));
}
[data-lp-card-item],
[data-lp-pricing-card] {
  height: 100%;
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
/* Cards are light surfaces — always readable text + visible elevation */
[data-lp-card-item] {
  background: var(--lp-surface, #fff);
  border: 1px solid color-mix(in srgb, var(--lp-border, #e2e8f0) 82%, transparent);
  box-shadow: var(--lp-card-shadow-elevated);
}
[data-lp-card-item] h3,
[data-lp-card-item] h3 [data-lp-inline-field],
[data-lp-card-item] h3 span {
  color: var(--lp-text-on-light) !important;
}
[data-lp-card-item] p,
[data-lp-card-item] p [data-lp-inline-field],
[data-lp-card-item] p span {
  color: var(--lp-muted-on-light) !important;
}
/* NOTE: cards always take their OWN background from --lp-surface (never a
   literal color — see ListCards' cardSurfaceStyle), independent of the
   enclosing section's data-lp-section-tone. So card text should always just
   track --lp-text-on-light/--lp-muted-on-light above, unconditionally — a
   previous "dark section override" here re-set card text to those exact same
   two variables (a no-op copy of the base rule, not an actual light color),
   so it never did anything; --lp-text-on-light is now itself theme-surface-
   aware (landing-page-variant-render.ts, extendedTokenStyle), which is what
   actually fixes cards on templates whose surface color is dark. */
[data-lp-card-item] > *:last-child,
[data-lp-pricing-card] > *:last-child {
  margin-top: auto;
}
[data-lp-pricing-card][data-lp-featured="1"] {
  transform: translateY(-4px);
}

/* Nav / button groups — center on page axis */
[data-lp-button-group-block] [data-lp-container-inner] {
  display: flex;
  flex-direction: column;
  align-items: center;
}
[data-lp-button-group-block] [data-lp-free-surface] {
  width: 100%;
  max-width: min(22rem, 100%);
}
[data-lp-button-group-block][data-lp-button-group-variant*="column"] [data-lp-free-surface],
[data-lp-button-group-block] [data-lp-free-surface].flex-col {
  margin-inline: auto;
}

/* ═══ Conversion zone — form + CTA as one story ═══ */
[data-lp-conversion-zone="form"] {
  padding-bottom: calc(var(--lp-section-y) * 0.35) !important;
}
[data-lp-conversion-zone="form"] + [data-lp-conversion-zone="cta"],
[data-lp-conversion-zone="cta"] + [data-lp-conversion-zone="form"] {
  padding-top: calc(var(--lp-section-y) * 0.15) !important;
  margin-top: calc(var(--lp-section-y) * -0.35);
}
[data-lp-conversion-zone="cta"] [data-lp-cta-band],
[data-lp-conversion-zone="cta"] [data-lp-cta-split],
[data-lp-conversion-zone="form"] [data-lp-form-block],
[data-lp-conversion-zone="form"] [data-lp-form-card] {
  max-width: min(var(--lp-container, 68rem), 100%);
  margin-inline: auto;
}
[data-lp-cta-split][data-lp-container-inner] {
  padding-inline: var(--lp-gutter) !important;
}

/* ═══ Dead-space guard — cap oversized empty shells ═══ */
[data-lp-hero-visual]:not(:has([data-lp-content-image], [data-lp-img-fallback])) {
  max-height: min(360px, 58vh);
}
[data-lp-template-shot] [data-lp-hero-visual] {
  max-height: min(480px, 68vh);
}
[data-lp-canvas-root] [data-lp-variant="editorial-overlay"] {
  min-height: min(68vh, 640px);
}
[data-lp-template-shot] [data-lp-canvas-root] [data-lp-variant="editorial-overlay"] {
  min-height: min(480px, 62vh);
}
[data-lp-canvas-root] [data-lp-variant="editorial-overlay"] [data-lp-hero-copy] {
  padding-block: clamp(1.5rem, 4vw, 2.75rem);
}
[data-lp-gallery-fallback] {
  max-height: 280px;
}

/* ═══ Mobile / tablet reflow reinforcement ═══ */
[data-lp-viewport="mobile"] [data-lp-canvas-root] {
  --lp-section-y: clamp(1.1rem, calc(var(--lp-section-space, 2.25rem) * 0.68), 3rem);
  --lp-gutter: max(1rem, env(safe-area-inset-left, 0px), env(safe-area-inset-right, 0px));
}
[data-lp-viewport="tablet"] [data-lp-canvas-root] {
  --lp-section-y: clamp(1.2rem, calc(var(--lp-section-space, 2.35rem) * 0.76), 3.5rem);
}
[data-lp-viewport="mobile"] [data-lp-pricing-card][data-lp-featured="1"] {
  transform: none;
}

/* Builder: single vertical element toolbar (editor-only) */
[data-lp-builder-vertical-toolbars="1"] [data-lp-floating-toolbar]:not([data-lp-element-vertical-toolbar]):not([data-lp-text-toolbar]) {
  display: none !important;
}

/* Generated pages retain their template palette; locally dark bands own readable ink. */
[data-lp-ai-generated="1"] [data-lp-section-tone="dark"] {
  --lp-text: #F8FAFC;
  --lp-muted: #CBD5E1;
  --lp-text-on-light: #F8FAFC;
  --lp-muted-on-light: #CBD5E1;
  --lp-muted-safe: #CBD5E1;
  --lp-text-muted: #CBD5E1;
  --lp-surface: #17243A;
  --lp-border: #475569;
  color: #F8FAFC;
}
[data-lp-ai-generated="1"] [data-lp-section-tone="editorial"] {
  --lp-text: #0F172A; --lp-secondary: #0F172A;
  --lp-muted: #475569; --lp-text-on-light: #0F172A;
  --lp-muted-on-light: #475569; --lp-muted-safe: #475569;
  --lp-surface: #FFFFFF; --lp-border: #CBD5E1;
  color: #0F172A;
}
[data-lp-ai-generated="1"] [data-lp-pricing-card][data-lp-featured="1"] {
  --lp-text: var(--lp-on-primary, #fff);
  --lp-text-on-light: var(--lp-on-primary, #fff);
  --lp-muted-on-light: var(--lp-on-primary, #fff);
  --lp-muted-safe: var(--lp-on-primary, #fff);
  color: var(--lp-on-primary, #fff) !important;
}
[data-lp-viewport] [data-lp-ai-generated="1"] [data-lp-item-count="1"] {
  grid-template-columns: minmax(0, 1fr) !important;
  width: 100%; max-width: 40rem; margin-inline: auto;
}
[data-lp-viewport="desktop"] [data-lp-ai-generated="1"] [data-lp-item-count="2"],
[data-lp-viewport="desktop"] [data-lp-ai-generated="1"] [data-lp-item-count="4"],
[data-lp-viewport="tablet"] [data-lp-ai-generated="1"] [data-lp-item-count="2"],
[data-lp-viewport="tablet"] [data-lp-ai-generated="1"] [data-lp-item-count="4"] {
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
}
[data-lp-ai-generated="1"] [data-lp-item-count] > * { min-width: 0; max-width: 100%; }
[data-lp-viewport="mobile"] [data-lp-ai-generated="1"] [data-lp-item-count] {
  grid-template-columns: minmax(0, 1fr) !important;
}
@media (max-width: 640px) {
  [data-lp-viewport] [data-lp-ai-generated="1"] [data-lp-item-count] {
    grid-template-columns: minmax(0, 1fr) !important;
  }
}
`.trim();
