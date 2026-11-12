/**
 * Section background / frame settings (Section Benefits and every other section).
 * Stored on the block the builder already saves: background, style, responsiveStyle.
 * Image and video opacity live on a background layer, never on the section element,
 * so the copy inside stays fully opaque.
 */

import type { CSSProperties } from 'react';
import type { LandingPageBlock } from '@marketingspa/shared';

export type SectionBgKind = 'image' | 'video';
export type SectionBgSpan = 'full' | 'frame';
export type SectionBorderStyle = 'solid' | 'dashed' | 'dotted' | 'double';
export type SectionVisibility = 'all' | 'mobile' | 'desktop';

export type SectionRadius = {
  tl: number;
  tr: number;
  br: number;
  bl: number;
  linked: boolean;
};

export type SectionShadow = {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
};

type StyleBag = Record<string, unknown>;

const HEX6 = /^#([0-9a-fA-F]{6})$/;
const HEX8 = /^#([0-9a-fA-F]{8})$/;

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function num(raw: unknown, min: number, max: number, fallback: number): number {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(clamp(n, min, max));
}

export function parseHexAlpha(raw: unknown, fallback = '#00000000'): {
  hex: string;
  alpha: number;
  hex8: string;
  css: string;
} {
  const text = typeof raw === 'string' ? raw.trim() : '';
  let hex = fallback.slice(0, 7);
  let alpha = fallback.length >= 9 ? parseInt(fallback.slice(7, 9), 16) / 255 : 0;
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

export function safeSectionMediaUrl(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const raw = input.trim().slice(0, 2000);
  if (!raw) return null;
  if (/[\s<>"']/.test(raw)) return null;
  if (/^javascript:/i.test(raw) || /^data:/i.test(raw)) return null;
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  return null;
}

export function sectionStyleBag(block: Pick<LandingPageBlock, 'style'> | null | undefined): StyleBag {
  const style = block?.style;
  if (!style || typeof style !== 'object' || Array.isArray(style)) return {};
  return { ...(style as StyleBag) };
}

export function sectionSettingsActive(style: unknown): boolean {
  if (!style || typeof style !== 'object') return false;
  return (style as StyleBag).lpSectionSettings === true;
}

export function cssUrlValue(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const raw = input.trim();
  const wrapped = /^url\(\s*(['"]?)(.+?)\1\s*\)$/i.exec(raw);
  const inner = wrapped?.[2] ? wrapped[2] : raw;
  return safeSectionMediaUrl(inner);
}

const POSITIONS = new Set([
  'left top',
  'center top',
  'right top',
  'left center',
  'center center',
  'right center',
  'left bottom',
  'center bottom',
  'right bottom',
]);

export function sectionBgPosition(style: StyleBag): string {
  const raw = String(style.backgroundPosition || 'center center');
  if (raw === 'center') return 'center center';
  if (raw === 'top') return 'center top';
  if (raw === 'bottom') return 'center bottom';
  if (raw === 'left') return 'left center';
  if (raw === 'right') return 'right center';
  return POSITIONS.has(raw) ? raw : 'center center';
}

export function sectionBgRepeat(style: StyleBag): string {
  const raw = String(style.backgroundRepeat || 'no-repeat');
  if (raw === 'repeat' || raw === 'repeat-x' || raw === 'repeat-y' || raw === 'no-repeat') return raw;
  return 'no-repeat';
}

export function readSectionVisibility(block: LandingPageBlock): SectionVisibility {
  const rs = (block.responsiveStyle || {}) as {
    desktop?: { display?: string };
    tablet?: { display?: string };
    mobile?: { display?: string };
  };
  const desktop = rs.desktop?.display === 'none';
  const tablet = rs.tablet?.display === 'none';
  const mobile = rs.mobile?.display === 'none';
  if (mobile && tablet && !desktop) return 'desktop';
  if (desktop && tablet && !mobile) return 'mobile';
  return 'all';
}

export function sectionTitle(block: Pick<LandingPageBlock, 'type' | 'layerName'>): string {
  const name = (block.layerName || block.type || 'Section').trim();
  return name.toLowerCase().startsWith('section') ? name : `Section ${name}`;
}

function radiusOf(style: StyleBag): SectionRadius {
  const raw = style.lpRadius;
  if (raw && typeof raw === 'object') {
    const r = raw as Partial<SectionRadius>;
    const linked = r.linked !== false;
    const tl = num(r.tl, 0, 200, 0);
    return {
      tl,
      tr: linked ? tl : num(r.tr, 0, 200, tl),
      br: linked ? tl : num(r.br, 0, 200, tl),
      bl: linked ? tl : num(r.bl, 0, 200, tl),
      linked,
    };
  }
  return { tl: 0, tr: 0, br: 0, bl: 0, linked: true };
}

function shadowOf(style: StyleBag): SectionShadow {
  const raw = style.lpShadow;
  if (raw && typeof raw === 'object') {
    const s = raw as Partial<SectionShadow>;
    return {
      x: num(s.x, -200, 200, 0),
      y: num(s.y, -200, 200, 8),
      blur: num(s.blur, 0, 120, 20),
      spread: num(s.spread, 0, 80, 0),
      color: parseHexAlpha(s.color || '#000000', '#000000FF').hex,
    };
  }
  return { x: 0, y: 8, blur: 20, spread: 0, color: '#000000' };
}

export type SectionSettingsView = {
  active: boolean;
  color: ReturnType<typeof parseHexAlpha>;
  mediaOn: boolean;
  kind: SectionBgKind;
  imageUrl: string | null;
  videoUrl: string | null;
  opacity: number;
  repeat: string;
  size: number;
  position: string;
  span: SectionBgSpan;
  padY: number;
  padX: number;
  borderOn: boolean;
  borderWidth: number;
  borderStyle: SectionBorderStyle;
  borderColor: string;
  radiusOn: boolean;
  radius: SectionRadius;
  shadowOn: boolean;
  shadow: SectionShadow;
  visibility: SectionVisibility;
};

export function readSectionSettings(block: LandingPageBlock): SectionSettingsView {
  const style = sectionStyleBag(block);
  const borderStyleRaw = String(style.lpBorderStyle || 'solid');
  const borderStyle: SectionBorderStyle =
    borderStyleRaw === 'dashed' || borderStyleRaw === 'dotted' || borderStyleRaw === 'double'
      ? borderStyleRaw
      : 'solid';
  const kind: SectionBgKind = style.lpBgKind === 'video' ? 'video' : 'image';
  return {
    active: style.lpSectionSettings === true,
    color: parseHexAlpha(typeof block.background === 'string' ? block.background : '', '#00000000'),
    mediaOn: style.lpBgMediaOn === true,
    kind,
    imageUrl: cssUrlValue(style.backgroundImage),
    videoUrl: safeSectionMediaUrl(style.lpBgVideo),
    opacity: num(style.lpBgOpacity, 0, 100, 100),
    repeat: sectionBgRepeat(style),
    size: num(style.lpBgSize, 1, 100, 100),
    position: sectionBgPosition(style),
    span: style.lpBgSpan === 'frame' ? 'frame' : 'full',
    padY: num(style.lpBgPadY, 0, 100, 0),
    padX: num(style.lpBgPadX, 0, 100, 0),
    borderOn: style.lpBorderOn === true,
    borderWidth: num(style.lpBorderWidth, 0, 40, 2),
    borderStyle,
    borderColor: parseHexAlpha(style.lpBorderColor || '#111111', '#111111FF').hex8,
    radiusOn: style.lpRadiusOn === true,
    radius: radiusOf(style),
    shadowOn: style.lpShadowOn === true,
    shadow: shadowOf(style),
    visibility: readSectionVisibility(block),
  };
}

export type SectionSettingsChange = {
  background?: string | null;
  mediaOn?: boolean;
  kind?: SectionBgKind;
  imageUrl?: string | null;
  videoUrl?: string | null;
  opacity?: number;
  repeat?: string;
  size?: number;
  position?: string;
  span?: SectionBgSpan;
  padY?: number;
  padX?: number;
  borderOn?: boolean;
  borderWidth?: number;
  borderStyle?: SectionBorderStyle;
  borderColor?: string;
  radiusOn?: boolean;
  radius?: Partial<SectionRadius>;
  shadowOn?: boolean;
  shadow?: Partial<SectionShadow>;
  visibility?: SectionVisibility;
};

function paintDecor(style: StyleBag, view: SectionSettingsView) {
  if (view.borderOn && view.borderWidth > 0) {
    style.border = `${view.borderWidth}px ${view.borderStyle} ${parseHexAlpha(view.borderColor).css}`;
  } else {
    delete style.border;
  }
  if (view.radiusOn) {
    const r = view.radius;
    if (r.linked) {
      style.borderRadius = `${r.tl}px`;
      delete style.borderTopLeftRadius;
      delete style.borderTopRightRadius;
      delete style.borderBottomRightRadius;
      delete style.borderBottomLeftRadius;
    } else {
      delete style.borderRadius;
      style.borderTopLeftRadius = `${r.tl}px`;
      style.borderTopRightRadius = `${r.tr}px`;
      style.borderBottomRightRadius = `${r.br}px`;
      style.borderBottomLeftRadius = `${r.bl}px`;
    }
  } else {
    delete style.borderRadius;
    delete style.borderTopLeftRadius;
    delete style.borderTopRightRadius;
    delete style.borderBottomRightRadius;
    delete style.borderBottomLeftRadius;
  }
  if (view.shadowOn) {
    const s = view.shadow;
    style.boxShadow = `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${parseHexAlpha(s.color, '#000000FF').css}`;
  } else {
    delete style.boxShadow;
  }
  delete style.opacity;
}

export function applySectionSettingsChange(
  block: LandingPageBlock,
  change: SectionSettingsChange,
): Partial<LandingPageBlock> {
  const view = readSectionSettings(block);
  const next: SectionSettingsView = {
    ...view,
    active: true,
    radius: { ...view.radius, ...(change.radius || {}) },
    shadow: { ...view.shadow, ...(change.shadow || {}) },
  };
  if (change.background !== undefined) {
    const parsed = parseHexAlpha(change.background || '', '#00000000');
    next.color = change.background ? parsed : parseHexAlpha('#00000000');
  }
  if (change.mediaOn !== undefined) next.mediaOn = change.mediaOn;
  if (change.kind) next.kind = change.kind;
  if (change.imageUrl !== undefined) next.imageUrl = safeSectionMediaUrl(change.imageUrl);
  if (change.videoUrl !== undefined) next.videoUrl = safeSectionMediaUrl(change.videoUrl);
  if (change.opacity !== undefined) next.opacity = num(change.opacity, 0, 100, next.opacity);
  if (change.repeat) next.repeat = sectionBgRepeat({ backgroundRepeat: change.repeat });
  if (change.size !== undefined) next.size = num(change.size, 1, 100, next.size);
  if (change.position) next.position = sectionBgPosition({ backgroundPosition: change.position });
  if (change.span) next.span = change.span;
  if (change.padY !== undefined) next.padY = num(change.padY, 0, 100, next.padY);
  if (change.padX !== undefined) next.padX = num(change.padX, 0, 100, next.padX);
  if (change.borderOn !== undefined) next.borderOn = change.borderOn;
  if (change.borderWidth !== undefined) next.borderWidth = num(change.borderWidth, 0, 40, next.borderWidth);
  if (change.borderStyle) next.borderStyle = change.borderStyle;
  if (change.borderColor) next.borderColor = parseHexAlpha(change.borderColor).hex8;
  if (change.radiusOn !== undefined) next.radiusOn = change.radiusOn;
  if (change.shadowOn !== undefined) next.shadowOn = change.shadowOn;
  if (change.visibility) next.visibility = change.visibility;
  if (next.radius.linked) {
    const changed = change.radius;
    const n = changed?.tl ?? changed?.tr ?? changed?.br ?? changed?.bl ?? next.radius.tl;
    next.radius = { tl: n, tr: n, br: n, bl: n, linked: true };
  }

  const style = sectionStyleBag(block);
  style.lpSectionSettings = true;
  style.lpBgMediaOn = next.mediaOn;
  style.lpBgKind = next.kind;
  style.lpBgOpacity = next.opacity;
  style.lpBgSize = next.size;
  style.lpBgSpan = next.span;
  style.lpBgPadY = next.padY;
  style.lpBgPadX = next.padX;
  style.lpBorderOn = next.borderOn;
  style.lpBorderWidth = next.borderWidth;
  style.lpBorderStyle = next.borderStyle;
  style.lpBorderColor = next.borderColor;
  style.lpRadiusOn = next.radiusOn;
  style.lpRadius = next.radius;
  style.lpShadowOn = next.shadowOn;
  style.lpShadow = next.shadow;
  style.backgroundRepeat = next.repeat;
  style.backgroundPosition = next.position;
  style.backgroundSize = `${next.size}% auto`;
  if (next.imageUrl) style.backgroundImage = `url("${next.imageUrl}")`;
  else delete style.backgroundImage;
  if (next.videoUrl) style.lpBgVideo = next.videoUrl;
  else delete style.lpBgVideo;
  delete style.opacity;
  paintDecor(style, next);

  let responsiveStyle = block.responsiveStyle;
  if (change.visibility) {
    const hide = {
      desktop: change.visibility === 'mobile',
      tablet: change.visibility !== 'all',
      mobile: change.visibility === 'desktop',
    };
    const prev = { ...((block.responsiveStyle || {}) as Record<string, Record<string, unknown> | undefined>) };
    for (const vp of ['desktop', 'tablet', 'mobile'] as const) {
      const bucket = { ...(prev[vp] || {}) };
      if (hide[vp]) bucket.display = 'none';
      else delete bucket.display;
      if (Object.keys(bucket).length) prev[vp] = bucket;
      else delete prev[vp];
    }
    responsiveStyle = (Object.keys(prev).length ? prev : undefined) as LandingPageBlock['responsiveStyle'];
  }

  const background =
    change.background !== undefined
      ? next.color.alpha <= 0 && next.color.hex === '#000000'
        ? null
        : next.color.hex8
      : block.background;
  return {
    background,
    style: style as LandingPageBlock['style'],
    ...(change.visibility ? { responsiveStyle } : {}),
  };
}

export type SectionInsets = {
  top: string;
  right: string;
  bottom: string;
  left: string;
  contentTop: string;
  contentRight: string;
  contentBottom: string;
  contentLeft: string;
};

/** Full width keeps the fill edge-to-edge and pads the copy. Frame shrinks the fill to the content column. */
export function sectionSettingsInsets(block: Pick<LandingPageBlock, 'style'>): SectionInsets {
  const style = sectionStyleBag(block);
  const padY = num(style.lpBgPadY, 0, 100, 0);
  const padX = num(style.lpBgPadX, 0, 100, 0);
  const frame = style.lpBgSpan === 'frame';
  const y = `${padY}%`;
  const x = frame ? `max(${padX}%, calc((100% - min(100%, 72rem)) / 2))` : `${padX}%`;
  if (!frame) {
    return {
      top: '0',
      right: '0',
      bottom: '0',
      left: '0',
      contentTop: y,
      contentRight: `${padX}%`,
      contentBottom: y,
      contentLeft: `${padX}%`,
    };
  }
  return {
    top: y,
    right: x,
    bottom: y,
    left: x,
    contentTop: y,
    contentRight: x,
    contentBottom: y,
    contentLeft: x,
  };
}

export function sectionLayerBoxStyle(
  block: Pick<LandingPageBlock, 'background' | 'style'>,
  fallback?: string,
): CSSProperties {
  const view = readSectionSettings(block as LandingPageBlock);
  const insets = sectionSettingsInsets(block);
  const raw = typeof block.background === 'string' ? block.background.trim() : '';
  const isHex = HEX6.test(raw) || HEX8.test(raw);
  const parsed = isHex ? parseHexAlpha(raw) : null;
  const box: CSSProperties = {
    top: insets.top,
    right: insets.right,
    bottom: insets.bottom,
    left: insets.left,
    background: parsed
      ? parsed.alpha > 0
        ? parsed.css
        : parsed.hex === '#000000'
          ? 'transparent'
          : parsed.hex
      : raw || fallback || 'transparent',
    pointerEvents: 'none',
  };
  if (view.borderOn && view.borderWidth > 0) {
    box.border = `${view.borderWidth}px ${view.borderStyle} ${parseHexAlpha(view.borderColor).css}`;
  }
  if (view.radiusOn) {
    const r = view.radius;
    box.borderRadius = r.linked
      ? `${r.tl}px`
      : `${r.tl}px ${r.tr}px ${r.br}px ${r.bl}px`;
  }
  if (view.shadowOn) {
    const s = view.shadow;
    box.boxShadow = `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${parseHexAlpha(s.color, '#000000FF').css}`;
  }
  return box;
}

/** Opacity belongs only to the media node. */
export function sectionMediaPaint(block: LandingPageBlock): {
  kind: SectionBgKind;
  url: string;
  opacity: number;
  size: string;
  position: string;
  repeat: string;
} | null {
  const view = readSectionSettings(block);
  if (!view.mediaOn) return null;
  if (view.kind === 'video') {
    if (!view.videoUrl) return null;
    return {
      kind: 'video',
      url: view.videoUrl,
      opacity: view.opacity / 100,
      size: `${view.size}% auto`,
      position: view.position,
      repeat: 'no-repeat',
    };
  }
  if (!view.imageUrl) return null;
  return {
    kind: 'image',
    url: view.imageUrl,
    opacity: view.opacity / 100,
    size: `${view.size}% auto`,
    position: view.position,
    repeat: view.repeat,
  };
}
