'use client';
import { installLpMotion, LP_MOTION_CSS } from './landing-page-motion-runtime';
import {LandingPageRenderOverlapGuard} from './landing-page-render-overlap-guard';
import { projectLandingFlow } from './landing-page-no-overlap';
import { LandingPageSectionElements } from './landing-page-section-elements';
import { resolveSidebarDropTarget } from './landing-page-section-insert-target';

/**
 * Premium conversion-first Landing Page renderer.
 * Layout variants differ by structure (not only colors). Existing specs without
 * meta.layout fall back to classic — fully compatible.
 */

import { isAgencyPortfolioStandard, agencyPortfolioRenderMeta } from './agency-portfolio-client';
import { agencyPortfolioDirection, isRestaurantMenuRepresentative, isLocalServiceRepresentative, isWebsiteRepresentative, industryDirection } from '@marketingspa/shared';
import { BlankStarterBlock } from './landing-page-blank-starter-block';
import { AgencyPortfolioBlock } from './landing-page-agency-portfolio-blocks';
import { RestaurantMenuBlock } from './landing-page-restaurant-blocks';
import {WebsiteBriefBlock} from './landing-page-website-blocks';
import { LocalServiceBlock } from './landing-page-local-service-blocks';
import { scopeLegacyLandingPageCss } from './landing-page-legacy-css-scope';
import { readSectionLibraryContext } from './landing-page-section-library-context';
import { LandingPageSectionLibraryBlockV2 } from './landing-page-section-library-v2';
import { memo, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type {
  LandingPageBlock,
  LandingPageCountdownBlock,
  LandingPageImageStyle,
  LandingPageLeadFormBlock,
  LandingPageListBlock,
  LandingPageSpec,
  LandingPageTextBlock,
  LandingPageThemeTokens,
} from '@marketingspa/shared';
import {
  filterPublishableSpeakers,
  filterPublishableTestimonials,
  isCountdownLaunchStyle,
  normalizeLandingPageThemeTokens,
  resolveLandingPageLayout,
  resolveSectionEyebrow,
  type LandingPageLayout,
} from '@marketingspa/shared';
import { itemBoxDomProps, itemBoxHideAttrs } from './landing-page-item-box';
import { LandingPageCountdownLive } from './landing-page-countdown';
import { LandingPageCountdownLaunch } from './landing-page-countdown-launch';
import { LandingPageHtmlDocument } from './landing-page-html-document';
import { isolateHtmlDocument } from './landing-page-html-isolate';
import {
  conversionGoalEmphasis,
  extendedTokenStyle,
  LP_VARIANT_CSS,
  mergeDesignFamilyTokens,
  resolveHeroComposition,
  resolveListComposition,
  resolveBlockVariant,
  canonicalBlockVariant,
} from './landing-page-variant-render';

function buildElementHiddenCss(spec: LandingPageSpec): string | null {
  const map = (spec.meta as { elementHidden?: Record<string, boolean> } | undefined)?.elementHidden;
  const rules: string[] = [
    '[data-lp-canvas-root] [data-lp-text-hidden="1"]{display:none!important}',
  ];
  if (map) {
    for (const [key, hidden] of Object.entries(map)) {
      if (!hidden) continue;
      const sep = key.indexOf('::');
      if (sep <= 0) continue;
      const blockId = key.slice(0, sep).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      const field = key.slice(sep + 2).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      // Scope hidden text to its owner; nested portal elements can use the same field name.
      rules.push(
        `[data-lp-block-id="${blockId}"] [data-lp-inline-field="${field}"][data-lp-element-id^="${blockId}::"]{display:none!important}`,
      );
      // Element chrome (Hero trust icons, boxes keyed by data-lp-element-id)
      rules.push(
        `[data-lp-block-id="${blockId}"] [data-lp-element-id="${blockId}::${field}"]{display:none!important}`,
      );
      // Orange text-box wrap (data-lp-free-id) — hiding only the inner <p> left a ghost.
      rules.push(
        `[data-lp-block-id="${blockId}"] [data-lp-free-id="${blockId}::${field}"]{display:none!important}`,
      );
    }
  }
  return rules.length ? rules.join('\n') : null;
}
import {
  isNavGroupColumn,
  navGroupItemStyle,
  parseNavVariant,
} from './landing-page-button-presets';
import { isLandingPageBoxStyle } from './landing-page-box-presets';
import {
  LP_SIDEBAR_PRESET_MIME,
  readSidebarDragPayload,
  showSidebarDropTarget,
  isSidebarPresetDrag,
  parseSidebarPresetPayload,
} from './landing-page-sidebar-dnd';
import {
  ElementChrome,
  InlineEditable,
  ItemReorderChrome,
  LandingPagePublicMetaProvider,
  SelectableShell,
  type LandingPageCanvasHandlers,
} from './landing-page-canvas-ux';
import { parseLpSelectionKey } from './landing-page-canvas-selection';
import { FreeGuidesProvider, isPlausibleFreeLayout } from './landing-page-free-drag';
import { computeCanvasFreeReserveHeight, resolveFreeLayoutForViewport } from '@marketingspa/shared';
import {
  landingPageSectionSurfaceStyle,
} from './landing-page-section-surface';
import {
  buildPageCustomCssBlocks,
  composeDesignTransformCss,
  safeCustomClassName,
} from './landing-page-block-design-style';
import { LP_SECTION_BG_MOTION_CSS } from './landing-page-section-bg-motion';
import {
  LP_RESPONSIVE_FOUNDATION_CSS,
  ensureLandingPageCatalogFonts,
} from './landing-page-responsive-foundation';
import { LP_PREMIUM_FOUNDATION_CSS } from './landing-page-premium-foundation';
import { LP_GOLD_FOUNDATION_CSS } from './landing-page-gold-foundation';
import { LP_VISUAL_FOUNDATION_CSS } from './landing-page-visual-foundation';
import { LP_PREMIUM_VISUAL_AXIS_CSS } from './landing-page-premium-visual-axis';
import { LP_COMMERCIAL_TEMPLATE_CSS } from './landing-page-commercial-template-css';
import { lpImgStyle, lpImgMotionAttr } from './landing-page-content-image-style';
import { LpContentImage } from './landing-page-content-image';

type Viewport = 'desktop' | 'tablet' | 'mobile';
type RenderMode = 'preview' | 'public';

/**
 * Keep InlineEditable mounted in the builder while the field is selected/editing,
 * even when the text is cleared to "". Otherwise `value ? <InlineEditable/> : null`
 * unmounts the chrome (orange border) the moment the last character is deleted.
 */
function showCanvasInlineField(
  value: string | undefined | null,
  canvas: LandingPageCanvasHandlers | null | undefined,
  blockId: string | undefined,
  field: string,
): boolean {
  if (value) return true;
  if (!canvas || !blockId) return false;
  if (canvas.isSelected?.({ blockId, field, element: field as never })) return true;
  if (canvas.isPrimarySelected?.({ blockId, field, element: field as never })) return true;
  const sel = canvas.selection;
  if (sel?.blockId !== blockId) return false;
  if (sel.field === field) return true;
  if (field === 'ctaLabel' && sel.element === 'cta') return true;
  if (!sel.field && String(sel.element || '') === field) return true;
  return false;
}

/** Merge block.background + style.backgroundImage* for section surfaces. */
function sectionBgStyle(
  block: Pick<LandingPageBlock, 'background' | 'style'>,
  fallback?: string,
): CSSProperties {
  return landingPageSectionSurfaceStyle(block, fallback);
}

function sectionBgMotionAttr(block: Pick<LandingPageBlock, 'style'>): string | undefined {
  const motion = (block.style as { lpBgMotion?: string } | undefined)?.lpBgMotion;
  return typeof motion === 'string' && motion && motion !== 'none' ? motion : undefined;
}

function sectionToneAttr(block: Pick<LandingPageBlock, 'style'>): string | undefined {
  const tone = (block.style as { lpSectionTone?: string } | undefined)?.lpSectionTone;
  return typeof tone === 'string' && tone ? tone : undefined;
}

/**
 * Legacy viewport sim rules — extended by landing-page-responsive-foundation.ts.
 * Attribute [data-lp-viewport] drives reflow in preview/shot (not browser @media).
 */
const LP_VIEWPORT_SIM_CSS = `
[data-lp-viewport="mobile"] [data-lp-canvas-root] {
  overflow-x: hidden !important;
  max-width: 100%;
}
[data-lp-viewport="mobile"] [data-lp-canvas-root] h1,
[data-lp-viewport="mobile"] [data-lp-canvas-root] h2,
[data-lp-viewport="mobile"] [data-lp-canvas-root] h3,
[data-lp-viewport="mobile"] [data-lp-canvas-root] h4,
[data-lp-viewport="mobile"] [data-lp-canvas-root] p,
[data-lp-viewport="mobile"] [data-lp-canvas-root] li,
[data-lp-viewport="mobile"] [data-lp-canvas-root] span,
[data-lp-viewport="mobile"] [data-lp-canvas-root] a,
[data-lp-viewport="mobile"] [data-lp-canvas-root] button,
[data-lp-viewport="mobile"] [data-lp-canvas-root] label,
[data-lp-viewport="mobile"] [data-lp-canvas-root] blockquote {
  overflow-wrap: anywhere;
  word-break: break-word;
  max-width: 100%;
  white-space: normal;
}
[data-lp-viewport="mobile"] [data-lp-canvas-root] img,
[data-lp-viewport="mobile"] [data-lp-canvas-root] video,
[data-lp-viewport="mobile"] [data-lp-canvas-root] iframe {
  max-width: 100% !important;
  width: 100%;
  height: auto;
}
[data-lp-viewport="mobile"] [data-lp-canvas-root] .grid,
[data-lp-viewport="mobile"] [data-lp-canvas-root] [data-lp-pricing-grid],
[data-lp-viewport="mobile"] [data-lp-canvas-root] [data-lp-stats-grid],
[data-lp-viewport="mobile"] [data-lp-canvas-root] [data-lp-cards-grid],
[data-lp-viewport="mobile"] [data-lp-canvas-root] [data-lp-testimonials-grid],
[data-lp-viewport="mobile"] [data-lp-canvas-root] [data-lp-faq-grid],
[data-lp-viewport="mobile"] [data-lp-canvas-root] [data-lp-process-grid] {
  grid-template-columns: minmax(0, 1fr) !important;
}
[data-lp-viewport="mobile"] [data-lp-canvas-root] .sm\\:grid-cols-2,
[data-lp-viewport="mobile"] [data-lp-canvas-root] .md\\:grid-cols-2,
[data-lp-viewport="mobile"] [data-lp-canvas-root] .md\\:grid-cols-3,
[data-lp-viewport="mobile"] [data-lp-canvas-root] .md\\:grid-cols-4,
[data-lp-viewport="mobile"] [data-lp-canvas-root] .lg\\:grid-cols-2,
[data-lp-viewport="mobile"] [data-lp-canvas-root] .lg\\:grid-cols-3,
[data-lp-viewport="mobile"] [data-lp-canvas-root] .lg\\:grid-cols-4,
[data-lp-viewport="mobile"] [data-lp-canvas-root] .lg\\:grid-cols-12 {
  grid-template-columns: minmax(0, 1fr) !important;
}
[data-lp-viewport="mobile"] [data-lp-canvas-root] .md\\:flex-row {
  flex-direction: column !important;
}
[data-lp-viewport="mobile"] [data-lp-canvas-root] .px-4,
[data-lp-viewport="mobile"] [data-lp-canvas-root] .sm\\:px-6 {
  padding-left: 1.125rem !important;
  padding-right: 1.125rem !important;
}
[data-lp-viewport="mobile"] [data-lp-canvas-root] [data-lp-form-block],
[data-lp-viewport="mobile"] [data-lp-canvas-root] form#lead-form {
  width: 100% !important;
  max-width: 100% !important;
}
[data-lp-viewport="mobile"] [data-lp-canvas-root] [data-lp-pricing-card],
[data-lp-viewport="mobile"] [data-lp-canvas-root] [data-lp-card-item] {
  min-width: 0 !important;
  max-width: 100% !important;
  transform: none !important;
}
[data-lp-viewport="mobile"] [data-lp-canvas-root] [data-lp-section-chrome="1"][data-lp-position-mode="free"] {
  max-width: 100% !important;
  box-sizing: border-box !important;
}
[data-lp-viewport="tablet"] [data-lp-canvas-root] {
  overflow-x: hidden !important;
  max-width: 100%;
}
[data-lp-viewport="tablet"] [data-lp-canvas-root] img,
[data-lp-viewport="tablet"] [data-lp-canvas-root] video {
  max-width: 100% !important;
}
[data-lp-viewport="tablet"] [data-lp-canvas-root] h1,
[data-lp-viewport="tablet"] [data-lp-canvas-root] h2,
[data-lp-viewport="tablet"] [data-lp-canvas-root] h3,
[data-lp-viewport="tablet"] [data-lp-canvas-root] p,
[data-lp-viewport="tablet"] [data-lp-canvas-root] li,
[data-lp-viewport="tablet"] [data-lp-canvas-root] span {
  overflow-wrap: anywhere;
  word-break: break-word;
  max-width: 100%;
}
[data-lp-viewport="tablet"] [data-lp-canvas-root] [data-lp-pricing-grid] {
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
}
[data-lp-viewport="tablet"] [data-lp-canvas-root] [data-lp-stats-grid],
[data-lp-viewport="tablet"] [data-lp-canvas-root] [data-lp-process-grid],
[data-lp-viewport="tablet"] [data-lp-canvas-root] [data-lp-cards-grid],
[data-lp-viewport="tablet"] [data-lp-canvas-root] [data-lp-testimonials-grid] {
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
}
[data-lp-viewport="tablet"] [data-lp-canvas-root] .md\\:grid-cols-3,
[data-lp-viewport="tablet"] [data-lp-canvas-root] .md\\:grid-cols-4,
[data-lp-viewport="tablet"] [data-lp-canvas-root] .lg\\:grid-cols-3,
[data-lp-viewport="tablet"] [data-lp-canvas-root] .lg\\:grid-cols-4 {
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
}
[data-lp-viewport="tablet"] [data-lp-canvas-root] .lg\\:grid-cols-12 {
  grid-template-columns: minmax(0, 1fr) !important;
}
[data-lp-viewport="tablet"] [data-lp-canvas-root] [data-lp-section-chrome="1"][data-lp-position-mode="free"] {
  max-width: 100% !important;
  box-sizing: border-box !important;
}
[data-lp-viewport="tablet"] [data-lp-canvas-root] [data-lp-pricing-card],
[data-lp-viewport="tablet"] [data-lp-canvas-root] [data-lp-card-item] {
  min-width: 0 !important;
  max-width: 100% !important;
}
/* Publish/public real breakpoints (SSR-safe; does not require builder viewport attr) */
@media (max-width: 767px) {
  [data-lp-public-root] [data-lp-canvas-root] {
    overflow-x: hidden;
    max-width: 100%;
  }
  [data-lp-public-root] [data-lp-canvas-root] h1,
  [data-lp-public-root] [data-lp-canvas-root] h2,
  [data-lp-public-root] [data-lp-canvas-root] h3,
  [data-lp-public-root] [data-lp-canvas-root] p,
  [data-lp-public-root] [data-lp-canvas-root] li,
  [data-lp-public-root] [data-lp-canvas-root] span,
  [data-lp-public-root] [data-lp-canvas-root] a {
    overflow-wrap: anywhere;
    word-break: break-word;
    max-width: 100%;
  }
  [data-lp-public-root] [data-lp-canvas-root] img,
  [data-lp-public-root] [data-lp-canvas-root] video,
  [data-lp-public-root] [data-lp-canvas-root] iframe {
    max-width: 100% !important;
    height: auto;
  }
  [data-lp-public-root] [data-lp-form-block],
  [data-lp-public-root] form#lead-form {
    width: 100% !important;
    max-width: 100% !important;
  }
  [data-lp-public-root] [data-lp-pricing-card] {
    transform: none !important;
    min-width: 0;
    max-width: 100%;
  }
  [data-lp-public-root] [data-lp-section-chrome="1"][data-lp-position-mode="free"] {
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
}
@media (min-width: 768px) and (max-width: 1023px) {
  [data-lp-public-root] [data-lp-pricing-grid] {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
  [data-lp-public-root] [data-lp-stats-grid],
  [data-lp-public-root] [data-lp-process-grid],
  [data-lp-public-root] [data-lp-testimonials-grid] {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
  [data-lp-public-root] [data-lp-section-chrome="1"][data-lp-position-mode="free"] {
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
}
`;

const ICON_SVGS = [
  // bulb
  'M12 3a7 7 0 0 0-4 12c.6.6 1 1.4 1 2.2V18h6v-.8c0-.8.4-1.6 1-2.2A7 7 0 0 0 12 3zm-1 16h2v1a1 1 0 0 1-2 0v-1z',
  // target
  'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 3a7 7 0 1 1-7 7 7 7 0 0 1 7-7zm0 3a4 4 0 1 0 4 4 4 4 0 0 0-4-4zm0 2.5A1.5 1.5 0 1 1 10.5 12 1.5 1.5 0 0 1 12 10.5z',
  // chart
  'M4 19h16v2H4zm2-2V9h2v8zm4 0V5h2v12zm4 0v-6h2v6zm4 0V7h2v10z',
  // gift
  'M20 7h-2.2A3 3 0 0 0 12 3a3 3 0 0 0-5.8 4H4a1 1 0 0 0-1 1v3h18V8a1 1 0 0 0-1-1zM9 5a1 1 0 1 1-1 1 1 1 0 0 1 1-1zm6 0a1 1 0 1 1-1 1 1 1 0 0 1 1-1zM3 13v7a1 1 0 0 0 1 1h7v-8zm10 0v8h7a1 1 0 0 0 1-1v-7z',
];

function spacingClass(spacing?: string) {
  switch (spacing) {
    case 'none':
      return 'py-2';
    case 'sm':
      return 'py-5 md:py-6';
    case 'lg':
      return 'py-8 md:py-10';
    default:
      return 'py-6 md:py-8';
  }
}

function sectionEyebrowFor(blockType: LandingPageBlock['type'], category?: string) {
  return resolveSectionEyebrow(category === 'agency' ? 'agency' : undefined, blockType);
}

function tokenStyle(tokens: LandingPageThemeTokens): CSSProperties {
  const t = normalizeLandingPageThemeTokens(tokens);
  return {
    ['--lp-primary' as string]: t.primary,
    ['--lp-accent' as string]: t.accent || t.secondary,
    ['--lp-secondary' as string]: t.secondary,
    ['--lp-bg' as string]: t.background,
    ['--lp-surface' as string]: t.surface,
    ['--lp-text' as string]: t.text,
    ['--lp-muted' as string]: t.muted,
    ['--lp-border' as string]: t.border || '#E2E8F0',
    ['--lp-button' as string]: t.button || t.primary,
    ['--lp-gradient' as string]: t.gradient || `linear-gradient(165deg, ${t.primary}14 0%, ${t.background} 42%, ${t.surface} 100%)`,
    ['--lp-radius' as string]: t.radius,
    ['--lp-shadow' as string]: t.shadow || '0 12px 36px rgba(15, 23, 42, 0.10)',
    ...extendedTokenStyle(t),
    background: t.canvas || t.background,
    color: t.text,
    fontFamily: t.fontFamily,
  };
}

function IconBubble({ index, primary }: { index: number; primary: string }) {
  const d = ICON_SVGS[index % ICON_SVGS.length];
  return (
    <span
      data-lp-icon-bubble="1"
      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
      style={{
        background: `var(--lp-icon-surface, color-mix(in srgb, ${primary} 16%, var(--lp-surface)))`,
        color: `var(--lp-icon-color, ${primary})`,
        boxShadow: 'inset 0 1px 0 color-mix(in srgb, #fff 18%, transparent)',
      }}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d={d} />
      </svg>
    </span>
  );
}

function CheckItem({
  primary,
  children,
  text,
  blockId,
  index,
  canvas,
  blockStyle,
}: {
  primary: string;
  children?: ReactNode;
  text?: string;
  blockId?: string;
  index?: number;
  canvas?: LandingPageCanvasHandlers | null;
  blockStyle?: Record<string, unknown> | null;
}) {
  const elementKey =
    blockId != null && index != null ? (`item:trust-icon-${index}` as const) : null;
  const iconIdMap =
    blockStyle && typeof blockStyle.elementIconIds === 'object' && blockStyle.elementIconIds
      ? (blockStyle.elementIconIds as Record<string, unknown>)
      : {};
  const glyphId = elementKey ? String(iconIdMap[elementKey] || 'check') : 'check';
  const glyph =
    glyphId === 'star'
      ? '★'
      : glyphId === 'heart'
        ? '♥'
        : glyphId === 'bolt'
          ? '⚡'
          : glyphId === 'plus'
            ? '+'
            : glyphId === 'arrow'
              ? '→'
              : glyphId === 'dot'
                ? '●'
                : glyphId === 'shield'
                  ? '🛡'
                  : '✓';

  const icon = (
    <span
      data-lp-trust-icon={index != null ? String(index) : undefined}
      data-lp-box-hit={canvas && blockId != null && index != null ? '1' : undefined}
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
      style={{ background: primary, color: 'var(--lp-on-primary, #fff)' }}
      aria-hidden
    >
      {glyph}
    </span>
  );

  // Always wrap so publish path also applies elementCustomCss / ElementChrome styles.
  const iconNode =
    blockId != null && index != null && elementKey ? (
      <ElementChrome
        blockId={blockId}
        element={elementKey}
        handlers={canvas}
        kind="box"
        blockStyle={blockStyle}
        className="mt-0.5 inline-flex shrink-0"
      >
        {icon}
      </ElementChrome>
    ) : (
      <span className="mt-0.5 inline-flex shrink-0">{icon}</span>
    );

  return (
    <li
      className="flex items-start gap-2 text-sm md:text-base"
      style={{ color: 'var(--lp-text)' }}
      data-lp-trust-row={index != null ? String(index) : undefined}
    >
      {iconNode}
      <div className="min-w-0 flex-1">{children ?? <span>{text}</span>}</div>
    </li>
  );
}

function HeroVisual({
  imageUrl,
  imageStyle,
  layout,
  category,
  primary,
  catalogPreview = false,
}: {
  imageUrl?: string | null;
  imageStyle?: LandingPageImageStyle;
  layout: LandingPageLayout;
  category?: string;
  primary: string;
  /** Hide builder hints in template preview / catalog shot. */
  catalogPreview?: boolean;
}) {
  const visualLabel =
    category === 'agency'
      ? 'Portfolio visual'
      : layout === 'saas'
        ? 'Product preview'
        : layout === 'product'
          ? 'Product visual'
          : category === 'fashion'
            ? 'Lookbook visual'
            : category === 'cosmetics'
              ? 'Beauty visual'
              : 'Hero visual';
  if (imageUrl) {
    return (
      <div className="relative mx-auto w-full max-w-full" data-lp-hero-visual="1">
        <LpContentImage
          src={imageUrl}
          alt={imageStyle?.alt || ''}
          fallbackLabel={visualLabel}
          width={960}
          height={720}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="aspect-[4/5] w-full max-w-full object-cover shadow-lg md:aspect-[5/6]"
          data-lp-img-motion={lpImgMotionAttr(imageStyle)}
          style={{
            borderRadius: imageStyle?.borderRadius || 'var(--lp-radius)',
            ...lpImgStyle(imageStyle),
          }}
        />
        {!catalogPreview ? (
          <div
            className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold shadow"
            style={{ color: 'var(--lp-secondary)' }}
          >
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-white"
              style={{ background: primary, color: 'var(--lp-on-primary, #fff)' }}
            >
              ▶
            </span>
            Xem giới thiệu
          </div>
        ) : null}
      </div>
    );
  }
  // Decorative placeholder — not fake customer photo
  return (
    <div
      className="relative mx-auto flex aspect-[4/5] w-full max-w-full flex-col items-center justify-end overflow-hidden p-6 md:aspect-[5/6]"
      data-lp-hero-visual="1"
      style={{
        borderRadius: 'var(--lp-radius)',
        background: `linear-gradient(160deg, ${primary}28 0%, color-mix(in srgb, var(--lp-secondary) 85%, #0b1f3a) 48%, #0b1220 100%)`,
        boxShadow: 'var(--lp-shadow)',
      }}
    >
      <div
        className="absolute inset-0 opacity-30"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.12) 0%, transparent 40%)',
        }}
      />
      <div
        className="absolute right-4 top-6 rounded-xl bg-white/95 px-3 py-2 text-[11px] font-semibold shadow-md"
        style={{ color: 'var(--lp-secondary)' }}
      >
        KPI +42%
      </div>
      <div
        className="absolute left-4 top-24 rounded-xl bg-white/95 px-3 py-2 text-[11px] font-semibold shadow-md"
        style={{ color: 'var(--lp-secondary)' }}
      >
        Sprint 2 tuần
      </div>
      <div
        className="relative mb-4 flex h-28 w-28 items-center justify-center rounded-2xl bg-white/15 text-3xl text-white backdrop-blur"
        aria-hidden
      >
        ◆
      </div>
      <p className="relative text-center text-xs font-semibold text-white/90">{visualLabel}</p>
      {!catalogPreview ? (
        <p className="relative text-center text-[10px] text-white/55">Thêm ảnh thật trong Builder</p>
      ) : null}
    </div>
  );
}

function LeadFormCard({
  block,
  primary,
  onSubmit,
  onFormStart,
  compact,
  canvas,
  omitHead,
  standard = false,
  mode = 'preview',
  plain = false,
}: {
  plain?: boolean;
  block: LandingPageLeadFormBlock;
  primary: string;
  onSubmit?: (fields: Record<string, string>, blockId: string) => Promise<void> | void;
  onFormStart?: () => void;
  compact?: boolean;
  canvas?: LandingPageCanvasHandlers | null;
  /** When true, skip headline/subheadline (e.g. split layout left column owns copy). */
  omitHead?: boolean;
  standard?: boolean;
  mode?: RenderMode;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({});
  const [success, setSuccess] = useState(false);
  const [plan, setPlan] = useState('');
  const [industryChoice,setIndustryChoice]=useState<{key:string;label:string}|null>(null);
  useEffect(()=>{if(!standard)return;const form=formRef.current;const choose=(event:Event)=>{const value=(event as CustomEvent).detail;if(value&&['dining_option','service_package','website_scope'].includes(value.key)&&typeof value.label==='string')setIndustryChoice({key:value.key,label:value.label.slice(0,200)});};form?.addEventListener('lp-industry-choice',choose);return()=>form?.removeEventListener('lp-industry-choice',choose);},[standard]);
  useEffect(() => {
    if (!standard) return;
    const form = formRef.current;
    const choose = (event: Event) => setPlan(String((event as CustomEvent).detail || ''));
    form?.addEventListener('agency-plan', choose);
    return () => form?.removeEventListener('agency-plan', choose);
  }, [standard]);
  const started = useRef(false);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const theme = block.formTheme || {};
  const radius = theme.radius || 'var(--lp-radius)';
  const headlineColor = theme.headlineColor || 'var(--lp-secondary)';
  const labelColor = theme.labelColor || 'var(--lp-text)';
  const mutedColor = theme.mutedColor || 'var(--lp-muted)';
  const inputBg = theme.inputBg || '#fff';
  const inputBorder = theme.inputBorder || '1px solid rgba(0,0,0,0.1)';
  const inputColor = theme.inputColor || '#171717';
  const buttonBg = theme.buttonBg || primary;
  const buttonColor = theme.buttonColor || 'var(--lp-on-primary, #fff)';
  const optionBg = theme.optionBg || 'rgba(0,0,0,0.06)';
  const optionBorder = theme.optionBorder || '1px solid transparent';
  const titleFont =
    theme.titleFont === 'serif'
      ? 'Georgia, "Times New Roman", serif'
      : undefined;
  const inputRadius = theme.inputRadius || 'calc(var(--lp-inner-radius, 8px))';
  const footerDefault = (block.style as Record<string, unknown> | undefined)?.lpAiGenerated === '1' ? 'Kiểm tra thông tin trước khi gửi yêu cầu.' : 'Bảo mật thông tin — không chia sẻ cho bên thứ ba';

  function renderOptionField(f: LandingPageLeadFormBlock['fields'][number]) {
    const layout = f.optionsLayout || (f.fieldType === 'checkbox' ? 'checkboxes' : f.fieldType === 'radio' ? 'buttons' : 'select');
    const opts = f.options || [];
    if (layout === 'select' || (f.fieldType === 'select' && !f.optionsLayout)) {
      return (
        <select
          name={f.name}
          required={f.required}
          aria-invalid={standard && fieldErrors[f.name] ? true : undefined}
          aria-describedby={standard && fieldErrors[f.name] ? `error-${block.id}-${f.id}` : undefined}
          aria-required={f.required || undefined}
          className="min-h-[48px] w-full px-3 py-2.5 text-base outline-none"
          style={{
            borderRadius: inputRadius,
            background: inputBg,
            border: inputBorder,
            color: inputColor,
          }}
          defaultValue=""
        >
          <option value="" disabled>
            {f.placeholder || 'Chọn…'}
          </option>
          {opts.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    }

    if (layout === 'emoji' || layout === 'scale' || layout === 'stars') {
      return (
        <div
          className={`flex flex-wrap gap-2 ${layout === 'emoji' || layout === 'stars' ? 'justify-center' : ''}`}
          role="radiogroup"
          aria-label={f.label}
        >
          {opts.map((o, idx) => {
            const display =
              layout === 'stars' ? '★' : layout === 'scale' ? o : o;
            return (
              <label
                key={`${f.id}-${idx}`}
                className="relative flex cursor-pointer items-center justify-center transition hover:scale-105"
                style={{
                  width: layout === 'scale' ? 40 : 48,
                  height: layout === 'scale' ? 40 : 48,
                  borderRadius: layout === 'emoji' ? 999 : 10,
                  background: optionBg,
                  border: optionBorder,
                  color: layout === 'stars' ? '#f59e0b' : labelColor,
                  fontSize: layout === 'emoji' ? 22 : layout === 'stars' ? 22 : 14,
                  fontWeight: 700,
                }}
              >
                <input
                  type="radio"
                  name={f.name}
                  value={o}
                  required={f.required && idx === 0}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                <span aria-hidden>{display}</span>
              </label>
            );
          })}
        </div>
      );
    }

    const multi = f.fieldType === 'checkbox' || layout === 'checkboxes';
    return (
      <div className="space-y-2" role={multi ? 'group' : 'radiogroup'} aria-label={f.label}>
        {opts.map((o, idx) => (
          <label
            key={`${f.id}-${idx}`}
            className="flex cursor-pointer items-start gap-2.5 px-3 py-2.5 text-sm font-medium transition hover:brightness-95"
            style={{
              borderRadius: inputRadius,
              background: optionBg,
              border: optionBorder,
              color: labelColor,
            }}
          >
            <input
              type={multi ? 'checkbox' : 'radio'}
              name={f.name}
              value={o}
              required={!multi && f.required && idx === 0}
              className="mt-0.5 h-4 w-4 shrink-0"
            />
            <InlineEditable
                as="span"
                blockId={block.id}
                field={`fieldOption:${f.id}:${idx}`}
                value={o}
                handlers={canvas}
                        blockStyle={(block.style || {}) as Record<string, unknown>}
                textRole="form-label"
                className="flex-1 leading-snug"
                style={{ color: labelColor }}
              />
          </label>
        ))}
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      aria-busy={standard ? pending : undefined}
      id="lead-form"
      data-lp-form-block="1"
      data-lp-form-hit="1"
      data-lp-transformable="1"
      className={`${standard ? 'agency-form-card'+(success?' agency-is-success':'') : 'space-y-3'} ${compact ? 'w-full max-w-full' : 'mx-auto w-full max-w-full sm:max-w-lg'}`}
      noValidate={standard}
      style={{
        background: theme.background || 'var(--lp-surface)',
        borderRadius: radius,
        boxShadow: plain ? 'none' : standard ? '0 12px 30px rgba(15,23,42,.04)' : theme.background ? '0 12px 40px rgba(15,23,42,0.14)' : '0 12px 40px rgba(15,23,42,0.12)',
        padding: plain ? '0' : standard ? 'var(--agency-form-padding, 30px)' : compact ? '1.25rem' : '1.75rem',
        border: theme.border || `2px solid ${primary}33`,
      }}
      onFocus={() => {
        if (!started.current) {
          started.current = true;
          onFormStart?.();
        }
      }}
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (standard) {
          const errors: Record<string,string> = {};
          for (const field of block.fields) {
            const input = form.elements.namedItem(field.name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
            if (input && (!input.checkValidity() || (field.required && !input.value.trim()))) errors[field.name] = field.required && !input.value.trim() ? `Vui lòng nhập ${field.label.toLowerCase()}.` : `Vui lòng kiểm tra ${field.label.toLowerCase()}.`;
          }
          setFieldErrors(errors);
          if (Object.keys(errors).length) { (form.elements.namedItem(Object.keys(errors)[0]!) as HTMLElement)?.focus(); return; }
        } else if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        if (pending) return;
        if (!onSubmit && !standard) return;
        if (standard && mode === 'public' && !onSubmit) { setFormError('Chưa thể gửi yêu cầu. Vui lòng thử lại sau.'); return; }
        const fd = new FormData(form);
        const fields: Record<string, string> = {};
        for (const [k, v] of fd.entries()) {
          const s = String(v);
          if (fields[k]) fields[k] = `${fields[k]}, ${s}`;
          else fields[k] = s;
        }
        if (standard && plan) fields.cooperation = plan;
        if(standard&&industryChoice)fields[industryChoice.key]=industryChoice.label;
        setPending(true);
        setFormError(null);
        void Promise.resolve().then(() => standard && mode === 'preview'
          ? new Promise<void>(resolve => setTimeout(resolve, 500))
          : onSubmit?.(fields, block.id))
          .then(() => { if (standard) setSuccess(true); })
          .catch((err: unknown) => {
            setFormError(err instanceof Error ? err.message : 'Không gửi được. Thử lại.');
          })
          .finally(() => setPending(false));
      }}
    >
      {standard&&industryChoice?<p data-industry-selection>Lựa chọn quan tâm: {industryChoice.label}</p>:null}
      {standard && plan ? <p className="agency-selection">Cách hợp tác quan tâm: {plan}</p> : null}
      {standard && success ? <div className="agency-form-success" role="status"><h3>{block.successMessage || 'Đã nhận được yêu cầu của bạn.'}</h3>{mode === 'preview' ? <p>Đây là trạng thái mô phỏng trong bản thiết kế. Không có thông tin nào được gửi đi.</p> : null}<button type="button" className="btn btn-outline" onClick={() => setSuccess(false)}>Gửi yêu cầu khác</button></div> : null}
      {omitHead ? null : showCanvasInlineField(block.headline, canvas, block.id, 'headline') ? (
        <InlineEditable
          as="h3"
          blockId={block.id}
          field="headline"
          value={block.headline || ''}
          handlers={canvas}
          blockStyle={(block.style || {}) as Record<string, unknown>}
          textRole="heading"
          className="text-lg font-bold md:text-xl"
          style={{ color: headlineColor, fontFamily: titleFont }}
        />
      ) : null}
      {omitHead ? null : showCanvasInlineField(block.subheadline, canvas, block.id, 'subheadline') ? (
        <InlineEditable
          as="p"
          blockId={block.id}
          field="subheadline"
          value={block.subheadline || ''}
          handlers={canvas}
          blockStyle={(block.style || {}) as Record<string, unknown>}
          multiline
          textRole="paragraph"
          className="text-sm"
          style={{ color: mutedColor }}
        />
      ) : null}
      {block.fields.map((f) => {
        const isChoice =
          f.fieldType === 'select' ||
          f.fieldType === 'checkbox' ||
          f.fieldType === 'radio' ||
          Boolean(f.optionsLayout);
        return (
          <label key={f.id} className="block text-sm" data-lp-field-name={f.name}>
            {f.label.trim() ? (
              <span className="mb-1.5 block font-medium" style={{ color: labelColor }}>
                <InlineEditable
                    as="span"
                    blockId={block.id}
                    field={`fieldLabel:${f.id}`}
                    value={f.label}
                    handlers={canvas}
                        blockStyle={(block.style || {}) as Record<string, unknown>}
                    textRole="form-label"
                    className="font-medium"
                    style={{ color: labelColor }}
                  />
                {f.required ? (
                  <span className="text-red-600" aria-hidden>
                    {' '}
                    *
                  </span>
                ) : standard ? <span className="form-optional">Không bắt buộc</span> : null}
              </span>
            ) : null}
            {isChoice && (f.options?.length || 0) > 0 ? (
              renderOptionField(f)
            ) : f.fieldType === 'textarea' ? (
              <textarea
                name={f.name}
                aria-invalid={standard && fieldErrors[f.name] ? true : undefined}
                aria-describedby={standard && fieldErrors[f.name] ? `error-${block.id}-${f.id}` : undefined}
                required={f.required}
                placeholder={f.placeholder}
                aria-required={f.required || undefined}
                className="min-h-[88px] w-full px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-black/5"
                style={{
                  borderRadius: theme.inputUnderline ? '0px' : inputRadius,
                  background: theme.inputUnderline ? 'transparent' : inputBg,
                  border: standard && fieldErrors[f.name] ? '1px solid #B42318' : theme.inputUnderline ? 'none' : inputBorder,
                  borderBottom: theme.inputUnderline
                    ? theme.inputBorderBottom || inputBorder || '1px solid currentColor'
                    : undefined,
                  color: inputColor,
                }}
                rows={3}
              />
            ) : (
              <input
                name={f.name}
                aria-invalid={standard && fieldErrors[f.name] ? true : undefined}
                aria-describedby={standard && fieldErrors[f.name] ? `error-${block.id}-${f.id}` : undefined}
                type={f.fieldType === 'email' || f.fieldType === 'tel' ? f.fieldType : 'text'}
                required={f.required}
                placeholder={f.placeholder}
                aria-required={f.required || undefined}
                autoComplete={
                  f.fieldType === 'email'
                    ? 'email'
                    : f.fieldType === 'tel'
                      ? 'tel'
                      : f.name === 'name'
                        ? 'name'
                        : undefined
                }
                pattern={f.fieldType === 'tel' ? (standard ? String.raw`[0-9+\s\(\)\-]{8,20}` : '[0-9+()\\-\\s]{8,20}') : undefined}
                title={
                  f.fieldType === 'tel'
                    ? 'Nhập số điện thoại hợp lệ (8–20 ký tự)'
                    : f.required
                      ? 'Vui lòng điền trường này'
                      : undefined
                }
                className="min-h-[48px] w-full px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-black/5"
                style={{
                  borderRadius: theme.inputUnderline ? '0px' : inputRadius,
                  background: theme.inputUnderline ? 'transparent' : inputBg,
                  border: standard && fieldErrors[f.name] ? '1px solid #B42318' : theme.inputUnderline ? 'none' : inputBorder,
                  borderBottom: theme.inputUnderline
                    ? theme.inputBorderBottom || inputBorder || '1px solid currentColor'
                    : undefined,
                  color: inputColor,
                }}
              />
            )}
            {standard && fieldErrors[f.name] ? <span id={`error-${block.id}-${f.id}`} data-lp-field-error role="alert">{fieldErrors[f.name]}</span> : null}
          </label>
        );
      })}
      {formError ? (
        <p className="text-sm font-medium text-red-700" data-lp-form-error role="alert">
          {formError}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="flex min-h-[52px] w-full items-center justify-center gap-2 px-4 py-3 text-base font-bold transition hover:brightness-105 disabled:opacity-60"
        style={{
          background: buttonBg,
          color: buttonColor,
          borderRadius: theme.buttonRadius || 'calc(var(--lp-radius) - 2px)',
          fontFamily: titleFont,
        }}
      >
        <InlineEditable
            as="span"
            blockId={block.id}
            field="submitLabel"
            value={standard && pending ? 'Đang gửi…' : block.submitLabel || 'Gửi'}
            handlers={canvas}
                        blockStyle={(block.style || {}) as Record<string, unknown>}
            textRole="button"
            className="font-bold"
            style={{ color: buttonColor }}
          />
        {!plain ? <span aria-hidden>{standard ? <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg> : '→'}</span> : null}
      </button>
      {!plain || block.footerText ? <p className={`flex items-center justify-center gap-1.5 text-center text-[11px] ${standard ? 'agency-form-footer' : ''}`} style={{ color: mutedColor }}>
        <span aria-hidden>{standard ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3"/></svg> : '🔒'}</span>
        <InlineEditable
            as="span"
            blockId={block.id}
            field="footerText"
            value={block.footerText || footerDefault}
            handlers={canvas}
                        blockStyle={(block.style || {}) as Record<string, unknown>}
            textRole="paragraph"
            className="text-[11px]"
            style={{ color: mutedColor }}
          />
      </p> : null}
    </form>
  );
}

function SectionHead({
  headline,
  subheadline,
  eyebrow,
  align = 'center',
  blockId,
  canvas,
  blockStyle,
}: {
  headline?: string;
  subheadline?: string;
  eyebrow?: string;
  align?: 'center' | 'left';
  blockId?: string;
  canvas?: LandingPageCanvasHandlers | null;
  blockStyle?: Record<string, unknown> | null;
}) {
  const showHeadline = showCanvasInlineField(headline, canvas, blockId, 'headline');
  const showSubheadline = showCanvasInlineField(subheadline, canvas, blockId, 'subheadline');
  if (!showHeadline && !showSubheadline && !eyebrow) return null;
  return (
    <div
      className={`mb-5 max-w-full md:mb-7 ${align === 'center' ? 'mx-auto max-w-2xl text-center' : ''}`}
      data-lp-section-head="1"
      data-lp-align={align}
    >
      {eyebrow && blockStyle?.lpAiGenerated !== '1' ? (
        <div data-lp-section-eyebrow="1">{eyebrow}</div>
      ) : null}
      {showHeadline ? (
        blockId ? (
          <InlineEditable
            as="h2"
            blockId={blockId}
            field="headline"
            value={headline || ''}
            handlers={canvas}
            blockStyle={blockStyle}
            textRole="heading"
            className="break-words text-2xl font-extrabold tracking-tight md:text-[1.75rem]"
            style={{ color: 'var(--lp-text-on-light, var(--lp-text))' }}
          />
        ) : (
          <h2
            className="break-words text-2xl font-extrabold tracking-tight md:text-[1.75rem]"
            style={{ color: 'var(--lp-text-on-light, var(--lp-text))' }}
          >
            {headline}
          </h2>
        )
      ) : null}
      {showSubheadline ? (
        blockId ? (
          <InlineEditable
            as="p"
            blockId={blockId}
            field="subheadline"
            value={subheadline || ''}
            handlers={canvas}
            blockStyle={blockStyle}
            multiline
            textRole="paragraph"
            className="mt-2.5 text-sm leading-relaxed md:text-[15px]"
            style={{ color: 'var(--lp-muted-on-light, var(--lp-muted))' }}
          />
        ) : (
          <p className="mt-2.5 text-sm leading-relaxed md:text-[15px]" style={{ color: 'var(--lp-muted-on-light, var(--lp-muted))' }}>
            {subheadline}
          </p>
        )
      ) : null}
    </div>
  );
}

function HeroBlock({
  block,
  layout,
  category,
  primary,
  leadForm,
  onLeadSubmit,
  onFormStart,
  canvas,
  mode = 'preview',
}: {
  block: LandingPageTextBlock;
  layout: LandingPageLayout;
  category?: string;
  primary: string;
  leadForm?: LandingPageLeadFormBlock | null;
  onLeadSubmit?: (fields: Record<string, string>, blockId: string) => Promise<void> | void;
  onFormStart?: () => void;
  canvas?: LandingPageCanvasHandlers | null;
  mode?: RenderMode;
}) {
  const catalogPreview = (mode === 'preview' && !canvas) || Boolean(readSectionLibraryContext(block));
  const variant = resolveBlockVariant('Hero', block.variant);
  const composition = resolveHeroComposition(
    block.variant,
    layout,
    Boolean(leadForm && (layout === 'lead_gen' || variant === 'floating-card')),
  );

  const fromField = (block.trustPoints || []).map((s) => s.trim()).filter(Boolean);
  const fromBody = (block.body || '')
    .split(/[|\n•]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
  const aiGenerated = (block.style as Record<string, unknown> | undefined)?.lpAiGenerated === '1';
  const defaultTrust =
    aiGenerated ? fromField : fromField.length > 0
      ? fromField
      : fromBody.length > 0
        ? fromBody
        : layout === 'webinar'
          ? ['Framework áp dụng ngay', 'Case study thực tế', 'Tài liệu kèm theo']
          : ['Tư vấn rõ ràng', 'Phản hồi nhanh', 'Cam kết minh bạch'];

  const eventMeta = [block.eventDate, block.eventTime, block.eventFormat].filter(Boolean) as string[];
  const showTrust = composition !== 'minimal-copy' && composition !== 'conversion-proof' && composition !== 'dark-cinematic';

  const renderHeadline = (className: string) =>
    showCanvasInlineField(block.headline, canvas, block.id, 'headline') ? (
      <InlineEditable
        as="h1"
        blockId={block.id}
        field="headline"
        value={block.headline || ''}
        handlers={canvas}
        blockStyle={(block.style || {}) as Record<string, unknown>}
        textRole="heading"
        className={className}
        style={{ color: 'var(--lp-text)', fontSize: 'var(--lp-fs-hero)' }}
      />
    ) : null;

  const renderSub = (className: string) =>
    showCanvasInlineField(block.subheadline, canvas, block.id, 'subheadline') ? (
      <InlineEditable
        as="p"
        blockId={block.id}
        field="subheadline"
        value={block.subheadline || ''}
        handlers={canvas}
        blockStyle={(block.style || {}) as Record<string, unknown>}
        multiline
        textRole="paragraph"
        className={className}
        style={{ color: 'var(--lp-muted)' }}
      />
    ) : null;

  const cta = showCanvasInlineField(block.ctaLabel, canvas, block.id, 'ctaLabel') ? (
    canvas ? (
      <InlineEditable
        as={readSectionLibraryContext(block) ? 'a' : 'span'}
        blockId={block.id}
        field="ctaLabel"
        value={block.ctaLabel || ''}
        handlers={canvas}
        blockStyle={(block.style || {}) as Record<string, unknown>}
        textRole="button"
        className="inline-flex min-h-[48px] items-center gap-2 px-7 py-3.5 text-sm font-extrabold shadow-lg md:text-base"
        style={{
          background: primary,
          color: 'var(--lp-on-primary, #fff)',
          borderRadius: 'var(--lp-button-radius, calc(var(--lp-radius) - 2px))',
        }}
      />
    ) : (
      <a
        href={block.ctaUrl || '#lead-form'}
        className="inline-flex min-h-[48px] items-center gap-2 px-7 py-3.5 text-sm font-extrabold shadow-lg transition hover:brightness-105 md:text-base"
        style={{
          background: primary,
          color: 'var(--lp-on-primary, #fff)',
          borderRadius: 'var(--lp-button-radius, calc(var(--lp-radius) - 2px))',
        }}
      >
        <InlineEditable
          as="span"
          blockId={block.id}
          field="ctaLabel"
          value={block.ctaLabel || ''}
          handlers={null}
          blockStyle={(block.style || {}) as Record<string, unknown>}
          textRole="button"
        />
        <span aria-hidden>→</span>
      </a>
    )
  ) : null;

  const wrapVisual = (node: ReactNode) => (
    <ElementChrome
      blockId={block.id}
      element="image"
      handlers={canvas}
      kind="image"
      blockStyle={(block.style || {}) as Record<string, unknown>}
    >
      <div data-lp-hero-visual="1">{node}</div>
    </ElementChrome>
  );

  const badge =
    aiGenerated ? null : layout === 'webinar' ? (
      <span
        className="mb-4 inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
        style={{ background: `${primary}18`, color: primary }}
      >
        Webinar Online — Miễn phí
      </span>
    ) : layout === 'saas' ? (
      <span
        className="mb-4 inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
        style={{ background: `${primary}18`, color: primary }}
      >
        Dùng thử miễn phí
      </span>
    ) : layout === 'course' ? (
      <span
        className="mb-4 inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
        style={{ background: `${primary}18`, color: primary }}
      >
        Khóa học thực chiến
      </span>
    ) : null;

  const eventBoxes =
    eventMeta.length > 0 ? (
      <div className="mt-5 flex flex-wrap gap-2">
        {eventMeta.map((m) => (
          <div
            key={m}
            className="rounded-lg border px-3 py-2 text-xs font-semibold shadow-sm"
            style={{
              color: 'var(--lp-secondary)',
              background: 'var(--lp-surface)',
              borderColor: 'var(--lp-border)',
            }}
          >
            {m}
          </div>
        ))}
      </div>
    ) : null;

  const trustList = showTrust ? (
    <ul className="mt-5 space-y-2.5 md:mt-6" data-lp-hero-trust="1">
      {defaultTrust.map((t, i) => (
        <CheckItem
          key={`trust-${i}`}
          primary={primary}
          blockId={block.id}
          index={i}
          canvas={canvas}
          blockStyle={(block.style || {}) as Record<string, unknown>}
        >
          {canvas ? (
            <InlineEditable
              as="span"
              blockId={block.id}
              field={`trustPoint:${i}`}
              value={t}
              handlers={canvas}
              blockStyle={(block.style || {}) as Record<string, unknown>}
              textRole="paragraph"
              className="text-sm leading-snug md:text-base"
              style={{ color: 'var(--lp-text)' }}
            />
          ) : (
            <span data-lp-motion-field={`trustPoint:${i}`}>{t}</span>
          )}
        </CheckItem>
      ))}
    </ul>
  ) : null;

  const copyCol = (
    <div data-lp-hero-copy="1">
      {badge}
      {renderHeadline('font-extrabold tracking-tight')}
      {renderSub('mt-4 max-w-2xl leading-relaxed md:mt-5')}
      {eventBoxes}
      {trustList}
      <div className="mt-6 flex flex-wrap gap-3 md:mt-8" data-lp-hero-cta="1">
        {cta}
      </div>
    </div>
  );

  const visual = wrapVisual(
    <HeroVisual
      imageUrl={block.imageUrl}
      imageStyle={block.imageStyle}
      layout={layout}
      category={category}
      primary={primary}
      catalogPreview={catalogPreview}
    />,
  );

  // floating-card: copy | visual | form/card
  if (composition === 'floating-card' && leadForm) {
    return (
      <section
        className={`${spacingClass(block.spacing)} relative overflow-hidden px-4 sm:px-6`}
        style={sectionBgStyle(block, 'var(--lp-gradient)')}
        data-lp-section-tone={sectionToneAttr(block)}
        data-lp-bg-motion={sectionBgMotionAttr(block)}
        data-lp-variant={composition}
        aria-label="Hero"
      >
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-12 lg:items-start lg:gap-8" data-lp-hero-grid="1" data-lp-container-inner="1">
          <div className="lg:col-span-5">{copyCol}</div>
          <div className="order-last mx-auto w-full max-w-xs sm:max-w-sm lg:order-none lg:col-span-3 lg:mx-0 lg:max-w-none">
            {visual}
          </div>
          <div className="lg:col-span-4" data-lp-hero-float="1" data-lp-form-variant="floating-card">
            <LeadFormCard
              block={leadForm}
              primary={primary}
              onSubmit={onLeadSubmit}
              onFormStart={onFormStart}
              compact
              canvas={canvas}
            />
          </div>
        </div>
      </section>
    );
  }

  if (composition === 'floating-card') {
    return (
      <section
        className={`${spacingClass(block.spacing)} relative overflow-hidden px-4 sm:px-6`}
        style={sectionBgStyle(block, 'var(--lp-gradient)')}
        data-lp-section-tone={sectionToneAttr(block)}
        data-lp-bg-motion={sectionBgMotionAttr(block)}
        data-lp-variant={composition}
        aria-label="Hero"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-7 md:grid-cols-2 md:gap-10" data-lp-hero-grid="1" data-lp-container-inner="1">
          {copyCol}
          <div data-lp-hero-float="1" className="p-4 md:p-6">
            {visual}
          </div>
        </div>
      </section>
    );
  }

  if (composition === 'editorial-overlay') {
    const bg = block.imageUrl
      ? `url(${block.imageUrl})`
      : `linear-gradient(160deg, ${primary}88 0%, var(--lp-secondary) 100%)`;
    return (
      <section
        className={`${spacingClass(block.spacing)} relative overflow-hidden px-4 sm:px-6 py-16 md:py-24`}
        style={sectionBgStyle(block)}
        data-lp-section-tone="dark"
        data-lp-variant={composition}
        aria-label="Hero"
      >
        <div
          className="absolute inset-0"
          data-lp-hero-overlay-bg="1"
          style={{
            backgroundImage: bg,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              'linear-gradient(105deg, rgba(8,10,16,0.82) 0%, rgba(8,10,16,0.45) 52%, rgba(8,10,16,0.22) 100%)',
          }}
        />
        <div className="relative z-[1] mx-auto max-w-6xl" data-lp-container-inner="1" data-lp-hero-on-dark="1">
          {copyCol}
        </div>
      </section>
    );
  }

  if (composition === 'fullscreen-image') {
    return (
      <section
        className={`${spacingClass(block.spacing)} relative overflow-hidden px-4 sm:px-6`}
        style={sectionBgStyle(block, 'var(--lp-gradient)')}
        data-lp-section-tone={sectionToneAttr(block)}
        data-lp-bg-motion={sectionBgMotionAttr(block)}
        data-lp-variant={composition}
        aria-label="Hero"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-8" data-lp-container-inner="1">
          {visual}
          <div className="mx-auto max-w-3xl text-center">{copyCol}</div>
        </div>
      </section>
    );
  }

  if (composition === 'split-left' || composition === 'split-right') {
    const reverse = composition === 'split-right';
    return (
      <section
        className={`${spacingClass(block.spacing)} relative overflow-hidden px-4 sm:px-6`}
        style={sectionBgStyle(block, 'var(--lp-gradient)')}
        data-lp-section-tone={sectionToneAttr(block)}
        data-lp-bg-motion={sectionBgMotionAttr(block)}
        data-lp-variant={composition}
        aria-label="Hero"
      >
        <div
          className={`mx-auto grid max-w-6xl items-center gap-7 md:grid-cols-2 md:gap-10 ${
            reverse ? 'md:[&>*:first-child]:order-2' : ''
          }`}
          data-lp-hero-grid="1"
          data-lp-container-inner="1"
        >
          {copyCol}
          {visual}
        </div>
      </section>
    );
  }

  if (composition === 'asymmetric') {
    return (
      <section
        className={`${spacingClass(block.spacing)} relative overflow-hidden px-4 sm:px-6`}
        style={sectionBgStyle(block, 'var(--lp-gradient)')}
        data-lp-section-tone={sectionToneAttr(block)}
        data-lp-bg-motion={sectionBgMotionAttr(block)}
        data-lp-variant={composition}
        aria-label="Hero"
      >
        <div
          className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-12 md:gap-8"
          data-lp-hero-grid="1"
          data-lp-container-inner="1"
        >
          <div className="md:col-span-5">{copyCol}</div>
          <div className="md:col-span-7 md:-mr-4 lg:-mr-8" data-lp-hero-bleed="1">
            {visual}
          </div>
        </div>
      </section>
    );
  }

  if (composition === 'image-collage') {
    const src = block.imageUrl;
    return (
      <section
        className={`${spacingClass(block.spacing)} relative overflow-hidden px-4 sm:px-6`}
        style={sectionBgStyle(block, 'var(--lp-gradient)')}
        data-lp-section-tone={sectionToneAttr(block)}
        data-lp-variant={composition}
        aria-label="Hero"
      >
        <div
          className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2 md:gap-10"
          data-lp-hero-grid="1"
          data-lp-container-inner="1"
        >
          {copyCol}
          <div className="grid grid-cols-2 gap-3 md:gap-4" data-lp-hero-collage="1">
            <div className="col-span-2 overflow-hidden" style={{ borderRadius: 'var(--lp-radius-lg, var(--lp-radius))' }}>
              {visual}
            </div>
            {src ? (
              <>
                <div className="overflow-hidden aspect-[4/3]" style={{ borderRadius: 'var(--lp-radius)' }}>
                  <LpContentImage
                    src={src}
                    alt=""
                    fallbackLabel=""
                    width={400}
                    height={300}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-[20%_40%] scale-110"
                    style={{ borderRadius: 'var(--lp-radius)' }}
                  />
                </div>
                <div className="overflow-hidden aspect-[4/3]" style={{ borderRadius: 'var(--lp-radius)' }}>
                  <LpContentImage
                    src={src}
                    alt=""
                    fallbackLabel=""
                    width={400}
                    height={300}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-[80%_60%] scale-110"
                    style={{ borderRadius: 'var(--lp-radius)' }}
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  if (composition === 'product-screenshot') {
    return (
      <section
        className={`${spacingClass(block.spacing)} relative overflow-hidden px-4 sm:px-6`}
        style={sectionBgStyle(block, 'var(--lp-gradient)')}
        data-lp-section-tone={sectionToneAttr(block)}
        data-lp-variant={composition}
        aria-label="Hero"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-8" data-lp-container-inner="1">
          <div className="mx-auto max-w-3xl text-center">{copyCol}</div>
          <div
            className="relative mx-auto w-full max-w-5xl overflow-hidden border shadow-2xl"
            data-lp-hero-screenshot="1"
            style={{
              borderRadius: 'var(--lp-radius-lg, 16px)',
              borderColor: 'var(--lp-border)',
              background: 'var(--lp-surface)',
            }}
          >
            <div
              className="flex items-center gap-1.5 border-b px-4 py-2.5"
              style={{ borderColor: 'var(--lp-border)', background: 'var(--lp-surface-alt, var(--lp-canvas))' }}
              aria-hidden
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#F87171' }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#FBBF24' }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#34D399' }} />
            </div>
            <div className="[&_[data-lp-hero-visual]_img]:aspect-[16/10] [&_[data-lp-hero-visual]_img]:rounded-none">
              {visual}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (composition === 'layered-cards') {
    return (
      <section
        className={`${spacingClass(block.spacing)} relative overflow-hidden px-4 sm:px-6`}
        style={sectionBgStyle(block, 'var(--lp-gradient)')}
        data-lp-section-tone={sectionToneAttr(block)}
        data-lp-variant={composition}
        aria-label="Hero"
      >
        <div
          className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2 md:gap-12"
          data-lp-hero-grid="1"
          data-lp-container-inner="1"
        >
          {copyCol}
          <div className="relative mx-auto w-full max-w-lg" data-lp-hero-layers="1">
            <div
              className="absolute -left-3 top-6 h-[88%] w-[92%] rotate-[-4deg] border opacity-70 md:-left-6"
              style={{
                borderRadius: 'var(--lp-radius-lg, var(--lp-radius))',
                background: 'var(--lp-surface-alt, var(--lp-canvas))',
                borderColor: 'var(--lp-border)',
                boxShadow: 'var(--lp-shadow-md)',
              }}
              aria-hidden
            />
            <div
              className="absolute -right-2 top-3 h-[90%] w-[90%] rotate-[3deg] border opacity-80 md:-right-5"
              style={{
                borderRadius: 'var(--lp-radius-lg, var(--lp-radius))',
                background: 'color-mix(in srgb, var(--lp-primary) 12%, var(--lp-surface))',
                borderColor: 'var(--lp-border)',
                boxShadow: 'var(--lp-shadow-sm)',
              }}
              aria-hidden
            />
            <div className="relative z-[1]">{visual}</div>
          </div>
        </div>
      </section>
    );
  }

  if (composition === 'dark-cinematic') {
    const bg = block.imageUrl
      ? `linear-gradient(105deg, rgba(8,10,16,0.92) 0%, rgba(8,10,16,0.55) 48%, rgba(8,10,16,0.25) 100%), url(${block.imageUrl})`
      : `linear-gradient(135deg, #0B0E14 0%, color-mix(in srgb, ${primary} 35%, #0B0E14) 55%, #12161F 100%)`;
    return (
      <section
        className={`${spacingClass(block.spacing)} relative min-h-[min(62vh,520px)] overflow-hidden px-4 sm:px-6 py-14 md:py-20`}
        style={{
          ...sectionBgStyle(block),
          backgroundImage: bg,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        data-lp-section-tone="dark"
        data-lp-variant={composition}
        aria-label="Hero"
      >
        <div className="relative z-[1] mx-auto max-w-3xl" data-lp-container-inner="1" data-lp-hero-on-dark="1">
          {copyCol}
        </div>
      </section>
    );
  }

  if (composition === 'gradient-mesh') {
    return (
      <section
        className={`${spacingClass(block.spacing)} relative overflow-hidden px-4 sm:px-6`}
        style={sectionBgStyle(block)}
        data-lp-section-tone={sectionToneAttr(block)}
        data-lp-variant={composition}
        aria-label="Hero"
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 15% 20%, color-mix(in srgb, ${primary} 42%, transparent) 0%, transparent 55%),
              radial-gradient(ellipse 50% 45% at 88% 15%, color-mix(in srgb, var(--lp-accent, ${primary}) 28%, transparent) 0%, transparent 50%),
              radial-gradient(ellipse 55% 40% at 70% 85%, color-mix(in srgb, var(--lp-secondary) 18%, transparent) 0%, transparent 55%),
              var(--lp-gradient, var(--lp-canvas))
            `,
          }}
        />
        <div
          className="relative z-[1] mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2 md:gap-10"
          data-lp-hero-grid="1"
          data-lp-container-inner="1"
        >
          {copyCol}
          {visual}
        </div>
      </section>
    );
  }

  if (composition === 'conversion-proof') {
    const proofs = defaultTrust.slice(0, 3);
    return (
      <section
        className={`${spacingClass(block.spacing)} relative overflow-hidden px-4 sm:px-6`}
        style={sectionBgStyle(block, 'var(--lp-gradient)')}
        data-lp-section-tone={sectionToneAttr(block)}
        data-lp-variant={composition}
        aria-label="Hero"
      >
        <div
          className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-12 md:gap-10"
          data-lp-hero-grid="1"
          data-lp-container-inner="1"
        >
          <div className="md:col-span-6">
            {copyCol}
            <div className="mt-6 flex flex-wrap gap-2" data-lp-hero-proof="1">
              {proofs.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
                  style={{
                    borderColor: 'var(--lp-border)',
                    background: 'var(--lp-surface)',
                    color: 'var(--lp-secondary)',
                    boxShadow: 'var(--lp-shadow-sm)',
                  }}
                >
                  <span aria-hidden style={{ color: primary }}>
                    ★
                  </span>
                  {p}
                </span>
              ))}
            </div>
          </div>
          <div className="md:col-span-6">{visual}</div>
        </div>
      </section>
    );
  }

  // centered | minimal-copy | default fallback — keep visual large (no tiny inset)
  return (
    <section
      className={`${spacingClass(block.spacing)} relative overflow-hidden px-4 sm:px-6`}
      style={sectionBgStyle(block, composition === 'centered' ? 'var(--lp-gradient)' : undefined)}
      data-lp-section-tone={sectionToneAttr(block)}
      data-lp-bg-motion={sectionBgMotionAttr(block)}
      data-lp-variant={composition}
      aria-label="Hero"
    >
      <div className="mx-auto max-w-6xl text-center" data-lp-container-inner="1">
        {copyCol}
        {block.imageUrl && composition !== 'minimal-copy' ? (
          wrapVisual(
            <LpContentImage
              src={block.imageUrl}
              alt={block.imageStyle?.alt || ''}
              fallbackLabel="Hero visual"
              width={1100}
              height={620}
              loading="lazy"
              decoding="async"
              className="mx-auto mt-8 w-full max-w-5xl object-cover shadow-lg"
              data-lp-img-motion={lpImgMotionAttr(block.imageStyle)}
              style={{
                borderRadius: block.imageStyle?.borderRadius || 'var(--lp-image-radius, var(--lp-radius))',
                aspectRatio: '16 / 9',
                ...lpImgStyle(block.imageStyle),
              }}
            />,
          )
        ) : null}
      </div>
    </section>
  );
}

/** Natural card counts: center one, balance two/four, then use three columns. */
function itemCountGridClass(count: number): string {
  if (count <= 1) return 'mx-auto w-full max-w-xl grid-cols-1';
  if (count === 2 || count === 4) return 'grid-cols-1 sm:grid-cols-2';
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
}

function ListCards({
  block,
  primary,
  layout,
  category,
  canvas,
}: {
  block: LandingPageListBlock;
  primary: string;
  layout: LandingPageLayout;
  category?: string;
  canvas?: LandingPageCanvasHandlers | null;
}) {
  const isProcess = block.type === 'Process';
  const listVariant = resolveListComposition(block.type, block.variant);
  const galleryVariant =
    block.type === 'Gallery' ? canonicalBlockVariant('Gallery', block.variant) : null;
  const cols = listVariant === 'minimal-list' || listVariant === 'editorial-list' || listVariant === 'numbered'
    ? 'grid-cols-1'
    : itemCountGridClass(block.items.length);


  // Title / paragraph-only insert (empty items): headline or subheadline as text block.
  if (!block.items.length) {
    return (
      <section
        className={`${spacingClass(block.spacing)} px-4 sm:px-6`}
        style={sectionBgStyle(block)}
        data-lp-section-tone={sectionToneAttr(block)}
        data-lp-bg-motion={sectionBgMotionAttr(block)}
        data-lp-title-block={(block.headline || '').trim() ? '1' : undefined}
        data-lp-paragraph-block={(block.subheadline || '').trim() && !(block.headline || '').trim() ? '1' : undefined}
      >
        <div className="mx-auto max-w-6xl" data-lp-container-inner="1" data-lp-free-surface="1">
          <SectionHead
            headline={block.headline}
            subheadline={block.subheadline}
            eyebrow={sectionEyebrowFor(block.type, category)}
            align="left"
            blockId={block.id}
            canvas={canvas}
            blockStyle={(block.style || {}) as Record<string, unknown>}
          />
        </div>
      </section>
    );
  }

  // Plain bullet/checklist insert (Benefits + no section head + icon markers).
  const isPlainList =
    block.type === 'Benefits' &&
    !(block.headline || '').trim() &&
    !(block.subheadline || '').trim() &&
    block.items.every((it) => !it.description?.trim() && !it.imageUrl) &&
    block.items.some((it) => {
      const icon = String(it.icon || '');
      return icon === 'bullet' || icon === 'bullet-orange' || icon === 'check';
    });

  if (isPlainList) {
    return (
      <section
        className={`${spacingClass(block.spacing)} px-4 sm:px-6`}
        style={sectionBgStyle(block)}
        data-lp-section-tone={sectionToneAttr(block)}
        data-lp-bg-motion={sectionBgMotionAttr(block)}
        data-lp-list-block="1"
      >
        <div className="mx-auto max-w-6xl" data-lp-container-inner="1">
          <ul className="space-y-2" data-lp-free-surface="1">
            {block.items.map((item, i) => {
              const icon = String(item.icon || 'bullet');
              return (
                <ItemReorderChrome
                  key={item.id}
                  blockId={block.id}
                  index={i}
                  itemId={item.id}
                  handlers={canvas}
                >
                  <li className="flex items-start gap-2.5">
                    {icon === 'check' ? (
                      <span
                        className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                        style={{ background: '#10b981' }}
                        aria-hidden
                      >
                        ✓
                      </span>
                    ) : (
                      <span
                        className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: icon === 'bullet-orange' ? '#f97316' : '#0f172a' }}
                        aria-hidden
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <InlineEditable
                          as="span"
                          blockId={block.id}
                          field={`itemTitle:${item.id}`}
                          value={item.title || ''}
                          handlers={canvas}
                        blockStyle={(block.style || {}) as Record<string, unknown>}
                          textRole="card-title"
                          className="text-[15px] leading-relaxed"
                          style={{ color: 'var(--lp-text)' }}
                        />
                    </div>
                  </li>
                </ItemReorderChrome>
              );
            })}
          </ul>
        </div>
      </section>
    );
  }

  // Button-group insert (Benefits + nav:* icon markers).
  const navVariant = parseNavVariant(block.items[0]?.icon);
  const isNavGroup =
    block.type === 'Benefits' &&
    !!navVariant &&
    !(block.headline || '').trim() &&
    !(block.subheadline || '').trim() &&
    block.items.every((it) => !it.description?.trim() && !it.imageUrl && parseNavVariant(it.icon));

  if (isNavGroup && navVariant) {
    const col = isNavGroupColumn(navVariant);
    return (
      <section
        className={`${spacingClass(block.spacing)} px-4 sm:px-6`}
        style={sectionBgStyle(block)}
        data-lp-section-tone={sectionToneAttr(block)}
        data-lp-bg-motion={sectionBgMotionAttr(block)}
        data-lp-button-group-block="1"
        data-lp-button-group-variant={navVariant}
        data-lp-transformable="1"
      >
        <div className="mx-auto max-w-6xl" data-lp-container-inner="1">
          <div
            className={col ? 'mx-auto flex max-w-xs flex-col gap-2' : 'flex flex-wrap items-center justify-center gap-1'}
            data-lp-free-surface="1"
            style={
              navVariant === 'row-active-block'
                ? { borderBottom: '1px solid rgba(15,23,42,0.08)', paddingBottom: 4 }
                : undefined
            }
          >
            {block.items.map((item, i) => (
              <ItemReorderChrome
                key={item.id}
                blockId={block.id}
                index={i}
                itemId={item.id}
                handlers={canvas}
              >
                <div style={navGroupItemStyle(navVariant, i, 0)}>
                  <InlineEditable
                      as="span"
                      blockId={block.id}
                      field={`itemTitle:${item.id}`}
                      value={item.title || ''}
                      handlers={canvas}
                        blockStyle={(block.style || {}) as Record<string, unknown>}
                      textRole="button"
                      className="inline-block"
                      style={{ color: 'inherit', fontWeight: 'inherit', fontSize: 'inherit' }}
                    />
                </div>
              </ItemReorderChrome>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const processVariant = isProcess ? canonicalBlockVariant('Process', block.variant) : null;

  if (isProcess && processVariant === 'timeline') {
    return (
      <section
        className={`${spacingClass(block.spacing)} px-4 sm:px-6`}
        style={sectionBgStyle(block, 'var(--lp-surface)')}
        data-lp-section-tone={sectionToneAttr(block)}
        data-lp-bg-motion={sectionBgMotionAttr(block)}
        data-lp-variant={listVariant}
        data-lp-list-variant={listVariant}
        data-lp-process-variant="timeline"
      >
        <div className="mx-auto max-w-6xl" data-lp-container-inner="1">
          <SectionHead
            headline={block.headline}
            subheadline={block.subheadline}
            eyebrow={sectionEyebrowFor(block.type, category)}
            blockId={block.id}
            canvas={canvas}
            blockStyle={(block.style || {}) as Record<string, unknown>}
          />
          <div className="relative space-y-6" data-lp-free-surface="1" data-lp-timeline="1">
            {block.items.map((item, i) => (
              <ItemReorderChrome
                key={item.id}
                blockId={block.id}
                index={i}
                itemId={item.id}
                handlers={canvas}
              >
                <div
                  className="relative flex gap-4"
                  data-lp-card-item="1"
                  data-lp-timeline-node="1"
                  {...itemBoxDomProps(block, item.id)}
                  {...itemBoxHideAttrs(block, item.id)}
                >
                  <div
                    className="relative z-[1] mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: primary, color: 'var(--lp-on-primary, #fff)' }}
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold" style={{ color: 'var(--lp-secondary)' }}>
                      <InlineEditable
                        as="span"
                        blockId={block.id}
                        field={`itemTitle:${item.id}`}
                        value={item.title || ''}
                        handlers={canvas}
                        blockStyle={(block.style || {}) as Record<string, unknown>}
                        textRole="card-title"
                        className="font-bold"
                        style={{ color: 'var(--lp-secondary)' }}
                      />
                    </h3>
                    {item.description ? (
                      <p className="mt-1 text-sm" style={{ color: 'var(--lp-muted)' }}>
                        <InlineEditable
                          as="span"
                          blockId={block.id}
                          field={`itemDesc:${item.id}`}
                          value={item.description}
                          handlers={canvas}
                          blockStyle={(block.style || {}) as Record<string, unknown>}
                          multiline
                          textRole="card-description"
                          className="text-sm"
                          style={{ color: 'var(--lp-muted)' }}
                        />
                      </p>
                    ) : null}
                  </div>
                </div>
              </ItemReorderChrome>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (
    isProcess &&
    (processVariant === 'steps' ||
      layout === 'webinar' ||
      layout === 'course' ||
      layout === 'service' ||
      listVariant === 'numbered')
  ) {
    return (
      <section
        className={`${spacingClass(block.spacing)} px-4 sm:px-6`}
        style={sectionBgStyle(block, 'var(--lp-surface)')}
        data-lp-section-tone={sectionToneAttr(block)}
        data-lp-bg-motion={sectionBgMotionAttr(block)}
        data-lp-variant={listVariant}
        data-lp-list-variant="numbered"
        data-lp-process-variant="steps"
      >
        <div className="mx-auto max-w-6xl" data-lp-container-inner="1">
          <SectionHead
            headline={block.headline}
            subheadline={block.subheadline}
            eyebrow={sectionEyebrowFor(block.type, category)}
            blockId={block.id}
            canvas={canvas}
            blockStyle={(block.style || {}) as Record<string, unknown>}
          />
          <div className={`relative grid gap-6 ${itemCountGridClass(block.items.length)}`} data-lp-free-surface="1" data-lp-process-grid="1" data-lp-item-count={block.items.length}>
            <div
              className="pointer-events-none absolute left-0 right-0 top-8 hidden h-0.5 lg:block"
              style={{ background: `${primary}33` }}
              aria-hidden
            />
            {block.items.map((item, i) => (
              <ItemReorderChrome
                key={item.id}
                blockId={block.id}
                index={i}
                itemId={item.id}
                handlers={canvas}
              >
                <div
                  className="relative min-w-0 text-center lg:text-left"
                  data-lp-card-item="1"
                  {...itemBoxDomProps(block, item.id)}
                  {...itemBoxHideAttrs(block, item.id)}
                >
                  <div
                    className="relative z-[1] mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white lg:mx-0"
                    style={{ background: primary, color: 'var(--lp-on-primary, #fff)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="font-bold" style={{ color: 'var(--lp-secondary)' }}>
                    <InlineEditable
                        as="span"
                        blockId={block.id}
                        field={`itemTitle:${item.id}`}
                        value={item.title || ''}
                        handlers={canvas}
                        blockStyle={(block.style || {}) as Record<string, unknown>}
                        textRole="card-title"
                        className="font-bold"
                        style={{ color: 'var(--lp-secondary)' }}
                      />
                  </h3>
                  {item.description ? (
                    <p className="mt-1 text-sm" style={{ color: 'var(--lp-muted)' }}>
                      <InlineEditable
                          as="span"
                          blockId={block.id}
                          field={`itemDesc:${item.id}`}
                          value={item.description}
                          handlers={canvas}
                        blockStyle={(block.style || {}) as Record<string, unknown>}
                          multiline
                          textRole="card-description"
                          className="text-sm"
                          style={{ color: 'var(--lp-muted)' }}
                        />
                    </p>
                  ) : null}
                </div>
              </ItemReorderChrome>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const featuredItem =
    galleryVariant === 'featured-plus-grid' && block.items.length > 0 ? block.items[0] : undefined;

  return (
    <section
      className={`${spacingClass(block.spacing)} px-4 sm:px-6`}
      style={sectionBgStyle(block)}
      data-lp-section-tone={sectionToneAttr(block)}
      data-lp-bg-motion={sectionBgMotionAttr(block)}
      data-lp-variant={listVariant}
      data-lp-list-variant={listVariant}
      data-lp-gallery-variant={galleryVariant || undefined}
    >
      <div className="mx-auto max-w-6xl" data-lp-container-inner="1">
        <SectionHead
          headline={block.headline}
          subheadline={block.subheadline}
          eyebrow={sectionEyebrowFor(block.type, category)}
          blockId={block.id}
          canvas={canvas}
          blockStyle={(block.style || {}) as Record<string, unknown>}
        />
        {featuredItem ? (
          <figure className="mb-4 overflow-hidden" data-lp-gallery-featured="1">
            <ItemReorderChrome
              blockId={block.id}
              index={0}
              itemId={featuredItem.id}
              handlers={canvas}
            >
              {featuredItem.imageUrl ? (
                <ElementChrome
                  blockId={block.id}
                  element={`item:${featuredItem.id}`}
                  handlers={canvas}
                  kind="image"
                  className="block w-full"
                >
                  <LpContentImage
                    src={featuredItem.imageUrl}
                    alt={featuredItem.imageStyle?.alt || featuredItem.title || ''}
                    fallbackLabel={featuredItem.title || 'Featured work'}
                    width={960}
                    height={540}
                    loading="lazy"
                    decoding="async"
                    data-lp-img-motion={lpImgMotionAttr(featuredItem.imageStyle)}
                    className="w-full object-cover"
                    style={{
                      borderRadius:
                        featuredItem.imageStyle?.borderRadius ||
                        'var(--lp-image-radius, calc(var(--lp-radius) - 4px))',
                      aspectRatio: '16 / 9',
                      ...lpImgStyle(featuredItem.imageStyle),
                    }}
                  />
                </ElementChrome>
              ) : (
                <div
                  className="flex aspect-video w-full items-end justify-start overflow-hidden p-4 text-sm font-semibold"
                  data-lp-gallery-fallback="1"
                  style={{
                    background: `linear-gradient(145deg, color-mix(in srgb, ${primary} 22%, var(--lp-surface)) 0%, var(--lp-surface-alt, var(--lp-surface)) 100%)`,
                    color: 'var(--lp-secondary)',
                    borderRadius: 'var(--lp-radius)',
                  }}
                >
                  {featuredItem.title || 'Featured work'}
                </div>
              )}
            </ItemReorderChrome>
          </figure>
        ) : null}
        <div
          className={
            listVariant === 'alternating'
              ? 'relative flex flex-col gap-6 md:gap-8'
              : listVariant === 'editorial-list' || listVariant === 'minimal-list'
                ? 'relative flex flex-col gap-3'
                : listVariant === 'masonry' || galleryVariant === 'masonry'
                  ? 'relative'
                  : `relative grid gap-3 md:gap-4 ${cols}`
          }
          data-lp-free-surface="1"
          data-lp-cards-grid="1" data-lp-item-count={block.items.length}
        >
          {(galleryVariant === 'featured-plus-grid' ? block.items.slice(1) : block.items).map((item, mapIdx) => {
            const i = galleryVariant === 'featured-plus-grid' ? mapIdx + 1 : mapIdx;
            const preferImage = listVariant === 'image-cards' || block.type === 'Gallery';
            const preferIcon = listVariant === 'icon-grid' || (!preferImage && !item.imageUrl);
            const numbered = listVariant === 'numbered';
            const minimal = listVariant === 'minimal-list' || listVariant === 'editorial-list';
            const cardInner = (
              <>
                {numbered ? (
                  <div
                    className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold text-white"
                    style={{ background: primary, color: 'var(--lp-on-primary, #fff)' }}
                  >
                    {i + 1}
                  </div>
                ) : null}
                {preferImage && item.imageUrl ? (
                  <ElementChrome
                    blockId={block.id}
                    element={`item:${item.id}`}
                    handlers={canvas}
                    kind="image"
                    className="mb-4 block w-full"
                  >
                    <LpContentImage
                      src={item.imageUrl}
                      alt={item.imageStyle?.alt || item.title || ''}
                      fallbackLabel={item.title || `Visual ${i + 1}`}
                      width={400}
                      height={225}
                      loading="lazy"
                      decoding="async"
                      data-lp-img-motion={lpImgMotionAttr(item.imageStyle)}
                      className="h-36 w-full object-cover"
                      style={{
                        borderRadius: item.imageStyle?.borderRadius || 'var(--lp-image-radius, calc(var(--lp-radius) - 4px))',
                        aspectRatio: '16 / 9',
                        ...lpImgStyle(item.imageStyle),
                      }}
                    />
                  </ElementChrome>
                ) : preferImage && !item.imageUrl ? (
                  <div
                    className="mb-4 flex h-36 w-full items-end p-3 text-xs font-semibold"
                    data-lp-gallery-fallback="1"
                    style={{
                      borderRadius: 'var(--lp-image-radius, calc(var(--lp-radius) - 4px))',
                      aspectRatio: '16 / 9',
                      background: `linear-gradient(135deg, color-mix(in srgb, ${primary} 20%, var(--lp-surface)) 0%, var(--lp-surface-alt, var(--lp-surface)) 100%)`,
                      color: 'var(--lp-secondary)',
                    }}
                  >
                    {item.title || `Visual ${i + 1}`}
                  </div>
                ) : preferIcon && !minimal ? (
                  <div className="mb-4">
                    <IconBubble index={i} primary={primary} />
                  </div>
                ) : item.imageUrl ? (
                  <ElementChrome
                    blockId={block.id}
                    element={`item:${item.id}`}
                    handlers={canvas}
                    kind="image"
                    className="mb-4 block w-full shrink-0 md:w-40"
                  >
                    <LpContentImage
                      src={item.imageUrl}
                      alt={item.imageStyle?.alt || item.title || ''}
                      fallbackLabel={item.title || `Visual ${i + 1}`}
                      width={400}
                      height={225}
                      loading="lazy"
                      decoding="async"
                      className="h-36 w-full object-cover md:h-28"
                      style={{
                        borderRadius: item.imageStyle?.borderRadius || 'var(--lp-image-radius, calc(var(--lp-radius) - 4px))',
                        aspectRatio: '16 / 9',
                        ...lpImgStyle(item.imageStyle),
                      }}
                    />
                  </ElementChrome>
                ) : null}
                <div className="min-w-0 flex-1">
                  <h3
                    className={minimal ? 'text-[15px] font-semibold md:text-base' : 'text-base font-extrabold md:text-lg'}
                    style={{ color: 'var(--lp-text-on-light, var(--lp-text))' }}
                  >
                    <InlineEditable
                      as="span"
                      blockId={block.id}
                      field={`itemTitle:${item.id}`}
                      value={item.title || ''}
                      handlers={canvas}
                      blockStyle={(block.style || {}) as Record<string, unknown>}
                      textRole="card-title"
                      className={minimal ? 'text-[15px] font-semibold md:text-base' : 'text-base font-extrabold md:text-lg'}
                      style={{ color: 'var(--lp-text-on-light, var(--lp-text))' }}
                    />
                  </h3>
                  {item.description ? (
                    <p className="mt-2 text-sm leading-relaxed md:text-[15px]" style={{ color: 'var(--lp-muted-on-light, var(--lp-muted))' }}>
                      <InlineEditable
                        as="span"
                        blockId={block.id}
                        field={`itemDesc:${item.id}`}
                        value={item.description}
                        handlers={canvas}
                        blockStyle={(block.style || {}) as Record<string, unknown>}
                        multiline
                        textRole="card-description"
                        className="text-sm leading-relaxed md:text-[15px]"
                        style={{ color: 'var(--lp-muted-on-light, var(--lp-muted))' }}
                      />
                    </p>
                  ) : null}
                </div>
              </>
            );

            const cardAccent = i % 3;
            const cardSurfaceStyle =
              minimal || listVariant === 'alternating'
                ? undefined
                : {
                    background:
                      cardAccent === 2
                        ? 'color-mix(in srgb, var(--lp-primary) 4%, var(--lp-surface))'
                        : 'var(--lp-surface)',
                    borderRadius: 'var(--lp-radius)',
                    boxShadow:
                      cardAccent === 1
                        ? '0 12px 32px rgba(15, 23, 42, 0.11)'
                        : cardAccent === 2
                          ? '0 6px 18px rgba(15, 23, 42, 0.07)'
                          : 'var(--lp-card-shadow-elevated, var(--lp-shadow))',
                    border:
                      cardAccent === 1
                        ? '1px solid color-mix(in srgb, var(--lp-primary) 18%, var(--lp-border, #e2e8f0))'
                        : '1px solid color-mix(in srgb, var(--lp-border, #e2e8f0) 82%, transparent)',
                  };
            const itemChrome = itemBoxDomProps(block, item.id);

            return (
              <ItemReorderChrome
                key={item.id}
                blockId={block.id}
                index={i}
                itemId={item.id}
                handlers={canvas}
              >
                <div
                  className={
                    listVariant === 'alternating'
                      ? 'min-w-0'
                      : minimal
                        ? 'min-w-0 border-b border-black/5 py-3 last:border-0'
                        : 'min-w-0 p-4 md:p-5 transition hover:-translate-y-0.5'
                  }
                  data-lp-card-item="1"
                  data-lp-card-accent={cardAccent ? String(cardAccent) : undefined}
                  style={{ ...cardSurfaceStyle, ...itemChrome.style }}
                  data-lp-item-box-custom={itemChrome['data-lp-item-box-custom']}
                  data-lp-item-box-bg={itemChrome['data-lp-item-box-bg']}
                  {...itemBoxHideAttrs(block, item.id)}
                >
                  {listVariant === 'alternating' ? (
                    <div data-lp-alt-row="1">{cardInner}</div>
                  ) : (
                    cardInner
                  )}
                </div>
              </ItemReorderChrome>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BlockView({
  block,
  primary,
  layout,
  category,
  mode,
  onLeadSubmit,
  onFormStart,
  skipLeadForm,
  canvas,
  goldStandard,
}: {
  block: LandingPageBlock;
  primary: string;
  layout: LandingPageLayout;
  category?: string;
  mode: RenderMode;
  onLeadSubmit?: (fields: Record<string, string>, blockId: string) => Promise<void> | void;
  onFormStart?: () => void;
  skipLeadForm?: boolean;
  canvas?: LandingPageCanvasHandlers | null;
  goldStandard?: string;
}) {
  if (!block.enabled) return null;
  const conversionZone =
    goldStandard && block.type === 'CTA'
      ? 'cta'
      : goldStandard && block.type === 'LeadForm'
        ? 'form'
        : undefined;

  switch (block.type) {
    case 'Hero':
      return null; // rendered by shell
    case 'Header': {
      const links = (block.body || '')
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 6);
      const headerVariant = canonicalBlockVariant('Header', block.variant);
      const minimal = headerVariant === 'minimal';
      const centered = headerVariant === 'centered';
      return (
        <header
          className={
            minimal
              ? 'border-b border-transparent px-4 py-2.5 sm:px-6'
              : centered
                ? 'border-b border-black/5 px-4 py-5 sm:px-6'
                : 'border-b border-black/5 px-4 py-3.5 sm:px-6'
          }
          style={sectionBgStyle(block, 'var(--lp-surface)')}
          data-lp-header-variant={headerVariant}
          data-lp-section-tone={sectionToneAttr(block)}
        >
          <div
            className={
              centered
                ? 'mx-auto flex max-w-6xl flex-col items-center gap-3 text-center'
                : 'mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3'
            }
            data-lp-header-inner="1"
            data-lp-container-inner="1"
          >
            <div className="flex min-w-0 items-center gap-3">
              {block.imageUrl ? (
                <ElementChrome blockId={block.id} element="image" handlers={canvas} kind="image" blockStyle={(block.style || {}) as Record<string, unknown>}>
                  <LpContentImage src={block.imageUrl} alt={block.headline || ''} width={120} height={36} className="h-9 w-auto max-w-[120px] object-contain" />
                </ElementChrome>
              ) : null}
            <InlineEditable
                as="div"
                blockId={block.id}
                field="headline"
                value={block.headline || 'Brand'}
                handlers={canvas}
                        blockStyle={(block.style || {}) as Record<string, unknown>}
                className={minimal ? 'text-xs font-bold tracking-wide uppercase' : 'text-sm font-extrabold'}
                style={{ color: 'var(--lp-secondary)' }}
              />
            </div>
            {links.length && !minimal ? (
              <nav className="hidden flex-wrap gap-4 text-xs font-medium md:flex" style={{ color: 'var(--lp-muted)' }} aria-label="Primary">
                {links.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </nav>
            ) : null}
            {block.ctaLabel && !minimal ? (
              canvas ? (
                <InlineEditable
                  as={readSectionLibraryContext(block) ? 'a' : 'span'}
                  blockId={block.id}
                  field="ctaLabel"
                  value={block.ctaLabel}
                  handlers={canvas}
                  blockStyle={(block.style || {}) as Record<string, unknown>}
                  className="inline-flex min-h-[40px] items-center px-4 py-2 text-xs font-bold text-white"
                  style={{ background: primary, color: 'var(--lp-on-primary, #fff)', borderRadius: 'calc(var(--lp-radius) - 2px)' }}
                />
              ) : (
                <a
                  href={block.ctaUrl || '#lead-form'}
                  className="inline-flex min-h-[40px] items-center px-4 py-2 text-xs font-bold text-white"
                  style={{ background: primary, color: 'var(--lp-on-primary, #fff)', borderRadius: 'calc(var(--lp-radius) - 2px)' }}
                >
                  <InlineEditable
                    as="span"
                    blockId={block.id}
                    field="ctaLabel"
                    value={block.ctaLabel}
                    handlers={null}
                    blockStyle={(block.style || {}) as Record<string, unknown>}
                  />
                </a>
              )
            ) : null}
          </div>
        </header>
      );
    }
    case 'Speaker': {
      const list = block as LandingPageListBlock;
      const speakers = filterPublishableSpeakers(list.items, mode);
      if (!speakers.length) {
        if (mode === 'public' || (mode === 'preview' && !canvas)) return null;
        return (
          <section
            className={`${spacingClass(block.spacing)} px-4 sm:px-6`}
            style={sectionBgStyle(block)}
            data-lp-section-tone={sectionToneAttr(block)}
            aria-label="Speaker"
          >
            <div className="mx-auto max-w-6xl" data-lp-container-inner="1">
              <SectionHead
                headline={list.headline || 'Diễn giả'}
                blockId={block.id}
                canvas={canvas}
                blockStyle={(block.style || {}) as Record<string, unknown>}
              />
              <div
                className="border border-dashed px-6 py-8 text-center text-sm"
                style={{
                  borderRadius: 'var(--lp-radius)',
                  borderColor: `${primary}66`,
                  color: 'var(--lp-muted)',
                  background: 'var(--lp-surface)',
                }}
              >
                Placeholder diễn giả — thêm tên/bio thật trong Builder. Ẩn khi publish nếu còn placeholder.
              </div>
            </div>
          </section>
        );
      }
      return (
        <section
          className={`${spacingClass(block.spacing)} px-4 sm:px-6`}
          style={sectionBgStyle(block)}
          data-lp-section-tone={sectionToneAttr(block)}
          aria-label="Speaker"
        >
          <div className="mx-auto max-w-6xl" data-lp-container-inner="1">
            <SectionHead
              headline={list.headline}
              subheadline={list.subheadline}
              eyebrow={sectionEyebrowFor(block.type, category)}
              blockId={block.id}
              canvas={canvas}
              blockStyle={(block.style || {}) as Record<string, unknown>}
            />
            <div className="relative grid grid-cols-1 gap-5 md:grid-cols-2" data-lp-free-surface="1" data-lp-cards-grid="1" data-lp-item-count={block.items.length}>
              {speakers.map((item) => {
                const index = list.items.findIndex((row) => row.id === item.id);
                const itemChrome = itemBoxDomProps(block, item.id);
                return (
                <ItemReorderChrome
                  key={item.id}
                  blockId={block.id}
                  index={index < 0 ? 0 : index}
                  itemId={item.id}
                  handlers={canvas}
                >
                <div
                  className="flex flex-col gap-4 p-5 sm:flex-row"
                  data-lp-card-item="1"
                  style={{
                    background: 'var(--lp-surface)',
                    borderRadius: 'var(--lp-radius)',
                    boxShadow: 'var(--lp-shadow)',
                    border: '1px solid rgba(15,23,42,0.06)',
                    ...itemChrome.style,
                  }}
                  data-lp-item-box-custom={itemChrome['data-lp-item-box-custom']}
                  data-lp-item-box-bg={itemChrome['data-lp-item-box-bg']}
                  {...itemBoxHideAttrs(block, item.id)}
                >
                  {item.imageUrl ? (
                    <ElementChrome
                      blockId={block.id}
                      element={`item:${item.id}`}
                      handlers={canvas}
                      kind="image"
                      className="shrink-0"
                    >
                      <LpContentImage
                        src={item.imageUrl}
                        alt={item.imageStyle?.alt || item.title || ''}
                        fallbackLabel={item.title || 'Speaker'}
                        width={160}
                        height={160}
                        loading="lazy"
                        decoding="async"
                        data-lp-img-motion={lpImgMotionAttr(item.imageStyle)}
                        className="h-28 w-28 shrink-0 rounded-full object-cover"
                        style={lpImgStyle(item.imageStyle)}
                      />
                    </ElementChrome>
                  ) : (
                    <div
                      className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full text-3xl text-white"
                      style={{ background: primary, color: 'var(--lp-on-primary, #fff)' }}
                      aria-hidden
                    >
                      👤
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-extrabold" style={{ color: 'var(--lp-secondary)' }}>
                      {item.title}
                    </h3>
                    {item.role ? (
                      <p className="text-sm font-semibold" style={{ color: primary }}>
                        {item.role}
                      </p>
                    ) : null}
                    {item.description ? (
                      <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--lp-muted)' }}>
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                </div>
                </ItemReorderChrome>
                );
              })}
            </div>
          </div>
        </section>
      );
    }
    case 'CTA': {
      const boxStyle = isLandingPageBoxStyle(block.style as Record<string, unknown> | undefined)
        ? (block.style as Record<string, unknown>)
        : null;
      const shapeOnly =
        Boolean(boxStyle) &&
        !(block.headline || '').trim() &&
        !(block.subheadline || '').trim() &&
        !(block.ctaLabel || '').trim();

      if (shapeOnly && boxStyle) {
        const freeW = block.freeLayout?.width;
        const freeH = block.freeLayout?.height;
        const imgUrl =
          typeof (block as { imageUrl?: string | null }).imageUrl === 'string'
            ? (block as { imageUrl?: string | null }).imageUrl
            : null;
        const isFrame = Boolean(boxStyle.lpFrame) || String(boxStyle.lpBox || '').startsWith('frame-');
        const gridToken = typeof boxStyle.lpGrid === 'string' ? boxStyle.lpGrid : '';
        const gridMatch = /^(\d+)x(\d+)$/.exec(gridToken);

        if (gridMatch) {
          const rows = Math.max(1, Number(gridMatch[1]));
          const cols = Math.max(1, Number(gridMatch[2]));
          let images: string[] = [];
          try {
            const parsed = JSON.parse(String(boxStyle.lpGridImages || '[]'));
            images = Array.isArray(parsed) ? parsed.map((u) => String(u || '')) : [];
          } catch {
            images = [];
          }
          let cellStyles: Array<Record<string, string>> = [];
          try {
            const parsed = JSON.parse(String(boxStyle.lpGridImageStyles || '[]'));
            cellStyles = Array.isArray(parsed) ? parsed : [];
          } catch {
            cellStyles = [];
          }
          const cellCount = rows * cols;
          const selectedGrid =
            canvas?.selection?.blockId === block.id &&
            typeof canvas.selection.element === 'string' &&
            canvas.selection.element.startsWith('grid:')
              ? Number(canvas.selection.element.slice(5))
              : -1;
          return (
            <section
              className="m-0 flex p-0"
              data-lp-box-block="1"
              data-lp-grid-block="1"
              data-lp-transformable="1"
              data-lp-box-id={String(boxStyle.lpBox || '')}
              style={{
                width: freeW ? '100%' : (boxStyle.width as string) || '160px',
                height: freeH ? '100%' : (boxStyle.height as string) || '160px',
                maxWidth: '100%',
              }}
            >
              <div
                data-lp-box-hit="1"
                data-lp-button-hit="1"
                className="grid h-full w-full gap-1 overflow-hidden rounded-md bg-slate-100 p-1"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                  boxSizing: 'border-box',
                }}
              >
                {Array.from({ length: cellCount }).map((_, idx) => {
                  const cellImg = images[idx] || '';
                  const cs = cellStyles[idx] || {};
                  const flip = String(cs.flip || '');
                  const sx = flip.includes('x') ? -1 : 1;
                  const sy = flip.includes('y') ? -1 : 1;
                  return (
                    <button
                      key={idx}
                      type="button"
                      data-lp-grid-cell={idx}
                      data-lp-content-image={cellImg ? '1' : undefined}
                      data-lp-img-motion={cs.motion || undefined}
                      className="relative min-h-0 min-w-0 overflow-hidden rounded-sm border border-dashed border-slate-300 bg-slate-200/80"
                      style={{
                        outline: selectedGrid === idx ? '2px solid #7c3aed' : undefined,
                        backgroundColor: cs.bgColor || undefined,
                        backgroundImage: cellImg
                          ? `url(${cellImg})`
                          : 'linear-gradient(180deg,#e2e8f0,#cbd5e1)',
                        backgroundSize: cs.size || 'cover',
                        backgroundPosition: cs.position || 'center',
                        backgroundRepeat: 'no-repeat',
                        transform: sx !== 1 || sy !== 1 ? `scale(${sx}, ${sy})` : undefined,
                        zIndex: cs.zIndex ? Number(cs.zIndex) : undefined,
                      }}
                      onClick={(e) => {
                        if (!canvas) return;
                        e.stopPropagation();
                        canvas.onSelect(
                          { blockId: block.id, element: `grid:${idx}` },
                          { shiftKey: e.shiftKey },
                        );
                      }}
                      title={cellImg ? 'Ô lưới — thay ảnh' : 'Ô trống — chọn rồi chèn ảnh'}
                    />
                  );
                })}
              </div>
            </section>
          );
        }

        const fillBg = imgUrl
          ? undefined
          : (boxStyle.background as string) ||
            ((boxStyle.backgroundImage as string) ? 'transparent' : '#e5e7eb');
        const styleBgImage = !imgUrl && typeof boxStyle.backgroundImage === 'string'
          ? (boxStyle.backgroundImage as string)
          : undefined;
        const imgSt = (block as { imageStyle?: LandingPageImageStyle }).imageStyle;
        const flip = String(imgSt?.flip || '');
        const sx = flip.includes('x') ? -1 : 1;
        const sy = flip.includes('y') ? -1 : 1;
        const shapeChrome: CSSProperties = {
          width: freeW ? '100%' : (boxStyle.width as string) || '88px',
          height: freeH ? '100%' : (boxStyle.height as string) || '56px',
          background: imgUrl ? imgSt?.bgColor || fillBg : fillBg,
          backgroundImage: imgUrl ? `url(${imgUrl})` : styleBgImage,
          backgroundSize: imgUrl
            ? imgSt?.fit === 'contain'
              ? 'contain'
              : 'cover'
            : (boxStyle.backgroundSize as string) || (styleBgImage ? 'contain' : undefined),
          backgroundRepeat: imgUrl
            ? 'no-repeat'
            : (boxStyle.backgroundRepeat as string) || (styleBgImage ? 'no-repeat' : undefined),
          backgroundPosition: imgUrl
            ? imgSt?.position || 'center'
            : (boxStyle.backgroundPosition as string) || (styleBgImage ? 'center' : undefined),
          border: (boxStyle.border as string) || 'none',
          borderRadius: (boxStyle.borderRadius as string) || '0',
          boxShadow: boxStyle.boxShadow as string | undefined,
          clipPath: boxStyle.clipPath as string | undefined,
          opacity: typeof boxStyle.opacity === 'number' ? boxStyle.opacity : undefined,
          filter: typeof boxStyle.filter === 'string' ? (boxStyle.filter as string) : undefined,
          mixBlendMode: (boxStyle.mixBlendMode as CSSProperties['mixBlendMode']) || undefined,
          transform:
            composeDesignTransformCss(boxStyle as Record<string, unknown>) ||
            (sx !== 1 || sy !== 1 ? `scale(${sx}, ${sy})` : undefined),
          zIndex: imgSt?.zIndex ? Number(imgSt.zIndex) : undefined,
          boxSizing: 'border-box',
          display: 'block',
          flexShrink: 0,
        };
        return (
          <section
            className="m-0 flex p-0"
            data-lp-box-block="1"
            data-lp-frame={isFrame ? '1' : undefined}
            data-lp-transformable="1"
            data-lp-box-id={String(boxStyle.lpBox || '')}
            style={{
              width: freeW ? '100%' : 'fit-content',
              height: freeH ? '100%' : 'fit-content',
              maxWidth: '100%',
            }}
          >
            <span
              data-lp-box-hit="1"
              data-lp-box-select="1"
              data-lp-button-hit="1"
              data-lp-content-image={imgUrl ? '1' : undefined}
              data-lp-img-motion={imgUrl ? lpImgMotionAttr(imgSt) : undefined}
              aria-hidden
              style={shapeChrome}
              onPointerUp={
                canvas
                  ? (e) => {
                      e.stopPropagation();
                      canvas.onSelect(
                        { blockId: block.id, element: imgUrl ? 'image' : 'section' },
                        { shiftKey: e.shiftKey },
                      );
                    }
                  : undefined
              }
            />
          </section>
        );
      }

      const buttonOnly =
        !boxStyle &&
        !(block.headline || '').trim() &&
        !(block.subheadline || '').trim() &&
        !(block.body || '').trim();

      if (buttonOnly) {
        // Published view: no label → no empty chrome (delete block to remove).
        if (!canvas && !(block.ctaLabel || '').trim()) {
          return null;
        }
        const chrome = (block.style || {}) as CSSProperties;
        // Tight chrome: no section padding — SelectableShell outline must hug the button.
        const freeW = block.freeLayout?.width;
        const freeH = block.freeLayout?.height;
        return (
          <section
            className="m-0 flex p-0"
            data-lp-button-block="1"
            data-lp-transformable="1"
            style={{
              width: freeW ? '100%' : 'fit-content',
              height: freeH ? '100%' : 'fit-content',
              maxWidth: '100%',
            }}
          >
            <InlineEditable
                as={readSectionLibraryContext(block) ? 'a' : 'span'}
                blockId={block.id}
                field="ctaLabel"
                value={block.ctaLabel || ''}
                handlers={canvas}
                        blockStyle={(block.style || {}) as Record<string, unknown>}
                textRole="button"
                fillParent
                className="inline-flex items-center justify-center font-bold"
                style={{
                  background: chrome.background || primary,
                  color: chrome.color || '#fff',
                  borderRadius: chrome.borderRadius || 'calc(var(--lp-radius) - 2px)',
                  padding: chrome.padding || '10px 22px',
                  fontSize: chrome.fontSize || '14px',
                  fontWeight: chrome.fontWeight || 700,
                  letterSpacing: chrome.letterSpacing,
                  boxShadow: chrome.boxShadow,
                  border: chrome.border || 'none',
                  width: freeW ? '100%' : chrome.width || 'auto',
                  height: freeH ? '100%' : 'auto',
                  minWidth: freeW ? undefined : 40,
                  minHeight: freeH ? undefined : 40,
                  textAlign: (chrome.textAlign as CSSProperties['textAlign']) || 'center',
                  textTransform: chrome.textTransform as CSSProperties['textTransform'],
                  boxSizing: 'border-box',
                  whiteSpace: 'nowrap',
                }}
              />
          </section>
        );
      }

      const ctaVariant = canonicalBlockVariant('CTA', block.variant);
      const ctaBandStyle: CSSProperties = {
        background:
          (block.style as Record<string, unknown> | undefined)?.lpAiGenerated === '1' ? '#0F172A' : ctaVariant === 'image-background' &&
          (block as { imageUrl?: string | null }).imageUrl
            ? `linear-gradient(120deg, rgba(0,0,0,0.55), rgba(0,0,0,0.35)), url(${(block as { imageUrl?: string | null }).imageUrl}) center/cover`
            : ctaVariant === 'minimal'
              ? 'var(--lp-surface)'
              : `linear-gradient(120deg, ${primary} 0%, var(--lp-secondary) 100%)`,
        borderRadius: 'var(--lp-radius)',
        boxShadow: 'var(--lp-shadow-lg, var(--lp-shadow))',
        color: ctaVariant === 'minimal' ? 'var(--lp-text)' : '#fff',
      };
      const ctaCopy = (
        <div className={ctaVariant === 'minimal' ? 'max-w-xl' : 'max-w-xl text-white'}>
          {category === 'agency' && ctaVariant !== 'minimal' ? (
            <div data-lp-section-eyebrow="1" className="!text-white/90 before:!bg-white/70">
              {sectionEyebrowFor('CTA', category) || 'Tiếp theo'}
            </div>
          ) : null}
          {showCanvasInlineField(block.headline, canvas, block.id, 'headline') ? (
            <InlineEditable
              as="h2"
              blockId={block.id}
              field="headline"
              value={block.headline || ''}
              handlers={canvas}
              blockStyle={(block.style || {}) as Record<string, unknown>}
              textRole="cta"
              className={
                ctaVariant === 'minimal'
                  ? 'text-2xl font-extrabold leading-tight md:text-3xl'
                  : 'text-2xl font-extrabold leading-tight md:text-3xl text-white'
              }
              style={ctaVariant === 'minimal' ? { color: 'var(--lp-text)' } : undefined}
            />
          ) : null}
          {showCanvasInlineField(block.subheadline, canvas, block.id, 'subheadline') ? (
            <InlineEditable
              as="p"
              blockId={block.id}
              field="subheadline"
              value={block.subheadline || ''}
              handlers={canvas}
              blockStyle={(block.style || {}) as Record<string, unknown>}
              multiline
              textRole="paragraph"
              className={
                ctaVariant === 'minimal'
                  ? 'mt-2 text-sm leading-relaxed md:text-[15px]'
                  : 'mt-2 text-sm leading-relaxed text-white/90 md:text-[15px]'
              }
              style={ctaVariant === 'minimal' ? { color: 'var(--lp-muted)' } : undefined}
            />
          ) : null}
        </div>
      );
      const ctaAction =
        showCanvasInlineField(block.ctaLabel, canvas, block.id, 'ctaLabel') ? (
          canvas ? (
            <InlineEditable
              as={readSectionLibraryContext(block) ? 'a' : 'span'}
              blockId={block.id}
              field="ctaLabel"
              value={block.ctaLabel || ''}
              handlers={canvas}
              blockStyle={(block.style || {}) as Record<string, unknown>}
              textRole="button"
              className="inline-flex min-h-[48px] items-center gap-2 bg-white px-7 py-3.5 text-sm font-extrabold shadow-md"
              style={{ color: primary, borderRadius: 'calc(var(--lp-radius) - 2px)' }}
            />
          ) : (
            <a
              href={block.ctaUrl || '#lead-form'}
              className="inline-flex min-h-[48px] items-center gap-2 bg-white px-7 py-3.5 text-sm font-extrabold shadow-md"
              style={{ color: primary, borderRadius: 'calc(var(--lp-radius) - 2px)' }}
            >
              <InlineEditable
                as="span"
                blockId={block.id}
                field="ctaLabel"
                value={block.ctaLabel || ''}
                handlers={null}
                blockStyle={(block.style || {}) as Record<string, unknown>}
                textRole="button"
              />
              <span aria-hidden>→</span>
            </a>
          )
        ) : null;

      if (ctaVariant === 'split') {
        return (
          <section
            className={`${spacingClass(block.spacing)} px-4 sm:px-6`}
            style={sectionBgStyle(block)}
            data-lp-section-tone={sectionToneAttr(block)}
            data-lp-conversion-zone={conversionZone}
            data-lp-variant={ctaVariant}
            data-lp-cta-variant={ctaVariant}
          >
            <div
              className="mx-auto max-w-6xl gap-5 py-8 md:py-9"
              data-lp-cta-split="1"
              data-lp-container-inner="1"
              style={ctaBandStyle}
            >
              {ctaCopy}
              <div
                className="flex items-center justify-center border border-white/25 p-5 md:p-6"
                data-lp-cta-action-panel="1"
                style={{
                  borderRadius: 'calc(var(--lp-radius) - 2px)',
                  background: 'rgba(255,255,255,0.12)',
                }}
              >
                {ctaAction}
              </div>
            </div>
          </section>
        );
      }

      const ctaBand = (
        <div
          className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 py-8 md:flex-row md:items-center md:gap-6 md:py-9"
          data-lp-cta-band="1"
          data-lp-container-inner="1"
          style={ctaBandStyle}
        >
          {ctaCopy}
          {ctaAction}
        </div>
      );

      return (
        <section
          className={`${spacingClass(block.spacing)} px-4 sm:px-6`}
          style={sectionBgStyle(block)}
          data-lp-section-tone={sectionToneAttr(block)}
          data-lp-conversion-zone={conversionZone}
          data-lp-variant={ctaVariant}
          data-lp-cta-variant={ctaVariant}
        >
          {ctaVariant === 'floating-card' ? (
            <div data-lp-cta-float-wrap="1">{ctaBand}</div>
          ) : (
            ctaBand
          )}
        </section>
      );
    }
    case 'Guarantee':
      if (mode === 'public' && !(block.body || '').trim()) return null;
      {
        const gVariant = canonicalBlockVariant('Guarantee', block.variant);
        const isBanner = gVariant === 'banner';
        const isMinimal = gVariant === 'minimal';
        return (
          <section
            className={`${spacingClass(block.spacing)} ${isBanner ? 'px-0' : 'px-4 sm:px-6'}`}
            style={sectionBgStyle(block)}
            data-lp-section-tone={sectionToneAttr(block)}
            data-lp-bg-motion={sectionBgMotionAttr(block)}
            data-lp-guarantee-variant={gVariant}
          >
            <div
              className={
                isBanner
                  ? 'w-full px-6 py-8 text-center md:py-10'
                  : isMinimal
                    ? 'mx-auto max-w-2xl px-2 py-4 text-center'
                    : 'mx-auto max-w-3xl border px-6 py-7 text-center md:py-8'
              }
              style={
                isBanner
                  ? {
                      background: `linear-gradient(120deg, ${primary} 0%, color-mix(in srgb, ${primary} 65%, #0F172A) 100%)`,
                      color: '#fff',
                    }
                  : isMinimal
                    ? { borderBottom: `2px solid ${primary}33` }
                    : {
                        borderRadius: 'var(--lp-radius)',
                        borderColor: `${primary}44`,
                        background: `${primary}0d`,
                        boxShadow: 'var(--lp-shadow)',
                      }
              }
            >
              {showCanvasInlineField(block.headline, canvas, block.id, 'headline') ? (
                <InlineEditable
                  as="h2"
                  blockId={block.id}
                  field="headline"
                  value={block.headline || ''}
                  handlers={canvas}
                  blockStyle={(block.style || {}) as Record<string, unknown>}
                  className={isBanner ? 'text-2xl font-extrabold md:text-3xl' : 'text-xl font-extrabold'}
                  style={{ color: isBanner ? '#fff' : 'var(--lp-secondary)' }}
                />
              ) : null}
              {showCanvasInlineField(block.body, canvas, block.id, 'body') || block.body || canvas ? (
                <InlineEditable
                  as="p"
                  blockId={block.id}
                  field="body"
                  value={block.body || ''}
                  handlers={canvas}
                  blockStyle={(block.style || {}) as Record<string, unknown>}
                  className="mt-2.5 text-sm leading-relaxed md:text-[15px]"
                  style={{ color: isBanner ? 'rgba(255,255,255,0.9)' : 'var(--lp-muted)' }}
                />
              ) : null}
            </div>
          </section>
        );
      }
    case 'Footer':
      {
        const footerVariant = canonicalBlockVariant('Footer', block.variant);
        const columns = footerVariant === 'columns' && (block.style as Record<string, unknown> | undefined)?.lpAiGenerated !== '1';
        return (
        <footer
          className={`${spacingClass(block.spacing)} border-t border-black/5 px-4 sm:px-6`}
          style={sectionBgStyle(block, 'var(--lp-surface)')}
          data-lp-footer-variant={footerVariant}
          data-lp-section-tone={sectionToneAttr(block)}
          data-lp-footer-root="1"
        >
          <div
            className={
              columns
                ? 'mx-auto grid max-w-6xl gap-6 py-2 md:grid-cols-3'
                : 'mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between'
            }
            data-lp-footer-inner="1"
            data-lp-container-inner="1"
          >
            <div>
              {block.headline ? (
                <div className="text-sm font-bold" style={{ color: 'var(--lp-secondary)' }}>
                  {block.headline}
                </div>
              ) : null}
              {block.body ? (
                <p className="text-xs md:text-sm" style={{ color: 'var(--lp-muted)' }}>
                  {block.body}
                </p>
              ) : null}
            </div>
            {columns ? (
              <>
                <div className="text-xs" style={{ color: 'var(--lp-muted)' }}>
                  Dịch vụ · Quy trình · Liên hệ
                </div>
                <div className="text-xs" style={{ color: 'var(--lp-muted)' }}>
                  Privacy · Terms · Support
                </div>
              </>
            ) : null}
            {block.ctaLabel ? (
              <a href={block.ctaUrl || '#lead-form'} className="text-sm font-semibold" style={{ color: primary }}>
                {block.ctaLabel}
              </a>
            ) : null}
          </div>
        </footer>
      );
      }
    case 'Benefits':
    case 'Features':
    case 'Process':
    case 'Gallery':
    case 'Product':
      return (
        <ListCards
          block={block}
          primary={primary}
          layout={layout}
          category={category}
          canvas={canvas}
        />
      );
    case 'Pricing': {
      const pVariant = canonicalBlockVariant('Pricing', block.variant);
      const pricingAttr = pVariant === 'default' ? 'cards' : pVariant;

      if (pVariant === 'comparison') {
        const featureUnion: string[] = [];
        for (const plan of block.plans) {
          for (const f of plan.features) {
            if (!featureUnion.includes(f)) featureUnion.push(f);
          }
        }
        return (
          <section
            className={`${spacingClass(block.spacing)} px-4 sm:px-6`}
            style={sectionBgStyle(block)}
            data-lp-section-tone={sectionToneAttr(block)}
            data-lp-bg-motion={sectionBgMotionAttr(block)}
            data-lp-pricing-variant="comparison"
            data-lp-variant={pVariant}
          >
            <div className="mx-auto max-w-6xl" data-lp-container-inner="1">
              <SectionHead
                headline={block.headline}
                subheadline={block.subheadline}
                eyebrow={sectionEyebrowFor(block.type, category)}
                blockId={block.id}
                canvas={canvas}
                blockStyle={(block.style || {}) as Record<string, unknown>}
              />
              <div className="relative overflow-x-auto" data-lp-free-surface="1">
                <table data-lp-pricing-table="1">
                  <thead>
                    <tr>
                      <th scope="col"> </th>
                      {block.plans.map((plan, planIndex) => (
                        <th
                          key={plan.id}
                          scope="col"
                          data-lp-featured={plan.highlighted ? '1' : undefined}
                        >
                          <ItemReorderChrome
                            blockId={block.id}
                            index={planIndex}
                            itemId={plan.id}
                            handlers={canvas}
                          >
                            <div>
                              <div className="font-bold">
                                <InlineEditable
                                  as="span"
                                  blockId={block.id}
                                  field={`planName:${plan.id}`}
                                  value={plan.name}
                                  handlers={canvas}
                                  blockStyle={(block.style || {}) as Record<string, unknown>}
                                  textRole="pricing"
                                  className="font-bold"
                                />
                              </div>
                              <div className="mt-1 text-base font-extrabold">
                                <InlineEditable
                                  as="span"
                                  blockId={block.id}
                                  field={`planPrice:${plan.id}`}
                                  value={plan.price}
                                  handlers={canvas}
                                  blockStyle={(block.style || {}) as Record<string, unknown>}
                                  textRole="pricing"
                                  className="font-extrabold"
                                />
                                {plan.period ? (
                                  <span className="text-xs font-normal opacity-80"> {plan.period}</span>
                                ) : null}
                              </div>
                            </div>
                          </ItemReorderChrome>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {featureUnion.map((feature) => (
                      <tr key={feature}>
                        <th scope="row">{feature}</th>
                        {block.plans.map((plan) => (
                          <td key={plan.id} className="text-center">
                            {plan.features.includes(feature) ? '✓' : '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {block.plans.some((p) => p.ctaLabel) ? (
                      <tr>
                        <td> </td>
                        {block.plans.map((plan) => (
                          <td key={plan.id} className="text-center">
                            {plan.ctaLabel ? (
                              canvas ? (
                                <InlineEditable
                                  as="span"
                                  blockId={block.id}
                                  field={`planCta:${plan.id}`}
                                  value={plan.ctaLabel}
                                  handlers={canvas}
                                  blockStyle={(block.style || {}) as Record<string, unknown>}
                                  textRole="button"
                                  className="inline-block px-3 py-2 text-sm font-bold"
                                  style={{
                                    borderRadius: 'calc(var(--lp-radius) - 2px)',
                                    background: primary,
                                    color: 'var(--lp-on-primary, #fff)',
                                  }}
                                />
                              ) : (
                                <a
                                  href={plan.ctaUrl || '#lead-form'}
                                  className="inline-block px-3 py-2 text-sm font-bold"
                                  style={{
                                    borderRadius: 'calc(var(--lp-radius) - 2px)',
                                    background: primary,
                                    color: 'var(--lp-on-primary, #fff)',
                                  }}
                                >
                                  <InlineEditable
                                    as="span"
                                    blockId={block.id}
                                    field={`planCta:${plan.id}`}
                                    value={plan.ctaLabel}
                                    handlers={null}
                                    blockStyle={(block.style || {}) as Record<string, unknown>}
                                    textRole="button"
                                  />
                                </a>
                              )
                            ) : null}
                          </td>
                        ))}
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        );
      }

      if (pVariant === 'minimal') {
        return (
          <section
            className={`${spacingClass(block.spacing)} px-4 sm:px-6`}
            style={sectionBgStyle(block)}
            data-lp-section-tone={sectionToneAttr(block)}
            data-lp-bg-motion={sectionBgMotionAttr(block)}
            data-lp-pricing-variant="minimal"
            data-lp-variant={pVariant}
          >
            <div className="mx-auto max-w-6xl" data-lp-container-inner="1">
              <SectionHead
                headline={block.headline}
                subheadline={block.subheadline}
                eyebrow={sectionEyebrowFor(block.type, category)}
                blockId={block.id}
                canvas={canvas}
                blockStyle={(block.style || {}) as Record<string, unknown>}
              />
              <div className="relative" data-lp-free-surface="1" data-lp-pricing-minimal="1">
                {block.plans.map((plan, planIndex) => {
                  const planBody = (
                    <div className="min-w-0 py-3" data-lp-pricing-card="1">
                      <div className="text-lg font-bold break-words">
                        <InlineEditable
                          as="span"
                          blockId={block.id}
                          field={`planName:${plan.id}`}
                          value={plan.name}
                          handlers={canvas}
                          blockStyle={(block.style || {}) as Record<string, unknown>}
                          textRole="pricing"
                          className="text-lg font-bold break-words"
                        />
                      </div>
                      <div className="mt-2 break-words text-2xl font-extrabold">
                        <InlineEditable
                          as="span"
                          blockId={block.id}
                          field={`planPrice:${plan.id}`}
                          value={plan.price}
                          handlers={canvas}
                          blockStyle={(block.style || {}) as Record<string, unknown>}
                          textRole="pricing"
                          className="break-words text-2xl font-extrabold"
                        />
                        {plan.period ? (
                          <span className="text-sm font-normal opacity-80"> {plan.period}</span>
                        ) : null}
                      </div>
                      <ul className="mt-3 space-y-1.5 text-sm" style={{ color: 'var(--lp-muted)' }}>
                        {plan.features.map((f) => (
                          <li key={f} className="flex gap-2">
                            <span className="shrink-0">•</span>
                            <span className="min-w-0 break-words">{f}</span>
                          </li>
                        ))}
                      </ul>
                      {plan.ctaLabel ? (
                        canvas ? (
                          <InlineEditable
                            as="span"
                            blockId={block.id}
                            field={`planCta:${plan.id}`}
                            value={plan.ctaLabel}
                            handlers={canvas}
                            blockStyle={(block.style || {}) as Record<string, unknown>}
                            textRole="button"
                            className="mt-4 inline-block text-sm font-bold"
                            style={{ color: primary }}
                          />
                        ) : (
                          <a
                            href={plan.ctaUrl || '#lead-form'}
                            className="mt-4 inline-block text-sm font-bold"
                            style={{ color: primary }}
                          >
                            <InlineEditable
                              as="span"
                              blockId={block.id}
                              field={`planCta:${plan.id}`}
                              value={plan.ctaLabel}
                              handlers={null}
                              blockStyle={(block.style || {}) as Record<string, unknown>}
                              textRole="button"
                            />
                          </a>
                        )
                      ) : null}
                    </div>
                  );
                  if (!canvas) {
                    return <div key={plan.id}>{planBody}</div>;
                  }
                  return (
                    <ItemReorderChrome
                      key={plan.id}
                      blockId={block.id}
                      index={planIndex}
                      itemId={plan.id}
                      handlers={canvas}
                    >
                      {planBody}
                    </ItemReorderChrome>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      return (
        <section
          className={`${spacingClass(block.spacing)} px-4 sm:px-6`}
          style={sectionBgStyle(block)}
          data-lp-section-tone={sectionToneAttr(block)}
          data-lp-bg-motion={sectionBgMotionAttr(block)}
          data-lp-pricing-variant={pricingAttr}
          data-lp-variant={pVariant}
        >
          <div className="mx-auto max-w-6xl" data-lp-container-inner="1">
            <SectionHead
              headline={block.headline}
              subheadline={block.subheadline}
              eyebrow={sectionEyebrowFor(block.type, category)}
              blockId={block.id}
              canvas={canvas}
              blockStyle={(block.style || {}) as Record<string, unknown>}
            />
            <div className={`relative grid gap-5 ${itemCountGridClass(block.plans.length)}`} data-lp-free-surface="1" data-lp-pricing-grid="1" data-lp-item-count={block.plans.length}>
              {block.plans.map((plan, planIndex) => {
                const planCard = (
                  <div
                    className="flex h-full min-w-0 flex-col break-words p-5 sm:p-6"
                    data-lp-pricing-card="1"
                    data-lp-featured={plan.highlighted ? '1' : undefined}
                    style={{
                      background: plan.highlighted ? primary : 'var(--lp-surface)',
                      color: plan.highlighted ? 'var(--lp-on-primary, #fff)' : 'var(--lp-text)',
                    }}
                  >
                  <div className="text-lg font-bold break-words">
                    <InlineEditable
                        as="span"
                        blockId={block.id}
                        field={`planName:${plan.id}`}
                        value={plan.name}
                        handlers={canvas}
                        blockStyle={(block.style || {}) as Record<string, unknown>}
                        textRole="pricing"
                        className="text-lg font-bold break-words"
                      />
                  </div>
                  <div className="mt-3 break-words text-3xl font-extrabold">
                    <InlineEditable
                        as="span"
                        blockId={block.id}
                        field={`planPrice:${plan.id}`}
                        value={plan.price}
                        handlers={canvas}
                        blockStyle={(block.style || {}) as Record<string, unknown>}
                        textRole="pricing"
                        className="break-words text-3xl font-extrabold"
                      />
                    {plan.period ? (
                      <span className="text-sm font-normal opacity-80"> {plan.period}</span>
                    ) : null}
                  </div>
                  <ul className="mt-5 flex-1 space-y-2 text-sm opacity-90">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-2">
                        <span className="shrink-0">✓</span>
                        <span className="min-w-0 break-words">{f}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.ctaLabel ? (
                    canvas ? (
                      <InlineEditable
                        as="span"
                        blockId={block.id}
                        field={`planCta:${plan.id}`}
                        value={plan.ctaLabel}
                        handlers={canvas}
                        blockStyle={(block.style || {}) as Record<string, unknown>}
                        textRole="button"
                        className="mt-6 block w-full max-w-full px-4 py-2.5 text-center text-sm font-bold break-words"
                        style={{
                          borderRadius: 'calc(var(--lp-radius) - 2px)',
                          background: plan.highlighted ? 'var(--lp-on-primary, #fff)' : primary,
                          color: plan.highlighted ? primary : 'var(--lp-on-primary, #fff)',
                        }}
                      />
                    ) : (
                      <a
                        href={plan.ctaUrl || '#lead-form'}
                        className="mt-6 block w-full max-w-full px-4 py-2.5 text-center text-sm font-bold break-words"
                        style={{
                          borderRadius: 'calc(var(--lp-radius) - 2px)',
                          background: plan.highlighted ? 'var(--lp-on-primary, #fff)' : primary,
                          color: plan.highlighted ? primary : 'var(--lp-on-primary, #fff)',
                        }}
                      >
                        <InlineEditable
                          as="span"
                          blockId={block.id}
                          field={`planCta:${plan.id}`}
                          value={plan.ctaLabel}
                          handlers={null}
                          blockStyle={(block.style || {}) as Record<string, unknown>}
                          textRole="button"
                        />
                      </a>
                    )
                  ) : null}
                  </div>
                );
                if (!canvas) {
                  return <div key={plan.id}>{planCard}</div>;
                }
                return (
                  <ItemReorderChrome
                    key={plan.id}
                    blockId={block.id}
                    index={planIndex}
                    itemId={plan.id}
                    handlers={canvas}
                  >
                    {planCard}
                  </ItemReorderChrome>
                );
              })}
            </div>
          </div>
        </section>
      );
    }
    case 'Testimonials': {
      const items = filterPublishableTestimonials(block.items, mode);
      const tVariant = canonicalBlockVariant('Testimonials', block.variant);
      if (!items.length) {
        if (mode === 'public') return null;
        return null;
      }
      return (
        <section
          className={`${spacingClass(block.spacing)} px-4 sm:px-6`}
          style={sectionBgStyle(block, 'var(--lp-surface)')}
          data-lp-section-tone={sectionToneAttr(block)}
          data-lp-bg-motion={sectionBgMotionAttr(block)}
          data-lp-variant={tVariant}
          data-lp-testimonials-variant={tVariant}
        >
          <div className="mx-auto max-w-6xl" data-lp-container-inner="1">
            <SectionHead
              headline={block.headline}
              eyebrow={sectionEyebrowFor(block.type, category)}
              blockId={block.id}
              canvas={canvas}
              blockStyle={(block.style || {}) as Record<string, unknown>}
            />
            <div
              className={
                tVariant === 'quote-centered'
                  ? 'relative'
                  : 'relative grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'
              }
              data-lp-free-surface="1"
              data-lp-testimonials-grid="1"
            >
              {items.map((t) => {
                const avatarNode = t.avatarUrl ? (
                  <LpContentImage
                    src={t.avatarUrl}
                    alt=""
                    fallbackLabel={(t.author || t.role || '?').slice(0, 1)}
                    width={40}
                    height={40}
                    loading="lazy"
                    decoding="async"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: primary, color: 'var(--lp-on-primary, #fff)' }}
                    data-lp-avatar="1"
                  >
                    {(t.author || t.role || '?').slice(0, 1)}
                  </span>
                );
                const quoteBody = (
                  <>
                    {tVariant === 'metric-plus-quote' ? (
                      <div className="mb-2" data-lp-metric="1">
                        {(t.role || '').match(/\d/) ? t.role : '★★★★★'}
                      </div>
                    ) : null}
                    <p className="flex-1 text-sm leading-relaxed" style={{ color: 'var(--lp-text)' }}>
                      &ldquo;
                      <InlineEditable
                        as="span"
                        blockId={block.id}
                        field={`itemQuote:${t.id}`}
                        value={t.quote || ''}
                        handlers={canvas}
                        blockStyle={(block.style || {}) as Record<string, unknown>}
                        multiline
                        textRole="testimonial"
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--lp-text)' }}
                      />
                      &rdquo;
                    </p>
                  </>
                );
                const authorFooter = (
                  <footer className="mt-4 flex items-center gap-3">
                    {tVariant === 'portrait-quotes' ? null : avatarNode}
                    <span>
                      <span className="block text-sm font-bold" style={{ color: 'var(--lp-secondary)' }}>
                        <InlineEditable
                          as="span"
                          blockId={block.id}
                          field={`itemAuthor:${t.id}`}
                          value={t.author || ''}
                          handlers={canvas}
                          blockStyle={(block.style || {}) as Record<string, unknown>}
                          textRole="testimonial"
                          className="text-sm font-bold"
                          style={{ color: 'var(--lp-secondary)' }}
                        />
                      </span>
                      {t.role && tVariant !== 'metric-plus-quote' ? (
                        <span className="text-xs" style={{ color: 'var(--lp-muted)' }}>
                          {t.role}
                        </span>
                      ) : null}
                    </span>
                  </footer>
                );

                let itemInner: ReactNode;
                if (tVariant === 'editorial') {
                  itemInner = (
                    <blockquote
                      className="flex min-w-0 flex-col break-words py-2"
                      data-lp-card-item="1"
                      data-lp-testimonial-editorial="1"
                    >
                      {quoteBody}
                      {authorFooter}
                    </blockquote>
                  );
                } else if (tVariant === 'portrait-quotes') {
                  itemInner = (
                    <blockquote
                      className="min-w-0 break-words p-5"
                      data-lp-card-item="1"
                      data-lp-testimonial-portrait="1"
                      style={{
                        background: 'var(--lp-bg)',
                        borderRadius: 'var(--lp-radius)',
                        boxShadow: 'var(--lp-shadow)',
                      }}
                    >
                      <div className="shrink-0">{avatarNode}</div>
                      <div className="min-w-0 flex-1">
                        {quoteBody}
                        {authorFooter}
                      </div>
                    </blockquote>
                  );
                } else {
                  itemInner = (
                    <blockquote
                      className="flex min-w-0 flex-col break-words p-5"
                      data-lp-card-item="1"
                      style={{
                        background: tVariant === 'quote-centered' ? 'transparent' : 'var(--lp-bg)',
                        borderRadius: 'var(--lp-radius)',
                        boxShadow: tVariant === 'quote-centered' ? 'none' : 'var(--lp-shadow)',
                      }}
                    >
                      {quoteBody}
                      {authorFooter}
                    </blockquote>
                  );
                }

                return (
                  <ItemReorderChrome
                    key={t.id}
                    blockId={block.id}
                    index={block.items.findIndex((row) => row.id === t.id)}
                    itemId={t.id}
                    handlers={canvas}
                  >
                    {itemInner}
                  </ItemReorderChrome>
                );
              })}
            </div>
          </div>
        </section>
      );
    }
    case 'FAQ': {
      const faqs = (block.items || []).filter(
        (it) => (it.question || '').trim() && (it.answer || '').trim(),
      );
      if (!faqs.length) {
        if (mode === 'public') return null;
      }
      const faqVariant = canonicalBlockVariant('FAQ', block.variant);
      const accordion = faqVariant === 'accordion';
      return (
        <section
          className={`${spacingClass(block.spacing)} px-4 sm:px-6`}
          style={sectionBgStyle(block)}
        data-lp-section-tone={sectionToneAttr(block)}
        data-lp-bg-motion={sectionBgMotionAttr(block)}
          data-lp-faq-variant={faqVariant}
        >
          <div className={`mx-auto ${accordion ? 'max-w-3xl' : 'max-w-6xl'}`}>
            <SectionHead
              headline={block.headline}
              eyebrow={sectionEyebrowFor(block.type, category)}
              blockId={block.id}
              canvas={canvas}
              blockStyle={(block.style || {}) as Record<string, unknown>}
            />
            <div
              className={
                accordion
                  ? 'relative flex flex-col gap-2'
                  : 'relative grid grid-cols-1 gap-3 md:grid-cols-2'
              }
              data-lp-free-surface="1"
              data-lp-faq-grid={accordion ? 'accordion' : '1'}
            >
              {(faqs.length ? faqs : block.items).map((item) => (
                <ItemReorderChrome
                  key={item.id}
                  blockId={block.id}
                  index={block.items.findIndex((row) => row.id === item.id)}
                  itemId={item.id}
                  handlers={canvas}
                >
                <details
                  className={
                    accordion
                      ? 'group border-b border-black/10 bg-transparent px-1 py-4 open:pb-5'
                      : 'group border border-black/5 bg-[var(--lp-surface)] p-4 open:shadow-md'
                  }
                  style={accordion ? undefined : { borderRadius: 'var(--lp-radius)' }}
                >
                  <summary
                    className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold"
                    style={{ color: 'var(--lp-secondary)' }}
                  >
                    <span className="min-w-0 flex-1">
                      <InlineEditable
                          as="span"
                          blockId={block.id}
                          field={`itemQuestion:${item.id}`}
                          value={item.question || ''}
                          handlers={canvas}
                        blockStyle={(block.style || {}) as Record<string, unknown>}
                          textRole="faq"
                          className={accordion ? 'text-base font-bold md:text-lg' : 'font-semibold'}
                          style={{ color: 'var(--lp-secondary)' }}
                        />
                    </span>
                    <span className="text-lg font-light text-[var(--lp-muted)] group-open:hidden">+</span>
                    <span className="hidden text-lg font-light text-[var(--lp-muted)] group-open:inline">
                      −
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed md:text-[15px]" style={{ color: 'var(--lp-muted)' }}>
                    <InlineEditable
                        as="span"
                        blockId={block.id}
                        field={`itemAnswer:${item.id}`}
                        value={item.answer || ''}
                        handlers={canvas}
                        blockStyle={(block.style || {}) as Record<string, unknown>}
                        multiline
                        textRole="faq"
                        className="text-sm leading-relaxed md:text-[15px]"
                        style={{ color: 'var(--lp-muted)' }}
                      />
                  </p>
                </details>
                </ItemReorderChrome>
              ))}
            </div>
          </div>
        </section>
      );
    }
    case 'Video':
      if (
        !(block.videoUrl || '').trim() &&
        !(block.posterUrl || '').trim() &&
        (mode === 'public' || (mode === 'preview' && !canvas))
      ) {
        return null;
      }
      return (
        <section
          className={`${spacingClass(block.spacing)} px-4 sm:px-6`}
          style={sectionBgStyle(block)}
          data-lp-section-tone={sectionToneAttr(block)}
        >
          <div className="mx-auto max-w-5xl" data-lp-container-inner="1">
            <SectionHead
              headline={block.headline}
              eyebrow={sectionEyebrowFor(block.type, category)}
              blockId={block.id}
              canvas={canvas}
              blockStyle={(block.style || {}) as Record<string, unknown>}
            />
            <div
              className="relative aspect-video w-full max-w-full overflow-hidden bg-black/10"
              style={{ borderRadius: 'var(--lp-radius)', boxShadow: 'var(--lp-shadow-lg, var(--lp-shadow))' }}
              data-lp-video-shell="1"
            >
              {block.videoUrl ? (
                <iframe
                  title={block.headline || 'Video'}
                  src={block.videoUrl}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : block.posterUrl ? (
                <div className="relative h-full w-full">
                  <LpContentImage
                    src={block.posterUrl}
                    alt=""
                    fallbackLabel="Video preview"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <span
                      className="inline-flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white shadow-lg"
                      style={{ background: primary, color: 'var(--lp-on-primary, #fff)' }}
                      aria-hidden
                    >
                      ▶
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-sm" style={{ color: 'var(--lp-muted)' }}>
                  Thêm URL video trong Builder
                </div>
              )}
            </div>
          </div>
        </section>
      );
    case 'LeadForm':
      if (skipLeadForm) return null;
      {
        const formVariant = canonicalBlockVariant('LeadForm', block.variant);
        const formCompact = formVariant === 'compact' || formVariant === 'inline';
        const formCard = (
          <div data-lp-form-card="1">
            {formVariant === 'booking' ? (
              <div
                className="mb-3 flex items-center gap-2 border-b border-black/5 px-1 pb-3"
                data-lp-form-booking-strip="1"
              >
                <span
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ background: primary, color: 'var(--lp-on-primary, #fff)' }}
                  aria-hidden
                >
                  ✓
                </span>
                <span className="text-sm font-bold" style={{ color: 'var(--lp-secondary)' }}>
                  Đặt lịch
                </span>
              </div>
            ) : null}
            <LeadFormCard
              block={block}
              primary={primary}
              onSubmit={onLeadSubmit}
              onFormStart={onFormStart}
              compact={formCompact}
              canvas={canvas}
              omitHead={formVariant === 'split'}
            />
          </div>
        );

        if (formVariant === 'split') {
          return (
            <section
              id="lead"
              className={`${spacingClass(block.spacing)} px-4 sm:px-6`}
              style={sectionBgStyle(block, 'var(--lp-surface)')}
              data-lp-section-tone={sectionToneAttr(block)}
              data-lp-conversion-zone={conversionZone}
              data-lp-bg-motion={sectionBgMotionAttr(block)}
              data-lp-variant={formVariant}
              data-lp-form-variant={formVariant}
            >
              <div className="mx-auto w-full max-w-5xl" data-lp-form-split="1">
                <div className="min-w-0 py-2">
                  {showCanvasInlineField(block.headline, canvas, block.id, 'headline') ? (
                    <InlineEditable
                      as="h2"
                      blockId={block.id}
                      field="headline"
                      value={block.headline || ''}
                      handlers={canvas}
                      blockStyle={(block.style || {}) as Record<string, unknown>}
                      textRole="heading"
                      className="text-2xl font-extrabold md:text-3xl"
                      style={{ color: 'var(--lp-secondary)' }}
                    />
                  ) : null}
                  {showCanvasInlineField(block.subheadline, canvas, block.id, 'subheadline') ? (
                    <InlineEditable
                      as="p"
                      blockId={block.id}
                      field="subheadline"
                      value={block.subheadline || ''}
                      handlers={canvas}
                      blockStyle={(block.style || {}) as Record<string, unknown>}
                      multiline
                      textRole="paragraph"
                      className="mt-3 text-sm leading-relaxed md:text-base"
                      style={{ color: 'var(--lp-muted)' }}
                    />
                  ) : null}
                </div>
                <ElementChrome
                  blockId={block.id}
                  element="form"
                  handlers={canvas || null}
                  kind="box"
                  className="w-full min-w-0"
                  blockStyle={(block.style || {}) as Record<string, unknown>}
                >
                  {formCard}
                </ElementChrome>
              </div>
            </section>
          );
        }

        return (
          <section
            id="lead"
            className={`${spacingClass(block.spacing)} flex justify-center px-4 sm:px-6`}
            style={sectionBgStyle(block, 'var(--lp-surface)')}
            data-lp-section-tone={sectionToneAttr(block)}
            data-lp-conversion-zone={conversionZone}
            data-lp-bg-motion={sectionBgMotionAttr(block)}
            data-lp-variant={formVariant}
            data-lp-form-variant={formVariant}
          >
            <ElementChrome
              blockId={block.id}
              element="form"
              handlers={canvas || null}
              kind="box"
              className={formVariant === 'inline' ? 'w-full max-w-3xl' : 'w-full max-w-lg'}
              blockStyle={(block.style || {}) as Record<string, unknown>}
            >
              {formCard}
            </ElementChrome>
          </section>
        );
      }
    case 'Countdown': {
      const cd = block as LandingPageCountdownBlock;
      if (isCountdownLaunchStyle(cd.styleVariant)) {
        return (
          <LandingPageCountdownLaunch
            block={cd}
            primary={primary}
            canvas={canvas}
            onLeadSubmit={onLeadSubmit}
            onFormStart={onFormStart}
          />
        );
      }
      return (
        <section
          className={`${spacingClass(cd.spacing)} px-4 sm:px-6`}
          style={sectionBgStyle(cd as LandingPageBlock, cd.background || undefined)}
          data-lp-section-tone={sectionToneAttr(cd as LandingPageBlock)}
          data-lp-countdown
        >
          <div className="mx-auto max-w-6xl" data-lp-container-inner="1">
            <SectionHead
              headline={cd.headline}
              subheadline={cd.subheadline}
              blockId={cd.id}
              canvas={canvas}
              blockStyle={(cd.style || {}) as Record<string, unknown>}
            />
            {cd.timezone ? (
              <p className="mb-4 text-center text-[11px] opacity-50">Timezone: {cd.timezone}</p>
            ) : null}
            <LandingPageCountdownLive block={cd} primary={primary} blockId={cd.id} canvas={canvas} />
          </div>
        </section>
      );
    }
    default:
      return null;
  }
}

const MemoBlockView = memo(BlockView);

export function LandingPageRenderer({
  spec,
  viewport = 'desktop',
  mode = 'preview',
  onLeadSubmit,
  onFormStart,
  className,
  categoryHint,
  selectedBlockId = null,
  onSelectBlock,
  interactive = false,
  canvas = null,
  onHtmlSourceChange,
  onHtmlSectionChange,
  htmlSelectedNodeId = null,
  onHtmlSelectNode,
  onHtmlBindPatch,
}: {
  spec: LandingPageSpec;
  viewport?: Viewport;
  mode?: RenderMode;
  onLeadSubmit?: (fields: Record<string, string>, blockId: string) => Promise<void> | void;
  onFormStart?: () => void;
  className?: string;
  categoryHint?: string;
  /** Stable block id for canvas selection (builder). */
  selectedBlockId?: string | null;
  onSelectBlock?: (blockId: string) => void;
  /** When true, canvas clicks select blocks (builder preview). */
  interactive?: boolean;
  /** Additive canvas UX handlers (hover/toolbar/inline/reorder). */
  canvas?: LandingPageCanvasHandlers | null;
  /** Builder: persist an edit made inside an uploaded HTML document. */
  onHtmlSourceChange?: (html: string) => void;
  onHtmlSectionChange?: (blockId: string, html: string) => void;
  htmlSelectedNodeId?: string | null;
  onHtmlSelectNode?: (node: import('./landing-page-html-nodes').HtmlNodeSnapshot) => void;
  onHtmlBindPatch?: (patch: import('./landing-page-html-nodes').HtmlPatchFn | null) => void;
}) {
  const motionRoot = useRef<HTMLDivElement>(null);
  const motionPlayed = useRef(new Set<string>());
  const motionEditing = Boolean(interactive || canvas);
  const motionHtmlImport = Boolean(spec.meta?.htmlSource || spec.meta?.htmlSections?.length);
  useEffect(() => {
    if (!motionRoot.current || motionHtmlImport) return;
    return installLpMotion(motionRoot.current, spec, motionEditing, motionPlayed.current);
  }, [spec, motionEditing, motionHtmlImport]);
  const sourceSpec=spec;spec=useMemo(()=>projectLandingFlow(sourceSpec),[sourceSpec]);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('lp-section-bg-motion-css')) return;
    const el = document.createElement('style');
    el.id = 'lp-section-bg-motion-css';
    el.setAttribute('data-lp-section-bg-motion-css', '1');
    el.textContent = LP_SECTION_BG_MOTION_CSS;
    document.head.appendChild(el);
  }, []);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('lp-viewport-sim-css')) return;
    const el = document.createElement('style');
    el.id = 'lp-viewport-sim-css';
    el.setAttribute('data-lp-viewport-sim-css', '1');
    el.textContent = scopeLegacyLandingPageCss(LP_VIEWPORT_SIM_CSS);
    document.head.appendChild(el);
  }, []);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('lp-responsive-foundation-css')) return;
    const el = document.createElement('style');
    el.id = 'lp-responsive-foundation-css';
    el.setAttribute('data-lp-responsive-foundation-css', '1');
    el.textContent = scopeLegacyLandingPageCss(LP_RESPONSIVE_FOUNDATION_CSS);
    document.head.appendChild(el);
  }, []);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('lp-premium-foundation-css')) return;
    const el = document.createElement('style');
    el.id = 'lp-premium-foundation-css';
    el.setAttribute('data-lp-premium-foundation-css', '1');
    el.textContent = scopeLegacyLandingPageCss(LP_PREMIUM_FOUNDATION_CSS);
    document.head.appendChild(el);
  }, []);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('lp-variant-css')) return;
    const el = document.createElement('style');
    el.id = 'lp-variant-css';
    el.setAttribute('data-lp-variant-css', '1');
    el.textContent = scopeLegacyLandingPageCss(LP_VARIANT_CSS);
    document.head.appendChild(el);
  }, []);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('lp-gold-foundation-css')) return;
    const el = document.createElement('style');
    el.id = 'lp-gold-foundation-css';
    el.setAttribute('data-lp-gold-foundation-css', '1');
    el.textContent = scopeLegacyLandingPageCss(LP_GOLD_FOUNDATION_CSS);
    document.head.appendChild(el);
  }, []);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('lp-visual-foundation-css')) return;
    const el = document.createElement('style');
    el.id = 'lp-visual-foundation-css';
    el.setAttribute('data-lp-visual-foundation-css', '1');
    el.textContent = scopeLegacyLandingPageCss(LP_VISUAL_FOUNDATION_CSS);
    document.head.appendChild(el);
  }, []);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('lp-premium-visual-axis-css')) return;
    const el = document.createElement('style');
    el.id = 'lp-premium-visual-axis-css';
    el.setAttribute('data-lp-premium-visual-axis-css', '1');
    el.textContent = scopeLegacyLandingPageCss(LP_PREMIUM_VISUAL_AXIS_CSS);
    document.head.appendChild(el);
  }, []);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('lp-commercial-template-css')) return;
    const el = document.createElement('style');
    el.id = 'lp-commercial-template-css';
    el.setAttribute('data-lp-commercial-template-css', '1');
    el.textContent = LP_COMMERCIAL_TEMPLATE_CSS;
    document.head.appendChild(el);
  }, []);
  useEffect(() => {
    for (const block of spec.blocks) {
      const context = readSectionLibraryContext(block);
      if (context?.version === 1) ensureLandingPageCatalogFonts(mergeDesignFamilyTokens(context.themeTokens, context.designFamily).fontFamily);
    }
  }, [spec.blocks]);
  const blankStarter = spec.meta?.rendererVersion === 'blank-starter-v1';
  const agencyStandard = isAgencyPortfolioStandard(spec);
  const restaurantPilot = isRestaurantMenuRepresentative(spec);
  const servicePilot = isLocalServiceRepresentative(spec);
  const websitePilot = isWebsiteRepresentative(spec);
  const tokens = agencyStandard || restaurantPilot || servicePilot || websitePilot ? normalizeLandingPageThemeTokens(spec.themeTokens, spec.theme) : mergeDesignFamilyTokens(
    normalizeLandingPageThemeTokens(spec.themeTokens, spec.theme),
    spec.meta?.designFamily,
  );
  const category = String(categoryHint || spec.meta?.category || '').trim() || undefined;
  const goldStandard =
    typeof spec.meta?.goldStandard === 'string' ? spec.meta.goldStandard : undefined;
  const layout = resolveLandingPageLayout(spec, category);
  const primary = tokens.button || tokens.primary;
  const goalAttr = conversionGoalEmphasis(spec.meta?.conversionGoal);
  const designFamilyAttr =
    typeof spec.meta?.designFamily === 'string' ? spec.meta.designFamily : undefined;
  const hero = spec.blocks.find((b) => b.type === 'Hero' && b.enabled) as LandingPageTextBlock | undefined;
  const leadForm = spec.blocks.find((b) => b.type === 'LeadForm' && b.enabled) as
    | LandingPageLeadFormBlock
    | undefined;
  const heroVariant = hero ? resolveBlockVariant('Hero', hero.variant) : 'default';
  const embedForm = Boolean(
    !agencyStandard &&
      leadForm &&
      hero &&
      (layout === 'lead_gen' || heroVariant === 'floating-card') &&
      // The form is only lifted into the Hero when that Hero actually renders it (floating-card).
      // Otherwise the standalone LeadForm section must stay, or the form disappears entirely
      // (lead_gen layout + centered/split Hero used to hide the only form on the page).
      resolveHeroComposition(hero.variant, layout, true) === 'floating-card',
  );
  const canvasBlocks = hero
    ? [hero, ...spec.blocks.filter((b) => b.type !== 'Hero')]
    : spec.blocks;
  const canvasFreeReserve = computeCanvasFreeReserveHeight(canvasBlocks, viewport);

  /** Public/Preview: resolve absolute free-position without canvas handlers. */
  const resolvePublicSectionFreeLayout = (block: (typeof canvasBlocks)[number]) => {
    const resolved = resolveFreeLayoutForViewport(
      block.positionMode,
      block.freeLayout,
      block.responsiveFreeLayout,
      viewport,
    );
    if (!resolved || !isPlausibleFreeLayout(resolved, 'absolute')) return null;
    return resolved;
  };

  useEffect(() => {
    if (typeof document === 'undefined') return;
    requestAnimationFrame(() => {
      const root = document.querySelector('[data-lp-canvas-root]') as HTMLElement | null;
      if (!root) return;
      if (canvasFreeReserve > 0) {
        root.style.minHeight = `${canvasFreeReserve}px`;
        root.setAttribute('data-lp-free-reserve-h', String(canvasFreeReserve));
      } else {
        root.style.minHeight = '';
        root.removeAttribute('data-lp-free-reserve-h');
      }
    });
  }, [canvasFreeReserve, viewport, canvasBlocks.length]);

  // Prefer full canvas handlers; fall back to legacy onSelectBlock adapter.
  const canvasHandlers: LandingPageCanvasHandlers | null =
    canvas ||
    (interactive && onSelectBlock
      ? {
          selection: selectedBlockId ? { blockId: selectedBlockId, element: 'section' } : null,
          selectedElementIds: selectedBlockId ? [`${selectedBlockId}::section`] : [],
          primarySelectedId: selectedBlockId ? `${selectedBlockId}::section` : null,
          onSelect: (next) => onSelectBlock(next.blockId),
          onMarqueeSelect: () => undefined,
          isSelected: (target) =>
            Boolean(selectedBlockId && target.blockId === selectedBlockId),
          isPrimarySelected: (target) =>
            Boolean(selectedBlockId && target.blockId === selectedBlockId),
          isSectionPrimary: (blockId) => selectedBlockId === blockId,
          onDeselect: () => undefined,
          onFieldLive: () => undefined,
          onFieldCommit: () => undefined,
          onDuplicate: () => undefined,
          onDuplicateItem: () => undefined,
          onDelete: () => undefined,
          onMove: () => undefined,
          onReorderBlock: () => undefined,
          onReorderItem: () => undefined,
          onAi: () => undefined,
          onReplaceImage: () => undefined,
        }
      : null);

  const primaryTarget = canvasHandlers?.primarySelectedId
    ? parseLpSelectionKey(canvasHandlers.primarySelectedId)
    : null;
  const selectedElement = primaryTarget?.element ?? canvasHandlers?.selection?.element;

  useEffect(() => {
    if (restaurantPilot || servicePilot || websitePilot) return; // Review pilots serve their own local font faces.
    if (agencyStandard) {
      if (!tokens.fontFamily.includes('Agency Portfolio Be Vietnam Pro')) ensureLandingPageCatalogFonts(tokens.fontFamily);
      return; // The approved Vietnamese font is served locally by this pilot.
    }
    // Always warm the professional font set so designFamily swaps never flash system fonts.
    const catalogFonts = [
      '"Oswald"',
      '"Inter"',
      '"Playfair Display"',
      '"DM Sans"',
      '"Manrope"',
      '"Plus Jakarta Sans"',
      '"Cormorant Garamond"',
      '"Fraunces"',
      '"Space Grotesk"',
      '"IBM Plex Sans"',
    ];
    ensureLandingPageCatalogFonts(tokens.fontFamily);
    for (const ff of catalogFonts) ensureLandingPageCatalogFonts(ff);
    if (goldStandard === 'modern-saas') {
      ensureLandingPageCatalogFonts('"IBM Plex Sans"');
    }
    if (goldStandard === 'care-warm') {
      ensureLandingPageCatalogFonts('"Fraunces"');
      ensureLandingPageCatalogFonts('"DM Sans"');
    }
    if (goldStandard === 'premium-medical') {
      ensureLandingPageCatalogFonts('"Cormorant Garamond"');
      ensureLandingPageCatalogFonts('"DM Sans"');
    }
    if (goldStandard === 'trust-clinical') {
      ensureLandingPageCatalogFonts('"Manrope"');
    }
    if (goldStandard === 'product-led') {
      ensureLandingPageCatalogFonts('"Plus Jakarta Sans"');
    }
    if (goldStandard === 'enterprise') {
      ensureLandingPageCatalogFonts('"IBM Plex Sans"');
    }
    if (goldStandard === 'ai-modern') {
      ensureLandingPageCatalogFonts('"Space Grotesk"');
      ensureLandingPageCatalogFonts('"DM Sans"');
    }
    if (
      goldStandard === 'trust-first' ||
      goldStandard === 'nav-product' ||
      goldStandard === 'minimal-trial'
    ) {
      ensureLandingPageCatalogFonts('"Inter"');
    }
    if (goldStandard === 'workflow-story') {
      ensureLandingPageCatalogFonts('"Manrope"');
    }
    if (goldStandard === 'ui-gallery' || goldStandard === 'early-trial') {
      ensureLandingPageCatalogFonts('"Plus Jakarta Sans"');
    }
    if (goldStandard === 'faq-trial') {
      ensureLandingPageCatalogFonts('"IBM Plex Sans"');
    }
    if (
      goldStandard === 'trust-case' ||
      goldStandard === 'faq-pitch' ||
      goldStandard === 'nav-services' ||
      goldStandard === 'minimal-pitch'
    ) {
      ensureLandingPageCatalogFonts('"IBM Plex Sans"');
    }
    if (goldStandard === 'trust-case' || goldStandard === 'nav-services' || goldStandard === 'minimal-pitch') {
      ensureLandingPageCatalogFonts('"Inter"');
    }
    if (goldStandard === 'process-sprint') {
      ensureLandingPageCatalogFonts('"Manrope"');
    }
    if (goldStandard === 'work-gallery') {
      ensureLandingPageCatalogFonts('"Fraunces"');
    }
    if (goldStandard === 'early-brief') {
      ensureLandingPageCatalogFonts('"Plus Jakarta Sans"');
    }
    if (
      goldStandard === 'buy-path' ||
      goldStandard === 'trust-reviews' ||
      goldStandard === 'price-compare' ||
      goldStandard === 'how-it-works' ||
      goldStandard === 'demo-reel' ||
      goldStandard === 'faq-buy' ||
      goldStandard === 'nav-shop' ||
      goldStandard === 'early-order' ||
      goldStandard === 'minimal-buy'
    ) {
      ensureLandingPageCatalogFonts('"Manrope"');
      ensureLandingPageCatalogFonts('"DM Sans"');
    }
    if (
      goldStandard === 'drop-buy' ||
      goldStandard === 'trust-fit' ||
      goldStandard === 'price-drop' ||
      goldStandard === 'style-guide' ||
      goldStandard === 'lookbook' ||
      goldStandard === 'runway-video' ||
      goldStandard === 'faq-size' ||
      goldStandard === 'nav-collection' ||
      goldStandard === 'early-preorder' ||
      goldStandard === 'minimal-drop'
    ) {
      ensureLandingPageCatalogFonts('"Fraunces"');
      ensureLandingPageCatalogFonts('"DM Sans"');
      ensureLandingPageCatalogFonts('"Manrope"');
    }
    if (
      goldStandard === 'trust-skin' ||
      goldStandard === 'kit-pricing' ||
      goldStandard === 'routine' ||
      goldStandard === 'tutorial' ||
      goldStandard === 'faq-safe'
    ) {
      ensureLandingPageCatalogFonts('"Cormorant Garamond"');
      ensureLandingPageCatalogFonts('"DM Sans"');
    }
  }, [tokens.fontFamily, goldStandard, designFamilyAttr, agencyStandard, restaurantPilot, servicePilot, websitePilot]);

  useEffect(() => {
    const styles = (spec.meta as { inlineTextStyles?: Record<string, unknown> } | undefined)?.inlineTextStyles;
    if (!styles) return;
    const needsFonts = Object.values(styles).some((s) => {
      const ff = s && typeof s === 'object' ? String((s as { fontFamily?: string }).fontFamily || '') : '';
      return /Lobster|Great Vibes|Playfair|Oswald|Black Ops|Cormorant|Montserrat|Mulish|Arima/i.test(ff);
    });
    if (needsFonts) {
      void import('./landing-page-title-presets').then((m) => m.ensureLandingPageTitleFonts());
    }
  }, [spec.meta]);

  const htmlDocument =
    typeof spec.meta?.htmlSource === 'string' && spec.meta.htmlSource.trim()
      ? spec.meta.htmlSource
      : '';
  const htmlSectionList = spec.meta?.htmlSections;
  const sectionById = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of htmlSectionList || []) {
      if (row?.blockId && row.html) map.set(row.blockId, row.html);
    }
    return map;
  }, [htmlSectionList]);
  const isolatedPage = useMemo(
    () => (htmlDocument ? isolateHtmlDocument(htmlDocument) : null),
    [htmlDocument],
  );
  const useHtmlSections = sectionById.size > 0 && Boolean(isolatedPage);
  const visibleBlocks = useHtmlSections || !htmlDocument ? spec.blocks.filter(b => !b.sectionPlacement) : [];

  return (
    <div
      className={className}
      ref={motionRoot}
      data-lp-style-scope={blankStarter ? 'blank-starter-v1' : agencyStandard ? 'agency-portfolio-v2' : restaurantPilot ? 'restaurant-menu-v2' : servicePilot ? 'local-service-v2' : websitePilot ? 'website-brief-v2' : 'legacy'}
      data-lp-renderer={blankStarter ? 'blank-starter-v1' : agencyStandard ? 'agency-portfolio-v2' : restaurantPilot ? 'restaurant-menu-v2' : servicePilot ? 'local-service-v2' : websitePilot ? 'website-brief-v2' : 'legacy'}
      data-agency-direction={agencyPortfolioDirection(spec)}
      data-industry-direction={industryDirection(spec)}
      data-lp-layout={layout}
      data-lp-category={category}
      data-lp-catalog={
        typeof spec.meta?.catalogVersion === 'string' && spec.meta.catalogVersion.startsWith('gallery-v22') && !(blankStarter || agencyStandard || restaurantPilot || servicePilot || websitePilot)
          ? 'v22'
          : undefined
      }
      data-lp-gold-standard={goldStandard}
      data-lp-viewport={viewport}
      data-lp-mode={mode}
      data-lp-interactive={interactive || canvasHandlers ? '1' : '0'}
      data-lp-canvas-ux={canvasHandlers ? '1' : '0'}
      data-lp-design-family={designFamilyAttr || undefined}
      data-lp-goal={goalAttr}
      style={{ width: '100%', maxWidth: '100%', margin: '0 auto' }}
    >
      {!motionHtmlImport && spec.blocks.some(block => block.style?.lpMotion) ? <style data-lp-motion-css>{LP_MOTION_CSS}</style> : null}
      {spec.blocks.some(block => readSectionLibraryContext(block)) ? (
        <style data-lp-section-library-details="1">{`
          [data-lp-section-library-scope] [data-lp-canvas-ux="1"]  :is([data-lp-hero-cta], [data-lp-cta-band], [data-lp-cta-action-panel]) a[data-lp-inline-field="ctaLabel"]::after { content: "→"; }
        `}</style>
      ) : null}
      {(() => {
        const css = buildPageCustomCssBlocks(
          spec.blocks.map((b) => ({
            id: b.id,
            style: (b.style || null) as Record<string, unknown> | null,
          })),
        );
        if (!css) return null;
        return (
          <style
            data-lp-custom-css="1"
            // CSS-only (sanitized) — never eval JS
            dangerouslySetInnerHTML={{ __html: css }}
          />
        );
      })()}
      {(() => {
        const hiddenCss = buildElementHiddenCss(spec);
        if (!hiddenCss) return null;
        return (
          <style
            data-lp-element-hidden-css="1"
            dangerouslySetInnerHTML={{ __html: hiddenCss }}
          />
        );
      })()}
      <FreeGuidesProvider
        contentSafeArea={Boolean(interactive || canvasHandlers)}
        viewport={viewport}
      >
        <LandingPagePublicMetaProvider
          meta={(agencyStandard || restaurantPilot || servicePilot || websitePilot ? agencyPortfolioRenderMeta(spec, viewport) || null : spec.meta || null) as Record<string, unknown> | null}
        >
        <article
          data-lp-canvas-root="1" data-lp-non-overlap="1"
          data-lp-ai-generated={spec.meta?.aiGenerationId ? "1" : undefined}
          data-lp-imported={htmlDocument ? '1' : undefined}
          data-lp-density={tokens.density || 'comfortable'}
          data-lp-btn-style={tokens.buttonStyle || 'solid'}
          data-lp-image-treatment={tokens.imageTreatment || 'photo-real'}
          data-lp-free-reserve-h={canvasFreeReserve > 0 ? canvasFreeReserve : undefined}
          className="relative min-h-[240px] data-[lp-canvas-preset-over=1]:ring-2 data-[lp-canvas-preset-over=1]:ring-inset data-[lp-canvas-preset-over=1]:ring-violet-400/70"
          style={{
            ...(htmlDocument
              ? {
                  background: isolatedPage?.background || 'transparent',
                  color: 'inherit',
                  fontFamily: 'inherit',
                }
              : tokenStyle(tokens)),
            ...(canvasFreeReserve > 0 ? { minHeight: canvasFreeReserve } : null),
            ...(!canvasHandlers && visibleBlocks.length === 1 && readSectionLibraryContext(visibleBlocks[0]!)?.version === 2 ? { minHeight: 0 } : null),
          }}
          onDragOver={(e)=>{
            if(!canvasHandlers?.onInsertSidebarPreset || !isSidebarPresetDrag(e.dataTransfer.types))return;
            // Portal elements bubble through the renderer's React tree, bypassing the section shell.
            const host=(e.target as Element|null)?.closest<HTMLElement>('[data-lp-section-chrome="1"]') || null;
            const payload=readSidebarDragPayload(e.dataTransfer);
            const target=payload?resolveSidebarDropTarget(e.currentTarget,host,payload,e):null;
            showSidebarDropTarget(target);e.dataTransfer.dropEffect=target?'copy':'none';
            if(target)e.preventDefault();
          }}
          onDragLeave={(e)=>{if(e.currentTarget.contains(e.relatedTarget as Node|null))return;const hit=document.elementFromPoint(e.clientX,e.clientY);if(hit&&e.currentTarget.contains(hit))return;showSidebarDropTarget(null);}}
          onDrop={(e)=>{
            if(!canvasHandlers?.onInsertSidebarPreset || !isSidebarPresetDrag(e.dataTransfer.types))return;
            // Portal elements bubble through the renderer's React tree, bypassing the section shell.
            const host=(e.target as Element|null)?.closest<HTMLElement>('[data-lp-section-chrome="1"]') || null;
            e.preventDefault();e.stopPropagation();
            const payload=readSidebarDragPayload(e.dataTransfer);
            const target=payload?resolveSidebarDropTarget(e.currentTarget,host,payload,e):null;
            showSidebarDropTarget(null);
            if(payload && target)canvasHandlers.onInsertSidebarPreset(payload,target.position);
          }}
        >
          {htmlDocument && !useHtmlSections ? (
            <LandingPageHtmlDocument
              html={htmlDocument}
              editable={Boolean(canvas)}
              selectedNodeId={htmlSelectedNodeId}
              onHtmlChange={onHtmlSourceChange}
              onSelectNode={onHtmlSelectNode}
              onBindPatch={onHtmlBindPatch}
              onLeadSubmit={
                onLeadSubmit ? (fields) => onLeadSubmit(fields, 'html-document') : undefined
              }
              onFormStart={onFormStart}
            />
          ) : null}
          {visibleBlocks.map((block) => {
            if (!block.enabled) return null;
            const sectionHtml = sectionById.get(block.id);
            if (sectionHtml && isolatedPage) {
              return (
                <div key={block.id} data-lp-block-slot={block.id}>
                  <SelectableShell
                    blockId={block.id}
                    label={`Section ${block.type}`}
                    selected={Boolean(
                      canvasHandlers?.isSelected?.({ blockId: block.id, element: 'section' }) ||
                        canvasHandlers?.isSectionPrimary?.(block.id),
                    )}
                    selectedElement={
                      primaryTarget?.blockId === block.id ? primaryTarget.element : undefined
                    }
                    handlers={canvasHandlers}
                    allowReorder={false}
                    responsiveHide={{
                      desktop: ((block.responsiveStyle || {}) as { desktop?: { display?: string } }).desktop?.display === 'none',
                      tablet: ((block.responsiveStyle || {}) as { tablet?: { display?: string } }).tablet?.display === 'none',
                      mobile: ((block.responsiveStyle || {}) as { mobile?: { display?: string } }).mobile?.display === 'none',
                    }}
                    surfaceBlock={block}
                  >
                    <LandingPageHtmlDocument
                      fragment={sectionHtml}
                      sharedCss={isolatedPage.css}
                      sharedFonts={isolatedPage.fontHrefs}
                      sharedBackground="transparent"
                      editable={Boolean(canvas)}
                      selectedNodeId={htmlSelectedNodeId}
                      activateRoot={Boolean(
                        canvas && selectedBlockId === block.id && !htmlSelectedNodeId,
                      )}
                      onFragmentChange={(html) => onHtmlSectionChange?.(block.id, html)}
                      onSelectNode={(node) => {
                        onSelectBlock?.(block.id);
                        onHtmlSelectNode?.(node);
                      }}
                      onBindPatch={onHtmlBindPatch}
                      onLeadSubmit={
                        onLeadSubmit ? (fields) => onLeadSubmit(fields, block.id) : undefined
                      }
                      onFormStart={onFormStart}
                    />
                  </SelectableShell>
                </div>
              );
            }
            const rs = (block.responsiveStyle || {}) as {
              desktop?: { display?: string };
              tablet?: { display?: string };
              mobile?: { display?: string };
            };
            const responsiveHide = {
              desktop: rs.desktop?.display === 'none',
              tablet: rs.tablet?.display === 'none',
              mobile: rs.mobile?.display === 'none',
            };
            const libraryContext = readSectionLibraryContext(block);
            if (libraryContext) {
              const localTokens = libraryContext.version === 2 ? libraryContext.themeTokens : mergeDesignFamilyTokens(libraryContext.themeTokens, libraryContext.designFamily);
              const localPrimary = localTokens.button || localTokens.primary;
              return (
                <div key={block.id} data-lp-block-slot={block.id} data-lp-section-library-scope="1">
                  <div data-lp-style-scope="legacy" data-lp-renderer="legacy"
                    data-lp-layout="classic" data-lp-viewport={viewport} data-lp-mode={mode}
                    data-lp-design-family={libraryContext.designFamily} data-lp-goal="lead"
                    data-lp-interactive={interactive || canvasHandlers ? '1' : '0'}
                    data-lp-canvas-ux={canvasHandlers ? '1' : '0'}>
                    <div data-lp-library-canvas={libraryContext.version === 1 ? "1" : undefined}
                      data-lp-library-v2={libraryContext.version === 2 ? "1" : undefined}
                      data-lp-density={localTokens.density || 'comfortable'}
                      data-lp-btn-style={localTokens.buttonStyle || 'solid'}
                      data-lp-image-treatment={localTokens.imageTreatment || 'photo-real'}
                      style={tokenStyle(localTokens)}>
                      <SelectableShell blockId={block.id} label={`Section ${block.type}`}
                        selected={Boolean(canvasHandlers?.isSelected?.({ blockId: block.id, element: 'section' }) || canvasHandlers?.isSelected?.({ blockId: block.id, element: 'section-background' }) || canvasHandlers?.isSectionPrimary?.(block.id))}
                        selectedElement={primaryTarget?.blockId === block.id ? primaryTarget.element : undefined}
                        handlers={canvasHandlers} allowReorder
                        designClassName={safeCustomClassName((block.style as Record<string, unknown>)?.className)}
                        publicFreeLayout={canvasHandlers ? null : resolvePublicSectionFreeLayout(block)}
                        responsiveHide={responsiveHide} surfaceBlock={block}
                        surfaceFallback={block.type === 'Hero' ? 'var(--lp-gradient)' : 'var(--lp-surface)'}>
                        {libraryContext.version === 2 ? (
                          <LandingPageSectionLibraryBlockV2 block={block} context={libraryContext}
                            catalogPreview={spec.meta?.rendererVersion === 'section-library-preview-v2'}
                            canvas={canvasHandlers} viewport={viewport}
                            renderForm={block.type === 'LeadForm' ? <LeadFormCard block={block as LandingPageLeadFormBlock}
                              primary={localPrimary} canvas={canvasHandlers} onSubmit={onLeadSubmit}
                              onFormStart={onFormStart} omitHead plain mode={mode} /> : undefined}
                            renderCountdown={block.type === 'Countdown' ? <LandingPageCountdownLive block={block as LandingPageCountdownBlock}
                              primary={localPrimary} blockId={block.id} canvas={canvasHandlers} /> : undefined}
                          />
                        ) : block.type === 'Hero' ? (
                          <HeroBlock block={block as LandingPageTextBlock} layout="classic"
                            primary={localPrimary} leadForm={null} onLeadSubmit={onLeadSubmit}
                            onFormStart={onFormStart} canvas={canvasHandlers} mode={mode} />
                        ) : (
                          <MemoBlockView block={block} primary={localPrimary} layout="classic"
                            mode={mode} onLeadSubmit={onLeadSubmit} onFormStart={onFormStart}
                            skipLeadForm={false} canvas={canvasHandlers} />
                        )}
                      </SelectableShell>
                    </div>
                  </div>
                </div>
              );
            }
            if (blankStarter && ['Header', 'Hero', 'LeadForm', 'Features', 'CTA', 'Footer'].includes(block.type)) {
              return <div key={block.id} data-lp-block-slot={block.id}>
                <SelectableShell blockId={block.id} label={`Section ${block.type}`}
                  selected={Boolean(canvasHandlers?.isSectionPrimary?.(block.id))}
                  selectedElement={primaryTarget?.blockId === block.id ? primaryTarget.element : undefined}
                  handlers={canvasHandlers} allowReorder
                  designClassName={safeCustomClassName((block.style as Record<string, unknown>)?.className)}
                  publicFreeLayout={canvasHandlers ? null : resolvePublicSectionFreeLayout(block)}
                  responsiveHide={responsiveHide} surfaceBlock={block}>
                  <BlankStarterBlock block={block} canvas={canvasHandlers}
                    renderForm={block.type === 'LeadForm' ? <LeadFormCard block={block} primary={primary}
                      onSubmit={onLeadSubmit} onFormStart={onFormStart} canvas={canvasHandlers} omitHead plain mode={mode} /> : null} />
                </SelectableShell>
              </div>;
            }
            if (restaurantPilot || servicePilot || websitePilot) {
              const IndustryBlock=websitePilot?WebsiteBriefBlock:servicePilot?LocalServiceBlock:RestaurantMenuBlock;
              return <div key={block.id} data-lp-block-slot={block.id}>
                <SelectableShell blockId={block.id} label={`Section ${block.type}`} selected={Boolean(canvasHandlers?.isSectionPrimary?.(block.id))} selectedElement={primaryTarget?.blockId===block.id?primaryTarget.element:undefined} handlers={canvasHandlers} allowReorder={block.type!=='Hero'} designClassName={safeCustomClassName((block.style as Record<string,unknown>)?.className)} publicFreeLayout={canvasHandlers?null:resolvePublicSectionFreeLayout(block)} responsiveHide={responsiveHide} surfaceBlock={block}>
                  <IndustryBlock block={block} spec={spec} canvas={canvasHandlers} renderForm={block.type==='LeadForm'?<LeadFormCard block={block} primary={primary} onSubmit={onLeadSubmit} onFormStart={onFormStart} canvas={canvasHandlers} omitHead standard mode={mode}/>:null}/>
                </SelectableShell>
              </div>;
            }
            if (agencyStandard && ['Header', 'Hero', 'Benefits', 'Features', 'Gallery', 'Process', 'Pricing', 'FAQ', 'CTA', 'LeadForm', 'Footer'].includes(block.type)) {
              return (
                <div key={block.id} data-lp-block-slot={block.id}>
                  <SelectableShell
                    blockId={block.id}
                    label={`Section ${block.type}`}
                    selected={Boolean(canvasHandlers?.isSectionPrimary?.(block.id))}
                    selectedElement={primaryTarget?.blockId === block.id ? primaryTarget.element : undefined}
                    handlers={canvasHandlers}
                    allowReorder={block.type !== 'Hero'}
                    designClassName={safeCustomClassName((block.style as Record<string, unknown>)?.className)}
                    publicFreeLayout={canvasHandlers ? null : resolvePublicSectionFreeLayout(block)}
                    responsiveHide={responsiveHide}
                    surfaceBlock={block}
                  >
                    <AgencyPortfolioBlock
                      block={block}
                      spec={spec}
                      canvas={canvasHandlers}
                      renderForm={block.type === 'LeadForm' ? (
                        <LeadFormCard
                          block={block}
                          primary={primary}
                          onSubmit={onLeadSubmit}
                          onFormStart={onFormStart}
                          canvas={canvasHandlers}
                          omitHead
                          standard
                          mode={mode}
                        />
                      ) : null}
                    />
                  </SelectableShell>
                </div>
              );
            }
            if (block.type === 'Hero') {
              return (
                <div key={block.id} data-lp-block-slot={block.id} data-lp-hero-slot-wrap="1">
                  <SelectableShell
                    blockId={block.id}
                    label={`Section ${block.type}`}
                    selected={Boolean(
                      canvasHandlers?.isSelected?.({ blockId: block.id, element: 'section' }) ||
                        canvasHandlers?.isSelected?.({
                          blockId: block.id,
                          element: 'section-background',
                        }) ||
                        canvasHandlers?.isSectionPrimary?.(block.id),
                    )}
                    selectedElement={
                      primaryTarget?.blockId === block.id ? primaryTarget.element : undefined
                    }
                    handlers={canvasHandlers}
                    allowReorder={false}
                    designClassName={safeCustomClassName(
                      ((block.style || {}) as Record<string, unknown>).className,
                    )}
                    publicFreeLayout={
                      canvasHandlers ? null : resolvePublicSectionFreeLayout(block)
                    }
                    responsiveHide={responsiveHide}
                    surfaceBlock={block}
                    surfaceFallback="var(--lp-gradient)"
                  >
                    <HeroBlock
                      block={block as LandingPageTextBlock}
                      layout={layout}
                      category={category}
                      primary={primary}
                      leadForm={embedForm ? leadForm : null}
                      onLeadSubmit={onLeadSubmit}
                      onFormStart={onFormStart}
                      canvas={canvasHandlers}
                      mode={mode}
                    />
                  </SelectableShell>
                </div>
              );
            }
            return (
              <div key={block.id} data-lp-block-slot={block.id}>
                <SelectableShell
                  blockId={block.id}
                  label={`Section ${block.type}`}
                  selected={Boolean(
                    canvasHandlers?.isSelected?.({ blockId: block.id, element: 'section' }) ||
                      canvasHandlers?.isSelected?.({
                        blockId: block.id,
                        element: 'section-background',
                      }) ||
                      canvasHandlers?.isSectionPrimary?.(block.id),
                  )}
                  selectedElement={
                    primaryTarget?.blockId === block.id ? primaryTarget.element : undefined
                  }
                  handlers={canvasHandlers}
                  designClassName={safeCustomClassName(
                    ((block.style || {}) as Record<string, unknown>).className,
                  )}
                  publicFreeLayout={
                    canvasHandlers ? null : resolvePublicSectionFreeLayout(block)
                  }
                  responsiveHide={responsiveHide}
                  surfaceBlock={block}
                  surfaceFallback="var(--lp-surface)"
                >
                  <MemoBlockView
                    block={block}
                    primary={primary}
                    layout={layout}
                    category={category}
                    mode={mode}
                    onLeadSubmit={onLeadSubmit}
                    onFormStart={onFormStart}
                    skipLeadForm={embedForm && block.type === 'LeadForm'}
                    canvas={canvasHandlers}
                    goldStandard={goldStandard}
                  />
                </SelectableShell>
              </div>
            );
          })}
          <LandingPageRenderOverlapGuard spec={spec}/>
          <LandingPageSectionElements spec={spec} canvas={canvasHandlers} renderNative={block=><MemoBlockView block={block} primary={primary} layout={layout} category={category} mode={mode} onLeadSubmit={onLeadSubmit} onFormStart={onFormStart} canvas={canvasHandlers} goldStandard={goldStandard}/>} />
        </article>
        </LandingPagePublicMetaProvider>
      </FreeGuidesProvider>
    </div>
  );
}
