/**
 * Additive helpers for Design-tab chrome stored on block.style.
 * Does not replace free-layout transform engine — compose extras for render only.
 */

import type { CSSProperties } from 'react';

export type ParsedBoxShadow = {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
};

export type ParsedCssFilter = {
  blur: number;
  brightness: number;
  contrast: number;
  saturate: number;
  grayscale: number;
  invert: number;
  sepia: number;
  hueRotate: number;
};

export type DesignTransformExtras = {
  opacity: number;
  rotate: number;
  translateX: number;
  translateY: number;
  scale: number;
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
  linkedScale: boolean;
};

const DEFAULT_SHADOW: ParsedBoxShadow = {
  x: 0,
  y: 8,
  blur: 24,
  spread: 0,
  color: '#000000',
  opacity: 0.25,
};

const DEFAULT_FILTER: ParsedCssFilter = {
  blur: 0,
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  invert: 0,
  sepia: 0,
  hueRotate: 0,
};

export function parsePx(raw: unknown, fallback = 0): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string') {
    const m = /^(-?\d+(?:\.\d+)?)(px|rem|%)?$/.exec(raw.trim());
    if (m) return Number(m[1]);
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function hexToRgba(hex: string, opacity: number): string {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h.slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  return `rgba(${r},${g},${b},${clamp(opacity, 0, 1)})`;
}

function parseRgbaOpacity(color: string): { hex: string; opacity: number } {
  const rgba = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i.exec(color);
  if (rgba) {
    const r = Number(rgba[1]);
    const g = Number(rgba[2]);
    const b = Number(rgba[3]);
    const a = rgba[4] != null ? Number(rgba[4]) : 1;
    const hex = `#${[r, g, b]
      .map((n) => clamp(n, 0, 255).toString(16).padStart(2, '0'))
      .join('')}`;
    return { hex, opacity: Number.isFinite(a) ? a : 1 };
  }
  if (/^#[0-9a-fA-F]{3,8}$/.test(color)) {
    const raw = color.slice(1);
    const full =
      raw.length === 3
        ? raw
            .split('')
            .map((c) => c + c)
            .join('')
        : raw.slice(0, 6);
    const opacity =
      raw.length === 8 ? clamp(parseInt(raw.slice(6, 8), 16) / 255, 0, 1) : 1;
    return { hex: `#${full}`, opacity };
  }
  return { hex: '#000000', opacity: 0.25 };
}

export function parseBoxShadow(raw: unknown): ParsedBoxShadow | null {
  if (!raw || raw === 'none') return null;
  const s = String(raw).trim();
  if (!s || s === 'none') return null;
  const m =
    /^(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px(?:\s+(-?\d+(?:\.\d+)?)px)?\s+(.+)$/i.exec(
      s,
    );
  if (!m) return { ...DEFAULT_SHADOW };
  const colorPart = parseRgbaOpacity(m[5]!.trim());
  return {
    x: Number(m[1]),
    y: Number(m[2]),
    blur: Number(m[3]),
    spread: m[4] != null ? Number(m[4]) : 0,
    color: colorPart.hex,
    opacity: colorPart.opacity,
  };
}

export function serializeBoxShadow(s: ParsedBoxShadow): string {
  return `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${hexToRgba(s.color, s.opacity)}`;
}

function readFilterFn(filter: string, name: string): number | null {
  const re = new RegExp(`${name}\\(([-\\d.]+)(px|deg|%)?\\)`, 'i');
  const m = re.exec(filter);
  if (!m) return null;
  return Number(m[1]);
}

export function parseCssFilter(raw: unknown): ParsedCssFilter {
  const s = typeof raw === 'string' ? raw : '';
  if (!s) return { ...DEFAULT_FILTER };
  return {
    blur: readFilterFn(s, 'blur') ?? 0,
    brightness: readFilterFn(s, 'brightness') ?? 100,
    contrast: readFilterFn(s, 'contrast') ?? 100,
    saturate: readFilterFn(s, 'saturate') ?? 100,
    grayscale: readFilterFn(s, 'grayscale') ?? 0,
    invert: readFilterFn(s, 'invert') ?? 0,
    sepia: readFilterFn(s, 'sepia') ?? 0,
    hueRotate: readFilterFn(s, 'hue-rotate') ?? 0,
  };
}

export function serializeCssFilter(f: ParsedCssFilter): string | undefined {
  const parts: string[] = [];
  if (f.blur > 0) parts.push(`blur(${f.blur}px)`);
  if (f.brightness !== 100) parts.push(`brightness(${f.brightness}%)`);
  if (f.contrast !== 100) parts.push(`contrast(${f.contrast}%)`);
  if (f.saturate !== 100) parts.push(`saturate(${f.saturate}%)`);
  if (f.grayscale > 0) parts.push(`grayscale(${f.grayscale}%)`);
  if (f.invert > 0) parts.push(`invert(${f.invert}%)`);
  if (f.sepia > 0) parts.push(`sepia(${f.sepia}%)`);
  if (f.hueRotate !== 0) parts.push(`hue-rotate(${f.hueRotate}deg)`);
  return parts.length ? parts.join(' ') : undefined;
}

export function readDesignTransform(style: Record<string, unknown>): DesignTransformExtras {
  const scaleX = typeof style.lpScaleX === 'number' ? style.lpScaleX : typeof style.lpScale === 'number' ? style.lpScale : 1;
  const scaleY = typeof style.lpScaleY === 'number' ? style.lpScaleY : typeof style.lpScale === 'number' ? style.lpScale : 1;
  return {
    opacity: typeof style.opacity === 'number' ? style.opacity : 1,
    rotate: typeof style.lpRotate === 'number' ? style.lpRotate : 0,
    translateX: typeof style.lpTranslateX === 'number' ? style.lpTranslateX : 0,
    translateY: typeof style.lpTranslateY === 'number' ? style.lpTranslateY : 0,
    scale: typeof style.lpScale === 'number' ? style.lpScale : scaleX,
    scaleX,
    scaleY,
    skewX: typeof style.lpSkewX === 'number' ? style.lpSkewX : 0,
    skewY: typeof style.lpSkewY === 'number' ? style.lpSkewY : 0,
    linkedScale: style.lpScaleLinked !== false && scaleX === scaleY,
  };
}

/** Inner design transform — does not replace free-layout shell transform. */
export function composeDesignTransformCss(style: Record<string, unknown>): string | undefined {
  const t = readDesignTransform(style);
  const parts: string[] = [];
  if (t.translateX || t.translateY) parts.push(`translate(${t.translateX}px, ${t.translateY}px)`);
  // Rotate on free shell when free; still allow style.lpRotate for flow sections.
  if (t.rotate) parts.push(`rotate(${t.rotate}deg)`);
  if (t.scaleX !== 1 || t.scaleY !== 1) parts.push(`scale(${t.scaleX}, ${t.scaleY})`);
  if (t.skewX || t.skewY) parts.push(`skew(${t.skewX}deg, ${t.skewY}deg)`);
  return parts.length ? parts.join(' ') : undefined;
}

export function parseBorderParts(style: Record<string, unknown>): {
  width: number;
  style: string;
  color: string;
} {
  if (typeof style.borderWidth === 'string' || typeof style.borderWidth === 'number') {
    return {
      width: parsePx(style.borderWidth, 0),
      style: typeof style.borderStyle === 'string' ? style.borderStyle : 'solid',
      color:
        typeof style.borderColor === 'string' && /^#/.test(style.borderColor)
          ? style.borderColor.slice(0, 7)
          : '#ffffff',
    };
  }
  const border = String(style.border || '');
  if (!border || border === 'none') {
    return { width: 0, style: 'solid', color: '#ffffff' };
  }
  const m = /^(\d+(?:\.\d+)?)px\s+(\w+)\s+(.+)$/i.exec(border);
  if (!m) return { width: 1, style: 'solid', color: '#ffffff' };
  const col = parseRgbaOpacity(m[3]!.trim());
  return { width: Number(m[1]), style: m[2]!, color: col.hex };
}

export function serializeBorder(width: number, borderStyle: string, color: string): string | undefined {
  if (width <= 0) return 'none';
  return `${width}px ${borderStyle || 'solid'} ${color}`;
}

export type CornerRadii = { tl: number; tr: number; br: number; bl: number; linked: boolean };

export function parseCornerRadii(style: Record<string, unknown>): CornerRadii {
  const tl = parsePx(style.borderTopLeftRadius ?? style.borderRadius, 0);
  const tr = parsePx(style.borderTopRightRadius ?? style.borderRadius, tl);
  const br = parsePx(style.borderBottomRightRadius ?? style.borderRadius, tl);
  const bl = parsePx(style.borderBottomLeftRadius ?? style.borderRadius, tl);
  const linked = style.lpRadiusLinked !== false && tl === tr && tr === br && br === bl;
  return { tl, tr, br, bl, linked };
}

/** Strip dangerous constructs — CSS only, never JS. */
export function sanitizeLandingPageCustomCss(raw: string): string {
  let css = String(raw || '');
  css = css.replace(/<\/?style[^>]*>/gi, '');
  css = css.replace(/@import\b[^;]*;?/gi, '');
  css = css.replace(/expression\s*\(/gi, '/*blocked*/(');
  css = css.replace(/javascript\s*:/gi, 'blocked:');
  css = css.replace(/-moz-binding\s*:/gi, 'blocked:');
  css = css.replace(/behavior\s*:/gi, 'blocked:');
  return css.slice(0, 8000);
}

export function safeCustomClassName(raw: unknown): string {
  return String(raw || '')
    .split(/\s+/)
    .map((c) => c.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 48))
    .filter(Boolean)
    .slice(0, 8)
    .join(' ');
}

/**
 * Selection target for Custom Class/CSS.
 * Section chrome uses legacy style.className / style.customCss.
 * Child elements use style.elementCustomClass / style.elementCustomCss maps.
 */
export function resolveCustomCssTargetKey(element?: string | null): string {
  if (!element || element === 'section' || element === 'section-background') return 'section';
  return String(element);
}

export type CustomCssFields = { className: string; customCss: string };

export function readCustomCssFields(
  style: Record<string, unknown> | null | undefined,
  targetKey: string,
): CustomCssFields {
  const st = style || {};
  if (targetKey === 'section') {
    return {
      className: String(st.className || ''),
      customCss: String(st.customCss || ''),
    };
  }
  const classMap = (st.elementCustomClass || {}) as Record<string, unknown>;
  const cssMap = (st.elementCustomCss || {}) as Record<string, unknown>;
  return {
    className: String(classMap[targetKey] || ''),
    customCss: String(cssMap[targetKey] || ''),
  };
}

/** Patch only the selected target — never copies CSS onto other elements. */
export function patchCustomCssFields(
  style: Record<string, unknown> | null | undefined,
  targetKey: string,
  patch: Partial<CustomCssFields>,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...(style || {}) };
  if (targetKey === 'section') {
    if ('className' in patch) {
      const className = safeCustomClassName(patch.className);
      if (className) next.className = className;
      else delete next.className;
    }
    if ('customCss' in patch) {
      const customCss = sanitizeLandingPageCustomCss(String(patch.customCss || ''));
      if (customCss.trim()) next.customCss = customCss;
      else delete next.customCss;
    }
    return next;
  }

  if ('className' in patch) {
    const classMap = {
      ...((next.elementCustomClass || {}) as Record<string, string>),
    };
    const className = safeCustomClassName(patch.className);
    if (className) classMap[targetKey] = className;
    else delete classMap[targetKey];
    if (Object.keys(classMap).length) next.elementCustomClass = classMap;
    else delete next.elementCustomClass;
  }
  if ('customCss' in patch) {
    const cssMap = {
      ...((next.elementCustomCss || {}) as Record<string, string>),
    };
    const customCss = sanitizeLandingPageCustomCss(String(patch.customCss || ''));
    if (customCss.trim()) cssMap[targetKey] = customCss;
    else delete cssMap[targetKey];
    if (Object.keys(cssMap).length) next.elementCustomCss = cssMap;
    else delete next.elementCustomCss;
  }
  return next;
}

export function readElementCustomClass(
  style: Record<string, unknown> | null | undefined,
  elementKey: string,
): string {
  if (!elementKey || elementKey === 'section' || elementKey === 'section-background') return '';
  const classMap = ((style || {}).elementCustomClass || {}) as Record<string, unknown>;
  return safeCustomClassName(classMap[elementKey]);
}

/** Extract declaration block from raw CSS (supports `color: red;` or `.x { color: red; }`). */
export function extractCustomCssDeclarations(raw: string): string {
  let text = sanitizeLandingPageCustomCss(raw).trim();
  if (!text) return '';
  const brace = text.match(/\{([\s\S]*)\}/);
  if (brace && text.includes('{')) text = (brace[1] || '').trim();
  return text;
}

function cssPropToReactKey(prop: string): string {
  if (!prop.includes('-')) return prop;
  return prop.replace(/-([a-z])/gi, (_, c: string) => c.toUpperCase());
}

/** Parse Custom CSS textarea (`color: white;`) into React inline styles. */
export function parseCustomCssDeclarations(raw: string): CSSProperties {
  const text = extractCustomCssDeclarations(raw);
  if (!text) return {};
  const out: CSSProperties = {};
  for (const chunk of text.split(';')) {
    const part = chunk.trim();
    if (!part) continue;
    const idx = part.indexOf(':');
    if (idx < 0) continue;
    const prop = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (!prop || !val) continue;
    (out as Record<string, string>)[cssPropToReactKey(prop)] = val;
  }
  return out;
}

export function readElementCustomCssStyle(
  style: Record<string, unknown> | null | undefined,
  elementKey: string,
): CSSProperties {
  const target = resolveCustomCssTargetKey(elementKey);
  const fields = readCustomCssFields(style, target);
  return parseCustomCssDeclarations(fields.customCss);
}

/** Wrap declarations in a unique selector so Box A CSS cannot leak to Box B. */
export function scopeLandingPageCustomCss(selector: string, raw: string): string {
  const safe = extractCustomCssDeclarations(raw);
  if (!safe) return '';
  const sel = String(selector || '').trim();
  if (!sel) return '';
  // !important so publish beats theme inline colors when style tag is used.
  const body = safe
    .split(';')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((decl) => {
      if (/\!important\s*$/i.test(decl)) return decl;
      return `${decl} !important`;
    })
    .join('; ');
  return `${sel} {\n${body};\n}`;
}

/** Visual chrome merged onto section surfaces (additive). */
export function landingPageDesignChromeStyle(style: Record<string, unknown> | undefined): CSSProperties {
  if (!style) return {};
  const out: CSSProperties = {};
  if (typeof style.width === 'string') out.width = style.width;
  if (typeof style.maxWidth === 'string') out.maxWidth = style.maxWidth;
  if (typeof style.height === 'string') out.height = style.height;
  if (typeof style.minHeight === 'string') out.minHeight = style.minHeight;
  if (typeof style.padding === 'string') out.padding = style.padding;
  if (typeof style.margin === 'string') out.margin = style.margin;
  if (typeof style.marginTop === 'string') out.marginTop = style.marginTop;
  if (typeof style.marginBottom === 'string') out.marginBottom = style.marginBottom;
  if (typeof style.border === 'string') out.border = style.border;
  if (typeof style.borderRadius === 'string') out.borderRadius = style.borderRadius;
  if (typeof style.borderTopLeftRadius === 'string') out.borderTopLeftRadius = style.borderTopLeftRadius;
  if (typeof style.borderTopRightRadius === 'string') out.borderTopRightRadius = style.borderTopRightRadius;
  if (typeof style.borderBottomRightRadius === 'string') {
    out.borderBottomRightRadius = style.borderBottomRightRadius;
  }
  if (typeof style.borderBottomLeftRadius === 'string') {
    out.borderBottomLeftRadius = style.borderBottomLeftRadius;
  }
  if (typeof style.boxShadow === 'string' && style.boxShadow !== 'none') out.boxShadow = style.boxShadow;
  if (typeof style.opacity === 'number') out.opacity = style.opacity;
  if (typeof style.filter === 'string') out.filter = style.filter;
  if (typeof style.mixBlendMode === 'string') {
    out.mixBlendMode = style.mixBlendMode as CSSProperties['mixBlendMode'];
  }
  const transform = composeDesignTransformCss(style);
  if (transform) out.transform = transform;
  return out;
}

export function buildPageCustomCssBlocks(
  blocks: Array<{ id: string; style?: Record<string, unknown> | object | null }>,
): string {
  const chunks: string[] = [];
  for (const b of blocks) {
    const st = (b.style || {}) as Record<string, unknown>;
    const sectionRaw = typeof st.customCss === 'string' ? st.customCss.trim() : '';
    if (sectionRaw) {
      const scoped = scopeLandingPageCustomCss(`[data-lp-block-id="${b.id}"]`, sectionRaw);
      if (scoped) chunks.push(scoped);
    }
    const elMap = (st.elementCustomCss || {}) as Record<string, unknown>;
    for (const [elKey, raw] of Object.entries(elMap)) {
      if (typeof raw !== 'string' || !raw.trim()) continue;
      const scoped = scopeLandingPageCustomCss(
        `[data-lp-element-id="${b.id}::${elKey}"]`,
        raw,
      );
      if (scoped) chunks.push(scoped);
    }
  }
  return chunks.join('\n');
}
