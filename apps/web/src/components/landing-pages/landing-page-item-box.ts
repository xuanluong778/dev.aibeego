import type { CSSProperties } from 'react';
import type { LandingPageBlock, LandingPageTextBoxChrome } from '@marketingspa/shared';
import { hexWithAlpha, parseHexAlpha, textBoxChromeCss, textBoxHideAttrs } from '@marketingspa/shared';
import { cssColorToHex } from './landing-page-canvas-ux';

export type LpItemBoxMap = Record<string, LandingPageTextBoxChrome>;

export function readLpItemBoxes(style: Record<string, unknown> | null | undefined): LpItemBoxMap {
  const raw = style?.lpItemBoxes;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return raw as LpItemBoxMap;
}

export function withLpItemBox(
  block: LandingPageBlock,
  itemId: string,
  box: LandingPageTextBoxChrome,
): { style: LandingPageBlock['style'] } {
  const style = { ...((block.style || {}) as Record<string, unknown>) };
  const map = { ...readLpItemBoxes(style) };
  const normalized = normalizeItemBoxChrome(box);
  if (!normalized) delete map[itemId];
  else map[itemId] = normalized;
  if (Object.keys(map).length) style.lpItemBoxes = map;
  else delete style.lpItemBoxes;
  return { style: style as LandingPageBlock['style'] };
}

function readItemBox(block: LandingPageBlock | null | undefined, itemId: string): LandingPageTextBoxChrome | undefined {
  if (!block) return undefined;
  return readLpItemBoxes((block.style || {}) as Record<string, unknown>)[itemId];
}

/** Normalize stored chrome; keep explicit backgroundOn:false (transparent card). */
export function normalizeItemBoxChrome(box: LandingPageTextBoxChrome | null | undefined): LandingPageTextBoxChrome | undefined {
  if (!box) return undefined;
  const next: LandingPageTextBoxChrome = { ...box };
  if (next.backgroundOn === false) {
    delete next.background;
  } else if (next.background) {
    const paint = parseHexAlpha(next.background);
    if (paint.alpha <= 0) delete next.background;
  }
  if (next.backgroundOn === true && !next.background) delete next.backgroundOn;
  return Object.keys(next).length ? next : undefined;
}

export function itemBoxHasUserChrome(box: LandingPageTextBoxChrome | null | undefined): boolean {
  const paint = normalizeItemBoxChrome(box);
  if (!paint) return false;
  if (paint.backgroundOn === false) return true;
  return Object.keys(textBoxChromeCss(paint)).length > 0;
}

/**
 * Theme CSS forces card fills with !important (section tones, accents, gradients).
 * Paint user box chrome via CSS variables referenced from premium axis overrides.
 */
export function itemBoxDomProps(
  block: LandingPageBlock | null | undefined,
  itemId: string,
): {
  style: CSSProperties;
  'data-lp-item-box-custom'?: '1';
  'data-lp-item-box-bg'?: '1' | 'clear';
} {
  const box = normalizeItemBoxChrome(readItemBox(block, itemId));
  if (!itemBoxHasUserChrome(box)) return { style: {} };
  if (box?.backgroundOn === false) {
    return {
      style: {},
      'data-lp-item-box-custom': '1',
      'data-lp-item-box-bg': 'clear',
    };
  }
  const css = textBoxChromeCss(box);
  const style: Record<string, string> = {};
  const hasBg = Boolean(css.backgroundColor || css.backgroundImage);

  if (css.backgroundColor) {
    style['--lp-item-box-bg-color'] = css.backgroundColor;
  }
  if (css.backgroundImage) {
    style['--lp-item-box-bg-image'] = css.backgroundImage;
    if (css.backgroundSize) style['--lp-item-box-bg-size'] = css.backgroundSize;
    if (css.backgroundPosition) style['--lp-item-box-bg-position'] = css.backgroundPosition;
  }
  if (css.padding) style['--lp-item-box-padding'] = css.padding;
  if (css.border) style['--lp-item-box-border'] = css.border;
  if (css.borderRadius) style['--lp-item-box-radius'] = css.borderRadius;
  if (css.boxShadow) style['--lp-item-box-shadow'] = css.boxShadow;

  return {
    style: style as CSSProperties,
    'data-lp-item-box-custom': '1',
    ...(hasBg ? { 'data-lp-item-box-bg': '1' as const } : {}),
  };
}

/** @deprecated use itemBoxDomProps */
export function itemBoxPaintStyle(
  block: LandingPageBlock | null | undefined,
  itemId: string,
): CSSProperties {
  return itemBoxDomProps(block, itemId).style;
}

export function itemBoxHideAttrs(
  block: LandingPageBlock | null | undefined,
  itemId: string,
): Record<string, string | undefined> {
  const box = readItemBox(block, itemId);
  return textBoxHideAttrs(box);
}

function escapeAttr(value: string): string {
  return typeof CSS !== 'undefined' && 'escape' in CSS
    ? CSS.escape(value)
    : value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function isTransparentCssColor(raw: string): boolean {
  const s = raw.trim().toLowerCase();
  if (!s || s === 'transparent') return true;
  return /^rgba\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*0\s*\)/.test(s);
}

/** Resolve a CSS color expression in the context of `el` (vars, color-mix, etc.). */
function resolveColorOnElement(el: HTMLElement, colorExpr: string): string | null {
  const expr = colorExpr.trim();
  if (!expr) return null;
  const probe = document.createElement('span');
  probe.style.display = 'none';
  probe.style.backgroundColor = expr;
  el.appendChild(probe);
  const raw = getComputedStyle(probe).backgroundColor;
  probe.remove();
  if (isTransparentCssColor(raw)) return null;
  return cssColorToHex(raw);
}

function splitGradientStops(gradientInner: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < gradientInner.length; i++) {
    const c = gradientInner[i];
    if (c === '(') depth += 1;
    else if (c === ')') depth -= 1;
    else if (c === ',' && depth === 0) {
      parts.push(gradientInner.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(gradientInner.slice(start).trim());
  if (parts.length <= 1) return [];
  return parts.slice(1).map((stop) => stop.replace(/\s+\d+(\.\d+)?%?\s*$/, '').trim());
}

function cardSurfaceFallbackAllowed(el: HTMLElement): boolean {
  if (
    el.closest(
      '[data-lp-list-variant="editorial-list"], [data-lp-list-variant="minimal-list"], [data-lp-testimonials-variant="quote-centered"]',
    )
  ) {
    return false;
  }
  return Boolean(el.matches('[data-lp-card-item], [data-lp-pricing-card]'));
}

/** Effective painted fill (solid, var(), gradient, color-mix) for inspector swatch. */
export function readPaintedBackgroundHex(el: HTMLElement): string | null {
  if (el.getAttribute('data-lp-item-box-bg') === 'clear') return null;

  const cs = getComputedStyle(el);

  const customVar = cs.getPropertyValue('--lp-item-box-bg-color').trim();
  if (customVar) {
    const fromVar = cssColorToHex(customVar) ?? resolveColorOnElement(el, customVar);
    if (fromVar) return fromVar;
  }

  const bgColor = cs.backgroundColor;
  if (!isTransparentCssColor(bgColor)) {
    return cssColorToHex(bgColor);
  }

  const bgImage = cs.backgroundImage;
  if (bgImage && bgImage !== 'none') {
    const grad = bgImage.match(/(?:linear|radial)-gradient\((.+)\)\s*$/i);
    if (grad?.[1]) {
      for (const stop of splitGradientStops(grad[1])) {
        const hex = resolveColorOnElement(el, stop);
        if (hex) return hex;
      }
    }
  }

  const inlineBg = (el.style.backgroundColor || el.style.background || '').trim();
  if (inlineBg) {
    const hex = resolveColorOnElement(el, inlineBg);
    if (hex) return hex;
  }

  if (cardSurfaceFallbackAllowed(el)) {
    return resolveColorOnElement(el, 'var(--lp-surface)');
  }

  return null;
}

/** Painted card/box fill on canvas (theme or user lpItemBoxes). */
export function readCanvasItemBoxBackgroundHex(blockId: string, itemId: string): string | null {
  if (typeof document === 'undefined') return null;
  const escId = escapeAttr(itemId);
  const escBlock = escapeAttr(blockId);
  const shell =
    (document.querySelector(
      `[data-lp-canvas-root] [data-lp-item-id="${escId}"][data-lp-item-parent="${escBlock}"][data-lp-bounding-box="1"]`,
    ) as HTMLElement | null) ||
    (document.querySelector(
      `[data-lp-canvas-root] [data-lp-item-id="${escId}"][data-lp-item-parent="${escBlock}"]`,
    ) as HTMLElement | null);
  const el =
    (shell?.querySelector('[data-lp-card-item="1"]') as HTMLElement | null) || shell;
  if (!el) return null;
  return readPaintedBackgroundHex(el);
}

/** Text-box wrap fill when inlineTextStyles.box has no stored background. */
export function readCanvasInlineWrapBackgroundHex(blockId: string, field: string): string | null {
  if (typeof document === 'undefined') return null;
  const esc =
    typeof CSS !== 'undefined' && 'escape' in CSS
      ? CSS.escape(field)
      : field.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const fieldEl = document.querySelector(
    `[data-lp-canvas-root] [data-lp-block-id="${blockId}"] [data-lp-inline-field="${esc}"]`,
  ) as HTMLElement | null;
  const el = (fieldEl?.closest('[data-lp-inline-wrap]') as HTMLElement | null) || fieldEl;
  if (!el) return null;
  return readPaintedBackgroundHex(el);
}

export function resolveBoxBackgroundDisplayHex(
  blockId: string,
  field: string,
  box: LandingPageTextBoxChrome | null | undefined,
  sampledHex: string | null,
): string {
  if (box?.backgroundOn === false) return '#00000000';
  if (box?.background) {
    const paint = parseHexAlpha(box.background);
    if (paint.alpha > 0) return paint.hex8;
  }
  if (sampledHex) return hexWithAlpha(sampledHex, 1);
  return '#00000000';
}

/** Solid fill for swatch / QA when reading stored hex8. */
export function itemBoxBackgroundCss(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const paint = parseHexAlpha(raw);
  if (paint.alpha <= 0) return undefined;
  return paint.css;
}
