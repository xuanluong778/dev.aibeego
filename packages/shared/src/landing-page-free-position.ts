/**
 * Free-position model + snap/guides math for LP Canvas.
 * Additive: omit positionMode (or 'flow') → document flow unchanged.
 */

export type LandingPagePositionMode = 'flow' | 'free';

export type LandingPageFreeLayout = {
  /** Left offset (px) relative to canvas/section containing box. */
  x: number;
  /** Top offset (px) relative to canvas/section containing box. */
  y: number;
  /** Optional explicit width (px). */
  width?: number;
  /** Optional explicit height (px). */
  height?: number;
  /** Rotation in degrees (0–360). */
  rotate?: number;
  /** Height reserved in flow so siblings don't jump when this box goes absolute. */
  reserveHeight?: number;
};

export type FreeResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

/** Horizontal text offsets must span a desktop section, including across columns. */
export const ELEMENT_FREE_MAX_X_PX = 2400;
/** Vertical element offsets: allow moving across a tall section (was 640 → box snapped back). */
export const ELEMENT_FREE_MAX_Y_PX = 4000;

export const FREE_SIZE_MIN_W = 40;
export const FREE_SIZE_MIN_H = 28;
export const FREE_SIZE_MAX_W = 1200;
export const FREE_SIZE_MAX_H = 1200;
export const FREE_ROTATE_SNAP_DEG = 15;

export type LandingPageResponsiveFreeLayout = {
  tablet?: LandingPageFreeLayout;
  mobile?: LandingPageFreeLayout;
};

export type FreeRect = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

export type FreeGuide = {
  orientation: 'v' | 'h';
  /** Absolute position in parent coords (px). */
  position: number;
  kind: 'edge' | 'center' | 'canvas' | 'section' | 'sibling' | 'spacing';
};

export type FreeSpacingLabel = {
  orientation: 'h' | 'v';
  /** Midpoint between the two edges. */
  x: number;
  y: number;
  value: number;
};

export type FreeSnapResult = {
  x: number;
  y: number;
  guides: FreeGuide[];
  spacings: FreeSpacingLabel[];
};

/** Soft snap distance — large enough to catch center without sticky jitter. */
export const FREE_SNAP_THRESHOLD_PX = 10;

/** Snap distance for content safe-area guides (builder content column). */
export const CONTENT_SAFE_AREA_SNAP_PX = 7;
/** Desktop content column max width (px). */
export const CONTENT_SAFE_AREA_DESKTOP_MAX_PX = 1200;
/** Surface width at/above which desktop 1200px column applies. */
export const CONTENT_SAFE_AREA_DESKTOP_MIN_SURFACE_PX = 1280;
/** Horizontal gutter each side — tablet. */
export const CONTENT_SAFE_AREA_TABLET_GUTTER_PX = 24;
/** Horizontal gutter each side — mobile. */
export const CONTENT_SAFE_AREA_MOBILE_GUTTER_PX = 16;

export type ContentSafeArea = {
  left: number;
  width: number;
  right: number;
};

/**
 * Content safe-area centered in a surface (canvas).
 * Desktop ≥1280: max 1200 centered (guides at 50% ± 600 when width ≥ 1200).
 * Tablet: width = 100% - 48 (24px each side).
 * Mobile: width = 100% - 32 (16px each side).
 */
export function resolveContentSafeArea(
  surfaceWidth: number,
  viewport?: 'desktop' | 'tablet' | 'mobile',
): ContentSafeArea {
  const w = Math.max(0, Number(surfaceWidth) || 0);
  let left = 0;
  let width = w;

  const isMobile =
    viewport === 'mobile' || (viewport == null && w > 0 && w < 768);
  const isTablet =
    viewport === 'tablet' ||
    (viewport == null && w >= 768 && w < CONTENT_SAFE_AREA_DESKTOP_MIN_SURFACE_PX);
  const isDesktop =
    viewport === 'desktop' || w >= CONTENT_SAFE_AREA_DESKTOP_MIN_SURFACE_PX;

  if (isMobile) {
    left = CONTENT_SAFE_AREA_MOBILE_GUTTER_PX;
    width = Math.max(0, w - CONTENT_SAFE_AREA_MOBILE_GUTTER_PX * 2);
  } else if (isTablet || (viewport === 'desktop' && w < CONTENT_SAFE_AREA_DESKTOP_MIN_SURFACE_PX)) {
    left = CONTENT_SAFE_AREA_TABLET_GUTTER_PX;
    width = Math.max(0, w - CONTENT_SAFE_AREA_TABLET_GUTTER_PX * 2);
  } else if (isDesktop) {
    width = Math.min(CONTENT_SAFE_AREA_DESKTOP_MAX_PX, w);
    left = Math.max(0, (w - width) / 2);
  }

  return { left, width, right: left + width };
}

/**
 * Map canvas-level safe area into a nested free-surface's local coordinates.
 * Intersects so nested surfaces inside the column still clamp correctly.
 */
export function mapContentSafeAreaToSurface(
  canvasSafe: ContentSafeArea,
  surfaceOffsetLeft: number,
  surfaceWidth: number,
): ContentSafeArea {
  const surfaceRight = surfaceOffsetLeft + surfaceWidth;
  const interLeftGlobal = Math.max(canvasSafe.left, surfaceOffsetLeft);
  const interRightGlobal = Math.min(canvasSafe.right, surfaceRight);
  const left = Math.max(0, interLeftGlobal - surfaceOffsetLeft);
  const right = Math.max(left, interRightGlobal - surfaceOffsetLeft);
  const width = Math.max(0, right - left);
  return { left, width, right: left + width };
}

/** Clamp a box into safe area horizontally (Y unchanged). Does not mutate stored layouts until drag/resize. */
export function clampBoxToContentSafeArea(
  x: number,
  y: number,
  width: number,
  height: number,
  safe: ContentSafeArea,
): { x: number; y: number; width: number; height: number } {
  const maxW = Math.max(FREE_SIZE_MIN_W, safe.width);
  const w = Math.min(Math.max(FREE_SIZE_MIN_W, width), maxW);
  const minX = safe.left;
  const maxX = safe.left + Math.max(0, safe.width - w);
  return {
    x: Math.round(Math.min(maxX, Math.max(minX, x))),
    y: Math.round(y),
    width: Math.round(w),
    height: Math.round(height),
  };
}

/** Kind priority when deltas are within 1px (higher = preferred). */
const SNAP_KIND_PRIORITY: Record<FreeGuide['kind'], number> = {
  center: 50,
  canvas: 40,
  section: 35,
  edge: 30,
  sibling: 20,
  spacing: 10,
};

export function sanitizeFreeLayout(raw: unknown): LandingPageFreeLayout | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const o = raw as Record<string, unknown>;
  const x = Number(o.x);
  const y = Number(o.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return undefined;
  const out: LandingPageFreeLayout = { x: Math.round(x), y: Math.round(y) };
  const w = Number(o.width);
  if (Number.isFinite(w) && w > 0) out.width = Math.round(w);
  const h = Number(o.height);
  if (Number.isFinite(h) && h > 0) out.height = Math.round(h);
  const rot = Number(o.rotate);
  if (Number.isFinite(rot)) out.rotate = normalizeRotate(rot);
  const rh = Number(o.reserveHeight);
  if (Number.isFinite(rh) && rh >= 0) out.reserveHeight = Math.round(rh);
  return out;
}

export const CANVAS_FREE_RESERVE_PADDING = 48;
export const CANVAS_FREE_RESERVE_MIN = 120;
/** Padding below furthest content when auto-growing a section to fit children. */
export const SECTION_CONTENT_FIT_PADDING = 24;

/**
 * Spec-only estimate: furthest bottom among elementFreeLayouts for a block.
 * Offset-mode `y` is translate — this is a lower-bound heuristic for sanitize
 * without DOM; live builder uses measureSectionContentHeightCss instead.
 */
export function estimateSectionContentBottomFromElementLayouts(
  blockId: string,
  elementFreeLayouts: Record<string, LandingPageFreeLayout> | null | undefined,
  padding = SECTION_CONTENT_FIT_PADDING,
): number {
  if (!elementFreeLayouts) return 0;
  const prefix = `${blockId}::`;
  let maxBottom = 0;
  for (const [key, layout] of Object.entries(elementFreeLayouts)) {
    if (!key.startsWith(prefix) || !layout) continue;
    const y = Number(layout.y);
    const h = Number(layout.height);
    const bottom =
      (Number.isFinite(y) ? Math.max(0, y) : 0) +
      (Number.isFinite(h) && h > 0 ? h : 48);
    if (bottom > maxBottom) maxBottom = bottom;
  }
  if (maxBottom <= 0) return 0;
  return Math.round(maxBottom + padding);
}

/** Max persisted flow-section minHeight — above this is almost always a bad free-drag inflate. */
export const MAX_FLOW_SECTION_MIN_HEIGHT_PX = 2400;

/**
 * Top→bottom pack of free (non text-layer) sections so stacked chrome never overlaps.
 * Pure — preserves intentional floating text-layer x/y. Used after height expands
 * that would otherwise grow a section in place and leave the next free sibling on top.
 */
export function packFreeSectionsVertical<T extends FreeSectionReflowBlock>(
  blocks: ReadonlyArray<T>,
  viewport: 'desktop' | 'tablet' | 'mobile' = 'desktop',
  gap = 0,
): T[] {
  type Row = { index: number; id: string; layout: LandingPageFreeLayout };
  const rows: Row[] = [];
  blocks.forEach((b, index) => {
    if (isFloatingTextLayerBlock(b)) return;
    const free = resolveFreeLayoutForViewport(
      b.positionMode,
      b.freeLayout,
      b.responsiveFreeLayout,
      viewport,
    );
    if (!free) return;
    rows.push({
      index,
      id: b.id,
      layout: ensureSectionFreeLayoutHeight({
        ...free,
        y: Math.max(0, Math.round(free.y ?? 0)),
        height: Math.max(
          CANVAS_FREE_RESERVE_MIN,
          Math.round(free.height ?? free.reserveHeight ?? CANVAS_FREE_RESERVE_MIN),
        ),
      }),
    });
  });
  if (rows.length < 2) return blocks as T[];

  rows.sort((a, b) => {
    const dy = (a.layout.y ?? 0) - (b.layout.y ?? 0);
    if (dy !== 0) return dy;
    return a.id.localeCompare(b.id);
  });
  let cursor = 0;
  let packedChanged = false;
  for (const row of rows) {
    const h = Math.round(row.layout.height ?? CANVAS_FREE_RESERVE_MIN);
    const prevY = Math.round(row.layout.y ?? 0);
    let y = prevY;
    if (y < cursor) {
      y = cursor;
      packedChanged = true;
    }
    row.layout = ensureSectionFreeLayoutHeight({ ...row.layout, y, height: h });
    cursor = y + h + gap;
  }
  if (!packedChanged) return blocks as T[];

  const byIndex = new Map(rows.map((r) => [r.index, r.layout]));
  return blocks.map((b, i) => {
    const layout = byIndex.get(i);
    if (!layout) return b;
    if (viewport === 'desktop') {
      return { ...b, positionMode: 'free' as const, freeLayout: layout };
    }
    return {
      ...b,
      positionMode: 'free' as const,
      freeLayout: b.freeLayout || layout,
      responsiveFreeLayout: {
        ...(b.responsiveFreeLayout || {}),
        [viewport]: layout,
      },
    };
  });
}

/**
 * Grow free / flow section heights so they cover elementFreeLayouts bottoms.
 * Pure — used by sanitize + after element free commits when DOM is unavailable.
 * After any free-section height grow, packs siblings so taller chrome cannot sit
 * on top of the next free section (in-place grow without pack was the overlap bug).
 * Also heals inflated flow minHeight left by page-wide free-surface snap bugs.
 */
export function expandBlocksToFitElementLayouts<
  T extends {
    id: string;
    type?: string;
    items?: unknown[] | null;
    positionMode?: LandingPagePositionMode;
    freeLayout?: LandingPageFreeLayout;
    responsiveFreeLayout?: LandingPageResponsiveFreeLayout;
    style?: Record<string, unknown> | object | null;
  },
>(
  blocks: ReadonlyArray<T>,
  elementFreeLayouts: Record<string, LandingPageFreeLayout> | null | undefined,
  viewport: 'desktop' | 'tablet' | 'mobile' = 'desktop',
): T[] {
  if (!blocks.length) return blocks as T[];
  let changed = false;
  let freeHeightGrew = false;
  const next = blocks.map((b) => {
    const needed = estimateSectionContentBottomFromElementLayouts(
      b.id,
      elementFreeLayouts,
    );
    const free = resolveFreeLayoutForViewport(
      b.positionMode,
      b.freeLayout,
      b.responsiveFreeLayout,
      viewport,
    );
    if (free) {
      if (needed <= 0) return b;
      const cur = Math.round(free.height ?? free.reserveHeight ?? 0);
      if (needed <= cur + 1) return b;
      changed = true;
      freeHeightGrew = true;
      const layout = ensureSectionFreeLayoutHeight({ ...free, height: needed });
      if (viewport === 'desktop') {
        return { ...b, positionMode: 'free' as const, freeLayout: layout };
      }
      return {
        ...b,
        positionMode: 'free' as const,
        freeLayout: b.freeLayout || layout,
        responsiveFreeLayout: {
          ...(b.responsiveFreeLayout || {}),
          [viewport]: layout,
        },
      };
    }
    // Flow section — persist minHeight so publish keeps space for translated/absolute kids.
    const style = { ...((b.style || {}) as Record<string, unknown>) };
    const curMin = Number.parseFloat(String(style.minHeight || '0')) || 0;
    if (curMin > MAX_FLOW_SECTION_MIN_HEIGHT_PX) {
      // Heal mega-sections from page-wide snap: keep EFL-driven need, drop the rest.
      const healed = Math.min(
        MAX_FLOW_SECTION_MIN_HEIGHT_PX,
        Math.max(needed, 0),
      );
      changed = true;
      if (healed <= 0) {
        const { minHeight: _drop, ...rest } = style;
        void _drop;
        return { ...b, style: Object.keys(rest).length ? rest : undefined };
      }
      return {
        ...b,
        style: { ...style, minHeight: `${healed}px` },
      };
    }
    if (needed <= 0) return b;
    if (needed <= curMin + 1) return b;
    changed = true;
    return {
      ...b,
      style: { ...style, minHeight: `${Math.min(needed, MAX_FLOW_SECTION_MIN_HEIGHT_PX)}px` },
    };
  });
  if (!changed) return blocks as T[];
  // Growing a free section in place without packing leaves the next free sibling
  // at its old y → painted overlap. Always pack after free height grows.
  return freeHeightGrew
    ? packFreeSectionsVertical(next as T[], viewport)
    : next;
}

export type FreeReserveBlockRef = {
  positionMode?: LandingPagePositionMode;
  freeLayout?: LandingPageFreeLayout;
  responsiveFreeLayout?: LandingPageResponsiveFreeLayout;
};

/**
 * One canvas-level reserve height for all absolute free sections (not per-block stacking).
 * height = max(bottom of each section's rotated bounding box) + padding.
 *
 * This is the single authoritative, post-commit source for canvas minHeight — the
 * live-DOM measurement in landing-page-free-drag.tsx (`syncCanvasFreeReserve`) only
 * runs while a drag/resize/rotate gesture is actively in progress. For that live path
 * to hand off cleanly at commit with no visible jump, this pure calculation must
 * already account for rotation the same way the browser's real layout does.
 */
export function computeCanvasFreeReserveHeight(
  blocks: ReadonlyArray<FreeReserveBlockRef>,
  viewport: 'desktop' | 'tablet' | 'mobile' = 'desktop',
  padding = CANVAS_FREE_RESERVE_PADDING,
): number {
  let maxBottom = 0;
  for (const b of blocks) {
    const free = resolveFreeLayoutForViewport(
      b.positionMode,
      b.freeLayout,
      b.responsiveFreeLayout,
      viewport,
    );
    if (!free) continue;
    const h = Math.max(
      CANVAS_FREE_RESERVE_MIN,
      Math.round(free.height ?? free.reserveHeight ?? CANVAS_FREE_RESERVE_MIN),
    );
    const y = Math.max(0, Math.round(free.y ?? 0));
    // Rotation grows the section's visual (axis-aligned) bounding box beyond its
    // unrotated height — e.g. at 90° a section's on-screen height equals its WIDTH.
    // Skip at 0/180 (cos=±1, sin=0 — identical to unrotated) and when width is
    // unknown (can't compute the rotated AABB safely; fall back to unrotated height).
    const rotate = free.rotate ?? 0;
    let boundH = h;
    if (rotate % 180 !== 0 && free.width != null && free.width > 0) {
      const rad = (rotate * Math.PI) / 180;
      boundH = Math.abs(free.width * Math.sin(rad)) + Math.abs(h * Math.cos(rad));
    }
    // Center stays fixed at y + h/2 regardless of rotation (CSS transform-origin is
    // the box's own center and never affects layout position).
    maxBottom = Math.max(maxBottom, y + h / 2 + boundH / 2);
  }
  if (maxBottom <= 0) return 0;
  return Math.max(CANVAS_FREE_RESERVE_MIN, Math.round(maxBottom + padding));
}

/** Ensure absolute free sections always reserve flow space (never collapse FlowReserve). */
export function ensureSectionFreeLayoutHeight(
  layout: LandingPageFreeLayout,
  fallback = 280,
): LandingPageFreeLayout {
  const fb = Math.max(120, Math.round(fallback));
  if (layout.height != null && layout.height > 0) {
    return {
      ...layout,
      reserveHeight: layout.reserveHeight && layout.reserveHeight > 0 ? layout.reserveHeight : layout.height,
    };
  }
  if (layout.reserveHeight != null && layout.reserveHeight > 0) {
    return { ...layout, height: layout.reserveHeight };
  }
  return { ...layout, height: fb, reserveHeight: fb };
}

export type FreeSectionReflowBlock = {
  id: string;
  type?: string;
  items?: unknown[] | null;
  positionMode?: LandingPagePositionMode;
  freeLayout?: LandingPageFreeLayout;
  responsiveFreeLayout?: LandingPageResponsiveFreeLayout;
};

/**
 * Empty Benefits/Features used as free Heading/Paragraph layers.
 * These float at absolute canvas coords and MUST NOT enter section packing —
 * pack forced shared/stacked Y and made headings jump/overlap on insert+drag.
 */
export function isFloatingTextLayerBlock(block: {
  type?: string;
  items?: unknown[] | null;
}): boolean {
  if (block.type !== 'Benefits' && block.type !== 'Features') return false;
  const items = Array.isArray(block.items) ? block.items : [];
  return items.length === 0;
}

/**
 * After a free section grows/shrinks/moves, push siblings that would overlap so
 * stacked sections never paint on top of each other. Pure — no DOM.
 *
 * Rules:
 * - Only touches free sections on the given viewport.
 * - Floating text-layer blocks (Heading/Paragraph) are excluded — their x/y are
 *   authoring coordinates and must stay exactly as committed.
 * - Sections with y >= previous bottom of the changed block shift by Δheight
 *   (and by Δy if the changed block itself moved).
 * - Remaining overlaps (e.g. dragged into another) are resolved top→bottom pack.
 */
export function reflowFreeSectionsAfterChange<T extends FreeSectionReflowBlock>(
  blocks: ReadonlyArray<T>,
  changedId: string,
  prevLayout: LandingPageFreeLayout | null | undefined,
  nextLayout: LandingPageFreeLayout,
  viewport: 'desktop' | 'tablet' | 'mobile' = 'desktop',
  gap = 0,
): T[] {
  const changed = blocks.find((b) => b.id === changedId);
  // Text-layer move/resize: write that block only — never pack/cascade siblings.
  if (changed && isFloatingTextLayerBlock(changed)) {
    const layout = {
      ...nextLayout,
      x: Math.max(0, Math.round(nextLayout.x ?? 0)),
      y: Math.max(0, Math.round(nextLayout.y ?? 0)),
    };
    return blocks.map((b) => {
      if (b.id !== changedId) return b;
      if (viewport === 'desktop') {
        return { ...b, positionMode: 'free' as const, freeLayout: layout };
      }
      return {
        ...b,
        positionMode: 'free' as const,
        freeLayout: b.freeLayout || layout,
        responsiveFreeLayout: {
          ...(b.responsiveFreeLayout || {}),
          [viewport]: layout,
        },
      };
    });
  }

  const nextH = Math.max(
    CANVAS_FREE_RESERVE_MIN,
    Math.round(nextLayout.height ?? nextLayout.reserveHeight ?? CANVAS_FREE_RESERVE_MIN),
  );
  const nextY = Math.max(0, Math.round(nextLayout.y ?? 0));
  const prevH = Math.max(
    CANVAS_FREE_RESERVE_MIN,
    Math.round(
      prevLayout?.height ?? prevLayout?.reserveHeight ?? nextH,
    ),
  );
  const prevY = Math.max(0, Math.round(prevLayout?.y ?? nextY));
  const deltaY = nextY - prevY;
  const deltaH = nextH - prevH;
  const prevBottom = prevY + prevH;

  type Row = { index: number; id: string; layout: LandingPageFreeLayout };
  const rows: Row[] = [];
  blocks.forEach((b, index) => {
    // Floating text layers keep authoring x/y — never ride pack cursor.
    if (isFloatingTextLayerBlock(b)) return;
    const free = resolveFreeLayoutForViewport(
      b.positionMode,
      b.freeLayout,
      b.responsiveFreeLayout,
      viewport,
    );
    if (!free) return;
    if (b.id === changedId) {
      rows.push({
        index,
        id: b.id,
        layout: ensureSectionFreeLayoutHeight({ ...nextLayout, y: nextY, height: nextH }),
      });
      return;
    }
    let y = Math.max(0, Math.round(free.y ?? 0));
    // Was at/below previous bottom → ride the height/y delta.
    if (y >= prevBottom - 1) {
      y = Math.max(0, y + deltaY + deltaH);
    }
    rows.push({
      index,
      id: b.id,
      layout: ensureSectionFreeLayoutHeight({
        ...free,
        y,
        height: Math.max(
          CANVAS_FREE_RESERVE_MIN,
          Math.round(free.height ?? free.reserveHeight ?? CANVAS_FREE_RESERVE_MIN),
        ),
      }),
    });
  });

  // Resolve any residual overlaps top→bottom (stable by previous y, then id).
  const withDelta = blocks.map((b, i) => {
    const layout = (() => {
      const row = rows.find((r) => r.index === i);
      return row?.layout;
    })();
    if (!layout) return b;
    if (viewport === 'desktop') {
      return { ...b, positionMode: 'free' as const, freeLayout: layout };
    }
    return {
      ...b,
      positionMode: 'free' as const,
      freeLayout: b.freeLayout || layout,
      responsiveFreeLayout: {
        ...(b.responsiveFreeLayout || {}),
        [viewport]: layout,
      },
    };
  }) as T[];
  return packFreeSectionsVertical(withDelta, viewport, gap);
}

export function normalizeRotate(deg: number): number {
  if (!Number.isFinite(deg)) return 0;
  let d = deg % 360;
  if (d < 0) d += 360;
  return Math.round(d * 10) / 10;
}

export function snapRotateDegrees(
  deg: number,
  shiftKey: boolean,
  step = FREE_ROTATE_SNAP_DEG,
): number {
  const n = normalizeRotate(deg);
  if (!shiftKey) return Math.round(n);
  const s = step > 0 ? step : FREE_ROTATE_SNAP_DEG;
  return normalizeRotate(Math.round(n / s) * s);
}

export function clampFreeSize(
  width: number,
  height: number,
  opts?: { minW?: number; minH?: number; maxW?: number; maxH?: number },
): { width: number; height: number } {
  const minW = opts?.minW ?? FREE_SIZE_MIN_W;
  const minH = opts?.minH ?? FREE_SIZE_MIN_H;
  const maxW = opts?.maxW ?? FREE_SIZE_MAX_W;
  const maxH = opts?.maxH ?? FREE_SIZE_MAX_H;
  return {
    width: Math.round(Math.min(maxW, Math.max(minW, width))),
    height: Math.round(Math.min(maxH, Math.max(minH, height))),
  };
}

/**
 * Resize box from a handle. Keeps opposite edge anchored.
 * Returns updated top-left + size (pre-canvas-clamp).
 */
export function applyResizeHandle(input: {
  handle: FreeResizeHandle;
  x: number;
  y: number;
  width: number;
  height: number;
  dx: number;
  dy: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}): { x: number; y: number; width: number; height: number } {
  let { x, y, width, height } = input;
  const { handle, dx, dy } = input;
  const right = x + width;
  const bottom = y + height;

  if (handle.includes('e')) width = width + dx;
  if (handle.includes('w')) {
    width = width - dx;
    x = x + dx;
  }
  if (handle.includes('s')) height = height + dy;
  if (handle.includes('n')) {
    height = height - dy;
    y = y + dy;
  }

  const clamped = clampFreeSize(width, height, input);
  // Re-anchor when min/max clamps size so the opposite edge stays put.
  if (handle.includes('w')) x = right - clamped.width;
  if (handle.includes('n')) y = bottom - clamped.height;
  if (handle.includes('e') && !handle.includes('w')) x = x; // left fixed
  if (handle.includes('s') && !handle.includes('n')) y = y;

  return { x: Math.round(x), y: Math.round(y), width: clamped.width, height: clamped.height };
}

export function resizeHandleCursor(handle: FreeResizeHandle): string {
  switch (handle) {
    case 'e':
    case 'w':
      return 'ew-resize';
    case 'n':
    case 's':
      return 'ns-resize';
    case 'nw':
    case 'se':
      return 'nwse-resize';
    case 'ne':
    case 'sw':
      return 'nesw-resize';
    default:
      return 'default';
  }
}

export function sanitizePositionMode(raw: unknown): LandingPagePositionMode | undefined {
  if (raw === 'free' || raw === 'flow') return raw;
  return undefined;
}

export function sanitizeResponsiveFreeLayout(
  raw: unknown,
): LandingPageResponsiveFreeLayout | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const o = raw as Record<string, unknown>;
  const tablet = sanitizeFreeLayout(o.tablet);
  const mobile = sanitizeFreeLayout(o.mobile);
  if (!tablet && !mobile) return undefined;
  return {
    ...(tablet ? { tablet } : {}),
    ...(mobile ? { mobile } : {}),
  };
}

/**
 * Clamp absolute free layout into a canvas width (tablet/mobile preview + publish).
 * Desktop layouts are left untouched by callers.
 */
export function constrainFreeLayoutToCanvasWidth(
  layout: LandingPageFreeLayout,
  canvasWidth: number,
  gutter = canvasWidth <= 420 ? 16 : 24,
): LandingPageFreeLayout {
  if (!(canvasWidth > 0) || !Number.isFinite(canvasWidth)) return layout;
  const maxW = Math.max(FREE_SIZE_MIN_W, canvasWidth - gutter * 2);
  const width =
    layout.width != null && Number.isFinite(layout.width)
      ? Math.min(Math.max(FREE_SIZE_MIN_W, layout.width), maxW)
      : undefined;
  let x = Number.isFinite(layout.x) ? layout.x : gutter;
  if (width != null) {
    const maxX = Math.max(gutter, canvasWidth - gutter - width);
    x = Math.min(Math.max(gutter, x), maxX);
  } else {
    x = Math.min(Math.max(0, x), Math.max(0, canvasWidth - gutter));
  }
  const y = Number.isFinite(layout.y) ? Math.max(0, layout.y) : 0;
  return {
    ...layout,
    x,
    y,
    ...(width != null ? { width } : null),
  };
}

/**
 * Resolve layout for builder/public viewport.
 * - Mobile: only explicit responsive.mobile (missing → flow) so small screens don't break.
 * - Tablet: responsive.tablet, else desktop freeLayout constrained to tablet width.
 * - Desktop: freeLayout unchanged.
 */
export function resolveFreeLayoutForViewport(
  positionMode: LandingPagePositionMode | undefined,
  freeLayout: LandingPageFreeLayout | undefined,
  responsive: LandingPageResponsiveFreeLayout | undefined,
  viewport: 'desktop' | 'tablet' | 'mobile',
): LandingPageFreeLayout | null {
  if (positionMode !== 'free') return null;
  if (viewport === 'mobile') {
    const mobile = responsive?.mobile ?? null;
    return mobile ? constrainFreeLayoutToCanvasWidth(mobile, 390) : null;
  }
  if (viewport === 'tablet') {
    const tablet = responsive?.tablet ?? freeLayout ?? null;
    return tablet ? constrainFreeLayoutToCanvasWidth(tablet, 768) : null;
  }
  return freeLayout ?? null;
}

function centerX(r: FreeRect) {
  return r.left + r.width / 2;
}
function centerY(r: FreeRect) {
  return r.top + r.height / 2;
}
function right(r: FreeRect) {
  return r.left + r.width;
}
function bottom(r: FreeRect) {
  return r.top + r.height;
}

function pushUniqueGuide(guides: FreeGuide[], g: FreeGuide) {
  if (guides.some((x) => x.orientation === g.orientation && Math.abs(x.position - g.position) < 0.5)) {
    return;
  }
  guides.push(g);
}

/**
 * Snap moving box to canvas / siblings. Uses transform-space coords (parent-relative).
 * Equal spacing: when gaps to nearest left/right (or top/bottom) siblings are nearly equal, snap.
 */
export function computeFreeSnap(input: {
  moving: FreeRect;
  /** Proposed top-left after pointer delta (pre-snap). */
  proposedX: number;
  proposedY: number;
  canvas: FreeRect;
  /** Visible surface used for alignment; movement bounds may have extra vertical room. */
  alignmentBounds?: FreeRect;
  siblings: FreeRect[];
  threshold?: number;
  /**
   * Optional content safe-area (builder). Snap to left/right guides within
   * CONTENT_SAFE_AREA_SNAP_PX and clamp X inside the column.
   */
  safeArea?: ContentSafeArea | null;
  /** Override snap threshold for safe-area guides only (default CONTENT_SAFE_AREA_SNAP_PX). */
  safeAreaThreshold?: number;
}): FreeSnapResult {
  const alignment = input.alignmentBounds || input.canvas;
  const thr = input.threshold ?? FREE_SNAP_THRESHOLD_PX;
  const safeThr = input.safeAreaThreshold ?? CONTENT_SAFE_AREA_SNAP_PX;
  const w = input.moving.width;
  const h = input.moving.height;
  let x = input.proposedX;
  let y = input.proposedY;
  const guides: FreeGuide[] = [];
  const spacings: FreeSpacingLabel[] = [];

  // Movement bounds: span the full surface, never trapping elements within a narrow safe area.
  // Content safe area guides still snap cleanly within safeAreaThreshold (lines 868-873).
  const canvasMinX = input.canvas.left;
  const canvasMaxX = input.canvas.left + Math.max(0, input.canvas.width - w);
  const minX = Math.min(canvasMinX, input.safeArea ? input.safeArea.left : canvasMinX);
  const maxX = Math.max(
    canvasMaxX,
    input.safeArea ? input.safeArea.right - w : canvasMaxX,
  );
  const minY = input.canvas.top;
  const maxY = input.canvas.top + Math.max(0, input.canvas.height - h);

  type Cand = { delta: number; guidePos: number; kind: FreeGuide['kind']; thr: number };
  const xCands: Cand[] = [];
  const yCands: Cand[] = [];

  const addX = (
    targetLeft: number,
    guidePos: number,
    kind: FreeGuide['kind'],
    candThr = thr,
  ) => {
    xCands.push({ delta: targetLeft - x, guidePos, kind, thr: candThr });
  };
  const addY = (
    targetTop: number,
    guidePos: number,
    kind: FreeGuide['kind'],
    candThr = thr,
  ) => {
    yCands.push({ delta: targetTop - y, guidePos, kind, thr: candThr });
  };

  // Canvas edges + center
  addX(alignment.left, alignment.left, 'canvas');
  addX(alignment.left + alignment.width - w, right(alignment), 'canvas');
  addX(centerX(alignment) - w / 2, centerX(alignment), 'center');
  addY(alignment.top, alignment.top, 'canvas');
  addY(alignment.top + alignment.height - h, bottom(alignment), 'canvas');
  addY(centerY(alignment) - h / 2, centerY(alignment), 'center');

  // Content safe-area vertical guides (builder) — snap within ~7px
  if (input.safeArea && input.safeArea.width > 0) {
    const sl = input.safeArea.left;
    const sr = input.safeArea.right;
    addX(sl, sl, 'section', safeThr);
    addX(sr - w, sr, 'section', safeThr);
  }

  for (const s of input.siblings) {
    // Edges
    addX(s.left, s.left, 'sibling');
    addX(right(s) - w, right(s), 'sibling');
    addX(s.left - w, s.left, 'edge'); // right edge of moving → left of sibling
    addX(right(s), right(s), 'edge'); // left of moving → right of sibling
    addY(s.top, s.top, 'sibling');
    addY(bottom(s) - h, bottom(s), 'sibling');
    addY(s.top - h, s.top, 'edge');
    addY(bottom(s), bottom(s), 'edge');
    // Centers
    addX(centerX(s) - w / 2, centerX(s), 'center');
    addY(centerY(s) - h / 2, centerY(s), 'center');
  }

  // Equal horizontal spacing among sorted siblings + moving
  const byLeft = [...input.siblings].sort((a, b) => a.left - b.left);
  for (let i = 0; i < byLeft.length - 1; i++) {
    const leftS = byLeft[i]!;
    const rightS = byLeft[i + 1]!;
    const gap = rightS.left - right(leftS);
    if (gap <= 0) continue;
    const total = rightS.left - right(leftS);
    if (total > w) {
      const side = (total - w) / 2;
      const target = right(leftS) + side;
      addX(target, centerX({ id: '', left: target, top: 0, width: w, height: 0 }), 'spacing');
    }
  }
  // Equal spacing vs single neighbor pair (match gap to another pair)
  if (byLeft.length >= 2) {
    const gaps: number[] = [];
    for (let i = 0; i < byLeft.length - 1; i++) {
      gaps.push(byLeft[i + 1]!.left - right(byLeft[i]!));
    }
    const refGap = gaps.find((g) => g > 0);
    if (refGap != null) {
      for (const s of byLeft) {
        addX(right(s) + refGap, right(s) + refGap / 2, 'spacing');
        addX(s.left - refGap - w, s.left - refGap / 2, 'spacing');
      }
    }
  }

  const byTop = [...input.siblings].sort((a, b) => a.top - b.top);
  if (byTop.length >= 2) {
    const gaps: number[] = [];
    for (let i = 0; i < byTop.length - 1; i++) {
      gaps.push(byTop[i + 1]!.top - bottom(byTop[i]!));
    }
    const refGap = gaps.find((g) => g > 0);
    if (refGap != null) {
      for (const s of byTop) {
        addY(bottom(s) + refGap, bottom(s) + refGap / 2, 'spacing');
        addY(s.top - refGap - h, s.top - refGap / 2, 'spacing');
      }
    }
  }

  const best = (cands: Cand[]) => {
    let pick: Cand | null = null;
    for (const c of cands) {
      const a = Math.abs(c.delta);
      if (a > c.thr) continue;
      if (!pick) {
        pick = c;
        continue;
      }
      const pa = Math.abs(pick.delta);
      // Prefer closer snap; when nearly tied, prefer canvas/sibling center guides.
      if (a < pa - 0.5) {
        pick = c;
      } else if (Math.abs(a - pa) <= 0.5) {
        const pk = SNAP_KIND_PRIORITY[pick.kind] || 0;
        const ck = SNAP_KIND_PRIORITY[c.kind] || 0;
        if (ck > pk) pick = c;
      }
    }
    return pick;
  };

  const bx = best(xCands);
  const by = best(yCands);
  if (bx) {
    x += bx.delta;
    pushUniqueGuide(guides, { orientation: 'v', position: bx.guidePos, kind: bx.kind });
  }
  if (by) {
    y += by.delta;
    pushUniqueGuide(guides, { orientation: 'h', position: by.guidePos, kind: by.kind });
  }

  x = Math.min(maxX, Math.max(minX, x));
  y = Math.min(maxY, Math.max(minY, y));

  // After clamp: still show canvas center guides when the box center is near midlines
  // (covers full-width / maxX=0 cases where snap delta never fired).
  const cxCanvas = centerX(alignment);
  const cyCanvas = centerY(alignment);
  const boxCx = x + w / 2;
  const boxCy = y + h / 2;
  if (Math.abs(boxCx - cxCanvas) <= thr) {
    pushUniqueGuide(guides, { orientation: 'v', position: cxCanvas, kind: 'center' });
  }
  if (Math.abs(boxCy - cyCanvas) <= thr) {
    pushUniqueGuide(guides, { orientation: 'h', position: cyCanvas, kind: 'center' });
  }

  // Show safe-area guides when edges align after clamp
  if (input.safeArea && input.safeArea.width > 0) {
    if (Math.abs(x - input.safeArea.left) <= safeThr) {
      pushUniqueGuide(guides, {
        orientation: 'v',
        position: input.safeArea.left,
        kind: 'section',
      });
    }
    if (Math.abs(x + w - input.safeArea.right) <= safeThr) {
      pushUniqueGuide(guides, {
        orientation: 'v',
        position: input.safeArea.right,
        kind: 'section',
      });
    }
  }

  // Spacing labels vs nearest siblings after snap
  const movingNow: FreeRect = { id: input.moving.id, left: x, top: y, width: w, height: h };
  let nearestL: FreeRect | null = null;
  let nearestR: FreeRect | null = null;
  let nearestT: FreeRect | null = null;
  let nearestB: FreeRect | null = null;
  for (const s of input.siblings) {
    if (right(s) <= movingNow.left && (!nearestL || right(s) > right(nearestL))) nearestL = s;
    if (s.left >= right(movingNow) && (!nearestR || s.left < nearestR.left)) nearestR = s;
    if (bottom(s) <= movingNow.top && (!nearestT || bottom(s) > bottom(nearestT))) nearestT = s;
    if (s.top >= bottom(movingNow) && (!nearestB || s.top < nearestB.top)) nearestB = s;
  }
  if (nearestL) {
    const gap = Math.round(movingNow.left - right(nearestL));
    if (gap > 0 && gap < 400) {
      spacings.push({
        orientation: 'h',
        x: right(nearestL) + gap / 2,
        y: centerY(movingNow),
        value: gap,
      });
    }
  }
  if (nearestR) {
    const gap = Math.round(nearestR.left - right(movingNow));
    if (gap > 0 && gap < 400) {
      spacings.push({
        orientation: 'h',
        x: right(movingNow) + gap / 2,
        y: centerY(movingNow),
        value: gap,
      });
    }
  }
  if (nearestT) {
    const gap = Math.round(movingNow.top - bottom(nearestT));
    if (gap > 0 && gap < 400) {
      spacings.push({
        orientation: 'v',
        x: centerX(movingNow),
        y: bottom(nearestT) + gap / 2,
        value: gap,
      });
    }
  }
  if (nearestB) {
    const gap = Math.round(nearestB.top - bottom(movingNow));
    if (gap > 0 && gap < 400) {
      spacings.push({
        orientation: 'v',
        x: centerX(movingNow),
        y: bottom(movingNow) + gap / 2,
        value: gap,
      });
    }
  }

  return { x: Math.round(x), y: Math.round(y), guides, spacings };
}

export function applyAxisLock(
  originX: number,
  originY: number,
  nextX: number,
  nextY: number,
  shiftKey: boolean,
): { x: number; y: number } {
  if (!shiftKey) return { x: nextX, y: nextY };
  const dx = Math.abs(nextX - originX);
  const dy = Math.abs(nextY - originY);
  if (dx >= dy) return { x: nextX, y: originY };
  return { x: originX, y: nextY };
}

export function nudgeFreeLayout(
  layout: LandingPageFreeLayout,
  key: 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown',
  shiftKey: boolean,
): LandingPageFreeLayout {
  const step = shiftKey ? 10 : 1;
  const next = { ...layout };
  if (key === 'ArrowLeft') next.x -= step;
  if (key === 'ArrowRight') next.x += step;
  if (key === 'ArrowUp') next.y -= step;
  if (key === 'ArrowDown') next.y += step;
  return next;
}
