'use client';

/**
 * Additive section surface helpers (background color / image / position / flip).
 * Does not replace existing block.background — merges style.* extras.
 */

import type { LandingPageCanvasStyle } from '@marketingspa/shared';
import type { CSSProperties } from 'react';
import type { LandingPageBlock } from '@marketingspa/shared';
import { landingPageDesignChromeStyle } from './landing-page-block-design-style';
import { sectionSettingsActive } from './landing-page-section-settings';

export type SectionBgFlip = { x?: boolean; y?: boolean };

export function parseSectionBgFlip(
  style?: LandingPageCanvasStyle | { lpBgFlip?: string } | null,
): SectionBgFlip {
  const raw = style && typeof (style as { lpBgFlip?: string }).lpBgFlip === 'string'
    ? String((style as { lpBgFlip?: string }).lpBgFlip)
    : '';
  return {
    x: raw.includes('x'),
    y: raw.includes('y'),
  };
}

export function encodeSectionBgFlip(flip: SectionBgFlip): string | undefined {
  const parts: string[] = [];
  if (flip.x) parts.push('x');
  if (flip.y) parts.push('y');
  return parts.length ? parts.join('') : undefined;
}

/** CSS for the visible section surface (color + optional bg image). */
export function landingPageSectionSurfaceStyle(
  block: Pick<LandingPageBlock, 'background' | 'style'>,
  fallback?: string,
): CSSProperties {
  const st = (block.style || {}) as LandingPageCanvasStyle & {
    lpBgFlip?: string;
    lpBgMotion?: string;
  };
  if (sectionSettingsActive(st)) {
    const chrome = landingPageDesignChromeStyle(st as Record<string, unknown>);
    const {
      opacity: _opacity,
      border: _border,
      borderRadius: _radius,
      borderTopLeftRadius: _tl,
      borderTopRightRadius: _tr,
      borderBottomRightRadius: _br,
      borderBottomLeftRadius: _bl,
      boxShadow: _shadow,
      backgroundImage: _image,
      ...rest
    } = chrome;
    return {
      ...rest,
      background: 'transparent',
      backgroundImage: 'none',
    };
  }
  const flip = parseSectionBgFlip(st);
  const hasImage = Boolean(st.backgroundImage);
  const transform =
    flip.x || flip.y
      ? `scale(${flip.x ? -1 : 1}, ${flip.y ? -1 : 1})`
      : undefined;
  const motion = typeof st.lpBgMotion === 'string' ? st.lpBgMotion : '';
  const useUnderlay = Boolean(hasImage && (transform || motion === 'ken-burns'));
  const bgImage = st.backgroundImage || undefined;

  if (useUnderlay && bgImage) {
    const chrome = landingPageDesignChromeStyle(st as Record<string, unknown>);
    const { transform: _ignored, ...chromeRest } = chrome;
    return {
      background: block.background || fallback || undefined,
      backgroundImage: 'none',
      ['--lp-bg-image' as string]: bgImage,
      ['--lp-bg-size' as string]: st.backgroundSize || 'cover',
      ['--lp-bg-pos' as string]: st.backgroundPosition || 'center',
      ['--lp-bg-flip' as string]: transform || 'none',
      ...chromeRest,
    };
  }

  const chrome = landingPageDesignChromeStyle(st as Record<string, unknown>);
  // Prefer explicit bg-flip underlay path; otherwise allow design transform chrome.
  const { transform: chromeTransform, ...chromeRest } = chrome;
  const tone =
    typeof (st as { lpSectionTone?: string }).lpSectionTone === 'string'
      ? (st as { lpSectionTone?: string }).lpSectionTone
      : '';
  return {
    background: block.background || fallback || undefined,
    backgroundImage: bgImage,
    backgroundSize: st.backgroundSize || (hasImage ? 'cover' : undefined),
    backgroundPosition: st.backgroundPosition || (hasImage ? 'center' : undefined),
    backgroundRepeat: st.backgroundRepeat || (hasImage ? 'no-repeat' : undefined),
    ...(tone === 'dark' ? { color: '#F8FAFC' } : null),
    ...chromeRest,
    ...(transform ? null : chromeTransform ? { transform: chromeTransform } : null),
  };
}

export function sectionHasBackgroundImage(block: Pick<LandingPageBlock, 'style' | 'background'>): boolean {
  const st = block.style as LandingPageCanvasStyle | undefined;
  if (st?.backgroundImage) return true;
  const bg = block.background || '';
  return /url\s*\(/i.test(bg);
}

export function sectionHasAnyBackground(block: Pick<LandingPageBlock, 'style' | 'background'>): boolean {
  return Boolean(block.background) || sectionHasBackgroundImage(block);
}

export const LP_RECENT_BG_COLORS_KEY = 'lp-recent-bg-colors';

export function loadRecentBgColors(): string[] {
  try {
    const raw = localStorage.getItem(LP_RECENT_BG_COLORS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter((c): c is string => typeof c === 'string').slice(0, 8);
  } catch {
    return [];
  }
}

export function pushRecentBgColor(color: string) {
  try {
    const next = [color, ...loadRecentBgColors().filter((c) => c !== color)].slice(0, 8);
    localStorage.setItem(LP_RECENT_BG_COLORS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export const LP_BG_PRESET_COLORS = [
  '#ffffff',
  '#0f172a',
  '#f8fafc',
  '#fef3c7',
  '#dbeafe',
  '#fce7f3',
  '#dcfce7',
  '#fee2e2',
];
