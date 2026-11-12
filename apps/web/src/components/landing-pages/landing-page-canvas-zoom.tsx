'use client';

/**
 * Canvas view-zoom for LP Builder — isolated from document/spec state.
 *
 * Live updates mutate DOM (transform + layout spacer) via rAF only.
 * React re-renders are limited to the zoom chrome (% label / buttons).
 * Element coordinates stay in unscaled CSS space; free-drag already
 * divides pointer deltas by readCanvasPointerScale().
 *
 * Inspector dock: never shrink the design CSS width (that reflows cards/gaps).
 * Keep design width as if only the rail were reserved, then fit with a uniform
 * transform scale into the remaining scrollport.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import { Minus, Plus } from 'lucide-react';
import {
  INSPECTOR_RAIL_WIDTH,
  INSPECTOR_SHELL_RIGHT_PX,
} from './landing-page-inspector-rail';

export const LP_CANVAS_ZOOM_MIN = 0.25;
export const LP_CANVAS_ZOOM_MAX = 2;
export const LP_CANVAS_ZOOM_STEP = 0.05;
export const LP_CANVAS_ZOOM_DEFAULT = 1;

const DEVICE_SCROLL_PAD_PX = 24;
/** Desktop fills the green canvas chrome — no extra 10% gutter. */
const DESKTOP_FIT_SCALE = 1;
const DESKTOP_SCROLL_PAD_PX = 0;

type ZoomSnap = {
  scale: number;
  /** True while pointer is scrubbing the zoom slider / holding wheel. */
  scrubbing: boolean;
};

type ZoomStore = {
  snap: ZoomSnap;
  listeners: Set<() => void>;
  layerEl: HTMLElement | null;
  slotEl: HTMLElement | null;
  scrollEl: HTMLElement | null;
  /** Locked design (unscaled) width — stable across Inspector open/close. */
  naturalW: number;
  naturalH: number;
  /** Editor fit so docked Inspector does not cover / reflow the LP (× user zoom). */
  fitScale: number;
  raf: number | null;
  pending: number | null;
  pendingAnchor: { clientX: number; clientY: number } | null;
  scrubbing: boolean;
  /** True while applyZoomDom mutates DOM — ResizeObserver must ignore. */
  applying: boolean;
  /** Last locked design width (hysteresis vs scrollbar flicker). */
  lockedDesignW: number;
};

const store: ZoomStore = {
  snap: { scale: LP_CANVAS_ZOOM_DEFAULT, scrubbing: false },
  listeners: new Set(),
  layerEl: null,
  slotEl: null,
  scrollEl: null,
  naturalW: 0,
  naturalH: 0,
  fitScale: 1,
  raf: null,
  pending: null,
  pendingAnchor: null,
  scrubbing: false,
  applying: false,
  lockedDesignW: 0,
};

function emit() {
  store.listeners.forEach((l) => l());
}

function clampZoom(n: number): number {
  if (!Number.isFinite(n)) return LP_CANVAS_ZOOM_DEFAULT;
  return Math.min(LP_CANVAS_ZOOM_MAX, Math.max(LP_CANVAS_ZOOM_MIN, n));
}

function isInspectorDockOpen(scroll: HTMLElement | null): boolean {
  const layout = scroll?.closest('[data-lp-builder-layout]') as HTMLElement | null;
  return layout?.getAttribute('data-lp-inspector-dock') === 'open';
}

/** Mobile/tablet use a fixed device frame — no desktop design-width lock. */
function isDeviceViewport(scroll: HTMLElement | null): boolean {
  const v = scroll?.getAttribute('data-lp-viewport');
  return v === 'mobile' || v === 'tablet';
}

/**
 * Design width for layout (% / grid / gaps). When Inspector panel is open the
 * scrollport is narrower — add the panel strip back so CSS layout stays identical
 * to the rail-only state (no responsive reflow).
 *
 * Device frames: use scrollport width only (stable). Never size from the scaled
 * device slot — that feedback-loops with device fit-scale (zoom pulse).
 *
 * Hysteresis (≥2px) avoids scrollbar show/hide oscillating clientWidth.
 */
function resolveDesignWidth(scroll: HTMLElement): number {
  // Device screens keep their own logical width; their fit host may be narrower than 320px.
  const pad = isDeviceViewport(scroll) ? DEVICE_SCROLL_PAD_PX : DESKTOP_SCROLL_PAD_PX;
  const raw = Math.max(isDeviceViewport(scroll) ? 1 : 320, scroll.clientWidth - pad);
  let next = raw;
  if (isDeviceViewport(scroll)) {
    next = raw;
  } else if (isInspectorDockOpen(scroll)) {
    const slot = scroll.closest('[data-lp-builder-layout]')?.querySelector('[data-lp-inspector-slot]') as HTMLElement | null;
    next = raw + Math.max(0, (slot?.offsetWidth || 0) - INSPECTOR_RAIL_WIDTH - INSPECTOR_SHELL_RIGHT_PX);
  }
  if (!isDeviceViewport(scroll)) next = Math.max(1280, next);
  if (store.lockedDesignW > 0 && Math.abs(next - store.lockedDesignW) < 2) {
    return store.lockedDesignW;
  }
  store.lockedDesignW = next;
  return next;
}

/**
 * Uniform fit into the visible scrollport (same scale on X and Y — no reflow).
 * Desktop uses the full canvas width (no extra gutter). Tall pages scroll vertically.
 *
 * Device frames handle their own upscale/fit — keep canvas fit at 1.
 */
function resolveFitScale(
  scroll: HTMLElement,
  designW: number,
  _designH: number,
): number {
  if (isDeviceViewport(scroll)) return 1;
  const availW = Math.max(1, scroll.clientWidth - DESKTOP_SCROLL_PAD_PX);
  const sx = availW / Math.max(1, designW);
  let fit = Math.min(1, sx) * DESKTOP_FIT_SCALE;
  if (!Number.isFinite(fit) || fit <= 0.05) fit = DESKTOP_FIT_SCALE;
  // Hysteresis: ignore sub-percent fit jitter from scrollbar flicker.
  if (store.fitScale > 0.05 && Math.abs(fit - store.fitScale) < 0.004) {
    return store.fitScale;
  }
  return fit;
}

function measureNatural(): { w: number; h: number } {
  const layer = store.layerEl;
  if (!layer) return { w: store.naturalW || 1, h: store.naturalH || 1 };
  const scroll = store.scrollEl;
  // Device: zoom layer width = scrollport (stable). Height from content only.
  if (scroll && isDeviceViewport(scroll)) {
    const w = resolveDesignWidth(scroll);
    const content = layer.firstElementChild as HTMLElement | null;
    const h = Math.max(
      1,
      content?.offsetHeight || layer.offsetHeight || store.naturalH || 1,
    );
    store.naturalW = w;
    store.naturalH = h;
    return { w, h };
  }
  // Measure the content root (not the slot) so slot width = natural*scale
  // never feeds back into a percentage-based layer width.
  const content = layer.firstElementChild as HTMLElement | null;
  const w = Math.max(
    1,
    content?.offsetWidth || layer.offsetWidth || store.naturalW || 1,
  );
  const h = Math.max(
    1,
    content?.offsetHeight || layer.offsetHeight || store.naturalH || 1,
  );
  store.naturalW = w;
  store.naturalH = h;
  return { w, h };
}

function applyZoomDom(scale: number, anchor: { clientX: number; clientY: number } | null) {
  const layer = store.layerEl;
  const slot = store.slotEl;
  const scroll = store.scrollEl;
  if (!layer || !slot) return;

  store.applying = true;

  const prevEffective =
    (store.snap.scale > 0.05 ? store.snap.scale : 1) *
    (store.fitScale > 0.05 ? store.fitScale : 1);
  const user = clampZoom(scale);

  // Lock CSS layout width to design size BEFORE measuring height / applying fit.
  if (scroll) {
    const designW = resolveDesignWidth(scroll);
    layer.style.width = `${designW}px`;
    layer.style.maxWidth = '';
    if (isDeviceViewport(scroll)) {
      layer.style.marginLeft = 'auto';
      layer.style.marginRight = 'auto';
    } else {
      layer.style.marginLeft = '';
      layer.style.marginRight = '';
    }
    store.naturalW = designW;
  }

  const { w, h } = measureNatural();
  const fit = scroll ? resolveFitScale(scroll, w, h) : 1;
  store.fitScale = fit;
  const next = user * fit;

  // Lock layer to unscaled CSS size; visual size comes only from transform.
  layer.style.width = `${w}px`;
  if (scroll && isDeviceViewport(scroll)) {
    layer.style.marginLeft = 'auto';
    layer.style.marginRight = 'auto';
    slot.style.marginLeft = 'auto';
    slot.style.marginRight = 'auto';
  } else {
    slot.style.marginLeft = '';
    slot.style.marginRight = '';
  }
  layer.style.transformOrigin = '0 0';
  // Only animate intentional user zoom — fit remesures must be instant or they
  // read as a continuous zoom-in/zoom-out pulse.
  const prevUser = store.snap.scale;
  if (!store.scrubbing && Math.abs(user - prevUser) > 0.001) {
    layer.style.transition = 'transform 200ms ease';
  } else {
    layer.style.transition = '';
  }
  layer.style.transform = Math.abs(next - 1) < 0.001 ? '' : `scale(${next})`;
  layer.style.willChange = Math.abs(next - 1) < 0.001 ? '' : 'transform';
  layer.setAttribute('data-lp-canvas-zoom', String(next));
  layer.setAttribute('data-lp-canvas-zoom-user', String(user));
  layer.setAttribute('data-lp-canvas-fit', String(fit));
  // Editor chrome (element toolbar) listens for this; nothing else emitted it before.
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('lp-canvas-zoom-change'));

  const desktopFrame = scroll != null && !isDeviceViewport(scroll);
  // Flush to the canvas chrome so Desktop uses the full working width.
  layer.style.borderRadius = '';
  layer.style.boxShadow = '';
  if (desktopFrame) layer.setAttribute('data-lp-desktop-frame', '1');
  else layer.removeAttribute('data-lp-desktop-frame');

  // Spacer drives scrollable area without reflowing document/element layout in React.
  slot.style.width = `${Math.ceil(w * next)}px`;
  slot.style.height = `${Math.ceil(h * next)}px`;
  slot.style.minHeight = `${Math.ceil(h * next)}px`;

  if (scroll && anchor && prevEffective > 0.05) {
    const rect = scroll.getBoundingClientRect();
    const x = anchor.clientX - rect.left + scroll.scrollLeft;
    const y = anchor.clientY - rect.top + scroll.scrollTop;
    const contentX = x / prevEffective;
    const contentY = y / prevEffective;
    scroll.scrollLeft = contentX * next - (anchor.clientX - rect.left);
    scroll.scrollTop = contentY * next - (anchor.clientY - rect.top);
  }

  store.snap = { scale: user, scrubbing: store.scrubbing };

  // Clear applying after layout settles so RO does not re-enter.
  requestAnimationFrame(() => {
    store.applying = false;
  });
}

function flushRaf() {
  store.raf = null;
  const next = store.pending;
  if (next == null) return;
  const anchor = store.pendingAnchor;
  store.pending = null;
  applyZoomDom(next, anchor);
  emit();
}

function scheduleZoom(next: number, anchor: { clientX: number; clientY: number } | null) {
  store.pending = clampZoom(next);
  if (anchor) store.pendingAnchor = anchor;
  if (store.raf != null) return;
  store.raf = requestAnimationFrame(flushRaf);
}

export function getCanvasZoom(): number {
  return store.snap.scale;
}

export function getCanvasFitScale(): number {
  return store.fitScale > 0.05 ? store.fitScale : 1;
}

export function subscribeCanvasZoom(onStoreChange: () => void): () => void {
  store.listeners.add(onStoreChange);
  return () => store.listeners.delete(onStoreChange);
}

export function getCanvasZoomSnapshot(): ZoomSnap {
  return store.snap;
}

export function setCanvasZoom(
  next: number,
  opts?: {
    anchor?: { clientX: number; clientY: number } | null;
    scrubbing?: boolean;
  },
) {
  if (opts?.scrubbing != null) store.scrubbing = opts.scrubbing;
  scheduleZoom(next, opts?.anchor ?? null);
}

export function bumpCanvasZoom(
  delta: number,
  anchor?: { clientX: number; clientY: number } | null,
) {
  setCanvasZoom((store.pending ?? store.snap.scale) + delta, { anchor: anchor ?? null });
}

export function bindCanvasZoomElements(els: {
  layer: HTMLElement | null;
  slot: HTMLElement | null;
  scroll: HTMLElement | null;
}) {
  store.layerEl = els.layer;
  store.slotEl = els.slot;
  store.scrollEl = els.scroll;
  if (els.layer && els.slot) {
    applyZoomDom(store.snap.scale, null);
  }
}

export function remeasureCanvasZoomNatural() {
  if (!store.layerEl || !store.slotEl) return;
  if (store.applying) return;
  applyZoomDom(store.snap.scale, null);
}

/** Recompute dock fit after Inspector open/close (editor viewport only). */
export function syncCanvasZoomToInspectorDock() {
  if (!store.layerEl || !store.slotEl) return;
  store.lockedDesignW = 0; // force re-lock for new dock width
  applyZoomDom(store.snap.scale, null);
  emit();
}

export function useCanvasZoom(): ZoomSnap {
  return useSyncExternalStore(subscribeCanvasZoom, getCanvasZoomSnapshot, getCanvasZoomSnapshot);
}

/** Wraps the renderer; zoom is applied here — never via setSpec / Builder re-render. */
export function LandingPageCanvasZoomLayer({ children }: { children: ReactNode }) {
  const slotRef = useRef<HTMLDivElement | null>(null);
  const layerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const slot = slotRef.current;
    const scroll =
      (layer?.closest('[data-lp-canvas-scroll]') as HTMLElement | null) ||
      (document.querySelector('[data-lp-canvas-scroll]') as HTMLElement | null);
    bindCanvasZoomElements({ layer, slot, scroll });

    if (!layer || typeof ResizeObserver === 'undefined') {
      return () => bindCanvasZoomElements({ layer: null, slot: null, scroll: null });
    }

    // Observe unscaled content size (first child), not the scaled slot.
    let roRaf: number | null = null;
    const ro = new ResizeObserver(() => {
      if (store.applying || store.scrubbing) return;
      if (roRaf != null) return;
      roRaf = requestAnimationFrame(() => {
        roRaf = null;
        if (store.applying || store.scrubbing) return;
        remeasureCanvasZoomNatural();
      });
    });
    const content = layer.firstElementChild;
    if (content) ro.observe(content);
    else ro.observe(layer);
    // Scrollport size changes (Inspector dock) → refit via transform only.
    // Never rewrite design width to the shrunken clientWidth (that reflows LP CSS).
    if (scroll) {
      const scrollRo = new ResizeObserver(() => {
        if (store.applying || store.scrubbing) return;
        remeasureCanvasZoomNatural();
      });
      scrollRo.observe(scroll);
      const layout = scroll.closest('[data-lp-builder-layout]');
      let mo: MutationObserver | null = null;
      if (layout && typeof MutationObserver !== 'undefined') {
        mo = new MutationObserver(() => {
          if (store.applying || store.scrubbing) return;
          syncCanvasZoomToInspectorDock();
        });
        mo.observe(layout, {
          attributes: true,
          attributeFilter: ['data-lp-inspector-dock'],
        });
      }
      // Viewport switch (desktop/tablet/mobile) → clear locked width.
      const viewportMo = new MutationObserver(() => {
        store.lockedDesignW = 0;
        if (store.applying || store.scrubbing) return;
        remeasureCanvasZoomNatural();
      });
      viewportMo.observe(scroll, {
        attributes: true,
        attributeFilter: ['data-lp-viewport'],
      });
      return () => {
        ro.disconnect();
        scrollRo.disconnect();
        mo?.disconnect();
        viewportMo.disconnect();
        if (roRaf != null) cancelAnimationFrame(roRaf);
        bindCanvasZoomElements({ layer: null, slot: null, scroll: null });
      };
    }
    return () => {
      ro.disconnect();
      if (roRaf != null) cancelAnimationFrame(roRaf);
      bindCanvasZoomElements({ layer: null, slot: null, scroll: null });
    };
  }, []);

  return (
    <div
      ref={slotRef}
      data-lp-canvas-zoom-slot="1"
      className="relative mx-auto"
      style={{ transformOrigin: '0 0' }}
    >
      <div
        ref={layerRef}
        data-lp-canvas-zoom-layer="1"
        data-lp-canvas-zoom={String(store.snap.scale)}
        className="relative"
        style={{ transformOrigin: '0 0' }}
      >
        {children}
      </div>
    </div>
  );
}

/** Ctrl/Meta + wheel → canvas zoom (keeps cursor as anchor). */
export function handleCanvasZoomWheel(e: ReactWheelEvent | WheelEvent): boolean {
  if (!(e.ctrlKey || e.metaKey)) return false;
  e.preventDefault();
  e.stopPropagation();
  const delta = e.deltaY > 0 ? -LP_CANVAS_ZOOM_STEP : LP_CANVAS_ZOOM_STEP;
  bumpCanvasZoom(delta, { clientX: (e as WheelEvent).clientX, clientY: (e as WheelEvent).clientY });
  return true;
}

export function LandingPageCanvasZoomControls() {
  const { scale } = useCanvasZoom();
  const pct = Math.round(scale * 100);
  const scrubbingRef = useRef(false);
  const [sliderDraft, setSliderDraft] = useState<number | null>(null);

  const onSliderInput = useCallback((raw: number) => {
    const next = clampZoom(raw / 100);
    // Keep controlled input in sync immediately; the canvas itself paints on rAF.
    setSliderDraft(Math.round(next * 100));
    const scroll = store.scrollEl;
    const anchor = scroll
      ? {
          clientX: scroll.getBoundingClientRect().left + scroll.clientWidth / 2,
          clientY: scroll.getBoundingClientRect().top + scroll.clientHeight / 2,
        }
      : null;
    setCanvasZoom(next, { anchor, scrubbing: true });
  }, []);

  const endScrub = useCallback(() => {
    scrubbingRef.current = false;
    store.scrubbing = false;
    if (store.raf != null) {
      cancelAnimationFrame(store.raf);
      store.raf = null;
    }
    if (store.pending != null) flushRaf();
    else remeasureCanvasZoomNatural();
    setSliderDraft(null);
    emit();
  }, []);

  return (
    <div
      data-lp-canvas-zoom-controls="1"
      className="pointer-events-auto flex max-w-full items-center gap-1 rounded-xl border border-white/15 bg-zinc-950/90 px-1.5 py-1 shadow-lg backdrop-blur-sm"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        title="Zoom Out"
        aria-label="Zoom Out"
        data-lp-zoom-out
        disabled={scale <= LP_CANVAS_ZOOM_MIN + 0.001}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white/90 hover:bg-white/10 disabled:opacity-40"
        onClick={() => {
          const scroll = store.scrollEl;
          const anchor = scroll
            ? {
                clientX: scroll.getBoundingClientRect().left + scroll.clientWidth / 2,
                clientY: scroll.getBoundingClientRect().top + scroll.clientHeight / 2,
              }
            : null;
          bumpCanvasZoom(-LP_CANVAS_ZOOM_STEP, anchor);
        }}
      >
        <Minus className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <input
        type="range"
        data-lp-zoom-slider
        aria-label="Zoom"
        min={Math.round(LP_CANVAS_ZOOM_MIN * 100)}
        max={Math.round(LP_CANVAS_ZOOM_MAX * 100)}
        step={Math.round(LP_CANVAS_ZOOM_STEP * 100)}
        value={sliderDraft ?? pct}
        className="h-11 min-w-0 w-20 accent-emerald-400 sm:w-28"
        onPointerDown={() => {
          scrubbingRef.current = true;
          store.scrubbing = true;
        }}
        onPointerUp={endScrub}
        onPointerCancel={endScrub}
        onBlur={endScrub}
        onKeyUp={endScrub}
        onChange={(e) => onSliderInput(Number(e.target.value))}
      />
      <button
        type="button"
        title="Zoom In"
        aria-label="Zoom In"
        data-lp-zoom-in
        disabled={scale >= LP_CANVAS_ZOOM_MAX - 0.001}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white/90 hover:bg-white/10 disabled:opacity-40"
        onClick={() => {
          const scroll = store.scrollEl;
          const anchor = scroll
            ? {
                clientX: scroll.getBoundingClientRect().left + scroll.clientWidth / 2,
                clientY: scroll.getBoundingClientRect().top + scroll.clientHeight / 2,
              }
            : null;
          bumpCanvasZoom(LP_CANVAS_ZOOM_STEP, anchor);
        }}
      >
        <Plus className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        title="Reset 100%"
        aria-label="Reset zoom 100%"
        data-lp-zoom-pct
        className="min-w-[3.25rem] rounded-lg px-1.5 py-1 text-center text-[11px] font-medium tabular-nums text-white/80 hover:bg-white/10"
        onClick={() => {
          const scroll = store.scrollEl;
          const anchor = scroll
            ? {
                clientX: scroll.getBoundingClientRect().left + scroll.clientWidth / 2,
                clientY: scroll.getBoundingClientRect().top + scroll.clientHeight / 2,
              }
            : null;
          setCanvasZoom(1, { anchor, scrubbing: false });
        }}
      >
        {pct}%
      </button>
    </div>
  );
}
