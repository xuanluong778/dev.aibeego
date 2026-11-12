'use client';
import { protectFreeRect, collisionNodes, elementRect, intersects } from './landing-page-no-overlap';

/**
 * Free-drag pointer engine + smart guides overlay (Canva-style).
 * - transform during drag; commit coords on drop (one history entry via caller)
 * - no setState per mousemove (rAF + DOM)
 * - disabled while inline editing / form focus / interactive controls
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { isLpMarqueeSelecting } from './landing-page-canvas-selection';
import {
  applyAxisLock,
  applyResizeHandle,
  clampBoxToContentSafeArea,
  computeFreeSnap,
  CONTENT_SAFE_AREA_SNAP_PX,
  FREE_SNAP_THRESHOLD_PX,
  ELEMENT_FREE_MAX_X_PX,
  ELEMENT_FREE_MAX_Y_PX,
  mapContentSafeAreaToSurface,
  normalizeRotate,
  resolveContentSafeArea,
  resizeHandleCursor,
  snapRotateDegrees,
  type ContentSafeArea,
  type FreeGuide,
  type FreeRect,
  type FreeResizeHandle,
  type FreeSpacingLabel,
  CANVAS_FREE_RESERVE_MIN,
  CANVAS_FREE_RESERVE_PADDING,
  SECTION_CONTENT_FIT_PADDING,
  type LandingPageFreeLayout,
} from '@marketingspa/shared';

export type { FreeResizeHandle };

export type FreeGuidesState = {
  visible: boolean;
  guides: FreeGuide[];
  spacings: FreeSpacingLabel[];
  canvasSize: { width: number; height: number };
  /** Guide coordinates are local to this surface, not always the page origin. */
  surface?: HTMLElement;
};

const EMPTY_GUIDES: FreeGuidesState = {
  visible: false,
  guides: [],
  spacings: [],
  canvasSize: { width: 0, height: 0 },
};

const FreeGuidesCtx = createContext<{
  setGuides: (s: FreeGuidesState) => void;
} | null>(null);

/** Imperative guides host — children never re-render on pointer move. */
export function FreeGuidesProvider({
  children,
  /** Builder-only persistent content safe-area guides (hidden on public). */
  contentSafeArea = false,
  viewport = 'desktop',
}: {
  children: ReactNode;
  contentSafeArea?: boolean;
  viewport?: 'desktop' | 'tablet' | 'mobile';
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const setGuides = useCallback((s: FreeGuidesState) => {
    const host = hostRef.current;
    if (!host) return;
    if (!s.visible) {
      host.replaceChildren();
      host.setAttribute('data-lp-guides-active', '0');
      host.style.display = 'none';
      return;
    }
    host.style.display = 'block';
    const parent = host.parentElement;
    const origin = parent?.getBoundingClientRect();
    const surface = s.surface?.getBoundingClientRect();
    const scale = s.surface ? readCanvasPointerScale(s.surface) : 1;
    host.style.left = `${origin && surface ? (surface.left - origin.left) / scale : 0}px`;
    host.style.top = `${origin && surface ? (surface.top - origin.top) / scale : 0}px`;
    host.style.width = `${s.canvasSize.width}px`;
    host.style.height = `${s.canvasSize.height}px`;
    host.setAttribute('data-lp-guides-active', '1');
    const frag = document.createDocumentFragment();
    for (const g of s.guides) {
      const line = document.createElement('div');
      line.setAttribute('data-lp-guide', g.orientation);
      line.setAttribute('data-lp-guide-kind', g.kind);
      line.style.position = 'absolute';
      line.style.boxShadow = '0 0 0 1px rgba(255,255,255,.85)';
      line.style.borderColor = '#e11d8a';
      line.style.borderStyle = 'dashed';
      const isCenter = g.kind === 'center';
      if (isCenter) {
        line.style.borderColor = '#c026d3';
        line.style.borderStyle = 'solid';
      }
      if (g.orientation === 'v') {
        line.style.left = `${g.position}px`;
        line.style.top = '0';
        line.style.width = '0';
        line.style.height = '100%';
        line.style.borderLeftWidth = isCenter ? '2px' : '1px';
      } else {
        line.style.top = `${g.position}px`;
        line.style.left = '0';
        line.style.height = '0';
        line.style.width = '100%';
        line.style.borderTopWidth = isCenter ? '2px' : '1px';
      }
      frag.appendChild(line);
    }
    for (const sp of s.spacings) {
      const label = document.createElement('div');
      label.setAttribute('data-lp-spacing-label', String(sp.value));
      label.textContent = String(sp.value);
      label.style.cssText =
        'position:absolute;transform:translate(-50%,-50%);background:#e11d8a;color:#fff;font-size:10px;font-weight:600;padding:2px 4px;border-radius:4px;left:' +
        sp.x +
        'px;top:' +
        sp.y +
        'px;';
      frag.appendChild(label);
    }
    host.replaceChildren(frag);
  }, []);
  const api = useMemo(() => ({ setGuides }), [setGuides]);
  return (
    <FreeGuidesCtx.Provider value={api}>
      <div className="relative" data-lp-guides-host="1">
        {children}
        {contentSafeArea ? (
          <ContentSafeAreaGuidesOverlay viewport={viewport} />
        ) : null}
        <div
          ref={hostRef}
          data-lp-smart-guides="1"
          data-lp-guides-active="0"
          className="pointer-events-none absolute inset-0 z-[40] overflow-hidden"
          style={{ display: 'none' }}
          aria-hidden
        />
      </div>
    </FreeGuidesCtx.Provider>
  );
}

/** Persistent vertical dashed guides for the 1200px (responsive) content column — builder only. */
function ContentSafeAreaGuidesOverlay({
  viewport,
}: {
  viewport: 'desktop' | 'tablet' | 'mobile';
}) {
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const host = wrap.parentElement;
    const canvas =
      (host?.querySelector('[data-lp-canvas-root]') as HTMLElement | null) ||
      (host?.querySelector('article') as HTMLElement | null);
    if (!canvas) return;

    const sync = () => {
      const w = canvas.offsetWidth || canvas.getBoundingClientRect().width;
      const safe = resolveContentSafeArea(w, viewport);
      // Start below top-of-page LP <header> so guides never overlay that chrome.
      const pageHeader =
        (canvas.querySelector(':scope > [data-lp-block-slot] header') as HTMLElement | null) ||
        (canvas.querySelector(':scope header') as HTMLElement | null) ||
        (canvas.querySelector('header') as HTMLElement | null);
      let topOffset = 0;
      if (pageHeader) {
        const canvasRect = canvas.getBoundingClientRect();
        const headerRect = pageHeader.getBoundingClientRect();
        const headerTopInCanvas = headerRect.top - canvasRect.top;
        if (headerTopInCanvas < 8) {
          topOffset = Math.max(0, Math.round(headerRect.bottom - canvasRect.top));
        }
      }
      const leftEl = leftRef.current;
      const rightEl = rightRef.current;
      for (const el of [leftEl, rightEl]) {
        if (!el) continue;
        el.style.top = `${topOffset}px`;
        el.style.height = `calc(100% - ${topOffset}px)`;
      }
      if (leftEl) leftEl.style.left = `${Math.max(0, Math.min(safe.left, w))}px`;
      if (rightEl) rightEl.style.left = `${Math.max(0, Math.min(safe.right, w))}px`;
      wrap.setAttribute('data-lp-content-safe-width', String(Math.round(safe.width)));
      wrap.setAttribute('data-lp-content-safe-left', String(Math.round(safe.left)));
      wrap.setAttribute('data-lp-content-safe-top', String(topOffset));
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(canvas);
    const pageHeader =
      (canvas.querySelector('header') as HTMLElement | null) || null;
    if (pageHeader) ro.observe(pageHeader);
    window.addEventListener('resize', sync);
    const mo = new MutationObserver(sync);
    mo.observe(canvas, { childList: true, subtree: true, attributes: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, [viewport]);

  return (
    <div
      ref={wrapRef}
      data-lp-content-safe-guides="1"
      className="pointer-events-none absolute inset-0 z-[34] overflow-hidden"
      aria-hidden
    >
      <div
        ref={leftRef}
        data-lp-content-safe-guide="left"
        className="absolute w-0 border-l-2 border-dashed"
        style={{
          left: 'calc(50% - 600px)',
          top: 0,
          height: '100%',
          borderColor: '#1e3a8a',
        }}
      />
      <div
        ref={rightRef}
        data-lp-content-safe-guide="right"
        className="absolute w-0 border-l-2 border-dashed"
        style={{
          left: 'calc(50% + 600px)',
          top: 0,
          height: '100%',
          borderColor: '#1e3a8a',
        }}
      />
    </div>
  );
}

export function useFreeGuidesPublisher() {
  return useContext(FreeGuidesCtx);
}

export type FreeDragCommitPayload = {
  /**
   * `free` — absolute/offset freeLayout commit.
   * `flow` — stay in document flow; persist height as style.minHeight only
   * (flow section N/S resize must not promote to free or the chrome jumps).
   */
  positionMode: 'free' | 'flow';
  freeLayout?: LandingPageFreeLayout;
  /** Flow section height (px) — written to block.style.minHeight. */
  flowMinHeight?: number;
  /** When viewport is tablet/mobile, caller may store under responsiveFreeLayout. */
  viewport: 'desktop' | 'tablet' | 'mobile';
};

/**
 * Free-position drag may ONLY start from an explicit move handle.
 * Body / text / padding clicks must never arm free-drag (select + inline-edit only).
 */
export function isFreeDragBlockedTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el?.closest) return true;
  if (el.closest('[data-lp-free-drag-handle]')) return false;
  return true;
}

type LpFreeDragHost = HTMLElement & {
  __lpBeginFreeDrag?: (e: ReactPointerEvent | PointerEvent) => void;
};

/** free-id → beginDrag (survives shell ref timing; used by vertical Move toolbar). */
const freeDragBeginByFreeId = new Map<string, (e: ReactPointerEvent | PointerEvent) => void>();
/** free-id → arm pending drag (body hold-to-move; click still selects). */
const freeDragArmByFreeId = new Map<string, (e: ReactPointerEvent | PointerEvent) => void>();

function registerFreeDragBegin(
  el: HTMLElement | null | undefined,
  begin: ((e: ReactPointerEvent | PointerEvent) => void) | null,
  arm?: ((e: ReactPointerEvent | PointerEvent) => void) | null,
) {
  if (!el) return;
  const host = el as LpFreeDragHost;
  const freeId = el.getAttribute('data-lp-free-id');
  if (begin) {
    host.__lpBeginFreeDrag = begin;
    if (freeId) {
      freeDragBeginByFreeId.set(freeId, begin);
      if (arm) freeDragArmByFreeId.set(freeId, arm);
      else freeDragArmByFreeId.delete(freeId);
    }
    return;
  }
  if (host.__lpBeginFreeDrag) delete host.__lpBeginFreeDrag;
  if (freeId && freeDragBeginByFreeId.get(freeId) && !host.__lpBeginFreeDrag) {
    // Only drop map entry when this host cleared its own handler.
    freeDragBeginByFreeId.delete(freeId);
    freeDragArmByFreeId.delete(freeId);
  }
}

/** Start free-drag on a shell that registered via useFreeDragBox (Move toolbar icon). */
export function beginFreeDragFromShell(
  shell: HTMLElement | null | undefined,
  e: ReactPointerEvent | PointerEvent,
): boolean {
  if (!shell) return false;
  let node: HTMLElement | null = shell;
  while (node) {
    const begin =
      (node as LpFreeDragHost).__lpBeginFreeDrag ||
      (node.getAttribute('data-lp-free-id')
        ? freeDragBeginByFreeId.get(node.getAttribute('data-lp-free-id')!)
        : undefined);
    if (begin) {
      begin(e);
      return true;
    }
    node = node.parentElement;
  }
  const freeId = shell.getAttribute('data-lp-free-id');
  if (freeId) {
    const begin = freeDragBeginByFreeId.get(freeId);
    if (begin) {
      begin(e);
      return true;
    }
  }
  return false;
}

export function beginFreeDragByFreeId(
  freeId: string | null | undefined,
  e: ReactPointerEvent | PointerEvent,
): boolean {
  if (!freeId) return false;
  const begin = freeDragBeginByFreeId.get(freeId);
  if (!begin) return false;
  begin(e);
  return true;
}

/** Arm hold-to-move (threshold) — used by LeadForm body drag when already selected. */
export function armFreeDragByFreeId(
  freeId: string | null | undefined,
  e: ReactPointerEvent | PointerEvent,
): boolean {
  if (!freeId) return false;
  const arm = freeDragArmByFreeId.get(freeId) || freeDragBeginByFreeId.get(freeId);
  if (!arm) return false;
  arm(e);
  return true;
}

export function readRect(el: HTMLElement, origin: DOMRect, scale = 1): FreeRect {
  const r = el.getBoundingClientRect();
  const s = scale > 0.05 && Number.isFinite(scale) ? scale : 1;
  return {
    id: el.getAttribute('data-lp-free-id') || el.getAttribute('data-lp-block-id') || 'x',
    left: (r.left - origin.left) / s,
    top: (r.top - origin.top) / s,
    width: r.width / s,
    height: r.height / s,
  };
}

/** CSS layout width of a surface (unscaled) — preferred over getBoundingClientRect under zoom. */
function surfaceLayoutSize(surfaceEl: HTMLElement, scale: number): { width: number; height: number } {
  const s = scale > 0.05 && Number.isFinite(scale) ? scale : 1;
  const rect = surfaceEl.getBoundingClientRect();
  const w = surfaceEl.clientWidth > 0 ? surfaceEl.clientWidth : rect.width / s;
  const h = surfaceEl.clientHeight > 0 ? surfaceEl.clientHeight : rect.height / s;
  return {
    width: Math.max(1, Math.round(w)),
    height: Math.max(1, Math.round(h)),
  };
}

/**
 * Convert a viewport pointer into unscaled canvas-root CSS coordinates.
 * Formula: local = (client - canvasRoot.getBoundingClientRect()) / pointerScale
 * pointerScale accounts for canvas zoom / device-frame transforms only.
 */
export function clientPointToCanvasLocal(
  clientX: number,
  clientY: number,
  fromEl?: HTMLElement | null,
): { x: number; y: number; scale: number } {
  const root =
    (fromEl?.closest('[data-lp-canvas-root]') as HTMLElement | null) ||
    (typeof document !== 'undefined'
      ? (document.querySelector('[data-lp-canvas-root]') as HTMLElement | null)
      : null);
  if (!root) return { x: Math.round(clientX), y: Math.round(clientY), scale: 1 };
  const scale = readCanvasPointerScale(root);
  const rect = root.getBoundingClientRect();
  const s = scale > 0.05 && Number.isFinite(scale) ? scale : 1;
  return {
    x: Math.round((clientX - rect.left) / s),
    y: Math.round((clientY - rect.top) / s),
    scale: s,
  };
}

/**
 * Convert a viewport pointer into LOCAL coordinates of a free surface / section.
 * Formula: local = (client - surface.getBoundingClientRect()) / pointerScale
 */
export function clientPointToSurfaceLocal(
  clientX: number,
  clientY: number,
  surfaceEl: HTMLElement,
): { x: number; y: number; scale: number } {
  const scale = readCanvasPointerScale(surfaceEl);
  const rect = surfaceEl.getBoundingClientRect();
  const s = scale > 0.05 && Number.isFinite(scale) ? scale : 1;
  return {
    x: Math.round((clientX - rect.left) / s),
    y: Math.round((clientY - rect.top) / s),
    scale: s,
  };
}

/**
 * Positioning parent for free coords.
 * Items must use the nearest `[data-lp-free-surface]` (card grid / title block),
 * then the owning section chrome — NEVER the page canvas/article.
 * Canvas fallback made left/top huge page offsets, snapped headings to other
 * sections, and inflated section minHeight until drop targets overlapped.
 */
export function resolveFreeSurface(el: HTMLElement): HTMLElement {
  const floating = el.closest('[data-lp-floating-text-section="1"]');
  if (floating) {
    const canvas = floating.closest<HTMLElement>('[data-lp-canvas-root]');
    if (canvas) return canvas;
  }

  // All in-section elements (cards, boxes, buttons, text, forms, items) offset
  // relative to their natural flow position, but movement, bounds and guides
  // belong to the whole section. A narrow column or cards-grid sub-surface otherwise
  // clamps drag and blocks rightward/leftward movement across columns.
  const ownerSection = (el.parentElement?.closest('[data-lp-section-chrome="1"]') ||
    el.parentElement?.closest('[data-lp-block-id]')) as HTMLElement | null;
  if (ownerSection) return ownerSection;

  if (el.getAttribute('data-lp-text-hug') === '1') {
    const owner = el.closest<HTMLElement>('[data-lp-section-chrome="1"]');
    if (owner) return owner;
  }
  const surface = el.closest('[data-lp-free-surface]') as HTMLElement | null;
  if (surface) return surface;
  const section = (el.closest('[data-lp-section-chrome="1"]') ||
    el.closest('[data-lp-block-id]')) as HTMLElement | null;
  if (section) return section;
  const canvas =
    (el.closest('[data-lp-canvas-root]') as HTMLElement | null) ||
    (el.closest('article') as HTMLElement | null);
  if (canvas) return canvas;
  const parent = el.offsetParent as HTMLElement | null;
  return parent || el.parentElement || el;
}

/**
 * Content safe-area in free-surface local coords.
 * Sections (absolute chrome) skip this — full-width backgrounds stay allowed.
 */
function resolveSurfaceContentSafeArea(
  surfaceEl: HTMLElement,
  viewport: 'desktop' | 'tablet' | 'mobile',
): ContentSafeArea {
  const canvas =
    (surfaceEl.closest('[data-lp-canvas-root]') as HTMLElement | null) ||
    (surfaceEl.closest('article') as HTMLElement | null) ||
    surfaceEl;
  const scale = readCanvasPointerScale(surfaceEl);
  const canvasCss = surfaceLayoutSize(canvas, scale);
  const surfaceCss = surfaceLayoutSize(surfaceEl, scale);
  const canvasSafe = resolveContentSafeArea(canvasCss.width, viewport);
  if (surfaceEl === canvas || surfaceEl.hasAttribute('data-lp-canvas-root')) {
    return canvasSafe;
  }
  const canvasRect = canvas.getBoundingClientRect();
  const surfaceRect = surfaceEl.getBoundingClientRect();
  const offsetLeft = (surfaceRect.left - canvasRect.left) / (scale > 0.05 ? scale : 1);
  return mapContentSafeAreaToSurface(canvasSafe, offsetLeft, surfaceCss.width);
}

/** True for in-section content (text/image/button/card/box), false for full-bleed sections. */
function shouldClampToContentSafeArea(el: HTMLElement, mode: 'absolute' | 'offset'): boolean {
  if (mode === 'offset') return true;
  if (el.getAttribute('data-lp-section-chrome') === '1') return false;
  if (el.getAttribute('data-lp-free-child') === '1') return true;
  if (el.getAttribute('data-lp-free-mode') === 'offset') return true;
  return false;
}

export function FreeDragGuidesOverlay({
  canvasSize,
  guides,
  spacings,
  visible,
}: {
  canvasSize: { width: number; height: number };
  guides: FreeGuide[];
  spacings: FreeSpacingLabel[];
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <div
      data-lp-smart-guides="1"
      data-lp-guides-active="1"
      className="pointer-events-none absolute inset-0 z-[40] overflow-hidden"
      style={{ width: canvasSize.width, height: canvasSize.height }}
      aria-hidden
    >
      {guides.map((g, i) =>
        g.orientation === 'v' ? (
          <div
            key={`v-${i}-${g.position}`}
            data-lp-guide="v"
            data-lp-guide-kind={g.kind}
            className="absolute top-0 w-px border-l border-dashed"
            style={{
              left: g.position,
              height: '100%',
              borderColor: '#e11d8a',
            }}
          />
        ) : (
          <div
            key={`h-${i}-${g.position}`}
            data-lp-guide="h"
            data-lp-guide-kind={g.kind}
            className="absolute left-0 h-px border-t border-dashed"
            style={{
              top: g.position,
              width: '100%',
              borderColor: '#e11d8a',
            }}
          />
        ),
      )}
      {spacings.map((s, i) => (
        <div
          key={`sp-${i}-${s.value}`}
          data-lp-spacing-label={s.value}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded bg-[#e11d8a] px-1 py-0.5 text-[10px] font-semibold text-white shadow"
          style={{ left: s.x, top: s.y }}
        >
          {s.value}
        </div>
      ))}
    </div>
  );
}

/**
 * Pointer delta in surface CSS space. Uses the surface's live client rect so a
 * canvas scroll / scroll-anchoring jump mid-drag does not separate box and cursor.
 */
function surfacePointerDelta(
  sess: { startClientX: number; startClientY: number; canvasEl?: HTMLElement | null; startSurfaceLeft?: number; startSurfaceTop?: number },
  clientX: number,
  clientY: number,
  scale: number,
): { dx: number; dy: number } {
  let shiftX = 0;
  let shiftY = 0;
  if (sess.canvasEl && sess.startSurfaceLeft != null && sess.startSurfaceTop != null) {
    const r = sess.canvasEl.getBoundingClientRect();
    shiftX = r.left - sess.startSurfaceLeft;
    shiftY = r.top - sess.startSurfaceTop;
  }
  return {
    dx: (clientX - sess.startClientX - shiftX) / scale,
    dy: (clientY - sess.startClientY - shiftY) / scale,
  };
}

/**
 * On drop only: if the box landed on another element, move it to the nearest
 * free edge (horizontal or vertical). If nothing is free nearby, keep the drop
 * position — never teleport the box back or to a distant spot.
 */
function resolveDropOverlap(s: {
  el: HTMLElement;
  canvasEl: HTMLElement;
  canvasBox: { left: number; top: number; width: number; height: number };
  mode?: 'absolute' | 'offset';
  baseLeft?: number;
  baseTop?: number;
  lastX: number;
  lastY: number;
  lastW: number;
  lastH: number;
  rotate: number;
  canvasScale?: number;
}) {
  try {
    const scale = s.canvasScale && s.canvasScale > 0 ? s.canvasScale : 1;
    const offset = s.mode === 'offset';
    const bx = offset ? s.baseLeft ?? 0 : 0;
    const by = offset ? s.baseTop ?? 0 : 0;
    const cur = { left: bx + s.lastX, top: by + s.lastY, width: s.lastW, height: s.lastH };
    const surface = s.canvasEl.getBoundingClientRect();
    const bounds = { ...s.canvasBox, height: Math.max(s.canvasBox.height, cur.top + cur.height + 240) };
    const a = protectFreeRect(s.el, cur, cur, bounds, surface, scale, [], { x: 1, y: 0 });
    const b = protectFreeRect(s.el, cur, cur, bounds, surface, scale, [], { x: 0, y: 1 });
    const d = (r: { left: number; top: number }) => Math.hypot(r.left - cur.left, r.top - cur.top);
    // Gentle nudge only — a large correction reads as the box "jumping".
    const moved = [a, b].filter((r) => d(r) > 0.5 && d(r) <= 48).sort((p, q) => d(p) - d(q));
    const best = moved[0];
    if (!best) return;
    s.lastX = Math.round(best.left - bx);
    s.lastY = Math.round(best.top - by);
    if (offset) {
      s.el.style.transform = `translate3d(${s.lastX}px, ${s.lastY}px, 0)${s.rotate ? ` rotate(${s.rotate}deg)` : ''}`;
    } else {
      s.el.style.left = `${s.lastX}px`;
      s.el.style.top = `${s.lastY}px`;
    }
  } catch {
    /* keep drop position */
  }
}

const FREE_DRAG_ANCHOR_STYLE_ID = 'lp-free-drag-no-anchor';
function setFreeDragScrollAnchorLock(on: boolean) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (on) {
    if (!document.getElementById(FREE_DRAG_ANCHOR_STYLE_ID)) {
      const st = document.createElement('style');
      st.id = FREE_DRAG_ANCHOR_STYLE_ID;
      st.textContent = 'html[data-lp-free-drag-active="1"], html[data-lp-free-drag-active="1"] *{overflow-anchor:none !important}';
      document.head.appendChild(st);
    }
    root.setAttribute('data-lp-free-drag-active', '1');
  } else {
    root.removeAttribute('data-lp-free-drag-active');
  }
}

type DragSession = {
  kind: 'move' | 'resize' | 'rotate';
  pointerId: number;
  originX: number;
  originY: number;
  startClientX: number;
  startClientY: number;
  width: number;
  height: number;
  reserveHeight: number;
  rotate: number;
  shiftLock: boolean;
  el: HTMLElement;
  canvasEl: HTMLElement;
  originalStyle: string;
  originalWidth: string;
  originalMaxWidth: string;
  siblings: FreeRect[];
  canvasBox: FreeRect;
  alignmentBounds: FreeRect;
  constrainToSurface?: boolean;
  /** Content (offset) only — sections stay full-width. */
  safeArea?: ContentSafeArea | null;
  /** Enforce content column on drag/resize (text/image/button/card/box). */
  clampToSafeArea?: boolean;
  raf: number | null;
  lastGuides: FreeGuide[];
  lastSpacings: FreeSpacingLabel[];
  lastX: number;
  lastY: number;
  lastW: number;
  lastH: number;
  lastRotate: number;
  /** Offset mode: natural flow position inside surface (before translate). */
  baseLeft?: number;
  baseTop?: number;
  /** Base flow position at pointerdown (offset) — compensates live reflow. */
  startBaseLeft?: number;
  startBaseTop?: number;
  /** Surface client rect at pointerdown — compensates canvas scroll mid-drag. */
  startSurfaceLeft?: number;
  startSurfaceTop?: number;
  mode?: 'absolute' | 'offset';
  /** Resize */
  handle?: FreeResizeHandle;
  /** Rotate — pointer angle at gesture start (radians) + box center in client space. */
  startPointerAngle?: number;
  centerClientX?: number;
  centerClientY?: number;
  /** Ancestor CSS transform scale — pointer deltas are divided by this. */
  canvasScale?: number;
  /** Latest pointer sample (client space) — rAF consumes snapshot, never re-reads DOM size. */
  pendingClientX?: number;
  pendingClientY?: number;
  pendingShift?: boolean;
};

type PendingArm = {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  shiftKey: boolean;
};

/** Active free-drag sessions — cancel when toolbar actions (duplicate/delete) remount DOM. */
const freeDragCancelers = new Set<() => void>();

export function cancelAllFreeDrags() {
  // Copy first — cancelers remove themselves while iterating.
  for (const cancel of [...freeDragCancelers]) {
    try {
      cancel();
    } catch {
      /* ignore */
    }
  }
  freeDragCancelers.clear();
}

/** Notify floating chrome (vertical toolbar) to re-anchor during live free transforms. */
export function emitFreeDragFrame() {
  try {
    window.dispatchEvent(new CustomEvent('lp-free-drag-frame'));
  } catch {
    /* ignore */
  }
}

/** Drop legacy per-slot reserves (pre canvas-level minHeight). */
function clearLegacySlotFlowReserves(root?: HTMLElement | null) {
  const canvas = root ?? (document.querySelector('[data-lp-canvas-root]') as HTMLElement | null);
  if (!canvas) return;
  canvas.querySelectorAll('[data-lp-flow-reserve="1"]').forEach((node) => node.remove());
}

/** Read cumulative CSS scale from ancestors (viewport preview / transforms). */
export function readCanvasPointerScale(fromEl: HTMLElement | null): number {
  if (!fromEl || typeof window === 'undefined') return 1;
  let node: HTMLElement | null = fromEl;
  let scale = 1;
  while (node) {
    const t = getComputedStyle(node).transform;
    if (t && t !== 'none') {
      try {
        const m = new DOMMatrixReadOnly(t);
        const sx = Math.hypot(m.a, m.b);
        if (sx > 0 && Number.isFinite(sx)) scale *= sx;
      } catch {
        /* ignore */
      }
    }
    node = node.parentElement;
  }
  return Number.isFinite(scale) && scale > 0 ? scale : 1;
}

/**
 * Union height of ALL painted content inside a section shell (CSS px, ÷ zoom).
 * Parent getBoundingClientRect / offsetHeight miss children moved by
 * transform:translate or position:absolute — those paint outside the box and
 * cause the next section to overlap. This walks descendants instead.
 */
export function measureSectionContentHeightCss(
  shell: HTMLElement,
  pointerScale?: number,
): number {
  const scale =
    pointerScale && pointerScale > 0.05
      ? pointerScale
      : readCanvasPointerScale(shell);
  const shellRect = shell.getBoundingClientRect();
  // Do NOT floor with shell.offsetHeight — that includes a previously inflated
  // minHeight and permanently locks mega-sections that overlap drop targets.
  let maxBottom = 0;

  const skipClosest =
    '[data-lp-floating-toolbar],[data-lp-transform-chrome],[data-lp-text-toolbar],[data-lp-canvas-zoom-controls],[data-lp-section-handle],[data-lp-resize-handle],[data-lp-rotate-handle],[data-lp-item-handle]';

  const nodes = shell.querySelectorAll(
    '[data-lp-element-id],[data-lp-inline-field],[data-lp-free-child],[data-lp-content-image],[data-lp-form-hit],[data-lp-box-hit],img,video,iframe,form,button,a,li,h1,h2,h3,h4,p,ul,ol',
  );
  for (let i = 0; i < nodes.length; i++) {
    const el = nodes[i] as HTMLElement;
    if (!shell.contains(el)) continue;
    if (el.closest(skipClosest)) continue;
    // Nested section chrome (shouldn't happen) — skip foreign shells.
    const nest = el.closest('[data-lp-section-chrome="1"]');
    if (nest && nest !== shell) continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 && r.height <= 0) continue;
    const localBottom = (r.bottom - shellRect.top) / scale;
    if (localBottom > maxBottom) maxBottom = localBottom;
  }
  if (maxBottom <= 0) {
    const slot = shell.querySelector('[data-lp-section-content]') as HTMLElement | null;
    maxBottom = Math.max(1, slot?.scrollHeight || shell.scrollHeight || 80);
  }
  return Math.max(1, Math.ceil(maxBottom));
}

/**
 * Visible content union in client coordinates — deep descendants only
 * (headline/cards/images). Do NOT union direct shell children: free-layout
 * stretches the content wrapper to the (possibly inflated) section height,
 * which made heal/toggle think painted content was hundreds of px taller than
 * the real cards/text and left empty chrome overlapping the next section.
 */
export function measureVisibleContentRect(
  shell: HTMLElement,
): { left: number; top: number; width: number; height: number } {
  const scale = readCanvasPointerScale(shell);
  const shellRect = shell.getBoundingClientRect();
  let minLeft = Infinity;
  let minTop = Infinity;
  let maxRight = -Infinity;
  let maxBottom = -Infinity;
  let found = false;

  const skipClosest =
    '[data-lp-floating-toolbar],[data-lp-transform-chrome],[data-lp-text-toolbar],[data-lp-canvas-zoom-controls],[data-lp-section-handle],[data-lp-resize-handle],[data-lp-rotate-handle]';

  const consider = (el: HTMLElement) => {
    if (el.closest(skipClosest)) return;
    const nest = el.closest('[data-lp-section-chrome="1"]');
    if (nest && nest !== shell) return;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    found = true;
    minLeft = Math.min(minLeft, r.left);
    minTop = Math.min(minTop, r.top);
    maxRight = Math.max(maxRight, r.right);
    maxBottom = Math.max(maxBottom, r.bottom);
  };

  shell
    .querySelectorAll(
      '[data-lp-element-id],[data-lp-inline-field],[data-lp-free-child],[data-lp-content-image],[data-lp-form-hit],[data-lp-card-item],[data-lp-box-hit],h1,h2,h3,h4,p,li,img,video',
    )
    .forEach((n) => consider(n as HTMLElement));

  if (!found) {
    return {
      left: shellRect.left,
      top: shellRect.top,
      width: shellRect.width / scale,
      height: Math.min(shellRect.height / scale, 400),
    };
  }
  return {
    left: minLeft,
    top: minTop,
    width: (maxRight - minLeft) / scale,
    height: (maxBottom - minTop) / scale,
  };
}

/**
 * One canvas-level reserve: minHeight = max(bottom of free section shells) + padding.
 * Uses live DOM bounds converted into CSS layout space (÷ pointer scale) so zoom
 * never under/over-reserves after commit handoff.
 */
export function syncCanvasFreeReserve(
  fromShell?: HTMLElement | null,
  padding = CANVAS_FREE_RESERVE_PADDING,
) {
  const root = (fromShell?.closest('[data-lp-canvas-root]') ??
    document.querySelector('[data-lp-canvas-root]')) as HTMLElement | null;
  if (!root) return;
  clearLegacySlotFlowReserves(root);
  const scale = readCanvasPointerScale(root);
  const rootRect = root.getBoundingClientRect();
  const rootTop = rootRect.top;
  let maxBottom = 0;
  root
    .querySelectorAll<HTMLElement>(
      '[data-lp-section-chrome="1"][data-lp-position-mode="free"]',
    )
    .forEach((shell) => {
      // Include transformed/absolute children that paint past the shell box.
      const contentH = measureSectionContentHeightCss(shell, scale);
      const topLocal = (shell.getBoundingClientRect().top - rootTop) / scale;
      maxBottom = Math.max(maxBottom, topLocal + contentH);
    });
  if (maxBottom <= 0) {
    root.style.minHeight = '';
    root.removeAttribute('data-lp-free-reserve-h');
    return;
  }
  const h = Math.max(CANVAS_FREE_RESERVE_MIN, Math.round(maxBottom + padding));
  root.style.minHeight = `${h}px`;
  root.setAttribute('data-lp-free-reserve-h', String(h));
}

/**
 * During child free-drag (offset), expand the parent section shell live so the
 * next section never paints under overflowing content mid-gesture.
 */
function applyParentSectionLiveFit(fromEl: HTMLElement | null) {
  if (!fromEl) return;
  // Never fit the section against itself mid-resize — that clamps grow-taller
  // back to content height and makes N/S handles feel broken.
  if (fromEl.getAttribute('data-lp-section-chrome') === '1') return;
  const section = fromEl.closest('[data-lp-section-chrome="1"]') as HTMLElement | null;
  if (!section) return;
  const scale = readCanvasPointerScale(section);
  const needed =
    measureSectionContentHeightCss(section, scale) + SECTION_CONTENT_FIT_PADDING;
  // Cap live growth — page-wide snap used to push this into thousands of px.
  const capped = Math.min(needed, 2400);
  if (section.getAttribute('data-lp-position-mode') === 'free') {
    section.style.height = `${capped}px`;
    section.style.minHeight = `${capped}px`;
  } else {
    section.style.minHeight = `${capped}px`;
  }
}

/**
 * Hook attached to a free-draggable box. Caller provides commit callback (pushHistory once).
 * Uses window-level pointer listeners so drag keeps working across children / before React re-render.
 */
export function useFreeDragBox({
  enabled,
  selected,
  viewport,
  layout,
  onCommit,
  onGuides,
  /** absolute = leave flow (sections); offset = translate in-place (cards/items, no vanish). */
  mode = 'absolute',
}: {
  enabled: boolean;
  selected: boolean;
  viewport: 'desktop' | 'tablet' | 'mobile';
  layout: LandingPageFreeLayout | null;
  onCommit: (payload: FreeDragCommitPayload) => void;
  onGuides?: (state: FreeGuidesState) => void;
  mode?: 'absolute' | 'offset';
}) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sessionRef = useRef<DragSession | null>(null);
  const pendingRef = useRef<PendingArm | null>(null);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const [dragging, setDragging] = useState(false);
  const [liveAngle, setLiveAngle] = useState<number | null>(null);
  const guidesCtx = useFreeGuidesPublisher();
  const publishGuidesRef = useRef(onGuides || ((s: FreeGuidesState) => guidesCtx?.setGuides(s)));
  publishGuidesRef.current = onGuides || ((s: FreeGuidesState) => guidesCtx?.setGuides(s));
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;

  const clearTransform = useCallback(() => {
    const el = shellRef.current;
    if (!el) return;
    el.style.transform = '';
    el.style.willChange = '';
    el.style.cursor = '';
    el.removeAttribute('data-lp-free-dragging');
    el.removeAttribute('data-lp-free-resizing');
    el.removeAttribute('data-lp-free-rotating');
    if (modeRef.current === 'offset') {
      // Never leave absolute pin on card items (legacy bug residue).
      el.style.position = '';
      el.style.left = '';
      el.style.top = '';
      el.style.margin = '';
      if (!layoutRef.current?.width) el.style.width = '';
      // Text hug / no locked height: always clear imperative height after gesture.
      // Keep locked text-box height (inlineTextStyles.height / --lp-text-box-height).
      if (
        el.getAttribute('data-lp-heading-height-locked') !== '1' &&
        (el.getAttribute('data-lp-text-hug') === '1' || !layoutRef.current?.height)
      ) {
        el.style.height = '';
        el.style.minHeight = '';
      }
      el.style.zIndex = '';
    }
  }, []);

  const detachWindow = useRef<(() => void) | null>(null);
  const cancelerRef = useRef<(() => void) | null>(null);
  /** Timestamp of last user resize — suppress auto grow-back that undoes shrink. */
  const lastUserResizeAtRef = useRef(0);

  const finish = useCallback(
    (commit: boolean) => {
      const s = sessionRef.current;
      pendingRef.current = null;
      detachWindow.current?.();
      detachWindow.current = null;
      if (cancelerRef.current) {
        freeDragCancelers.delete(cancelerRef.current);
        cancelerRef.current = null;
      }
      if (!s) {
        setDragging(false);
        setLiveAngle(null);
        publishGuidesRef.current?.(EMPTY_GUIDES);
        return;
      }
      if (s.raf != null) cancelAnimationFrame(s.raf);
      try {
        s.el.releasePointerCapture(s.pointerId);
      } catch {
        /* ignore */
      }
      // Flow-section height resize: keep minHeight through clearTransform so React
      // does not flash back to content height before the history commit paints.
      const flowResizeCommit =
        Boolean(commit) &&
        s.kind === 'resize' &&
        s.mode === 'offset' &&
        !layoutRef.current &&
        s.el?.getAttribute('data-lp-section-chrome') === '1';
      const flowHPending = Math.round(s.lastH);
      clearTransform();
      if (s.el.getAttribute('data-lp-text-hug') === '1') {
        // Text width belongs to inlineTextStyles. Clearing it here makes Undo or
        // the next gesture expand an unchanged React width to max-content.
        s.el.style.width = s.originalWidth;
        s.el.style.maxWidth = s.originalMaxWidth;
      }
      // React may see the same saved style before and after a canceled gesture.
      // Restore the original inline styles explicitly, including its saved translate.
      if (!commit) {
        s.el.style.cssText = s.originalStyle;
        if (s.mode !== 'offset') syncCanvasFreeReserve(s.el);
      }
      if (flowResizeCommit) {
        // Stay in document flow — only lock the author-chosen height.
        s.el.style.position = '';
        s.el.style.left = '';
        s.el.style.top = '';
        s.el.style.width = '';
        s.el.style.height = '';
        s.el.style.minHeight = `${Math.max(56, flowHPending)}px`;
        s.el.style.zIndex = '';
        s.el.style.transform = '';
      }
      sessionRef.current = null;
      setFreeDragScrollAnchorLock(false);
      if (commit && s.kind === 'move' && s.canvasEl && s.el.closest('[data-lp-non-overlap="1"]')) {
        resolveDropOverlap(s);
      }
      setDragging(false);
      setLiveAngle(null);
      publishGuidesRef.current?.(EMPTY_GUIDES);
      emitFreeDragFrame();
      if (!commit) return;
      if (s.kind === 'resize') lastUserResizeAtRef.current = performance.now();
      // Flow section N/S resize: persist minHeight only — never promote to free
      // (absolute freeLayout pulls the section out of flow → jump + overlap).
      if (flowResizeCommit) {
        onCommitRef.current({
          positionMode: 'flow',
          flowMinHeight: Math.max(56, flowHPending),
          viewport: viewportRef.current,
        });
        return;
      }
      // Keep document-flow spacer in sync with the visual box so sections don't overlap.
      let flowH = Math.round(s.lastH);
      const flowW = Math.round(s.lastW);
      // Absolute sections after MOVE/ROTATE: grow height to fit live content so the
      // next section is not painted underneath. Never do this after RESIZE — the
      // user just chose lastH; forcing contentH snaps the box back (jump) and can
      // no-op pushHistory so Undo stays disabled.
      if (s.mode !== 'offset' && s.el && s.kind !== 'resize') {
        const scale = readCanvasPointerScale(s.el);
        const contentH =
          measureSectionContentHeightCss(s.el, scale) + SECTION_CONTENT_FIT_PADDING;
        if (contentH > flowH) flowH = contentH;
      }
      const textHug = s.el?.getAttribute('data-lp-text-hug') === '1';
      // Move/rotate: size was locked at session start (getBoundingClientRect / prior layout).
      // Resize: lastW/lastH were mutated by handles only — commit them as-is.
      // Text hug: omit height — selection must follow content, not a locked frame.
      onCommitRef.current({
        positionMode: 'free',
        freeLayout: textHug
          ? {
              x: s.lastX,
              y: s.lastY,
              width: flowW,
              rotate: normalizeRotate(s.lastRotate),
            }
          : {
              x: s.lastX,
              y: s.lastY,
              width: flowW,
              height: flowH,
              rotate: normalizeRotate(s.lastRotate),
              reserveHeight: flowH,
            },
        viewport: viewportRef.current,
      });
      // Canvas minHeight after commit is owned solely by computeCanvasFreeReserveHeight
      // (packages/shared) via LandingPageRenderer's own render + effect — it reacts to
      // this same onCommit's spec change and is rotation-aware, so no imperative
      // re-sync is needed here (see BUG-15: two independent writers used to race).
    },
    [clearTransform],
  );

  // Register canceler for this hook instance
  useEffect(() => {
    const cancel = () => finish(false);
    cancelerRef.current = cancel;
    freeDragCancelers.add(cancel);
    return () => {
      freeDragCancelers.delete(cancel);
      cancelerRef.current = null;
      // Unmount mid-drag must not leave window listeners sticky.
      finish(false);
    };
  }, [finish]);

  // Grow-only content sync (sections only): repair frames that are clearly too
  // short for painted content. Large threshold + skip right after user resize
  // so a deliberate shrink is not immediately undone (jump + Undo no-op).
  useEffect(() => {
    if (mode === 'offset') return;
    if (dragging) return;
    if (!layout || !layout.height) return;
    const el = shellRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      if (sessionRef.current || pendingRef.current) return;
      if (performance.now() - lastUserResizeAtRef.current < 1200) return;
      const scale = readCanvasPointerScale(el);
      const needed =
        measureSectionContentHeightCss(el, scale) + SECTION_CONTENT_FIT_PADDING;
      const committed = Math.round(layout.height || 0);
      // Only rescue severe clipping — small deltas are intentional authoring.
      if (needed > committed + 48) {
        onCommitRef.current({
          positionMode: 'free',
          freeLayout: { ...layout, height: needed, reserveHeight: needed },
          viewport: viewportRef.current,
        });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [layout, mode, dragging]);

  const startSessionRef = useRef<
    (
      pointerId: number,
      clientX: number,
      clientY: number,
      shiftKey: boolean,
      opts?: {
        preserveBoxSize?: boolean;
        preferPaintedOrigin?: boolean;
        forceMode?: 'absolute' | 'offset';
      },
    ) => void
  >(() => undefined);

  const applyMove = useCallback((_clientX?: number, _clientY?: number, _shiftKey?: boolean) => {
    const s = sessionRef.current;
    if (!s) return;
    if (_clientX != null) s.pendingClientX = _clientX;
    if (_clientY != null) s.pendingClientY = _clientY;
    if (_shiftKey != null) s.pendingShift = _shiftKey;
    s.shiftLock = s.pendingShift ?? false;

    if (s.raf != null) return;
    s.raf = requestAnimationFrame(() => {
      const sess = sessionRef.current;
      if (!sess) return;
      sess.raf = null;
      const clientX = sess.pendingClientX ?? sess.startClientX;
      const clientY = sess.pendingClientY ?? sess.startClientY;
      const shiftKey = sess.pendingShift ?? false;
      sess.shiftLock = shiftKey;

      if (sess.kind === 'rotate') {
        const cx = sess.centerClientX ?? clientX;
        const cy = sess.centerClientY ?? clientY;
        const ang = Math.atan2(clientY - cy, clientX - cx);
        const startAng = sess.startPointerAngle ?? ang;
        const deltaDeg = ((ang - startAng) * 180) / Math.PI;
        let next = normalizeRotate(sess.rotate + deltaDeg);
        next = snapRotateDegrees(next, shiftKey);
        const priorTransform = sess.el.style.transform;
        sess.el.style.transform = `rotate(${next}deg)`;
        if (sess.el.closest('[data-lp-non-overlap="1"]') && collisionNodes(sess.el).some(n=>intersects(elementRect(sess.el),elementRect(n),1))) { sess.el.style.transform=priorTransform; return; }
        sess.lastRotate = next;
        sess.lastX = sess.originX;
        sess.lastY = sess.originY;
        sess.lastW = sess.width;
        sess.lastH = sess.height;
        sess.el.style.transform = `rotate(${next}deg)`;
        setLiveAngle(next);
        publishGuidesRef.current?.(EMPTY_GUIDES);
        if (sess.mode !== 'offset') syncCanvasFreeReserve(sess.el);
        emitFreeDragFrame();
        return;
      }

      if (sess.kind === 'resize' && sess.handle) {
        const previous={x:sess.lastX,y:sess.lastY,w:sess.lastW,h:sess.lastH,css:sess.el.style.cssText};
        const scale = sess.canvasScale && sess.canvasScale > 0 ? sess.canvasScale : 1;
        // Snapshot geometry at pointerdown — never re-measure DOM size per frame.
        const { dx: rawDx, dy: rawDy } = surfacePointerDelta(sess, clientX, clientY, scale);
        const theta = (sess.rotate * Math.PI) / 180;
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);
        const dx = rawDx * cos + rawDy * sin;
        const dy = -rawDx * sin + rawDy * cos;
        const maxW = sess.clampToSafeArea && sess.safeArea ? sess.safeArea.width : undefined;
        const next = applyResizeHandle({
          handle: sess.handle,
          x: sess.originX,
          y: sess.originY,
          width: sess.width,
          height: sess.height,
          dx,
          dy,
          ...(maxW != null ? { maxW } : {}),
        });
        if (sess.clampToSafeArea && sess.safeArea) {
          sess.canvasBox = {
            ...sess.canvasBox,
            height: Math.max(
              sess.canvasBox.height,
              next.y + next.height + 240,
              next.height + 560,
            ),
          };
          const clamped = clampBoxToContentSafeArea(
            next.x,
            next.y,
            next.width,
            next.height,
            sess.safeArea,
          );
          const maxY = Math.max(0, sess.canvasBox.height - clamped.height);
          sess.lastX = clamped.x;
          sess.lastY = Math.min(maxY, Math.max(0, clamped.y));
          sess.lastW = clamped.width;
          sess.lastH = clamped.height;
        } else {
          sess.canvasBox = {
            ...sess.canvasBox,
            width: Math.max(sess.canvasBox.width, next.x + next.width + 48),
            height: Math.max(
              sess.canvasBox.height,
              next.y + next.height + 240,
              next.height + 560,
            ),
          };
          const maxX = Math.max(0, sess.canvasBox.width - next.width);
          const maxY = Math.max(0, sess.canvasBox.height - next.height);
          sess.lastX = Math.min(maxX, Math.max(0, next.x));
          sess.lastY = Math.min(maxY, Math.max(0, next.y));
          sess.lastW = next.width;
          sess.lastH = next.height;
        }
        sess.lastRotate = sess.rotate;
        sess.reserveHeight = sess.lastH;
        if (sess.mode === 'offset') {
          sess.el.style.width = `${sess.lastW}px`;
          sess.el.style.height = `${sess.lastH}px`;
          sess.el.style.minHeight = `${sess.lastH}px`;
          sess.el.style.maxWidth = 'none';
          sess.el.style.transform = `translate3d(${sess.lastX}px, ${sess.lastY}px, 0) rotate(${sess.rotate}deg)`;
          applyParentSectionLiveFit(sess.el);
        } else {
          sess.el.style.left = `${sess.lastX}px`;
          sess.el.style.top = `${sess.lastY}px`;
          sess.el.style.width = `${sess.lastW}px`;
          sess.el.style.height = `${sess.lastH}px`;
          sess.el.style.minHeight = `${sess.lastH}px`;
          sess.el.style.maxWidth = 'none';
          sess.el.style.transform = sess.rotate ? `rotate(${sess.rotate}deg)` : '';
          syncCanvasFreeReserve(sess.el);
        }
        if(sess.el.closest('[data-lp-non-overlap="1"]')&&collisionNodes(sess.el).some(n=>intersects(elementRect(sess.el),elementRect(n),1))){sess.el.style.cssText=previous.css;sess.lastX=previous.x;sess.lastY=previous.y;sess.lastW=previous.w;sess.lastH=previous.h;}
        publishGuidesRef.current?.(EMPTY_GUIDES);
        emitFreeDragFrame();
        return;
      }

      // --- move ---
      const scale = sess.canvasScale && sess.canvasScale > 0 ? sess.canvasScale : 1;
      const { dx, dy } = surfacePointerDelta(sess, clientX, clientY, scale);
      let proposedX = sess.originX + dx;
      let proposedY = sess.originY + dy;
      const locked = applyAxisLock(sess.originX, sess.originY, proposedX, proposedY, sess.shiftLock);
      proposedX = locked.x;
      proposedY = locked.y;

      const isOffset = sess.mode === 'offset';
      // Parent live-fit / grid reflow moves the card's natural flow position
      // mid-drag; re-derive base each frame so the box stays under the pointer.
      if (isOffset && !sess.rotate && sess.canvasEl) {
        const rNow = readRect(sess.el, sess.canvasEl.getBoundingClientRect(), scale);
        sess.baseLeft = rNow.left - sess.lastX;
        sess.baseTop = rNow.top - sess.lastY;
        proposedX += (sess.startBaseLeft ?? sess.baseLeft) - sess.baseLeft;
        proposedY += (sess.startBaseTop ?? sess.baseTop) - sess.baseTop;
      }
      const movingLeft = isOffset ? (sess.baseLeft ?? 0) + proposedX : proposedX;
      const movingTop = isOffset ? (sess.baseTop ?? 0) + proposedY : proposedY;

      if (!sess.constrainToSurface) sess.canvasBox = {
        ...sess.canvasBox,
        height: Math.max(sess.canvasBox.height, movingTop + sess.height + 240, sess.height + 560),
      };

      const snap = computeFreeSnap({
        moving: {
          id: 'moving',
          left: movingLeft,
          top: movingTop,
          width: sess.width,
          height: sess.height,
        },
        proposedX: movingLeft,
        proposedY: movingTop,
        canvas: sess.canvasBox,
        alignmentBounds: sess.alignmentBounds,
        siblings: sess.siblings,
        threshold: FREE_SNAP_THRESHOLD_PX / scale,
        safeArea: sess.clampToSafeArea ? sess.safeArea : null,
        safeAreaThreshold: CONTENT_SAFE_AREA_SNAP_PX,
      });

      // No per-frame overlap push: it made the box jump/freeze whenever the
      // pointer crossed another element. Overlap is resolved once on drop (finish).
      if (isOffset) {
        sess.lastX = Math.round(snap.x - (sess.baseLeft ?? 0));
        sess.lastY = Math.round(snap.y - (sess.baseTop ?? 0));
        sess.lastW = sess.width;
        sess.lastH = sess.height;
        sess.lastRotate = sess.rotate;
        sess.el.style.transform = `translate3d(${sess.lastX}px, ${sess.lastY}px, 0) rotate(${sess.rotate}deg)`;
        applyParentSectionLiveFit(sess.el);
      } else {
        sess.lastX = snap.x;
        sess.lastY = snap.y;
        sess.lastW = sess.width;
        sess.lastH = sess.height;
        sess.lastRotate = sess.rotate;
        sess.el.style.left = `${snap.x}px`;
        sess.el.style.top = `${snap.y}px`;
        sess.el.style.transform = sess.rotate ? `rotate(${sess.rotate}deg)` : '';
        syncCanvasFreeReserve(sess.el);
      }
      sess.lastGuides = snap.guides;
      sess.lastSpacings = snap.spacings;
      publishGuidesRef.current?.({
        visible: true,
        guides: snap.guides,
        spacings: snap.spacings,
        canvasSize: { width: sess.alignmentBounds.width, height: sess.alignmentBounds.height },
        surface: sess.canvasEl,
      });
      emitFreeDragFrame();
    });
  }, []);

  const attachWindow = useCallback(
    (pointerId: number) => {
      detachWindow.current?.();
      const endGesture = (commit: boolean) => {
        if (pendingRef.current && !sessionRef.current) {
          pendingRef.current = null;
          detachWindow.current?.();
          detachWindow.current = null;
          return;
        }
        finish(commit);
      };
      const onMove = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        // Mouse released but we missed pointerup (DOM remount / capture loss) —
        // stop sticky drag immediately so section doesn't follow the cursor.
        if (ev.pointerType === 'mouse' && ev.buttons === 0) {
          const s = sessionRef.current;
          const moved =
            !!s &&
            (s.lastX !== s.originX ||
              s.lastY !== s.originY ||
              s.lastW !== s.width ||
              s.lastH !== s.height ||
              s.lastRotate !== s.rotate);
          endGesture(moved);
          return;
        }
        const pending = pendingRef.current;
        if (pending && !sessionRef.current) {
          if (
            Math.abs(ev.clientX - pending.startClientX) > 4 ||
            Math.abs(ev.clientY - pending.startClientY) > 4
          ) {
            pendingRef.current = null;
            startSessionRef.current(
              pending.pointerId,
              pending.startClientX,
              pending.startClientY,
              pending.shiftKey || ev.shiftKey,
              { preserveBoxSize: true },
            );
            applyMove(ev.clientX, ev.clientY, ev.shiftKey);
          }
          return;
        }
        if (!sessionRef.current) return;
        ev.preventDefault();
        applyMove(ev.clientX, ev.clientY, ev.shiftKey);
      };
      const onUp = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        endGesture(true);
      };
      const onCancel = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        endGesture(false);
      };
      const onBlur = () => endGesture(false);
      const onLostCapture = (ev: Event) => {
        const pe = ev as PointerEvent;
        if (pe.pointerId != null && pe.pointerId !== pointerId) return;
        endGesture(false);
      };
      // Canvas scroll without pointer motion: re-run the frame with last pointer.
      const onScroll = () => {
        if (sessionRef.current) applyMove();
      };
      window.addEventListener('scroll', onScroll, true);
      window.addEventListener('pointermove', onMove, { passive: false });
      window.addEventListener('pointerup', onUp, true);
      window.addEventListener('pointercancel', onCancel, true);
      window.addEventListener('blur', onBlur);
      document.addEventListener('lostpointercapture', onLostCapture, true);
      detachWindow.current = () => {
        window.removeEventListener('scroll', onScroll, true);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp, true);
        window.removeEventListener('pointercancel', onCancel, true);
        window.removeEventListener('blur', onBlur);
        document.removeEventListener('lostpointercapture', onLostCapture, true);
      };
    },
    [applyMove, finish],
  );

  const startSession = useCallback(
    (
      pointerId: number,
      clientX: number,
      clientY: number,
      shiftKey: boolean,
      opts?: {
        preserveBoxSize?: boolean;
        allowWhileEditing?: boolean;
        /** Use live painted left/top so resize/move never jumps when freeLayout drifted. */
        preferPaintedOrigin?: boolean;
        /**
         * Override hook mode for this gesture. Flow section resize MUST use
         * offset so the shell stays in document flow (absolute = jump).
         */
        forceMode?: 'absolute' | 'offset';
      },
    ) => {
      if (!enabledRef.current) return;
      const el = shellRef.current;
      if (!el) return;
      // Move handle may start drag while text was editing — blur first, then allow.
      if (el.querySelector('[data-lp-inline-editing="1"]')) {
        if (!opts?.allowWhileEditing) return;
        el.querySelectorAll('[data-lp-inline-editing="1"]').forEach((node) => {
          try {
            (node as HTMLElement).blur();
          } catch {
            /* ignore */
          }
        });
      }

      let surfaceEl = resolveFreeSurface(el);
      // LeadForm section shell resolves to itself: its own box moves with the drag, so origin/clamp
      // measured against it flip frame to frame and the form jumps to the top-left. Measure against
      // the canvas (the shell's real containing block) instead.
      if (
        surfaceEl === el &&
        el.getAttribute('data-lp-block-type') === 'LeadForm' &&
        el.querySelector('[data-lp-form-hit],[data-lp-form-block],[data-lp-form-card]')
      ) {
        surfaceEl = el.closest<HTMLElement>('[data-lp-canvas-root]') || surfaceEl;
      }
      if (getComputedStyle(surfaceEl).position === 'static') {
        surfaceEl.style.position = 'relative';
      }

      const originalStyle = el.style.cssText;
      const originalWidth = el.style.width;
      const originalMaxWidth = el.style.maxWidth;
      const savedLayout = layoutRef.current;
      const currentLayout = el.dataset.lpOverlapOverride!==undefined && modeRef.current==='offset' && savedLayout ? {...savedLayout,x:0,y:0,rotate:0} : savedLayout;
      const canvasScale = readCanvasPointerScale(el);
      const surfaceRect = surfaceEl.getBoundingClientRect();
      const surfaceCss = surfaceLayoutSize(surfaceEl, canvasScale);
      const box = readRect(el, surfaceRect, canvasScale);
      const useOffset = (opts?.forceMode ?? modeRef.current) === 'offset';
      const preserveBoxSize = opts?.preserveBoxSize === true;

      const siblingEls = Array.from(
        surfaceEl.querySelectorAll<HTMLElement>(
          useOffset ? '[data-lp-free-child="1"],[data-lp-free-box="1"]' : '[data-lp-free-box="1"]',
        ),
      ).filter((node) => node !== el && !node.contains(el) && !el.contains(node));
      const siblings = siblingEls.map((node) => readRect(node, surfaceRect, canvasScale));

      let originX: number;
      let originY: number;
      // Move/rotate/resize start: lock size from saved layout OR live CSS-space rect.
      // Never shrink via measureTightFreeSize on move — that caused card/section collapse + reflow.
      let dragW = Math.round(box.width);
      let dragH = Math.round(box.height);
      const isButtonShell = Boolean(
        el.getAttribute('data-lp-button-shell') === '1' ||
          el.querySelector(
            '[data-lp-button-block],[data-lp-box-block],[data-lp-button-hit],[data-lp-box-hit]',
          ),
      );
      const isFormShell = Boolean(
        el.querySelector('[data-lp-form-hit],[data-lp-form-block],[data-lp-form-card]'),
      );
      const isCompactShell = isButtonShell || isFormShell;

      // Compact shells (button / LeadForm): hug the visible control so free-drag
      // has horizontal room. Legacy full-bleed freeLayout.width === surface width
      // locked maxX=0 and made forms only move vertically.
      if (!useOffset && isCompactShell) {
        const hitEl = el.querySelector<HTMLElement>(
          '[data-lp-form-hit],[data-lp-form-block],[data-lp-form-card],[data-lp-button-hit],[data-lp-box-hit],[data-lp-button-block],[data-lp-box-block]',
        );
        if (hitEl) {
          const hit = readRect(hitEl, surfaceRect, canvasScale);
          if (hit.width >= 8 && hit.height >= 8) {
            const hugW = Math.min(surfaceCss.width, Math.max(40, Math.round(hit.width)));
            const hugH = Math.max(28, Math.round(hit.height));
            const layoutW =
              currentLayout?.width && currentLayout.width > 0 ? currentLayout.width : box.width;
            const fullBleed = layoutW >= surfaceCss.width - 12;
            // Always hug forms; hug buttons on first free or when stuck full-bleed.
            if (isFormShell || !currentLayout || fullBleed) {
              dragW = hugW;
              if (!currentLayout?.height || fullBleed || isFormShell) {
                dragH = hugH;
              }
              // Align shell origin to the painted card (centered form inside padded section).
              if (!currentLayout || fullBleed || isFormShell) {
                box.left = hit.left;
                box.top = hit.top;
              }
            }
          }
        }
      }
      box.width = dragW;
      box.height = dragH;

      if (useOffset) {
        // Offset mode: x/y are translate deltas; box stays in document flow (never vanishes).
        originX = currentLayout?.x ?? 0;
        originY = currentLayout?.y ?? 0;
        // Clear any leftover absolute pin from older buggy builds.
        if(el.style.position==='absolute')el.style.position='relative';
        el.style.left = '';
        el.style.top = '';
        // Lock measured width so children do not reflow while dragging.
        el.style.width = `${dragW}px`;
        el.style.maxWidth = 'none';
        el.style.boxSizing = 'border-box';
        el.style.zIndex = '30';
        // Text hug: don't lock free-layout height during move — unless the text
        // box itself has a persisted height from the 8-handle resize chrome.
        if (el.getAttribute('data-lp-text-hug') === '1') {
          if (el.getAttribute('data-lp-heading-height-locked') === '1') {
            const lockedH = el.style.getPropertyValue('--lp-text-box-height');
            if (lockedH) el.style.height = lockedH;
            el.style.minHeight = 'max-content';
          } else {
            el.style.height = 'auto';
            el.style.minHeight = '0';
          }
        } else {
          el.style.height = `${dragH}px`;
          el.style.minHeight = `${dragH}px`;
        }
      } else {
        // Absolute free: preserveBoxSize is the only path (move/rotate/resize all pass it).
        // Legacy shrink-on-move removed — resize handles own size changes.
        void preserveBoxSize;

        const paintedX = Math.max(0, Math.round(box.left));
        const paintedY = Math.max(0, Math.round(box.top));
        const layoutX = currentLayout?.x;
        const layoutY = currentLayout?.y;
        // Prefer painted origin when layout drifted (or caller asked) — otherwise
        // setting left/top from stale freeLayout jumps the section on pointerdown.
        const layoutDrifted =
          layoutX == null ||
          layoutY == null ||
          Math.abs(layoutX - paintedX) > 2 ||
          Math.abs(layoutY - paintedY) > 2;
        if (opts?.preferPaintedOrigin || layoutDrifted || isFormShell || (isButtonShell && !currentLayout)) {
          originX = paintedX;
          originY = paintedY;
        } else {
          originX = layoutX;
          originY = layoutY;
        }

        // Room to move on both axes — expand virtual canvas beyond short article height.
        const roomH = Math.max(
          surfaceCss.height,
          dragH + 560,
          originY + dragH + 240,
          box.top + dragH + 240,
        );
        const maxX0 = Math.max(0, surfaceCss.width - dragW);
        const maxY0 = Math.max(0, roomH - dragH);
        originX = Math.min(maxX0, Math.max(0, originX));
        originY = Math.min(maxY0, Math.max(0, originY));

        const rot0 = normalizeRotate(currentLayout?.rotate ?? 0);
        el.style.position = 'absolute';
        el.style.left = `${originX}px`;
        el.style.top = `${originY}px`;
        el.style.width = `${dragW}px`;
        el.style.height = `${dragH}px`;
        el.style.minHeight = `${dragH}px`;
        el.style.maxWidth = 'none';
        el.style.boxSizing = 'border-box';
        el.style.zIndex = '50';
        el.style.margin = '0';
        if (rot0) el.style.transform = `rotate(${rot0}deg)`;
        if (!currentLayout) syncCanvasFreeReserve(el);
      }

      const rotate = normalizeRotate(currentLayout?.rotate ?? 0);

      // For offset mode, snap/clamp against the visual box inside the surface.
      const movingLeft = useOffset ? box.left - (currentLayout?.x ?? 0) + originX : originX;
      const movingTop = useOffset ? box.top - (currentLayout?.y ?? 0) + originY : originY;
      const constrainToSurface = useOffset && Boolean(el.closest('[data-lp-section-element="1"]'));
      const canvasH = constrainToSurface ? surfaceCss.height : Math.max(surfaceCss.height, dragH + 560, movingTop + dragH + 240);

      const clampToSafeArea = shouldClampToContentSafeArea(
        el,
        useOffset ? 'offset' : 'absolute',
      );
      const safeArea = clampToSafeArea
        ? resolveSurfaceContentSafeArea(surfaceEl, viewportRef.current)
        : null;

      const session: DragSession = {
        kind: 'move',
        constrainToSurface,
        pointerId,
        originX,
        originY,
        startClientX: clientX,
        startClientY: clientY,
        width: dragW,
        height: dragH,
        reserveHeight: currentLayout?.reserveHeight ?? box.height,
        rotate,
        shiftLock: shiftKey,
        el,
        canvasEl: surfaceEl,
        originalStyle,
        originalWidth,
        originalMaxWidth,
        siblings,
        alignmentBounds: {
          id: 'surface-alignment', left: 0, top: 0,
          width: surfaceCss.width, height: surfaceCss.height,
        },
        canvasBox: {
          id: 'surface',
          left: 0,
          top: 0,
          width: surfaceCss.width,
          height: canvasH,
        },
        safeArea,
        clampToSafeArea,
        raf: null,
        lastGuides: [],
        lastSpacings: [],
        lastX: originX,
        lastY: originY,
        lastW: dragW,
        lastH: dragH,
        lastRotate: rotate,
        canvasScale,
        pendingClientX: clientX,
        pendingClientY: clientY,
        pendingShift: shiftKey,
      };
      // Stash base flow position for offset clamp (natural left/top without current translate).
      session.baseLeft = useOffset ? box.left - (currentLayout?.x ?? 0) : 0;
      session.baseTop = useOffset ? box.top - (currentLayout?.y ?? 0) : 0;
      session.startBaseLeft = session.baseLeft;
      session.startBaseTop = session.baseTop;
      session.startSurfaceLeft = surfaceRect.left;
      session.startSurfaceTop = surfaceRect.top;
      session.mode = useOffset ? 'offset' : 'absolute';
      setFreeDragScrollAnchorLock(true);
      sessionRef.current = session;
      el.setAttribute('data-lp-free-dragging', '1');
      el.style.willChange = 'transform';
      el.style.cursor = 'grabbing';
      try {
        el.setPointerCapture(pointerId);
      } catch {
        /* ignore */
      }
      setDragging(true);
      emitFreeDragFrame();
    },
    [],
  );
  startSessionRef.current = startSession;

  const beginDrag = useCallback(
    (e: ReactPointerEvent, opts?: { force?: boolean; immediate?: boolean }) => {
      if (!enabledRef.current) return;
      if (isLpMarqueeSelecting()) return;
      if (e.button !== 0) return;
      const force = opts?.force === true;
      if (!force && !selectedRef.current) return;
      if (!force && isFreeDragBlockedTarget(e.target)) return;
      const el = shellRef.current;
      if (!el) return;
      if (
        !force &&
        el.querySelector('[data-lp-inline-editing="1"]')
      ) {
        return;
      }
      if ((e.target as HTMLElement | null)?.closest?.('[data-lp-resize-handle],[data-lp-rotate-handle]')) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      pendingRef.current = null;
      if (opts?.immediate) {
        attachWindow(e.pointerId);
        // Move must never shrink — lock live getBoundingClientRect size.
        startSession(e.pointerId, e.clientX, e.clientY, e.shiftKey, {
          preserveBoxSize: true,
          allowWhileEditing: force,
        });
        return;
      }
      // Arm: wait for small move so click-to-select still works.
      pendingRef.current = {
        pointerId: e.pointerId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        shiftKey: e.shiftKey,
      };
      attachWindow(e.pointerId);
    },
    [attachWindow, startSession],
  );

  // Expose imperative begin for vertical Move toolbar (not body pointer events).
  useLayoutEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const beginFromHandle = (e: ReactPointerEvent | PointerEvent) => {
      beginDrag(e as ReactPointerEvent, { force: true, immediate: true });
    };
    const armFromBody = (e: ReactPointerEvent | PointerEvent) => {
      beginDrag(e as ReactPointerEvent, { force: true, immediate: false });
    };
    registerFreeDragBegin(el, beginFromHandle, armFromBody);
    return () => {
      const host = el as LpFreeDragHost;
      const freeId = el.getAttribute('data-lp-free-id');
      if (host.__lpBeginFreeDrag === beginFromHandle) delete host.__lpBeginFreeDrag;
      if (freeId && freeDragBeginByFreeId.get(freeId) === beginFromHandle) {
        freeDragBeginByFreeId.delete(freeId);
      }
      if (freeId) freeDragArmByFreeId.delete(freeId);
    };
  });

  const beginResize = useCallback(
    (handle: FreeResizeHandle, e: ReactPointerEvent) => {
      if (!enabledRef.current || e.button !== 0) return;
      const el = shellRef.current;
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      pendingRef.current = null;
      attachWindow(e.pointerId);
      // Flow section (no freeLayout): resize in offset mode so we never pin
      // position:absolute mid-gesture (that yanked the section out of flow).
      const flowSectionResize =
        !layoutRef.current && el.getAttribute('data-lp-section-chrome') === '1';
      // Preserve current section box — do not shrink full-bleed width on resize start.
      startSession(e.pointerId, e.clientX, e.clientY, e.shiftKey, {
        preserveBoxSize: true,
        preferPaintedOrigin: true,
        ...(flowSectionResize ? { forceMode: 'offset' as const } : null),
      });
      const s = sessionRef.current;
      if (!s) return;
      s.kind = 'resize';
      s.handle = handle;
      lastUserResizeAtRef.current = performance.now();
      s.el.setAttribute('data-lp-free-resizing', '1');
      s.el.style.cursor = resizeHandleCursor(handle);
      s.el.style.height = `${s.height}px`;
      s.el.style.minHeight = `${s.height}px`;
      s.el.style.width = `${s.width}px`;
      if (s.mode !== 'offset') syncCanvasFreeReserve(s.el);
    },
    [attachWindow, startSession],
  );

  const beginRotate = useCallback(
    (e: ReactPointerEvent) => {
      if (!enabledRef.current || e.button !== 0) return;
      const el = shellRef.current;
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      pendingRef.current = null;
      attachWindow(e.pointerId);
      startSession(e.pointerId, e.clientX, e.clientY, e.shiftKey, { preserveBoxSize: true });
      const s = sessionRef.current;
      if (!s) return;
      s.kind = 'rotate';
      const rect = el.getBoundingClientRect();
      s.centerClientX = rect.left + rect.width / 2;
      s.centerClientY = rect.top + rect.height / 2;
      s.startPointerAngle = Math.atan2(e.clientY - s.centerClientY, e.clientX - s.centerClientX);
      s.el.setAttribute('data-lp-free-rotating', '1');
      s.el.style.cursor = 'grabbing';
      setLiveAngle(s.rotate);
    },
    [attachWindow, startSession],
  );

  // Keyboard nudge when selected + free
  useEffect(() => {
    if (!enabled || !selected || !layout) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      if (t?.closest?.('[data-lp-inline-editing="1"]')) return;
      if (
        e.key !== 'ArrowLeft' &&
        e.key !== 'ArrowRight' &&
        e.key !== 'ArrowUp' &&
        e.key !== 'ArrowDown'
      ) {
        return;
      }
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      const next = { ...layout };
      if (e.key === 'ArrowLeft') next.x -= step;
      if (e.key === 'ArrowRight') next.x += step;
      if (e.key === 'ArrowUp') next.y -= step;
      if (e.key === 'ArrowDown') next.y += step;
      next.x = Math.max(0, next.x);
      next.y = Math.max(0, next.y);
      // Canvas minHeight after commit is owned solely by computeCanvasFreeReserveHeight
      // via LandingPageRenderer's own render + effect (see BUG-15) — no imperative
      // re-sync needed here.
      onCommit({ positionMode: 'free', freeLayout: next, viewport });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, selected, layout, onCommit, viewport]);

  // Recompute every render (no useMemo): when dragging, read sessionRef.last*
  // so a parent re-render mid-gesture reapplies the LIVE box instead of wiping
  // transform/left/top (see freeLayoutStyle). Between React renders, pointer
  // handlers still own the DOM imperatively.
  const live: FreeLayoutLiveGeometry | null =
    dragging && sessionRef.current
      ? {
          x: sessionRef.current.lastX,
          y: sessionRef.current.lastY,
          width: sessionRef.current.lastW,
          height: sessionRef.current.lastH,
          rotate: sessionRef.current.lastRotate,
        }
      : null;
  // During flow-section resize there is no freeLayout — still emit a React style
  // from live geometry so parent re-renders do not snap minHeight back to 56.
  const sessMode = dragging ? sessionRef.current?.mode : undefined;
  const shellStyle =
    freeLayoutStyle(layout, dragging, mode, live) ??
    (dragging && live && sessMode === 'offset'
      ? ({
          position: 'relative',
          height: live.height,
          minHeight: live.height,
          ...(live.width > 0 ? { width: live.width, maxWidth: 'none' as const } : null),
          boxSizing: 'border-box',
          ...(live.x || live.y
            ? {
                transform: `translate3d(${live.x}px, ${live.y}px, 0)${
                  live.rotate ? ` rotate(${normalizeRotate(live.rotate)}deg)` : ''
                }`,
              }
            : live.rotate
              ? { transform: `rotate(${normalizeRotate(live.rotate)}deg)` }
              : null),
        } as CSSProperties)
      : undefined);

  return {
    shellRef,
    dragging,
    liveAngle,
    shellStyle,
    beginDrag,
    beginResize,
    beginRotate,
    isActive: () => Boolean(sessionRef.current || pendingRef.current),
    cancelPending: () => {
      if (sessionRef.current) return;
      pendingRef.current = null;
      detachWindow.current?.();
      detachWindow.current = null;
    },
  };
}

/**
 * Absolute free-layout plausibility bounds — single source for drag/resize gate
 * (`isPlausibleFreeLayout`) and Advanced Position clamp (`clampAbsoluteFreeLayout`).
 * Do not duplicate these numbers elsewhere.
 */
export const FREE_LAYOUT_ABSOLUTE_BOUNDS = {
  minPos: -40,
  maxPos: 2400,
  /** Sizes must be strictly > 0 and ≤ maxSize (matches isPlausibleFreeLayout). */
  minSize: 1,
  maxSize: 2400,
} as const;

export const FREE_LAYOUT_OFFSET_BOUNDS = {
  maxAbsPos: ELEMENT_FREE_MAX_Y_PX,
  maxAbsX: ELEMENT_FREE_MAX_X_PX,
  maxSize: 1200,
} as const;

function clampNumber(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Clamp absolute freeLayout so freeLayoutStyle never returns undefined for typed inputs. */
export function clampAbsoluteFreeLayout(
  layout: LandingPageFreeLayout,
): LandingPageFreeLayout {
  const { minPos, maxPos, minSize, maxSize } = FREE_LAYOUT_ABSOLUTE_BOUNDS;
  const next: LandingPageFreeLayout = {
    ...layout,
    x: clampNumber(Number(layout.x) || 0, minPos, maxPos),
    y: clampNumber(Number(layout.y) || 0, minPos, maxPos),
  };
  if (layout.width != null && Number.isFinite(layout.width)) {
    next.width = clampNumber(layout.width, minSize, maxSize);
  }
  if (layout.height != null && Number.isFinite(layout.height)) {
    next.height = clampNumber(layout.height, minSize, maxSize);
    next.reserveHeight = next.height;
  } else if (layout.reserveHeight != null && Number.isFinite(layout.reserveHeight)) {
    next.reserveHeight = clampNumber(layout.reserveHeight, minSize, maxSize);
  }
  if (layout.rotate != null && Number.isFinite(layout.rotate)) {
    next.rotate = layout.rotate;
  }
  return next;
}

/**
 * Patch one Advanced Position field, then clamp the whole layout to absolute bounds.
 * Empty/cleared width|height|rotate stay undefined (optional fields).
 */
export function patchAbsoluteFreeLayoutField(
  prev: LandingPageFreeLayout,
  key: 'x' | 'y' | 'width' | 'height' | 'rotate',
  raw: number | undefined,
): LandingPageFreeLayout {
  const draft: LandingPageFreeLayout = { ...prev };
  if (raw == null || !Number.isFinite(raw)) {
    if (key === 'width' || key === 'height' || key === 'rotate') {
      delete (draft as { width?: number; height?: number; rotate?: number })[key];
      if (key === 'height') delete (draft as { reserveHeight?: number }).reserveHeight;
    } else {
      draft[key] = key === 'x' || key === 'y' ? 0 : draft[key];
    }
    return clampAbsoluteFreeLayout(draft);
  }
  if (key === 'x' || key === 'y') {
    draft[key] = raw;
  } else if (key === 'width' || key === 'height') {
    draft[key] = raw;
    if (key === 'height') draft.reserveHeight = raw;
  } else {
    draft.rotate = raw;
  }
  return clampAbsoluteFreeLayout(draft);
}

/** Drop absurd coords saved under the old canvas-relative bug (box "vanished"). */
export function isPlausibleFreeLayout(
  layout: LandingPageFreeLayout | null | undefined,
  kind: 'absolute' | 'offset' = 'absolute',
): boolean {
  if (!layout) return false;
  if (!Number.isFinite(layout.x) || !Number.isFinite(layout.y)) return false;
  if (kind === 'offset') {
    // Horizontal text offsets may cross columns; keep the existing vertical limit.
    const { maxAbsPos, maxAbsX, maxSize } = FREE_LAYOUT_OFFSET_BOUNDS;
    if (Math.abs(layout.x) > maxAbsX || Math.abs(layout.y) > maxAbsPos) return false;
    if (layout.width != null && (layout.width <= 0 || layout.width > maxSize)) return false;
    return true;
  }
  const { minPos, maxPos, maxSize } = FREE_LAYOUT_ABSOLUTE_BOUNDS;
  if (layout.x < minPos || layout.y < minPos) return false;
  if (layout.x > maxPos || layout.y > maxPos) return false;
  if (layout.width != null && (layout.width <= 0 || layout.width > maxSize)) return false;
  if (layout.height != null && (layout.height <= 0 || layout.height > maxSize)) return false;
  if (layout.rotate != null && !Number.isFinite(layout.rotate)) return false;
  return true;
}

export type FreeLayoutLiveGeometry = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
};

/**
 * Build CSS for a free shell.
 * When `dragging`, pass `live` from the active session so React re-renders
 * (setDragging / parent updates) do NOT wipe el.style.transform|left|top to
 * identity — that 1-frame clear is what made the orange toolbar jump.
 */
export function freeLayoutStyle(
  layout: LandingPageFreeLayout | null,
  dragging: boolean,
  mode: 'absolute' | 'offset' = 'absolute',
  live?: FreeLayoutLiveGeometry | null,
): CSSProperties | undefined {
  if (!layout || !isPlausibleFreeLayout(layout, mode)) return undefined;
  const src = live && dragging
    ? {
        x: live.x,
        y: live.y,
        width: live.width > 0 ? live.width : layout.width,
        height: live.height > 0 ? live.height : layout.height,
        rotate: live.rotate,
        reserveHeight: layout.reserveHeight,
      }
    : layout;
  const rot = normalizeRotate(src.rotate ?? 0);
  // During drag: ALWAYS keep geometry keys in the React style object.
  // Omitting them lets React clear prior transform/left/top → visible jump.
  // Pointer handlers still write the same properties imperatively each frame;
  // re-renders read `live` (session last*) so they do not snap back to origin.
  if (mode === 'offset') {
    return {
      position: 'relative',
      transform: `translate3d(${src.x}px, ${src.y}px, 0)${rot ? ` rotate(${rot}deg)` : ''}`,
      zIndex: dragging ? 30 : 5,
      ...(src.width ? { width: src.width, maxWidth: 'none' } : null),
      // minHeight:0 + overflow:hidden together, not just `height` alone: this
      // element is a CSS grid/flex item (the cards grid — data-lp-cards-grid).
      // Grid/flex items get an implicit "automatic minimum size" equal to their
      // CONTENT's min-content height unless overflow is something other than
      // visible — so an explicit smaller `height` here was silently overridden
      // back up to fit the (icon+title+paragraph) content by the grid algorithm
      // itself, before the box model even got a chance to clip anything. This is
      // why dragging a card's resize handle shorter visually did nothing.
      ...(src.height
        ? {
            height: src.height,
            minHeight: dragging ? src.height : 0,
            overflow: 'hidden' as const,
          }
        : null),
      boxSizing: 'border-box',
      ...(dragging ? { maxWidth: 'none' as const } : null),
    };
  }
  return {
    position: 'absolute',
    left: src.x,
    top: src.y,
    ...(src.width ? { width: src.width, maxWidth: 'none' } : null),
    // Hard height for free sections so reserved canvas space matches painted box.
    // Content that outgrows triggers grow-only commit → reflow siblings.
    ...(src.height
      ? { height: src.height, minHeight: src.height, boxSizing: 'border-box' as const }
      : {
          minHeight: Math.max(1, Math.round(src.reserveHeight || 120)),
          boxSizing: 'border-box' as const,
        }),
    transform: rot ? `rotate(${rot}deg)` : undefined,
    zIndex: dragging ? 50 : 5,
    margin: 0,
    overflow: 'visible',
    ...(dragging ? { maxWidth: 'none' as const } : null),
  };
}

const RESIZE_HANDLES: FreeResizeHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

/** 8 resize handles + top rotate handle (Canva-style). */
export function FreeTransformChrome({
  visible,
  hideHandles = false,
  liveAngle,
  onResizePointerDown,
  onRotatePointerDown,
}: {
  visible: boolean;
  /** Hide handles during active transform but keep angle badge. */
  hideHandles?: boolean;
  liveAngle: number | null;
  onResizePointerDown: (handle: FreeResizeHandle, e: ReactPointerEvent) => void;
  onRotatePointerDown: (e: ReactPointerEvent) => void;
}) {
  if (!visible && liveAngle == null) return null;
  return (
    <div
      data-lp-transform-chrome="1"
      className="pointer-events-none absolute inset-0 z-[18]"
      aria-hidden
    >
      {/* Rotate stick */}
      {!hideHandles ? (
        <div className="pointer-events-none absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-full flex-col items-center">
          <button
            type="button"
            data-lp-rotate-handle
            title="Xoay (giữ Shift để snap 15°)"
            className="pointer-events-auto mb-1 flex h-5 w-5 cursor-grab items-center justify-center rounded-full border-2 border-[#F97316] bg-white text-[#F97316] shadow-sm active:cursor-grabbing"
            onPointerDown={(e) => onRotatePointerDown(e)}
          >
            <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden>
              <path
                fill="currentColor"
                d="M10 4V1L8.5 2.5A5 5 0 1 0 11 7h-1.1A3.9 3.9 0 1 1 8.1 3.1L10 4z"
              />
            </svg>
          </button>
          <div className="h-3 w-px bg-[#F97316]" />
        </div>
      ) : null}
      {liveAngle != null ? (
        <span
          data-lp-rotate-angle
          className="pointer-events-none absolute left-1/2 top-0 z-[19] -translate-x-1/2 -translate-y-[calc(100%+28px)] rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow"
        >
          {Math.round(liveAngle)}°
        </span>
      ) : null}

      {!hideHandles
        ? RESIZE_HANDLES.map((handle) => {
            const cursor = resizeHandleCursor(handle);
            const pos: CSSProperties = {};
            if (handle.includes('n')) pos.top = -5;
            if (handle.includes('s')) pos.bottom = -5;
            if (handle.includes('w')) pos.left = -5;
            if (handle.includes('e')) pos.right = -5;
            if (handle === 'n' || handle === 's') {
              pos.left = '50%';
              pos.transform = 'translateX(-50%)';
            }
            if (handle === 'e' || handle === 'w') {
              pos.top = '50%';
              pos.transform = 'translateY(-50%)';
            }
            return (
              <button
                key={handle}
                type="button"
                data-lp-resize-handle={handle}
                title="Resize"
                className="pointer-events-auto absolute h-2.5 w-2.5 rounded-sm border-2 border-[#F97316] bg-white shadow-sm"
                style={{ ...pos, cursor }}
                onPointerDown={(e) => onResizePointerDown(handle, e)}
              />
            );
          })
        : null}
    </div>
  );
}

export function FreeDragHandle({ title = 'Kéo tự do' }: { title?: string }) {
  return (
    <>
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
        <path
          fill="currentColor"
          d="M4 1h1v1H4V1zm3 0h1v1H7V1zM4 4h1v1H4V4zm3 0h1v1H7V4zM4 7h1v1H4V7zm3 0h1v1H7V7zM1 4h1v1H1V4zm0 3h1v1H1V7zm9-3h1v1h-1V4zm0 3h1v1h-1V7zM4 10h1v1H4v-1zm3 0h1v1H7v-1z"
        />
      </svg>
      <span className="hidden sm:inline">{title === 'Kéo tự do' ? 'Tự do' : title}</span>
    </>
  );
}

export function FlowReserve({
  height,
  editor = false,
}: {
  height?: number;
  /** Builder canvas: show dashed placeholder so free-holes aren't mistaken for empty sections. */
  editor?: boolean;
}) {
  // Always reserve positive space when called for a free section — never collapse slot.
  const h = !height || height <= 0 ? 120 : Math.max(1, Math.round(height));
  if (!editor) {
    return (
      <div
        data-lp-flow-reserve="1"
        data-lp-flow-reserve-fallback={!height || height <= 0 ? '1' : undefined}
        aria-hidden
        style={{
          height: h,
          width: '100%',
          pointerEvents: 'none',
          visibility: 'hidden',
          margin: 0,
          padding: 0,
          border: 0,
        }}
      />
    );
  }
  return (
    <div
      data-lp-flow-reserve="1"
      data-lp-flow-reserve-fallback={!height || height <= 0 ? '1' : undefined}
      aria-hidden
      title="Khoảng giữ chỗ section (free) — click để chọn / Delete để xóa section"
      style={{
        height: h,
        width: '100%',
        pointerEvents: 'auto',
        cursor: 'pointer',
        margin: 0,
        padding: 0,
        border: 0,
        boxSizing: 'border-box',
        background:
          'repeating-linear-gradient(-45deg,rgba(249,115,22,0.06),rgba(249,115,22,0.06) 8px,rgba(249,115,22,0.02) 8px,rgba(249,115,22,0.02) 16px)',
        outline: '1px dashed rgba(249,115,22,0.35)',
        outlineOffset: -1,
      }}
    />
  );
}
