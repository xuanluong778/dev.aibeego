/**
 * Chrome of the box around an inline text field.
 * Stored on inlineTextStyles[blockId::field].box — never on the section,
 * and never mixed with font color / weight / size.
 * Toggle flags hide the effect and keep the last numbers.
 */

export type LandingPageTextBoxPadding = {
  t: number;
  r: number;
  b: number;
  l: number;
  linked: boolean;
};

export type LandingPageTextBoxBorder = {
  width: number;
  style: 'solid' | 'dashed';
  /** #RRGGBB or #RRGGBBAA */
  color: string;
};

export type LandingPageTextBoxRadius = {
  tl: number;
  tr: number;
  br: number;
  bl: number;
  linked: boolean;
};

export type LandingPageTextBoxShadow = {
  x: number;
  y: number;
  blur: number;
  spread: number;
  /** #RRGGBB */
  color: string;
  /** 0–1 */
  opacity: number;
};

export type LandingPageTextBoxVisibility = 'all' | 'mobile' | 'desktop';

export type LandingPageTextBoxChrome = {
  /** #RRGGBBAA. Empty / omitted = no fill. Alpha 00 keeps the color without painting. */
  background?: string;
  /** false = user cleared fill → transparent (not theme default). */
  backgroundOn?: boolean;
  paddingOn?: boolean;
  padding?: LandingPageTextBoxPadding;
  borderOn?: boolean;
  border?: LandingPageTextBoxBorder;
  radiusOn?: boolean;
  radius?: LandingPageTextBoxRadius;
  shadowOn?: boolean;
  shadow?: LandingPageTextBoxShadow;
  mediaOn?: boolean;
  mediaUrl?: string;
  mediaFit?: 'cover' | 'contain';
  mediaPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  visibility?: LandingPageTextBoxVisibility;
};

const HEX6 = /^#([0-9a-fA-F]{6})$/;
const HEX8 = /^#([0-9a-fA-F]{8})$/;

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

export function parseHexAlpha(raw: unknown, fallback = '#000000FF'): { hex: string; alpha: number; hex8: string; css: string } {
  const text = typeof raw === 'string' ? raw.trim() : '';
  let hex = fallback.slice(0, 7);
  let alpha = 1;
  const m8 = HEX8.exec(text);
  const m6 = HEX6.exec(text);
  if (m8 && m8[1]) {
    hex = `#${m8[1].slice(0, 6)}`;
    alpha = parseInt(m8[1].slice(6, 8), 16) / 255;
  } else if (m6 && m6[1]) {
    hex = `#${m6[1]}`;
    alpha = 1;
  }
  alpha = clamp(alpha, 0, 1);
  const aa = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  const hex8 = `${hex}${aa}`.toUpperCase();
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { hex: hex.toUpperCase(), alpha, hex8, css: `rgba(${r},${g},${b},${alpha})` };
}

export function hexWithAlpha(hex: string, alpha: number): string {
  const parsed = parseHexAlpha(hex);
  const aa = Math.round(clamp(alpha, 0, 1) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${parsed.hex}${aa}`.toUpperCase();
}

export function safeTextBoxMediaUrl(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const raw = input.trim().slice(0, 2000);
  if (!raw) return null;
  if (/[\s<>"']/.test(raw)) return null;
  if (/^javascript:/i.test(raw) || /^data:/i.test(raw)) return null;
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  return null;
}

function num(raw: unknown, min: number, max: number, fallback: number): number {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return round(clamp(n, min, max));
}

export function defaultTextBoxPadding(): LandingPageTextBoxPadding {
  return { t: 6, r: 6, b: 0, l: 6, linked: true };
}

export function defaultTextBoxBorder(): LandingPageTextBoxBorder {
  return { width: 1, style: 'solid', color: '#FFC700FF' };
}

export function defaultTextBoxRadius(): LandingPageTextBoxRadius {
  return { tl: 8, tr: 8, br: 8, bl: 8, linked: true };
}

export function defaultTextBoxShadow(): LandingPageTextBoxShadow {
  return { x: 0, y: 8, blur: 20, spread: 0, color: '#000000', opacity: 1 };
}

export function sanitizeTextBoxChrome(raw: unknown): LandingPageTextBoxChrome | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const s = raw as Record<string, unknown>;
  const out: LandingPageTextBoxChrome = {};
  if (typeof s.background === 'string' && HEX8.test(s.background.trim())) {
    out.background = parseHexAlpha(s.background).hex8;
  } else if (typeof s.background === 'string' && HEX6.test(s.background.trim())) {
    out.background = parseHexAlpha(s.background).hex8;
  }
  if (s.backgroundOn === true || s.backgroundOn === false) out.backgroundOn = s.backgroundOn;
  if (s.paddingOn === true || s.paddingOn === false) out.paddingOn = s.paddingOn;
  if (s.padding && typeof s.padding === 'object') {
    const p = s.padding as Record<string, unknown>;
    const t = num(p.t, 0, 240, 0);
    const linked = p.linked !== false;
    out.padding = linked
      ? { t, r: t, b: t, l: t, linked: true }
      : {
          t,
          r: num(p.r, 0, 240, t),
          b: num(p.b, 0, 240, t),
          l: num(p.l, 0, 240, t),
          linked: false,
        };
  }
  if (s.borderOn === true || s.borderOn === false) out.borderOn = s.borderOn;
  if (s.border && typeof s.border === 'object') {
    const b = s.border as Record<string, unknown>;
    const color = typeof b.color === 'string' ? parseHexAlpha(b.color, '#000000FF').hex8 : '#000000FF';
    out.border = {
      width: num(b.width, 0, 32, 1),
      style: b.style === 'dashed' ? 'dashed' : 'solid',
      color,
    };
  }
  if (s.radiusOn === true || s.radiusOn === false) out.radiusOn = s.radiusOn;
  if (s.radius && typeof s.radius === 'object') {
    const r = s.radius as Record<string, unknown>;
    const tl = num(r.tl, 0, 240, 0);
    const linked = r.linked !== false;
    out.radius = linked
      ? { tl, tr: tl, br: tl, bl: tl, linked: true }
      : {
          tl,
          tr: num(r.tr, 0, 240, tl),
          br: num(r.br, 0, 240, tl),
          bl: num(r.bl, 0, 240, tl),
          linked: false,
        };
  }
  if (s.shadowOn === true || s.shadowOn === false) out.shadowOn = s.shadowOn;
  if (s.shadow && typeof s.shadow === 'object') {
    const sh = s.shadow as Record<string, unknown>;
    out.shadow = {
      x: num(sh.x, -200, 200, 0),
      y: num(sh.y, -200, 200, 8),
      blur: num(sh.blur, 0, 120, 20),
      spread: num(sh.spread, -80, 80, 0),
      color: parseHexAlpha(sh.color, '#000000FF').hex,
      opacity: clamp(typeof sh.opacity === 'number' ? sh.opacity : 1, 0, 1),
    };
  }
  if (s.mediaOn === true || s.mediaOn === false) out.mediaOn = s.mediaOn;
  const mediaUrl = safeTextBoxMediaUrl(s.mediaUrl);
  if (mediaUrl) out.mediaUrl = mediaUrl;
  if (s.mediaFit === 'contain' || s.mediaFit === 'cover') out.mediaFit = s.mediaFit;
  if (
    s.mediaPosition === 'center' ||
    s.mediaPosition === 'top' ||
    s.mediaPosition === 'bottom' ||
    s.mediaPosition === 'left' ||
    s.mediaPosition === 'right'
  ) {
    out.mediaPosition = s.mediaPosition;
  }
  if (s.visibility === 'mobile' || s.visibility === 'desktop' || s.visibility === 'all') {
    out.visibility = s.visibility;
  }
  return Object.keys(out).length ? out : undefined;
}

/** CSS for the wrapper around the glyphs. Does not set color, font, or text-shadow. */
export function textBoxChromeCss(box: LandingPageTextBoxChrome | null | undefined): Record<string, string> {
  if (!box) return {};
  const css: Record<string, string> = {};
  if (box.backgroundOn === false) {
    css.backgroundColor = 'transparent';
  } else if (box.background) {
    const paint = parseHexAlpha(box.background);
    if (paint.alpha > 0) css.backgroundColor = paint.css;
  }
  if (box.paddingOn && box.padding) {
    const p = box.padding;
    css.padding = `${p.t}px ${p.r}px ${p.b}px ${p.l}px`;
  }
  if (box.borderOn && box.border && box.border.width > 0) {
    const color = parseHexAlpha(box.border.color).css;
    css.border = `${box.border.width}px ${box.border.style} ${color}`;
  }
  if (box.radiusOn && box.radius) {
    const r = box.radius;
    css.borderRadius = `${r.tl}px ${r.tr}px ${r.br}px ${r.bl}px`;
  }
  if (box.shadowOn && box.shadow) {
    const sh = box.shadow;
    const rgb = parseHexAlpha(sh.color);
    css.boxShadow = `${sh.x}px ${sh.y}px ${sh.blur}px ${sh.spread}px rgba(${parseInt(rgb.hex.slice(1, 3), 16)},${parseInt(rgb.hex.slice(3, 5), 16)},${parseInt(rgb.hex.slice(5, 7), 16)},${clamp(sh.opacity, 0, 1)})`;
  }
  if (box.mediaOn && box.mediaUrl) {
    css.backgroundImage = `url("${box.mediaUrl}")`;
    css.backgroundSize = box.mediaFit === 'contain' ? 'contain' : 'cover';
    css.backgroundPosition = box.mediaPosition || 'center';
    css.backgroundRepeat = 'no-repeat';
  }
  return css;
}

/** Existing desktop / tablet / mobile breakpoints. Tablet follows the side that is hidden. */
export function textBoxHideAttrs(
  box: LandingPageTextBoxChrome | null | undefined,
): Record<string, string | undefined> {
  const mode = box?.visibility || 'all';
  if (mode === 'mobile') {
    return {
      'data-lp-text-hide-desktop': '1',
      'data-lp-text-hide-tablet': '1',
      'data-lp-text-hide-mobile': undefined,
    };
  }
  if (mode === 'desktop') {
    return {
      'data-lp-text-hide-desktop': undefined,
      'data-lp-text-hide-tablet': '1',
      'data-lp-text-hide-mobile': '1',
    };
  }
  return {
    'data-lp-text-hide-desktop': undefined,
    'data-lp-text-hide-tablet': undefined,
    'data-lp-text-hide-mobile': undefined,
  };
}

export function textBoxChromeActive(box: LandingPageTextBoxChrome | null | undefined): boolean {
  if (!box) return false;
  if (box.backgroundOn === false) return true;
  if (box.background && parseHexAlpha(box.background).alpha > 0) return true;
  if (box.paddingOn) return true;
  if (box.borderOn) return true;
  if (box.radiusOn) return true;
  if (box.shadowOn) return true;
  if (box.mediaOn && box.mediaUrl) return true;
  if (box.visibility === 'mobile' || box.visibility === 'desktop') return true;
  return false;
}
