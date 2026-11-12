/**
 * Landing Page visual variant helpers + responsive CSS.
 * Composition from block.variant; designFamily only tunes tokens / surfaces.
 */

import type { CSSProperties } from 'react';
import type {
  LandingPageBlockType,
  LandingPageLayout,
  LandingPageThemeTokens,
} from '@marketingspa/shared';
import {
  canonicalBlockVariant,
  resolveBlockVariant,
  resolveDesignFamily,
  type LandingPageDesignFamily,
} from '@marketingspa/shared';

/** Hero composition shells used by the renderer (maps foundation ids). */
export type HeroComposition =
  | 'centered'
  | 'split-left'
  | 'split-right'
  | 'editorial-overlay'
  | 'fullscreen-image'
  | 'minimal-copy'
  | 'floating-card'
  | 'asymmetric'
  | 'image-collage'
  | 'product-screenshot'
  | 'layered-cards'
  | 'dark-cinematic'
  | 'gradient-mesh'
  | 'conversion-proof';

const HERO_COMPOSITIONS = new Set<string>([
  'centered',
  'split-left',
  'split-right',
  'editorial-overlay',
  'fullscreen-image',
  'minimal-copy',
  'floating-card',
  'asymmetric',
  'image-collage',
  'product-screenshot',
  'layered-cards',
  'dark-cinematic',
  'gradient-mesh',
  'conversion-proof',
]);

export function resolveHeroComposition(
  rawVariant: unknown,
  layout: LandingPageLayout,
  hasEmbeddedForm: boolean,
): HeroComposition {
  const v = canonicalBlockVariant('Hero', rawVariant);
  if (v !== 'default' && HERO_COMPOSITIONS.has(v)) {
    return v as HeroComposition;
  }
  // Old specs without variant: keep layout-driven shells.
  if (layout === 'lead_gen' && hasEmbeddedForm) return 'floating-card';
  if (layout === 'agency' || layout === 'course') return 'split-right';
  if (['webinar', 'product', 'saas', 'service', 'local'].includes(layout)) return 'split-left';
  return 'centered';
}

export function resolveListComposition(
  type: LandingPageBlockType,
  rawVariant: unknown,
): string {
  const v = canonicalBlockVariant(type, rawVariant);
  if (type === 'Gallery') {
    if (v === 'default') return 'grid';
    return v;
  }
  if (v === 'default') return 'icon-grid';
  return v;
}

/** designFamily → soft visual defaults (never reorders sections). Keep in sync with shared design-tokens. */
export function designFamilyTokenOverrides(
  familyRaw: unknown,
): Partial<LandingPageThemeTokens> {
  const family = resolveDesignFamily(familyRaw);
  const map: Record<LandingPageDesignFamily, Partial<LandingPageThemeTokens>> = {
    editorial: {
      fontFamily: '"Playfair Display", "Fraunces", Georgia, serif',
      fontSizeHero: 'clamp(2.2rem, 5.2vw, 3.65rem)',
      sectionSpacing: '3.5rem',
      textWidth: '38rem',
      imageAspect: '3 / 4',
      radius: '10px',
      density: 'spacious',
      imageTreatment: 'editorial',
      fontWeightHeading: 700,
      lineHeightHeading: 1.12,
      shadowMd: '0 16px 40px rgba(15, 23, 42, 0.08)',
      surfaceAlt: '#F4F1EC',
      canvas: '#FAF8F5',
    },
    minimal: {
      fontFamily: '"DM Sans", "Inter", system-ui, sans-serif',
      fontSizeHero: 'clamp(1.95rem, 4.2vw, 3.05rem)',
      sectionSpacing: '2.75rem',
      radius: '8px',
      shadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
      imageAspect: '1 / 1',
      density: 'compact',
      imageTreatment: 'product-flat',
      buttonStyle: 'outline',
      fontWeightHeading: 700,
      surfaceAlt: '#F1F5F9',
      canvas: '#F8FAFC',
    },
    luxury: {
      fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
      fontSizeHero: 'clamp(2.2rem, 4.8vw, 3.5rem)',
      sectionSpacing: '3.75rem',
      radius: '14px',
      imageAspect: '4 / 5',
      buttonStyle: 'solid',
      density: 'spacious',
      imageTreatment: 'editorial',
      fontWeightHeading: 500,
      lineHeightHeading: 1.1,
      shadowLg: '0 28px 70px rgba(15, 23, 42, 0.12)',
      surfaceAlt: '#F5F0E8',
      canvas: '#FAF7F2',
    },
    bold: {
      fontFamily: '"Oswald", "Inter", sans-serif',
      fontSizeHero: 'clamp(2.35rem, 5.6vw, 3.85rem)',
      sectionSpacing: '2.75rem',
      radius: '16px',
      imageAspect: '16 / 9',
      density: 'comfortable',
      imageTreatment: 'photo-real',
      fontWeightHeading: 700,
      lineHeightHeading: 1.05,
      buttonStyle: 'solid',
      surfaceAlt: '#FFF7ED',
      canvas: '#FFFBEB',
    },
    organic: {
      fontFamily: '"Fraunces", "Manrope", Georgia, serif',
      fontSizeHero: 'clamp(2.05rem, 4.4vw, 3.2rem)',
      sectionSpacing: '3.25rem',
      radius: '20px',
      imageAspect: '5 / 6',
      density: 'spacious',
      imageTreatment: 'photo-real',
      radiusPill: '9999px',
      fontWeightHeading: 600,
      surfaceAlt: '#F0FDF4',
      canvas: '#F7FEE7',
    },
    corporate: {
      fontFamily: '"Inter", "IBM Plex Sans", system-ui, sans-serif',
      fontSizeHero: 'clamp(1.95rem, 4vw, 3rem)',
      sectionSpacing: '3rem',
      radius: '10px',
      containerWidth: '70rem',
      density: 'comfortable',
      imageTreatment: 'product-flat',
      fontWeightHeading: 700,
      buttonStyle: 'solid',
      surfaceAlt: '#EEF2FF',
      canvas: '#F8FAFC',
    },
    conversion: {
      fontFamily: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
      fontSizeHero: 'clamp(2.05rem, 4.6vw, 3.4rem)',
      sectionSpacing: '2.5rem',
      buttonStyle: 'solid',
      density: 'compact',
      imageTreatment: 'photo-real',
      fontWeightHeading: 800,
      lineHeightHeading: 1.1,
      surfaceAlt: '#EFF6FF',
      canvas: '#F8FAFC',
    },
    portfolio: {
      fontFamily: '"Playfair Display", "Fraunces", Georgia, serif',
      fontSizeHero: 'clamp(2.1rem, 4.6vw, 3.4rem)',
      sectionSpacing: '3.25rem',
      imageAspect: '4 / 3',
      radius: '12px',
      density: 'spacious',
      imageTreatment: 'editorial',
      fontWeightHeading: 700,
      surfaceAlt: '#F1F5F9',
      canvas: '#FAFAF9',
    },
    local: {
      fontFamily: '"Manrope", "Plus Jakarta Sans", system-ui, sans-serif',
      fontSizeHero: 'clamp(1.95rem, 4.2vw, 3.05rem)',
      sectionSpacing: '2.85rem',
      radius: '12px',
      density: 'comfortable',
      imageTreatment: 'photo-real',
      buttonStyle: 'solid',
      fontWeightHeading: 700,
      surfaceAlt: '#ECFEFF',
      canvas: '#F0FDFA',
    },
    product: {
      fontFamily: '"Space Grotesk", "DM Sans", system-ui, sans-serif',
      fontSizeHero: 'clamp(2.05rem, 4.4vw, 3.25rem)',
      sectionSpacing: '2.85rem',
      imageAspect: '1 / 1',
      radius: '14px',
      density: 'comfortable',
      imageTreatment: 'product-flat',
      fontWeightHeading: 700,
      surfaceAlt: '#F8FAFC',
      canvas: '#FFFFFF',
    },
  };
  return map[family] || map.conversion;
}

export function mergeDesignFamilyTokens(
  tokens: LandingPageThemeTokens,
  familyRaw: unknown,
): LandingPageThemeTokens {
  const over = designFamilyTokenOverrides(familyRaw);
  const baseLum = hexRelativeLuminance(tokens.canvas || tokens.background);
  const baseIsDark = baseLum != null && baseLum < 0.35;
  if (baseIsDark) {
    // Preserve dark industry palettes — family must not paint light canvas/surface over them.
    const {
      canvas: _c,
      surface: _s,
      surfaceAlt: _sa,
      background: _b,
      gradient: _g,
      ...safeOver
    } = over;
    return { ...tokens, ...safeOver };
  }
  return { ...tokens, ...over };
}

function resolveFontPairing(fontFamily: string): { heading: string; body: string } {
  if (/Oswald/i.test(fontFamily)) {
    return {
      heading: '"Oswald", "Inter", sans-serif',
      body: '"Inter", "Segoe UI", system-ui, sans-serif',
    };
  }
  if (/Cormorant/i.test(fontFamily)) {
    return {
      heading: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
      body: '"Manrope", "DM Sans", system-ui, sans-serif',
    };
  }
  if (/Fraunces|Playfair|Palatino|serif/i.test(fontFamily)) {
    return {
      heading: fontFamily,
      body: '"DM Sans", "Inter", system-ui, sans-serif',
    };
  }
  if (/DM Sans/i.test(fontFamily)) {
    return {
      heading: '"DM Sans", "Inter", system-ui, sans-serif',
      body: '"DM Sans", "Inter", system-ui, sans-serif',
    };
  }
  if (/Plus Jakarta/i.test(fontFamily)) {
    return {
      heading: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
      body: '"Inter", "Plus Jakarta Sans", system-ui, sans-serif',
    };
  }
  if (/Manrope/i.test(fontFamily)) {
    return {
      heading: '"Manrope", "Plus Jakarta Sans", system-ui, sans-serif',
      body: '"Manrope", "Segoe UI", system-ui, sans-serif',
    };
  }
  if (/IBM Plex Sans/i.test(fontFamily)) {
    return { heading: fontFamily, body: '"IBM Plex Sans", "Inter", sans-serif' };
  }
  if (/Space Grotesk/i.test(fontFamily)) {
    return {
      heading: '"Space Grotesk", sans-serif',
      body: '"DM Sans", "Inter", system-ui, sans-serif',
    };
  }
  if (/Inter/i.test(fontFamily)) {
    return { heading: fontFamily, body: '"Inter", "Segoe UI", system-ui, sans-serif' };
  }
  return {
    heading: fontFamily,
    body: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
  };
}

/**
 * WCAG relative luminance from a hex color (#rgb or #rrggbb). Returns null for
 * anything else (gradients, var(), named colors) — callers should treat that
 * as "unknown, assume light" since that's the safe default for the 5 base
 * theme presets (all light).
 */
function hexRelativeLuminance(hex: string | undefined): number | null {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((hex || '').trim());
  if (!m || !m[1]) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function extendedTokenStyle(tokens: LandingPageThemeTokens): CSSProperties {
  const density = tokens.density || 'comfortable';
  const sectionMult = density === 'compact' ? '0.85' : density === 'spacious' ? '1.2' : '1';
  const fonts = resolveFontPairing(tokens.fontFamily || 'system-ui, sans-serif');
  // Card / forced-light section ink — derived from theme surface luminance.
  // Prefer token.text when it already contrasts; otherwise fall back to AA ink.
  const surfaceLum = hexRelativeLuminance(tokens.surface) ?? hexRelativeLuminance(tokens.background);
  const surfaceIsDark = surfaceLum != null && surfaceLum < 0.35;
  const canvasLum = hexRelativeLuminance(tokens.canvas) ?? surfaceLum;
  const canvasIsDark = canvasLum != null && canvasLum < 0.35;
  const textOnLight = surfaceIsDark ? '#F8FAFC' : '#0f172a';
  const mutedOnLight = surfaceIsDark ? '#CBD5E1' : '#475569';
  const onPrimary = (() => {
    const lum = hexRelativeLuminance(tokens.button || tokens.primary);
    if (lum == null) return '#ffffff';
    return lum < 0.179 ? '#ffffff' : '#0B1220';
  })();
  const mutedSafe = canvasIsDark
    ? tokens.muted || '#CBD5E1'
    : tokens.muted || mutedOnLight;
  return {
    ['--lp-text-on-light' as string]: textOnLight,
    ['--lp-muted-on-light' as string]: mutedOnLight,
    ['--lp-muted-safe' as string]: mutedSafe,
    ['--lp-on-primary' as string]: onPrimary,
    ['--lp-on-accent' as string]: onPrimary,
    ['--lp-canvas' as string]: tokens.canvas || tokens.background,
    ['--lp-surface-alt' as string]: tokens.surfaceAlt || tokens.surface,
    ['--lp-text-muted' as string]: tokens.textMuted || tokens.muted,
    ['--lp-container' as string]: tokens.containerWidth || '68rem',
    ['--lp-font-heading' as string]: fonts.heading,
    ['--lp-font-body' as string]: fonts.body,
    ['--lp-heading-font' as string]: fonts.heading,
    ['--lp-body-font' as string]: fonts.body,
    ['--lp-text-width' as string]: tokens.textWidth || '42rem',
    ['--lp-section-space' as string]: tokens.sectionSpacing || '2.75rem',
    ['--lp-section-mult' as string]: sectionMult,
    ['--lp-fs-sm' as string]: tokens.fontSizeSm || '0.875rem',
    ['--lp-fs-md' as string]: tokens.fontSizeMd || '1rem',
    ['--lp-fs-lg' as string]: tokens.fontSizeLg || '1.125rem',
    ['--lp-fs-xl' as string]: tokens.fontSizeXl || '1.5rem',
    ['--lp-fs-2xl' as string]: tokens.fontSize2xl || '2rem',
    ['--lp-fs-hero' as string]: tokens.fontSizeHero || 'clamp(1.85rem, 4vw, 3.15rem)',
    ['--lp-fw-heading' as string]: String(tokens.fontWeightHeading ?? 800),
    ['--lp-fw-body' as string]: String(tokens.fontWeightBody ?? 400),
    ['--lp-lh-heading' as string]: String(tokens.lineHeightHeading ?? 1.15),
    ['--lp-lh-body' as string]: String(tokens.lineHeightBody ?? 1.6),
    ['--lp-image-radius' as string]: tokens.imageRadius || tokens.radius,
    ['--lp-image-aspect' as string]: tokens.imageAspect || '4 / 5',
    ['--lp-button-radius' as string]: tokens.buttonRadius || `calc(${tokens.radius} - 2px)`,
    ['--lp-radius-sm' as string]: tokens.radiusSm || `calc(${tokens.radius} - 4px)`,
    ['--lp-radius-md' as string]: tokens.radiusMd || tokens.radius,
    ['--lp-radius-lg' as string]: tokens.radiusLg || `calc(${tokens.radius} + 6px)`,
    ['--lp-radius-pill' as string]: tokens.radiusPill || '9999px',
    ['--lp-shadow-sm' as string]: tokens.shadowSm || '0 4px 14px rgba(15, 23, 42, 0.06)',
    ['--lp-shadow-md' as string]: tokens.shadowMd || tokens.shadow || '0 12px 36px rgba(15, 23, 42, 0.10)',
    ['--lp-shadow-lg' as string]: tokens.shadowLg || '0 24px 60px rgba(15, 23, 42, 0.14)',
    ['--lp-button-style' as string]: tokens.buttonStyle || 'solid',
    ['--lp-image-treatment' as string]: tokens.imageTreatment || 'photo-real',
    ['--lp-icon-surface' as string]:
      tokens.iconSurface || `color-mix(in srgb, ${tokens.primary} 14%, ${tokens.surface})`,
    ['--lp-icon-color' as string]: tokens.iconColor || tokens.primary,
  };
}

/**
 * Lightweight conversionGoal emphasis — never reorders blocks.
 * Returns optional data-attr value for CSS (e.g. stronger CTA).
 */
export function conversionGoalEmphasis(goalRaw: unknown): string {
  const g = typeof goalRaw === 'string' ? goalRaw : 'lead';
  if (['lead', 'booking', 'purchase', 'signup', 'download', 'contact'].includes(g)) return g;
  return 'lead';
}

/** Shared variant + viewport CSS injected once. */
export const LP_VARIANT_CSS = `
/* —— Block variants (composition) —— */
[data-lp-variant="minimal-copy"] [data-lp-hero-copy] { max-width: var(--lp-text-width, 42rem); margin-inline: auto; }
[data-lp-variant="minimal-copy"] [data-lp-hero-trust] { display: none; }

[data-lp-variant="editorial-overlay"] { position: relative; min-height: min(56vh, 520px); }
[data-lp-variant="editorial-overlay"] [data-lp-hero-overlay-bg] {
  position: absolute; inset: 0; background-size: cover; background-position: center;
  filter: brightness(0.55);
}
[data-lp-variant="editorial-overlay"] [data-lp-hero-copy] {
  position: relative; z-index: 1; color: #fff; max-width: var(--lp-text-width, 42rem);
}
[data-lp-variant="editorial-overlay"] [data-lp-hero-copy] h1,
[data-lp-variant="editorial-overlay"] [data-lp-hero-copy] [data-lp-inline-field="headline"] { color: #fff !important; }
[data-lp-variant="editorial-overlay"] [data-lp-hero-copy] p,
[data-lp-variant="editorial-overlay"] [data-lp-hero-copy] [data-lp-inline-field="subheadline"] { color: rgba(255,255,255,0.88) !important; }

[data-lp-variant="fullscreen-image"] [data-lp-hero-visual] { max-width: none; width: 100%; }
[data-lp-variant="fullscreen-image"] [data-lp-hero-visual] img,
[data-lp-variant="fullscreen-image"] [data-lp-hero-visual] > div {
  aspect-ratio: 16 / 9; max-width: 100%; border-radius: var(--lp-image-radius, var(--lp-radius));
}

[data-lp-variant="floating-card"] [data-lp-hero-float] {
  background: var(--lp-surface); border-radius: var(--lp-radius);
  box-shadow: var(--lp-shadow); padding: 1.25rem; border: 1px solid var(--lp-border);
}

[data-lp-list-variant="alternating"] [data-lp-card-item]:nth-child(even) {
  flex-direction: row-reverse;
}
[data-lp-list-variant="alternating"] [data-lp-alt-row] {
  display: flex; flex-direction: column; gap: 1rem; align-items: center;
}
@media (min-width: 768px) {
  [data-lp-list-variant="alternating"] [data-lp-alt-row] {
    flex-direction: row; gap: 1.75rem; text-align: left;
  }
  [data-lp-list-variant="alternating"] [data-lp-card-item]:nth-child(even) [data-lp-alt-row] {
    flex-direction: row-reverse;
  }
}

[data-lp-list-variant="masonry"] [data-lp-cards-grid],
[data-lp-gallery-variant="masonry"] [data-lp-cards-grid] {
  columns: 1; column-gap: 0.75rem;
}
@media (min-width: 768px) {
  [data-lp-list-variant="masonry"] [data-lp-cards-grid],
  [data-lp-gallery-variant="masonry"] [data-lp-cards-grid] { columns: 2; }
}
@media (min-width: 1024px) {
  [data-lp-list-variant="masonry"] [data-lp-cards-grid],
  [data-lp-gallery-variant="masonry"] [data-lp-cards-grid] { columns: 3; }
}
[data-lp-list-variant="masonry"] [data-lp-card-item],
[data-lp-gallery-variant="masonry"] [data-lp-card-item] {
  break-inside: avoid; margin-bottom: 0.75rem; display: inline-block; width: 100%;
}

[data-lp-gallery-variant="editorial-mosaic"] [data-lp-cards-grid] {
  display: grid; grid-template-columns: 1fr; gap: 0.75rem;
}
@media (min-width: 768px) {
  [data-lp-gallery-variant="editorial-mosaic"] [data-lp-cards-grid] {
    grid-template-columns: 1.4fr 1fr 1fr; grid-auto-rows: minmax(140px, auto);
  }
  [data-lp-gallery-variant="editorial-mosaic"] [data-lp-card-item]:first-child {
    grid-row: span 2; grid-column: 1;
  }
}

[data-lp-gallery-variant="featured-plus-grid"] [data-lp-cards-grid] {
  display: grid; grid-template-columns: 1fr; gap: 0.75rem;
}
@media (min-width: 768px) {
  [data-lp-gallery-variant="featured-plus-grid"] [data-lp-cards-grid] {
    grid-template-columns: 1.2fr 1fr; gap: 1rem;
  }
  [data-lp-gallery-variant="featured-plus-grid"] [data-lp-card-item]:first-child {
    grid-row: span 2;
  }
}

[data-lp-testimonials-variant="quote-centered"] [data-lp-testimonials-grid] {
  display: block; max-width: var(--lp-text-width, 42rem); margin-inline: auto; text-align: center;
}
[data-lp-testimonials-variant="quote-centered"] [data-lp-card-item] {
  box-shadow: none; background: transparent; padding: 1.5rem 0;
}
[data-lp-testimonials-variant="editorial"] [data-lp-testimonials-grid] {
  display: grid; grid-template-columns: 1fr; gap: 1.5rem;
}
@media (min-width: 768px) {
  [data-lp-testimonials-variant="editorial"] [data-lp-testimonials-grid] {
    grid-template-columns: 1fr 1fr; gap: 2rem;
  }
}
[data-lp-testimonials-variant="portrait-quotes"] [data-lp-card-item] {
  display: flex; flex-direction: column; align-items: center; text-align: center;
}
[data-lp-testimonials-variant="portrait-quotes"] img,
[data-lp-testimonials-variant="portrait-quotes"] [data-lp-avatar] {
  width: 4.5rem; height: 4.5rem; border-radius: 9999px;
}
[data-lp-testimonials-variant="metric-plus-quote"] [data-lp-metric] {
  font-size: var(--lp-fs-2xl, 2rem); font-weight: 800; color: var(--lp-primary);
}

[data-lp-cta-variant="minimal"] [data-lp-cta-band] {
  background: var(--lp-surface) !important; color: var(--lp-text) !important;
  box-shadow: none; border: 1px solid var(--lp-border);
}
[data-lp-cta-variant="minimal"] [data-lp-cta-band] * { color: inherit !important; }
[data-lp-cta-variant="centered"] [data-lp-cta-band] {
  flex-direction: column; text-align: center; align-items: center;
}
[data-lp-cta-variant="banner"] [data-lp-cta-band] { border-radius: 0; }
[data-lp-category="agency"] [data-lp-cta-variant="banner"] [data-lp-cta-band] {
  border-radius: var(--lp-radius-lg, calc(var(--lp-radius) + 4px));
}
[data-lp-form-variant="inline"] [data-lp-form-card] { max-width: 100%; box-shadow: none; border: none; background: transparent; padding: 0; }
[data-lp-form-variant="booking"] [data-lp-form-card] { border-top: 4px solid var(--lp-primary); }
[data-lp-form-variant="minimal"] [data-lp-form-card] { box-shadow: none; border: 1px solid var(--lp-border); }
[data-lp-form-variant="floating-card"] [data-lp-form-card] {
  box-shadow: var(--lp-shadow-lg, var(--lp-shadow)); transform: translateY(-0.35rem);
}

/* —— Additive design tokens consumption —— */
[data-lp-canvas-root] {
  --lp-shadow: var(--lp-shadow-md, 0 12px 36px rgba(15, 23, 42, 0.10));
}
[data-lp-canvas-root] h1,
[data-lp-canvas-root] h2,
[data-lp-canvas-root] h3,
[data-lp-canvas-root] [data-lp-inline-field="headline"] {
  font-weight: var(--lp-fw-heading, 800);
  line-height: var(--lp-lh-heading, 1.15);
}
[data-lp-canvas-root] p,
[data-lp-canvas-root] [data-lp-inline-field="subheadline"],
[data-lp-canvas-root] [data-lp-inline-field="body"] {
  font-weight: var(--lp-fw-body, 400);
  line-height: var(--lp-lh-body, 1.6);
  font-size: var(--lp-fs-md, 1rem);
}
[data-lp-density="compact"] [data-lp-section-pad],
[data-lp-density="compact"] section[class*="py-"] {
  padding-top: calc(var(--lp-section-space, 2.5rem) * 0.72 * var(--lp-section-mult, 0.85)) !important;
  padding-bottom: calc(var(--lp-section-space, 2.5rem) * 0.72 * var(--lp-section-mult, 0.85)) !important;
}
[data-lp-density="spacious"] [data-lp-section-pad],
[data-lp-density="spacious"] section[class*="py-"] {
  padding-top: calc(var(--lp-section-space, 2.75rem) * 1.15 * var(--lp-section-mult, 1.2)) !important;
  padding-bottom: calc(var(--lp-section-space, 2.75rem) * 1.15 * var(--lp-section-mult, 1.2)) !important;
}
[data-lp-canvas-root] h1 {
  font-size: var(--lp-fs-hero, clamp(1.85rem, 4vw, 3.15rem));
  letter-spacing: -0.03em;
}
/* Same literal-vs-theme-var split as the light side (landing-page-visual-
   foundation.ts): "dark" plus every other *-gold-system.ts tone whose
   goldSectionBackground() is a fixed dark hex gradient regardless of theme
   (executive, luxury, authority, work, studio). "glow" is dark only for saas
   — cosmetics' "glow" is light and is handled on the light side instead. */
[data-lp-section-tone="dark"],
[data-lp-section-tone="executive"],
[data-lp-section-tone="luxury"],
[data-lp-section-tone="authority"],
[data-lp-section-tone="work"],
[data-lp-section-tone="studio"],
[data-lp-category="saas"] [data-lp-section-tone="glow"] {
  color: #f8fafc;
}
[data-lp-section-tone="dark"] [data-lp-section-head] h2,
[data-lp-section-tone="executive"] [data-lp-section-head] h2,
[data-lp-section-tone="luxury"] [data-lp-section-head] h2,
[data-lp-section-tone="authority"] [data-lp-section-head] h2,
[data-lp-section-tone="work"] [data-lp-section-head] h2,
[data-lp-section-tone="studio"] [data-lp-section-head] h2,
[data-lp-category="saas"] [data-lp-section-tone="glow"] [data-lp-section-head] h2,
[data-lp-section-tone="dark"] [data-lp-section-head] p,
[data-lp-section-tone="executive"] [data-lp-section-head] p,
[data-lp-section-tone="luxury"] [data-lp-section-head] p,
[data-lp-section-tone="authority"] [data-lp-section-head] p,
[data-lp-section-tone="work"] [data-lp-section-head] p,
[data-lp-section-tone="studio"] [data-lp-section-head] p,
[data-lp-category="saas"] [data-lp-section-tone="glow"] [data-lp-section-head] p,
[data-lp-section-tone="dark"] > [data-lp-container-inner] > h1,
[data-lp-section-tone="dark"] > [data-lp-container-inner] > h2 {
  /* !important: SectionHead/heading elements set their own inline
     color: var(--lp-text-on-light, ...) — a plain rule here is silently
     beaten by that inline style, which is exactly why this never took
     effect for dark-toned sections despite the correct color being right
     here. */
  color: #f8fafc !important;
}
[data-lp-section-tone="dark"] [data-lp-section-head] [style*="var(--lp-muted)"],
[data-lp-section-tone="dark"] [data-lp-section-head] [style*="var(--lp-secondary)"] {
  color: #e2e8f0 !important;
}
[data-lp-section-tone="dark"] [data-lp-card-item] [style*="var(--lp-muted)"],
[data-lp-section-tone="dark"] [data-lp-card-item] [style*="var(--lp-secondary)"] {
  /* A literal light color, NOT var(--lp-muted-on-light, ...) — that variable
     stays dark for a light-themed page, which is exactly the case this rule
     exists for (a literal dark-toned card on an otherwise light theme). */
  color: #cbd5e1 !important;
}
[data-lp-section-tone="dark"] [data-lp-card-item] h3 [style*="var(--lp-secondary)"] {
  color: #f8fafc !important;
}
[data-lp-btn-style="outline"] [data-lp-cta-band] a,
[data-lp-btn-style="outline"] [data-lp-hero-cta] a {
  background: transparent !important;
  color: var(--lp-primary) !important;
  border: 2px solid var(--lp-primary);
  box-shadow: none !important;
}
[data-lp-btn-style="pill"] [data-lp-cta-band] a,
[data-lp-btn-style="pill"] [data-lp-hero-cta] a,
[data-lp-btn-style="pill"] [data-lp-form-card] button[type="submit"] {
  border-radius: var(--lp-radius-pill, 9999px) !important;
}
[data-lp-image-treatment="editorial"] [data-lp-content-image],
[data-lp-image-treatment="editorial"] [data-lp-hero-visual] img {
  filter: contrast(1.05) saturate(0.92);
}
[data-lp-image-treatment="product-flat"] [data-lp-content-image],
[data-lp-image-treatment="product-flat"] [data-lp-hero-visual] img {
  filter: none;
  box-shadow: none;
  border-radius: var(--lp-radius-sm, 6px);
}
[data-lp-pricing-variant="comparison"] [data-lp-pricing-table] {
  width: 100%; border-collapse: collapse;
}
[data-lp-pricing-variant="comparison"] [data-lp-pricing-table] th,
[data-lp-pricing-variant="comparison"] [data-lp-pricing-table] td {
  border: 1px solid var(--lp-border); padding: 0.75rem 0.85rem; text-align: left; vertical-align: top;
}
[data-lp-pricing-variant="minimal"] [data-lp-pricing-minimal] {
  display: flex; flex-direction: column; gap: 1.25rem; max-width: 36rem; margin-inline: auto;
}
[data-lp-process-variant="timeline"] [data-lp-timeline] {
  position: relative; padding-left: 1.75rem;
}
[data-lp-process-variant="timeline"] [data-lp-timeline]::before {
  content: ""; position: absolute; left: 0.55rem; top: 0.25rem; bottom: 0.25rem; width: 2px;
  background: color-mix(in srgb, var(--lp-primary) 35%, transparent);
}
[data-lp-cta-variant="split"] [data-lp-cta-split] {
  display: grid; gap: 1.25rem; align-items: center;
}
@media (min-width: 768px) {
  [data-lp-cta-variant="split"] [data-lp-cta-split] { grid-template-columns: 1.2fr 0.8fr; }
}
[data-lp-cta-variant="floating-card"] [data-lp-cta-float-wrap] {
  background: var(--lp-surface-alt, var(--lp-surface)); padding: 1.5rem 1rem;
}
[data-lp-cta-variant="floating-card"] [data-lp-cta-band] {
  max-width: 56rem; margin-inline: auto;
  box-shadow: var(--lp-shadow-lg, var(--lp-shadow));
}
[data-lp-form-variant="split"] [data-lp-form-split] {
  display: grid; gap: 1.5rem; align-items: start; width: 100%; max-width: 64rem; margin-inline: auto;
}
@media (min-width: 768px) {
  [data-lp-form-variant="split"] [data-lp-form-split] { grid-template-columns: 1fr 1fr; }
}
[data-lp-gallery-variant="featured-plus-grid"] [data-lp-gallery-featured] {
  margin-bottom: 0.85rem;
}
[data-lp-gallery-variant="featured-plus-grid"] [data-lp-gallery-featured] img {
  width: 100%; aspect-ratio: 16 / 9; object-fit: cover;
  border-radius: var(--lp-image-radius, var(--lp-radius));
}
[data-lp-testimonials-variant="editorial"] [data-lp-testimonial-editorial] {
  border-left: 3px solid var(--lp-primary); padding-left: 1.1rem; background: transparent; box-shadow: none;
}
[data-lp-testimonials-variant="portrait-quotes"] [data-lp-testimonial-portrait] {
  display: flex; flex-direction: column; gap: 1rem; align-items: flex-start; text-align: left;
}
@media (min-width: 640px) {
  [data-lp-testimonials-variant="portrait-quotes"] [data-lp-testimonial-portrait] {
    flex-direction: row; align-items: center;
  }
}

/* Goal emphasis (no reorder) */
[data-lp-goal="booking"] [data-lp-cta-band],
[data-lp-goal="purchase"] [data-lp-cta-band] { ring: 0; outline: none; }
[data-lp-goal="booking"] a[href="#lead-form"],
[data-lp-goal="purchase"] a[href="#lead-form"] { min-width: 12rem; }

/* —— Responsive 1440 / 768 / 390 —— */
[data-lp-canvas-root] {
  overflow-x: clip;
  max-width: 100%;
}
[data-lp-canvas-root] img,
[data-lp-canvas-root] video,
[data-lp-canvas-root] iframe {
  max-width: 100%;
  height: auto;
}
[data-lp-hero-cta] a,
[data-lp-cta-band] a,
[data-lp-hero-cta] [data-lp-inline-field="ctaLabel"] {
  max-width: 100%;
}

@media (max-width: 767px) {
  [data-lp-canvas-root] {
    --lp-section-space: 1.75rem;
  }
  [data-lp-hero-cta] a,
  [data-lp-cta-band] a,
  [data-lp-form-card] button[type="submit"] {
    width: 100%;
    justify-content: center;
  }
  [data-lp-variant="split-left"] [data-lp-hero-grid],
  [data-lp-variant="split-right"] [data-lp-hero-grid],
  [data-lp-variant="floating-card"] [data-lp-hero-grid] {
    display: flex !important;
    flex-direction: column;
    gap: 1.25rem;
  }
  [data-lp-variant="split-right"] [data-lp-hero-visual] { order: -1; }
  [data-lp-list-variant="icon-grid"] [data-lp-cards-grid],
  [data-lp-list-variant="image-cards"] [data-lp-cards-grid] {
    grid-template-columns: 1fr !important;
  }
  [data-lp-hero-copy] h1,
  [data-lp-hero-copy] [data-lp-inline-field="headline"] {
    font-size: clamp(1.6rem, 7vw, 2.1rem) !important;
    line-height: 1.15 !important;
    overflow-wrap: anywhere;
  }
  [data-lp-variant="editorial-overlay"] { min-height: 420px; padding: 2rem 1rem; }
  [data-lp-variant="editorial-overlay"] [data-lp-hero-overlay-bg] { filter: brightness(0.45); }
}

@media (min-width: 768px) and (max-width: 1023px) {
  [data-lp-list-variant="icon-grid"] [data-lp-cards-grid],
  [data-lp-list-variant="image-cards"] [data-lp-cards-grid] {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}

@media (min-width: 1440px) {
  [data-lp-container-inner] {
    max-width: min(var(--lp-container, 68rem), 100%);
  }
}

/* Builder viewport sim: force mobile collapse */
[data-lp-viewport="mobile"] [data-lp-hero-grid] {
  display: flex !important; flex-direction: column !important;
}
[data-lp-viewport="mobile"] [data-lp-cards-grid],
[data-lp-viewport="mobile"] [data-lp-testimonials-grid],
[data-lp-viewport="mobile"] [data-lp-pricing-grid] {
  grid-template-columns: 1fr !important;
}
[data-lp-viewport="mobile"] [data-lp-hero-cta] a,
[data-lp-viewport="mobile"] [data-lp-cta-band] a {
  width: 100%; justify-content: center;
}
[data-lp-viewport="tablet"] [data-lp-cards-grid]:not([data-lp-process-grid]) {
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
}
`.trim();

export { resolveBlockVariant, canonicalBlockVariant };
