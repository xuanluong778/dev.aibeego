'use client';

import type { LandingPageCanvasElementKey } from './landing-page-canvas-ux';

/** Stable canvas selection target — field disambiguates nested item text fields. */
export type LpSelectionTarget = {
  blockId: string;
  element: LandingPageCanvasElementKey;
  field?: string;
};

export type LpSelectOptions = {
  shiftKey?: boolean;
};

export function lpSelectionKey(target: LpSelectionTarget): string {
  if (target.field) return `${target.blockId}::field:${target.field}`;
  return `${target.blockId}::${target.element || 'section'}`;
}

/**
 * Top-level text elements must always carry `field` so canvas chrome / toolbar
 * (`InlineEditable` queries with field) match the stored selection key.
 * Legacy keys without field (`id::headline`) are normalized to `id::field:headline`.
 */
export function normalizeLpSelectionTarget(target: LpSelectionTarget): LpSelectionTarget {
  if (target.field) {
    const fromField = elementFromField(target.field);
    return {
      blockId: target.blockId,
      element: fromField && fromField !== 'section' ? fromField : target.element,
      field: target.field,
    };
  }
  const el = target.element;
  if (el === 'headline' || el === 'subheadline' || el === 'body') {
    return { blockId: target.blockId, element: el, field: el };
  }
  if (el === 'cta') {
    return { blockId: target.blockId, element: 'cta', field: 'ctaLabel' };
  }
  return target;
}

/** Match primary/selected against normalized + legacy (field-less) keys. */
export function lpSelectionKeyMatches(storedKey: string | null | undefined, target: LpSelectionTarget): boolean {
  if (!storedKey) return false;
  const normalized = normalizeLpSelectionTarget(target);
  const withField = lpSelectionKey(normalized);
  if (storedKey === withField) return true;
  // Legacy: stored as blockId::headline while query uses field:headline (or reverse).
  const legacy = lpSelectionKey({
    blockId: normalized.blockId,
    element: normalized.element,
  });
  if (storedKey === legacy) {
    // A bare card key (block::item:id) is the large box, not every nested text field.
    if (
      normalized.field &&
      typeof normalized.element === 'string' &&
      normalized.element.startsWith('item:')
    ) {
      return false;
    }
    return true;
  }
  if (normalized.field) {
    const parsed = parseLpSelectionKey(storedKey);
    if (!parsed || parsed.blockId !== normalized.blockId) return false;
    const other = normalizeLpSelectionTarget(parsed);
    return Boolean(other.field && other.field === normalized.field);
  }
  return false;
}

export function parseLpSelectionKey(key: string): LpSelectionTarget | null {
  const sep = key.indexOf('::');
  if (sep <= 0) return null;
  const blockId = key.slice(0, sep);
  const rest = key.slice(sep + 2);
  if (rest.startsWith('field:')) {
    const field = rest.slice('field:'.length);
    return { blockId, element: elementFromField(field), field };
  }
  return { blockId, element: (rest || 'section') as LandingPageCanvasElementKey };
}

/** Card/gallery image selection — distinct from bare `item:id` (the box). */
export function isItemImageField(field?: string | null): boolean {
  return Boolean(field && /^itemImage:.+/.test(field));
}

export function itemImageField(itemId: string): string {
  return `itemImage:${itemId}`;
}

export function itemIdFromItemImageField(field: string): string | null {
  const m = /^itemImage:(.+)$/.exec(field);
  return m?.[1] || null;
}

export function elementFromField(field: string): LandingPageCanvasElementKey {
  if (field === 'ctaLabel') return 'cta';
  if (field === 'headline' || field === 'subheadline' || field === 'body') return field;
  const trust = /^trustPoint:(\d+)$/.exec(field);
  if (trust?.[1] != null) return `item:trust-${trust[1]}`;
  const img = /^itemImage:(.+)$/.exec(field);
  if (img?.[1]) return `item:${img[1]}`;
  const m =
    /^(?:itemTitle|itemDesc|itemQuestion|itemAnswer|itemQuote|itemAuthor|planName|planPrice|planCta|fieldLabel):(.+)$/.exec(
      field,
    );
  if (m?.[1]) return `item:${m[1]}`;
  const cd = /^countdownCell:(.+)$/.exec(field);
  if (cd?.[1]) return `countdown:${cd[1].toLowerCase()}`;
  return 'section';
}

export function isSectionLevelElement(el?: LandingPageCanvasElementKey | null): boolean {
  return !el || el === 'section' || el === 'section-background';
}

/** Section chrome stays active (toolbar + outline) when the LeadForm card is selected. */
export function isSectionToolbarElement(el?: LandingPageCanvasElementKey | null): boolean {
  return isSectionLevelElement(el) || el === 'form';
}

export function isTextToolbarTarget(target: LpSelectionTarget): boolean {
  if (target.element === 'image') return false;
  // Card image field is content-image, not editable text.
  if (isItemImageField(target.field)) return false;
  // Any inline text field (trustPoint:N, itemTitle:…, headline, …) shows the quick toolbar.
  // Check field BEFORE section rejection — a stale elementFromField used to map
  // trustPoint → 'section', which hid the toolbar despite a valid field selection.
  if (target.field) return true;
  if (isSectionLevelElement(target.element)) return false;
  if (
    target.element === 'headline' ||
    target.element === 'subheadline' ||
    target.element === 'body' ||
    target.element === 'cta'
  ) {
    return true;
  }
  if (typeof target.element === 'string' && target.element.startsWith('item:')) {
    return false;
  }
  return false;
}

let marqueeSelecting = false;

/** True while a section marquee gesture is active — blocks section free-drag. */
export function isLpMarqueeSelecting(): boolean {
  return marqueeSelecting;
}

export function setLpMarqueeSelecting(active: boolean): void {
  marqueeSelecting = active;
}

export function rectsIntersect(a: DOMRect, b: DOMRect): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

export function normalizeClientRect(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): DOMRect {
  const left = Math.min(x0, x1);
  const top = Math.min(y0, y1);
  const width = Math.abs(x1 - x0);
  const height = Math.abs(y1 - y0);
  return { left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON() { return {}; } };
}

/** Collect canvas targets inside a section whose boxes intersect the marquee rect. */
export function collectMarqueeTargetsInBlock(
  blockEl: HTMLElement,
  marqueeRect: DOMRect,
): LpSelectionTarget[] {
  const blockId = blockEl.getAttribute('data-lp-block-id');
  if (!blockId) return [];
  const seen = new Set<string>();
  const out: LpSelectionTarget[] = [];

  const add = (target: LpSelectionTarget) => {
    const key = lpSelectionKey(target);
    if (seen.has(key)) return;
    seen.add(key);
    out.push(target);
  };

  blockEl.querySelectorAll('[data-lp-inline-field]').forEach((node) => {
    const field = node.getAttribute('data-lp-inline-field');
    if (!field) return;
    const box =
      (node.closest('[data-lp-inline-wrap]') as HTMLElement | null) ||
      (node as HTMLElement);
    if (rectsIntersect(box.getBoundingClientRect(), marqueeRect)) {
      add({ blockId, element: elementFromField(field), field });
    }
  });

  blockEl.querySelectorAll('[data-lp-element-id]').forEach((node) => {
    if (node.closest('[data-lp-inline-field]')) return;
    const raw = node.getAttribute('data-lp-element-id');
    if (!raw) return;
    const sep = raw.indexOf('::');
    if (sep <= 0) return;
    const bid = raw.slice(0, sep);
    if (bid !== blockId) return;
    const elKey = raw.slice(sep + 2) as LpSelectionTarget['element'];
    if (rectsIntersect((node as HTMLElement).getBoundingClientRect(), marqueeRect)) {
      add({ blockId, element: elKey });
    }
  });

  blockEl.querySelectorAll('[data-lp-grid-cell]').forEach((node) => {
    const idx = node.getAttribute('data-lp-grid-cell');
    if (idx == null) return;
    if (rectsIntersect((node as HTMLElement).getBoundingClientRect(), marqueeRect)) {
      add({ blockId, element: `grid:${idx}` as LpSelectionTarget['element'] });
    }
  });

  blockEl.querySelectorAll('[data-lp-content-image="1"]').forEach((node) => {
    if (node.closest('[data-lp-element-id]')) return;
    if (rectsIntersect((node as HTMLElement).getBoundingClientRect(), marqueeRect)) {
      add({ blockId, element: 'image' });
    }
  });

  return out;
}

export function applyMarqueeSelection(
  ids: string[],
  primaryId: string | null,
  targets: LpSelectionTarget[],
  opts?: LpSelectOptions,
): { ids: string[]; primaryId: string | null } {
  const keys = targets.map((t) => lpSelectionKey(normalizeLpSelectionTarget(t)));
  if (!keys.length) {
    return opts?.shiftKey ? { ids, primaryId } : { ids: [], primaryId: null };
  }
  if (opts?.shiftKey) {
    const merged = [...ids];
    for (const k of keys) {
      if (!merged.includes(k)) merged.push(k);
    }
    return { ids: merged, primaryId: keys[keys.length - 1]! };
  }
  return { ids: keys, primaryId: keys[keys.length - 1]! };
}

export function applySelectionClick(
  ids: string[],
  primaryId: string | null,
  target: LpSelectionTarget,
  opts?: LpSelectOptions,
): { ids: string[]; primaryId: string | null } {
  const key = lpSelectionKey(normalizeLpSelectionTarget(target));
  if (opts?.shiftKey) {
    if (ids.includes(key) || (primaryId && lpSelectionKeyMatches(primaryId, target) && ids.some((id) => lpSelectionKeyMatches(id, target)))) {
      const nextIds = ids.filter((id) => !lpSelectionKeyMatches(id, target));
      const nextPrimary =
        primaryId && lpSelectionKeyMatches(primaryId, target)
          ? nextIds.length
            ? nextIds[nextIds.length - 1]!
            : null
          : primaryId;
      return { ids: nextIds, primaryId: nextPrimary };
    }
    return { ids: [...ids.filter((id) => !lpSelectionKeyMatches(id, target)), key], primaryId: key };
  }
  return { ids: [key], primaryId: key };
}

export function findTextAnchorEl(target: LpSelectionTarget | null): HTMLElement | null {
  if (!target || typeof document === 'undefined') return null;
  const normalized = normalizeLpSelectionTarget(target);
  if (!normalized.field) return null;
  const block = document.querySelector(
    `[data-lp-block-id="${CSS.escape(normalized.blockId)}"]`,
  ) as HTMLElement | null;
  if (!block) return null;
  return block.querySelector(
    `[data-lp-inline-field="${CSS.escape(normalized.field)}"]`,
  ) as HTMLElement | null;
}
