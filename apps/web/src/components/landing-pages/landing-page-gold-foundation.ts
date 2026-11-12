/**
 * Gold-standard visual system — agency + clinic benchmark directions.
 * Scoped via [data-lp-gold-standard]; data-driven, no slug rules.
 */

import { LP_BATCH1_GOLD_FOUNDATION_CSS } from './landing-page-batch1-gold-foundation';
import { LP_BATCH2_GOLD_FOUNDATION_CSS } from './landing-page-batch2-gold-foundation';
import { LP_CLINIC_GOLD_FOUNDATION_CSS } from './landing-page-clinic-gold-foundation';
import { LP_SAAS_GOLD_FOUNDATION_CSS } from './landing-page-saas-gold-foundation';

const LP_AGENCY_GOLD_FOUNDATION_CSS = `
/* ═══ Base tokens ═══ */
[data-lp-gold-standard] [data-lp-canvas-root] {
  --lp-gutter: clamp(1.125rem, 3.2vw, 1.625rem);
  --lp-grid-gap: clamp(1rem, 2.2vw, 1.375rem);
  --lp-section-y: calc(var(--lp-section-space, 2.65rem) * 0.82);
  --lp-section-mult: 0.92;
  --lp-body-font: "DM Sans", "Segoe UI", system-ui, sans-serif;
  --lp-heading-font: var(--lp-font-heading, inherit);
  --lp-card-border: 1px solid color-mix(in srgb, var(--lp-border, #e2e8f0) 78%, transparent);
  --lp-card-shadow: var(--lp-shadow-md, 0 10px 32px rgba(15, 23, 42, 0.08));
  font-family: var(--lp-body-font);
  -webkit-font-smoothing: antialiased;
}

[data-lp-gold-standard="dark-direct"] [data-lp-canvas-root] {
  --lp-heading-font: "Fraunces", "Palatino Linotype", Georgia, serif;
  --lp-body-font: "DM Sans", "Segoe UI", system-ui, sans-serif;
  --lp-section-y: calc(var(--lp-section-space, 2.75rem) * 0.78);
}
[data-lp-gold-standard="cream-editorial"] [data-lp-canvas-root] {
  --lp-heading-font: "Fraunces", "Palatino Linotype", Georgia, serif;
  --lp-body-font: "DM Sans", "Segoe UI", system-ui, sans-serif;
  --lp-section-y: calc(var(--lp-section-space, 2.85rem) * 0.88);
  --lp-section-mult: 1;
}
[data-lp-gold-standard="modern-saas"] [data-lp-canvas-root] {
  --lp-heading-font: "IBM Plex Sans", "Segoe UI", system-ui, sans-serif;
  --lp-body-font: "IBM Plex Sans", "Segoe UI", system-ui, sans-serif;
  --lp-section-y: calc(var(--lp-section-space, 2.75rem) * 0.85);
  --lp-card-shadow: var(--lp-shadow-md, 0 8px 28px rgba(15, 23, 42, 0.07));
}

/* ═══ Container axis — single alignment spine ═══ */
[data-lp-gold-standard] [data-lp-container-inner],
[data-lp-gold-standard] [data-lp-header-inner],
[data-lp-gold-standard] [data-lp-footer-inner],
[data-lp-gold-standard] [data-lp-canvas-root] .max-w-3xl,
[data-lp-gold-standard] [data-lp-canvas-root] .max-w-5xl,
[data-lp-gold-standard] [data-lp-canvas-root] .max-w-6xl {
  width: 100%;
  max-width: min(var(--lp-container, 68rem), 100%);
  margin-inline: auto;
  padding-inline: var(--lp-gutter);
  box-sizing: border-box;
}

[data-lp-gold-standard] [data-lp-canvas-root] [data-lp-section-chrome] > section,
[data-lp-gold-standard] [data-lp-canvas-root] [data-lp-section-chrome] > header,
[data-lp-gold-standard] [data-lp-canvas-root] [data-lp-section-chrome] > footer {
  padding-inline: 0 !important;
  padding-block: var(--lp-section-y);
}
[data-lp-gold-standard] [data-lp-block-slot] + [data-lp-block-slot] [data-lp-section-chrome] > section {
  margin-top: 0;
}
[data-lp-gold-standard] [data-lp-canvas-root] [data-lp-section-chrome] > header {
  padding-block: calc(var(--lp-section-y) * 0.45);
}
[data-lp-gold-standard] [data-lp-canvas-root] [data-lp-section-chrome] > footer {
  padding-block: calc(var(--lp-section-y) * 0.65);
}

/* Tighten same-tone adjacency — continuous story flow */
[data-lp-gold-standard] [data-lp-block-slot]:has([data-lp-section-tone="cream"]) + [data-lp-block-slot]:has([data-lp-section-tone="cream"]) [data-lp-section-chrome] > section,
[data-lp-gold-standard] [data-lp-block-slot]:has([data-lp-section-tone="surface"]) + [data-lp-block-slot]:has([data-lp-section-tone="surface"]) [data-lp-section-chrome] > section,
[data-lp-gold-standard] [data-lp-block-slot]:has([data-lp-section-tone="canvas"]) + [data-lp-block-slot]:has([data-lp-section-tone="canvas"]) [data-lp-section-chrome] > section {
  padding-top: calc(var(--lp-section-y) * 0.35) !important;
}

/* ═══ Typography hierarchy ═══ */
[data-lp-gold-standard] [data-lp-canvas-root] h1,
[data-lp-gold-standard] [data-lp-canvas-root] h2,
[data-lp-gold-standard] [data-lp-canvas-root] h3,
[data-lp-gold-standard] [data-lp-section-head] h2 {
  font-family: var(--lp-heading-font);
}
[data-lp-gold-standard] [data-lp-section-head] {
  margin-bottom: clamp(1.25rem, 2.5vw, 1.75rem);
}
[data-lp-gold-standard] [data-lp-section-head] h2 {
  font-size: clamp(1.5rem, 2.8vw, 2.125rem);
  font-weight: var(--lp-fw-heading, 800);
  line-height: 1.15;
  letter-spacing: -0.028em;
  margin-bottom: 0.5rem;
}
[data-lp-gold-standard] [data-lp-section-head] p {
  font-size: clamp(0.975rem, 1.85vw, 1.0625rem);
  line-height: 1.6;
  max-width: min(var(--lp-text-width, 40rem), 100%);
  color: var(--lp-muted) !important;
}
[data-lp-gold-standard] [data-lp-section-head][data-lp-align="center"] h2,
[data-lp-gold-standard] [data-lp-section-head][data-lp-align="center"] p {
  margin-inline: auto;
  text-align: center;
}

[data-lp-gold-standard] [data-lp-section-eyebrow] {
  font-size: 0.6875rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
  color: var(--lp-primary);
}
[data-lp-gold-standard] [data-lp-section-eyebrow]::before {
  width: 1.75rem;
  height: 2px;
  opacity: 0.9;
}

/* Section tone text contrast */
[data-lp-gold-standard] [data-lp-section-tone="dark"] {
  color: #f5f5f4;
}
[data-lp-gold-standard] [data-lp-section-tone="dark"] [data-lp-section-head] h2,
[data-lp-gold-standard] [data-lp-section-tone="dark"] > [data-lp-container-inner] > h2 {
  color: #fafaf9 !important;
}
[data-lp-gold-standard] [data-lp-section-tone="dark"] [data-lp-section-head] p,
[data-lp-gold-standard] [data-lp-section-tone="dark"] > [data-lp-container-inner] > p,
[data-lp-gold-standard] [data-lp-section-tone="dark"] li:not([data-lp-card-item] li) {
  color: #c8c8c4 !important;
}
[data-lp-gold-standard] [data-lp-section-tone="editorial"],
[data-lp-gold-standard] [data-lp-section-tone="canvas"],
[data-lp-gold-standard] [data-lp-section-tone="surface"] {
  color: var(--lp-text-on-light, #0f172a);
}
[data-lp-gold-standard] [data-lp-section-tone="editorial"] [data-lp-section-head] h2,
[data-lp-gold-standard] [data-lp-section-tone="canvas"] [data-lp-section-head] h2,
[data-lp-gold-standard] [data-lp-section-tone="surface"] [data-lp-section-head] h2 {
  color: var(--lp-text-on-light, #0f172a) !important;
}
[data-lp-gold-standard] [data-lp-section-tone="editorial"] [data-lp-section-head] p,
[data-lp-gold-standard] [data-lp-section-tone="canvas"] [data-lp-section-head] p,
[data-lp-gold-standard] [data-lp-section-tone="surface"] [data-lp-section-head] p {
  color: var(--lp-muted-on-light, #475569) !important;
}
[data-lp-gold-standard] [data-lp-section-tone="accent"] {
  color: #fff;
}
[data-lp-gold-standard] [data-lp-section-tone="accent"] h2,
[data-lp-gold-standard] [data-lp-section-tone="accent"] p {
  color: inherit !important;
}
[data-lp-gold-standard] [data-lp-section-tone="cream"] {
  color: #1a1a1a;
}
[data-lp-gold-standard] [data-lp-section-tone="cream"] [data-lp-section-head] p {
  color: var(--lp-muted) !important;
}

/* ═══ Header / Footer — real site chrome ═══ */
[data-lp-gold-standard="dark-direct"] header[data-lp-header-variant] {
  border-bottom: 1px solid color-mix(in srgb, #fff 8%, transparent) !important;
  backdrop-filter: blur(8px);
}
[data-lp-gold-standard="dark-direct"] header[data-lp-header-variant] nav {
  color: #a8a8a4 !important;
}
[data-lp-gold-standard="cream-editorial"] header[data-lp-header-variant] {
  border-bottom: 1px solid color-mix(in srgb, var(--lp-border) 55%, transparent) !important;
}
[data-lp-gold-standard="modern-saas"] header[data-lp-header-variant="minimal"] {
  border-bottom: 1px solid var(--lp-border) !important;
  background: color-mix(in srgb, var(--lp-surface) 92%, transparent) !important;
}
[data-lp-gold-standard] footer[data-lp-footer-variant] {
  border-top: 1px solid color-mix(in srgb, var(--lp-border) 70%, transparent);
}
[data-lp-gold-standard="modern-saas"] footer[data-lp-footer-variant="columns"] {
  font-size: 0.875rem;
}

/* ═══ HERO — focal points per direction ═══ */
[data-lp-gold-standard="dark-direct"] [data-lp-variant="editorial-overlay"] {
  min-height: min(88vh, 920px);
  display: flex;
  align-items: flex-end;
}
[data-lp-gold-standard="dark-direct"] [data-lp-variant="editorial-overlay"] [data-lp-hero-copy] h1 {
  font-size: clamp(2.35rem, 5.8vw, 3.85rem);
  line-height: 1.05;
  letter-spacing: -0.035em;
  max-width: 13ch;
  font-weight: 800;
}
[data-lp-gold-standard="dark-direct"] [data-lp-variant="editorial-overlay"] [data-lp-hero-copy] p {
  font-size: clamp(1rem, 2vw, 1.125rem);
  line-height: 1.55;
  max-width: 38ch;
  color: #d4d4d0 !important;
}
[data-lp-gold-standard="dark-direct"] [data-lp-hero-cta] a {
  min-width: 13rem;
  padding: 0.95rem 1.85rem !important;
  font-size: 0.9375rem !important;
  font-weight: 800 !important;
  border-radius: calc(var(--lp-radius) - 2px) !important;
  box-shadow: 0 14px 36px color-mix(in srgb, var(--lp-primary) 45%, transparent);
}

[data-lp-gold-standard="cream-editorial"] [data-lp-variant="centered"] [data-lp-hero-copy] {
  max-width: var(--lp-text-width, 36rem);
  margin-inline: auto;
  padding-block: clamp(1.5rem, 4vw, 2.5rem);
}
[data-lp-gold-standard="cream-editorial"] [data-lp-variant="centered"] [data-lp-hero-copy] h1 {
  font-size: clamp(2.1rem, 4.8vw, 3.35rem);
  line-height: 1.1;
  letter-spacing: -0.032em;
}
[data-lp-gold-standard="cream-editorial"] [data-lp-variant="centered"] [data-lp-hero-copy] p {
  font-size: clamp(1.02rem, 2vw, 1.15rem);
  line-height: 1.65;
  color: var(--lp-muted-safe, color-mix(in srgb, var(--lp-secondary) 58%, var(--lp-surface) 42%)) !important;
}
[data-lp-gold-standard="cream-editorial"] [data-lp-section-tone="dark"] [data-lp-hero-cta] a {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
}

[data-lp-gold-standard="modern-saas"] [data-lp-hero-grid] {
  gap: clamp(1.5rem, 3vw, 2.5rem) !important;
  align-items: center !important;
}
[data-lp-gold-standard="modern-saas"] [data-lp-variant="split-left"] [data-lp-hero-copy] h1 {
  font-size: clamp(2rem, 4.2vw, 3rem);
  line-height: 1.12;
  letter-spacing: -0.03em;
  font-weight: 700;
}
[data-lp-gold-standard="modern-saas"] [data-lp-variant="split-left"] [data-lp-hero-copy] p {
  font-size: clamp(0.975rem, 1.8vw, 1.0625rem);
  line-height: 1.6;
  max-width: 42ch;
}
[data-lp-gold-standard="modern-saas"] [data-lp-hero-visual] img,
[data-lp-gold-standard="modern-saas"] [data-lp-hero-visual] [data-lp-content-image] {
  border-radius: var(--lp-radius-lg, calc(var(--lp-radius) + 6px));
  box-shadow: var(--lp-shadow-lg, 0 20px 50px rgba(15, 23, 42, 0.12));
}

/* Trust / proof points */
[data-lp-gold-standard] [data-lp-hero-trust] li,
[data-lp-gold-standard] [data-lp-trust-point] {
  font-size: 0.9375rem;
  line-height: 1.45;
}

/* ═══ Cards — hierarchy, not uniform boxes ═══ */
[data-lp-gold-standard="dark-direct"] [data-lp-list-variant="icon-grid"] [data-lp-card-item] {
  background: color-mix(in srgb, var(--lp-surface) 96%, #fff 4%);
  border: 1px solid color-mix(in srgb, var(--lp-border) 90%, transparent);
  border-radius: var(--lp-radius-md, var(--lp-radius));
  padding: 1.35rem 1.4rem;
  box-shadow: var(--lp-card-shadow);
}
[data-lp-gold-standard="dark-direct"] [data-lp-list-variant="numbered"] [data-lp-card-item],
[data-lp-gold-standard="dark-direct"] [data-lp-process-variant="steps"] [data-lp-card-item] {
  background: var(--lp-surface);
  border: 1px solid var(--lp-border);
  border-radius: var(--lp-radius-md, var(--lp-radius));
  padding: 1.35rem 1.5rem;
  box-shadow: var(--lp-card-shadow);
}

[data-lp-gold-standard="cream-editorial"] [data-lp-list-variant="editorial-list"] [data-lp-cards-grid] {
  max-width: var(--lp-text-width, 36rem);
  margin-inline: auto;
}
[data-lp-gold-standard="cream-editorial"] [data-lp-list-variant="editorial-list"] [data-lp-card-item] {
  border: none;
  box-shadow: none;
  background: transparent;
  padding: 0.85rem 0;
  border-bottom: 1px solid color-mix(in srgb, var(--lp-border) 55%, transparent);
}
[data-lp-gold-standard="cream-editorial"] [data-lp-list-variant="editorial-list"] [data-lp-card-item] h3 {
  font-size: 1.0625rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

[data-lp-gold-standard="modern-saas"] [data-lp-list-variant="alternating"] [data-lp-card-item] {
  border: 1px solid var(--lp-border);
  border-radius: var(--lp-radius-lg, calc(var(--lp-radius) + 4px));
  padding: 1.5rem 1.65rem;
  box-shadow: var(--lp-card-shadow);
  background: var(--lp-surface);
}

/* ═══ Gallery — editorial mosaic / masonry ═══ */
[data-lp-gold-standard] [data-lp-gallery-variant="editorial-mosaic"] [data-lp-gallery-featured] {
  margin-bottom: var(--lp-grid-gap);
  border-radius: var(--lp-radius-lg, calc(var(--lp-radius) + 4px));
  overflow: hidden;
  box-shadow: var(--lp-shadow-lg, 0 18px 48px rgba(0, 0, 0, 0.14));
}
[data-lp-gold-standard] [data-lp-gallery-variant="editorial-mosaic"] [data-lp-card-item] {
  border-radius: var(--lp-radius-md, var(--lp-radius));
  overflow: hidden;
  box-shadow: var(--lp-card-shadow);
  border: 1px solid color-mix(in srgb, var(--lp-border) 70%, transparent);
}
[data-lp-gold-standard="modern-saas"] [data-lp-gallery-variant="masonry"] [data-lp-card-item] {
  border-radius: var(--lp-radius-md, var(--lp-radius));
  overflow: hidden;
  box-shadow: var(--lp-card-shadow);
}

/* ═══ Testimonials ═══ */
[data-lp-gold-standard] [data-lp-testimonials-variant="metric-plus-quote"] [data-lp-metric] {
  font-size: clamp(1.85rem, 3.2vw, 2.35rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}
[data-lp-gold-standard="cream-editorial"] [data-lp-testimonials-variant="editorial"] [data-lp-card-item] {
  border: none;
  box-shadow: none;
  padding: 1.25rem 0;
  border-left: 3px solid color-mix(in srgb, var(--lp-primary) 50%, transparent);
  padding-left: 1.25rem;
}

/* ═══ Pricing — comparison + featured ═══ */
[data-lp-gold-standard] [data-lp-pricing-card] {
  border: var(--lp-card-border);
  box-shadow: var(--lp-card-shadow);
  border-radius: var(--lp-radius-lg, calc(var(--lp-radius) + 4px));
  padding: 1.5rem;
  background: var(--lp-surface);
}
[data-lp-gold-standard] [data-lp-pricing-card][data-lp-featured="1"] {
  border: 2px solid color-mix(in srgb, var(--lp-primary) 50%, transparent);
  box-shadow: var(--lp-shadow-lg, 0 16px 44px rgba(15, 23, 42, 0.12));
  transform: translateY(-6px);
  position: relative;
  z-index: 1;
}
[data-lp-gold-standard="dark-direct"] [data-lp-pricing-variant="comparison"] [data-lp-pricing-table] {
  border-radius: var(--lp-radius-md, var(--lp-radius));
  overflow: hidden;
  box-shadow: var(--lp-card-shadow);
}
[data-lp-gold-standard="dark-direct"] [data-lp-pricing-variant="comparison"] [data-lp-pricing-table] th[data-lp-featured="1"],
[data-lp-gold-standard="modern-saas"] [data-lp-pricing-variant="comparison"] [data-lp-pricing-table] th[data-lp-featured="1"] {
  background: color-mix(in srgb, var(--lp-primary) 12%, var(--lp-surface) 88%);
}

/* ═══ Conversion zone — CTA + Form as one story ═══ */
[data-lp-gold-standard] [data-lp-conversion-zone="cta"] {
  padding-bottom: calc(var(--lp-section-y) * 0.35) !important;
}
[data-lp-gold-standard="dark-direct"] [data-lp-conversion-zone="cta"] + [data-lp-conversion-zone="form"] {
  padding-top: 0 !important;
  margin-top: -0.25rem;
}
[data-lp-gold-standard="dark-direct"] [data-lp-conversion-zone="form"] [data-lp-form-card] {
  max-width: 28rem;
  margin-inline: auto;
}

[data-lp-gold-standard="cream-editorial"] [data-lp-conversion-zone="form"] {
  padding-bottom: calc(var(--lp-section-y) * 0.25) !important;
}
[data-lp-gold-standard="cream-editorial"] [data-lp-conversion-zone="form"] + [data-lp-conversion-zone="cta"] {
  padding-top: 0 !important;
}

[data-lp-gold-standard="modern-saas"] [data-lp-conversion-zone="form"] [data-lp-form-split] {
  max-width: min(var(--lp-container, 72rem), 100%);
  margin-inline: auto;
  padding-inline: var(--lp-gutter);
  gap: clamp(1.5rem, 3vw, 2.5rem);
}
[data-lp-gold-standard="modern-saas"] [data-lp-conversion-zone="form"] + [data-lp-conversion-zone="cta"] {
  padding-top: calc(var(--lp-section-y) * 0.25) !important;
}
[data-lp-gold-standard="modern-saas"] [data-lp-cta-split] {
  border-radius: var(--lp-radius-lg, calc(var(--lp-radius) + 6px)) !important;
  overflow: hidden;
}

[data-lp-gold-standard] [data-lp-form-block],
[data-lp-gold-standard] [data-lp-form-card] form#lead-form {
  border: var(--lp-card-border);
  box-shadow: var(--lp-shadow-lg, var(--lp-shadow));
  border-radius: var(--lp-radius-lg, calc(var(--lp-radius) + 4px));
  background: var(--lp-surface) !important;
  padding: clamp(1.25rem, 2.5vw, 1.75rem);
}
[data-lp-gold-standard="dark-direct"] [data-lp-section-tone="dark"] [data-lp-form-block] {
  border: 1px solid color-mix(in srgb, #fff 14%, transparent);
  background: color-mix(in srgb, var(--lp-surface) 94%, #fff 6%) !important;
}
[data-lp-gold-standard] [data-lp-form-card] button[type="submit"] {
  font-weight: 700 !important;
  min-height: 48px;
  letter-spacing: 0.01em;
}

/* CTA bands */
[data-lp-gold-standard] [data-lp-cta-band],
[data-lp-gold-standard] [data-lp-cta-split] {
  border-radius: var(--lp-radius-lg, calc(var(--lp-radius) + 4px)) !important;
  box-shadow: var(--lp-shadow-lg, var(--lp-shadow)) !important;
}
[data-lp-gold-standard] [data-lp-cta-band] h2,
[data-lp-gold-standard] [data-lp-cta-split] h2 {
  font-size: clamp(1.35rem, 2.5vw, 1.75rem);
  line-height: 1.2;
  letter-spacing: -0.02em;
}
[data-lp-gold-standard] [data-lp-cta-band] a,
[data-lp-gold-standard] [data-lp-cta-action-panel] a {
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.22);
  min-width: 11.5rem;
  font-weight: 800;
}

/* Guarantee */
[data-lp-gold-standard="cream-editorial"] [data-lp-guarantee-variant="banner"] > div {
  max-width: min(var(--lp-container, 68rem), 100%);
  margin-inline: auto;
  padding-inline: var(--lp-gutter);
  box-sizing: border-box;
  border-radius: var(--lp-radius-md, var(--lp-radius));
}

/* Timeline */
[data-lp-gold-standard="cream-editorial"] [data-lp-process-variant="timeline"] [data-lp-timeline-node] {
  border-left: 2px solid color-mix(in srgb, var(--lp-primary) 40%, transparent);
  padding-left: 1.35rem;
  padding-bottom: 0.5rem;
}

/* Video shell */
[data-lp-gold-standard] [data-lp-video-shell] {
  border-radius: var(--lp-radius-lg, calc(var(--lp-radius) + 4px));
  box-shadow: var(--lp-shadow-lg, var(--lp-shadow));
  overflow: hidden;
}

/* ═══ Responsive — attribute sim, no desktop shrink ═══ */
[data-lp-viewport="tablet"] [data-lp-gold-standard] [data-lp-canvas-root] {
  --lp-section-y: calc(var(--lp-section-space, 2.5rem) * 0.8);
}
[data-lp-viewport="tablet"] [data-lp-gold-standard] [data-lp-hero-grid].lg\\:grid-cols-12,
[data-lp-viewport="tablet"] [data-lp-gold-standard] [data-lp-hero-grid].md\\:grid-cols-2 {
  grid-template-columns: 1fr !important;
}
[data-lp-viewport="tablet"] [data-lp-gold-standard] [data-lp-pricing-grid] {
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
}

[data-lp-viewport="mobile"] [data-lp-gold-standard] [data-lp-canvas-root] {
  --lp-gutter: 1rem;
  --lp-section-y: calc(var(--lp-section-space, 2.25rem) * 0.72);
}
[data-lp-viewport="mobile"] [data-lp-gold-standard] [data-lp-canvas-root] h1 {
  font-size: clamp(1.85rem, 7vw, 2.35rem) !important;
  line-height: 1.08 !important;
}
[data-lp-viewport="mobile"] [data-lp-gold-standard] [data-lp-section-head] h2 {
  font-size: clamp(1.35rem, 5.5vw, 1.65rem) !important;
}
[data-lp-viewport="mobile"] [data-lp-gold-standard] [data-lp-hero-grid],
[data-lp-viewport="mobile"] [data-lp-gold-standard] [data-lp-form-split],
[data-lp-viewport="mobile"] [data-lp-gold-standard] [data-lp-cta-split] {
  grid-template-columns: 1fr !important;
}
[data-lp-viewport="mobile"] [data-lp-gold-standard] [data-lp-pricing-grid],
[data-lp-viewport="mobile"] [data-lp-gold-standard] [data-lp-cards-grid],
[data-lp-viewport="mobile"] [data-lp-gold-standard] [data-lp-testimonials-grid] {
  grid-template-columns: 1fr !important;
}
[data-lp-viewport="mobile"] [data-lp-gold-standard] [data-lp-pricing-card][data-lp-featured="1"] {
  transform: none;
}
[data-lp-viewport="mobile"] [data-lp-gold-standard] form#lead-form,
[data-lp-viewport="mobile"] [data-lp-gold-standard] [data-lp-form-block] {
  width: 100% !important;
  max-width: 100% !important;
}
[data-lp-viewport="mobile"] [data-lp-gold-standard="dark-direct"] [data-lp-variant="editorial-overlay"] {
  min-height: auto;
}

/* ═══ TRUST-CASE — case study + KPI proof ═══ */
[data-lp-gold-standard="trust-case"] [data-lp-canvas-root] {
  --lp-heading-font: "IBM Plex Sans", "Segoe UI", system-ui, sans-serif;
}
[data-lp-gold-standard="trust-case"] [data-lp-testimonials-variant="metric-plus-quote"] [data-lp-metric] {
  font-size: clamp(1.35rem, 2.5vw, 1.75rem);
  font-weight: 800;
  color: var(--lp-primary) !important;
}

/* ═══ PROCESS-SPRINT — timeline deliverable ═══ */
[data-lp-gold-standard="process-sprint"] [data-lp-canvas-root] {
  --lp-heading-font: "Manrope", "Segoe UI", system-ui, sans-serif;
}
[data-lp-gold-standard="process-sprint"] [data-lp-process-variant="timeline"] [data-lp-timeline-node] {
  border-left: 2px solid color-mix(in srgb, var(--lp-primary) 38%, transparent);
  padding-left: 1.25rem;
}

/* ═══ WORK-GALLERY — portfolio first ═══ */
[data-lp-gold-standard="work-gallery"] [data-lp-canvas-root] {
  --lp-heading-font: "Fraunces", "Palatino Linotype", serif;
}
[data-lp-gold-standard="work-gallery"] [data-lp-gallery-variant="editorial-mosaic"] [data-lp-gallery-featured] {
  box-shadow: var(--lp-shadow-lg, 0 22px 55px rgba(0, 0, 0, 0.35));
}

/* ═══ FAQ-PITCH — objection handling ═══ */
[data-lp-gold-standard="faq-pitch"] [data-lp-canvas-root] {
  --lp-heading-font: "IBM Plex Sans", "Segoe UI", system-ui, sans-serif;
}
[data-lp-gold-standard="faq-pitch"] [data-lp-faq-variant="accordion"] [data-lp-card-item] {
  border: 1px solid var(--lp-border);
  border-radius: var(--lp-radius-md, var(--lp-radius));
}

/* ═══ NAV-SERVICES — pricing self-serve ═══ */
[data-lp-gold-standard="nav-services"] [data-lp-canvas-root] {
  --lp-heading-font: "Inter", "Segoe UI", system-ui, sans-serif;
}
[data-lp-gold-standard="nav-services"] [data-lp-pricing-variant="comparison"] [data-lp-pricing-table] th[data-lp-featured="1"] {
  background: color-mix(in srgb, var(--lp-primary) 12%, var(--lp-surface) 88%);
}

/* ═══ EARLY-BRIEF — form-first brief ═══ */
[data-lp-gold-standard="early-brief"] [data-lp-canvas-root] {
  --lp-heading-font: "Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif;
}
[data-lp-gold-standard="early-brief"] [data-lp-conversion-zone="form"] [data-lp-form-inline] {
  max-width: min(var(--lp-container, 72rem), 100%);
  margin-inline: auto;
}

/* ═══ MINIMAL-PITCH — compact high-intent ═══ */
[data-lp-gold-standard="minimal-pitch"] [data-lp-canvas-root] {
  --lp-heading-font: "Inter", "Segoe UI", system-ui, sans-serif;
  --lp-section-y: calc(var(--lp-section-space, 2.25rem) * 0.72);
}
[data-lp-gold-standard="minimal-pitch"] [data-lp-variant="minimal-copy"] [data-lp-hero-copy] h1 {
  font-size: clamp(1.85rem, 3.8vw, 2.75rem);
  max-width: 20ch;
  margin-inline: auto;
  text-align: center;
}
`.trim();

export const LP_GOLD_FOUNDATION_CSS = `${LP_AGENCY_GOLD_FOUNDATION_CSS}\n${LP_CLINIC_GOLD_FOUNDATION_CSS}\n${LP_SAAS_GOLD_FOUNDATION_CSS}\n${LP_BATCH1_GOLD_FOUNDATION_CSS}\n${LP_BATCH2_GOLD_FOUNDATION_CSS}`;
