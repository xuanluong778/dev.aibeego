'use client';

/**
 * Editor-only vertical element toolbar (move / save / duplicate / delete).
 * Fixed to the viewport, clamped to the visible landing-page content (never the inspector).
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { createPortal } from 'react-dom';
import {
  elementFromField,
  isItemImageField,
  isSectionLevelElement,
  itemIdFromItemImageField,
  itemImageField,
  lpSelectionKey,
  normalizeLpSelectionTarget,
  type LpSelectionTarget,
} from './landing-page-canvas-selection';
import type { LandingPageCanvasElementKey } from './landing-page-canvas-ux';
import { LP_BLOCK_MIME } from './landing-page-canvas-ux';
import { beginFreeDragByFreeId, beginFreeDragFromShell, cancelAllFreeDrags } from './landing-page-free-drag';
import { beginSectionRowMove, sectionRowElementOf } from './landing-page-section-row-move';
import {
  placeToolbarTopRight,
  readDropObstacles,
  readToolbarPageBounds,
  type DropRect,
} from './landing-page-section-insert-target';

const TOOLBAR_W = 44;
const BTN_H = 44;
// Clears the 8-handle resize chrome (handles straddle the edge) so the bar never steals a resize.
const GAP = 8;
const BAR_H = BTN_H * 4 + 3;
const DRAGGING_SEL =
  '[data-lp-free-dragging="1"],[data-lp-free-resizing="1"],[data-lp-free-rotating="1"]';

function isGestureActive(): boolean {
  return Boolean(document.querySelector(DRAGGING_SEL));
}

function toDropRect(r: DOMRect): DropRect {
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

const TOOLBAR_SEL = '[data-lp-element-vertical-toolbar]';
/** Zoom layer animates `transform`; geometry must be tracked per frame until it settles. */
function isZoomAnimating(): boolean {
  const layer = document.querySelector('[data-lp-canvas-zoom-layer]') as HTMLElement | null;
  try {
    return Boolean(layer?.getAnimations?.().some((a) => a.playState === 'running'));
  } catch {
    return false;
  }
}

type HoverHit = { target: LpSelectionTarget; anchor: HTMLElement };
type ToolbarPos = { left: number; top: number; side: 'left' | 'right' | 'top' | 'bottom' | 'inside' };

/** 4-way move / cross-arrows icon (not up/down only). */
function CrossMoveIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 .75 10.6 3.4H9.1v2.9h2.9V4.8L14.6 8l-2.6 2.6V9.1H9.1v2.9h1.5L8 15.25 5.4 12H6.9V9.1H4v1.5L1.4 8 4 5.4v1.5h2.9V4.8H5.4L8 .75z" />
    </svg>
  );
}

// NOTE: `[data-lp-canvas-context-menu]` is the trigger WRAPPER around the whole canvas — matching it
// made every hover "ignored", so hover never produced a toolbar. Only the popup content is ignored.
const IGNORE_HIT =
  '[data-lp-element-vertical-toolbar],[data-lp-inspector],[data-lp-inspector-rail],[data-lp-text-toolbar],[data-lp-text-color-panel],[data-lp-text-more-menu],[data-lp-canvas-context-menu-content],[data-lp-marquee-selection]';

export type LandingPageElementVerticalToolbarProps = {
  enabled: boolean;
  canvasRootRef: React.RefObject<HTMLElement | null>;
  primaryTarget: LpSelectionTarget | null;
  onSelect: (target: LpSelectionTarget) => void;
  onSave: (target: LpSelectionTarget) => void;
  onDuplicate: (target: LpSelectionTarget) => void;
  onDelete: (target: LpSelectionTarget) => void;
  sectionLocked?: (blockId: string) => boolean;
};

function resolveHit(from: HTMLElement | null): { anchor: HTMLElement; target: LpSelectionTarget } | null {
  if (!from?.closest) return null;
  if (from.closest(IGNORE_HIT)) return null;

  const blockHost = from.closest('[data-lp-block-id]') as HTMLElement | null;
  if (!blockHost) return null;
  const blockId = blockHost.getAttribute('data-lp-block-id');
  if (!blockId) return null;

  // The wrap includes box padding around the editable field: hovering that padding must
  // still resolve to the SAME text element (otherwise hover flips to the section while
  // the pointer travels from the text to its toolbar).
  const inline = (from.closest('[data-lp-inline-field]') ||
    from.closest('[data-lp-inline-wrap]')?.querySelector('[data-lp-inline-field]') ||
    null) as HTMLElement | null;
  if (inline) {
    const field = inline.getAttribute('data-lp-inline-field');
    if (!field) return null;
    const anchor =
      (inline.closest('[data-lp-inline-wrap]') as HTMLElement | null) ||
      (inline.closest('[data-lp-button-block]') as HTMLElement | null) ||
      inline;
    return {
      anchor,
      target: normalizeLpSelectionTarget({
        blockId,
        element: elementFromField(field),
        field,
      }),
    };
  }

  const eidHost = from.closest('[data-lp-element-id]') as HTMLElement | null;
  if (eidHost) {
    const raw = eidHost.getAttribute('data-lp-element-id') || '';
    const sep = raw.indexOf('::');
    if (sep > 0) {
      const bid = raw.slice(0, sep);
      const elKey = raw.slice(sep + 2) as LandingPageCanvasElementKey;
      if (bid === blockId) {
        const fieldAttr = eidHost.getAttribute('data-lp-element-field') || undefined;
        const kind = eidHost.getAttribute('data-lp-element-kind');
        let field = fieldAttr;
        if (
          !field &&
          kind === 'image' &&
          typeof elKey === 'string' &&
          elKey.startsWith('item:') &&
          !elKey.startsWith('item:trust-')
        ) {
          field = itemImageField(elKey.slice(5));
        }
        return {
          anchor: eidHost,
          target: normalizeLpSelectionTarget({ blockId, element: elKey, field }),
        };
      }
    }
  }

  if (from.closest('[data-lp-form-hit]')) {
    const anchor = (from.closest('[data-lp-form-hit]') ||
      from.closest('[data-lp-block-id]')) as HTMLElement;
    return { anchor, target: { blockId, element: 'form' } };
  }

  if (from.closest('[data-lp-button-block]')) {
    const anchor = from.closest('[data-lp-button-block]') as HTMLElement;
    return {
      anchor,
      target: normalizeLpSelectionTarget({ blockId, element: 'cta', field: 'ctaLabel' }),
    };
  }

  if (from.closest('[data-lp-box-block]')) {
    const anchor = from.closest('[data-lp-box-block]') as HTMLElement;
    return {
      anchor,
      target: normalizeLpSelectionTarget({ blockId, element: 'cta', field: 'ctaLabel' }),
    };
  }

  const img = from.closest('[data-lp-content-image]') as HTMLElement | null;
  if (img) {
    const itemHost = img.closest('[data-lp-item-id]') as HTMLElement | null;
    const itemId = itemHost?.getAttribute('data-lp-item-id');
    if (itemId) {
      return {
        anchor: img,
        target: normalizeLpSelectionTarget({
          blockId,
          element: `item:${itemId}`,
          field: itemImageField(itemId),
        }),
      };
    }
    return { anchor: img, target: { blockId, element: 'image' } };
  }

  const gridCell = from.closest('[data-lp-grid-cell]') as HTMLElement | null;
  if (gridCell) {
    const idx = gridCell.getAttribute('data-lp-grid-cell');
    return {
      anchor: gridCell,
      target: { blockId, element: `grid:${idx}` as LandingPageCanvasElementKey },
    };
  }

  if (
    from.closest('[data-lp-section-bg-hit]') ||
    from.closest('[data-lp-selection-target="section-background"]')
  ) {
    const shell =
      (blockHost.closest('[data-lp-section-chrome]') as HTMLElement | null) || blockHost;
    return { anchor: shell, target: { blockId, element: 'section-background' } };
  }

  const shell =
    (blockHost.closest('[data-lp-section-chrome]') as HTMLElement | null) ||
    (blockHost.hasAttribute('data-lp-section-chrome') ? blockHost : blockHost);
  return { anchor: shell, target: { blockId, element: 'section' } };
}

function targetsEqual(a: LpSelectionTarget | null, b: LpSelectionTarget | null): boolean {
  if (!a || !b) return false;
  return lpSelectionKey(a) === lpSelectionKey(b);
}

function findAnchorForTarget(target: LpSelectionTarget): HTMLElement | null {
  const { blockId, element, field } = target;
  const blockEl = document.querySelector(
    `[data-lp-block-id="${CSS.escape(blockId)}"]`,
  ) as HTMLElement | null;
  if (!blockEl) return null;

  // While a free-drag gesture is live, pin to the moving shell (not a stale
  // nested text node whose rect can thrash under parent transform + reflow).
  const dragging = document.querySelector(DRAGGING_SEL) as HTMLElement | null;
  if (dragging) {
    const dragFreeId = dragging.getAttribute('data-lp-free-id') || '';
    const belongs =
      dragFreeId === blockId ||
      dragFreeId.startsWith(`${blockId}::`) ||
      dragging.closest(`[data-lp-block-id="${CSS.escape(blockId)}"]`) === blockEl ||
      blockEl.contains(dragging);
    if (belongs) return dragging;
  }

  if (field) {
    if (isItemImageField(field)) {
      const itemId = itemIdFromItemImageField(field);
      if (itemId) {
        const byField = blockEl.querySelector(
          `[data-lp-element-field="${CSS.escape(field)}"]`,
        ) as HTMLElement | null;
        if (byField) return byField;
        const itemHost = blockEl.querySelector(
          `[data-lp-item-id="${CSS.escape(itemId)}"]`,
        ) as HTMLElement | null;
        const img = itemHost?.querySelector('[data-lp-content-image="1"]') as HTMLElement | null;
        if (img) return img;
      }
    }
    const inline = blockEl.querySelector(
      `[data-lp-inline-field="${CSS.escape(field)}"]`,
    ) as HTMLElement | null;
    if (inline) {
      return (
        (inline.closest('[data-lp-inline-wrap]') as HTMLElement | null) ||
        (inline.closest('[data-lp-button-block]') as HTMLElement | null) ||
        inline
      );
    }
  }

  if (element === 'image') {
    return blockEl.querySelector('[data-lp-content-image="1"]') as HTMLElement | null;
  }
  // Form / section: always anchor to the outer free shell so the vertical toolbar
  // sits beside the section outline — never on nested CTA/privacy text.
  if (element === 'form' || isSectionLevelElement(element)) {
    return (
      (document.querySelector(
        `[data-lp-free-id="${CSS.escape(blockId)}"]`,
      ) as HTMLElement | null) ||
      (blockEl.closest('[data-lp-section-chrome]') as HTMLElement | null) ||
      blockEl
    );
  }
  if (typeof element === 'string' && element.startsWith('grid:')) {
    const idx = element.slice(5);
    return blockEl.querySelector(`[data-lp-grid-cell="${idx}"]`) as HTMLElement | null;
  }
  if (typeof element === 'string' && element.startsWith('item:')) {
    const itemId = element.slice(5);
    return (
      (blockEl.querySelector(`[data-lp-item-id="${CSS.escape(itemId)}"]`) as HTMLElement | null) ||
      (blockEl.querySelector(`[data-lp-free-id="${CSS.escape(`${blockId}::${itemId}`)}"]`) as
        | HTMLElement
        | null)
    );
  }

  const eid = blockEl.querySelector(
    `[data-lp-element-id="${CSS.escape(`${blockId}::${element}`)}"]`,
  ) as HTMLElement | null;
  if (eid) return eid;

  return (blockEl.closest('[data-lp-section-chrome]') as HTMLElement | null) || blockEl;
}

export function LandingPageElementVerticalToolbar({
  enabled,
  canvasRootRef,
  primaryTarget,
  onSelect,
  onSave,
  onDuplicate,
  onDelete,
  sectionLocked,
}: LandingPageElementVerticalToolbarProps) {
  // Three distinct states: hover (nothing selected), selection (pinned), gesture
  // (drag/resize/rotate of the selection). Selection always wins over hover so the
  // frame, the toolbar and every action refer to the same target.
  const [hover, setHover] = useState<HoverHit | null>(null);
  const [toolbarHover, setToolbarHover] = useState(false);
  const [pos, setPos] = useState<ToolbarPos | null>(null);
  const displayTarget = primaryTarget ?? hover?.target ?? null;

  const toolbarElRef = useRef<HTMLDivElement | null>(null);
  const hoverRafRef = useRef<number | null>(null);
  const scheduleRef = useRef<() => void>(() => {});
  const primaryRef = useRef(primaryTarget);
  primaryRef.current = primaryTarget;
  const hoverRef = useRef(hover);
  hoverRef.current = hover;
  const targetRef = useRef(displayTarget);
  targetRef.current = displayTarget;

  // A stale hover must never outlive a selection (it reappeared after deselect).
  useEffect(() => {
    if (primaryTarget) setHover(null);
  }, [primaryTarget]);
  // The toolbar unmounting under the pointer never fires pointerleave.
  useEffect(() => {
    if (!displayTarget) setToolbarHover(false);
  }, [displayTarget]);

  const displayKey = displayTarget ? lpSelectionKey(displayTarget) : '';

  // ONE geometry pipeline: every trigger (scroll, zoom, resize, inspector, DOM/style
  // mutation, drag frames, pointer end) only schedules; one rAF measures and writes.
  useLayoutEffect(() => {
    if (!enabled || !targetRef.current) {
      setPos(null);
      scheduleRef.current = () => {};
      return;
    }
    const root = canvasRootRef.current;
    let raf = 0;
    let observed: HTMLElement | null = null;
    const ro = new ResizeObserver(() => schedule());
    const measure = (): ToolbarPos | null => {
      const target = targetRef.current;
      if (!target) return null;
      // Stable identity: re-resolve from the target each time; the hover anchor is
      // only trusted while it is still attached and nothing is selected.
      const hoverAnchor = !primaryRef.current ? hoverRef.current?.anchor : null;
      const anchor =
        hoverAnchor && hoverAnchor.isConnected ? hoverAnchor : findAnchorForTarget(target);
      if (!anchor || !anchor.isConnected) return null;
      if (anchor !== observed) {
        if (observed) ro.unobserve(observed);
        ro.observe(anchor);
        observed = anchor;
      }
      const r = anchor.getBoundingClientRect();
      if (r.width <= 0 && r.height <= 0) return null;
      const canvas = anchor.closest('[data-lp-canvas-root]') as HTMLElement | null;
      if (!canvas) return null;
      const scroll = document.querySelector('[data-lp-canvas-scroll]') as HTMLElement | null;
      const inspector = document.querySelector(
        '[data-lp-inspector-shell], [data-lp-inspector]',
      ) as HTMLElement | null;
      // Visible landing-page box only: canvas ∩ scrollport, cut before the inspector.
      const bounds = readToolbarPageBounds({
        canvas: toDropRect(canvas.getBoundingClientRect()),
        scroll: scroll ? toDropRect(scroll.getBoundingClientRect()) : null,
        inspector: inspector ? toDropRect(inspector.getBoundingClientRect()) : null,
        contentSafe: null,
      });
      const compact = window.innerHeight < 500;
      // Right beside the target (GAP clears the resize handles), top-aligned and clamped to
      // the visible page box. No room on the right -> left side -> inside the right edge.
      // Hidden when the target is fully out of the visible box.
      const tw = compact ? BAR_H : TOOLBAR_W;
      const th = compact ? TOOLBAR_W : BAR_H;
      const bTop = bounds.top;
      const bBottom = bounds.top + bounds.height;
      const bLeft = bounds.left;
      const bRight = bounds.left + bounds.width;
      const vTop = Math.max(r.top, bTop);
      const vBottom = Math.min(r.bottom, bBottom);
      if (vBottom <= vTop || Math.min(r.right, bRight) <= Math.max(r.left, bLeft)) return null;
      // Preferred: beside the target on a free lane (never over another box).
      const lane = placeToolbarTopRight({
        anchor: toDropRect(r),
        bounds,
        toolbarW: tw,
        toolbarH: th,
        gap: GAP,
        obstacles: readDropObstacles(canvas),
      });
      if (lane && (lane.side === 'right' || lane.side === 'left')) return lane;
      const minTop = bTop + GAP;
      const maxTop = Math.max(minTop, bBottom - th - GAP);
      const top = Math.round(Math.min(maxTop, Math.max(minTop, vTop)));
      if (r.right + GAP + tw <= bRight) return { left: Math.round(r.right + GAP), top, side: 'right' };
      if (r.left - GAP - tw >= bLeft) return { left: Math.round(r.left - GAP - tw), top, side: 'left' };
      return { left: Math.round(bRight - tw - GAP), top, side: 'inside' };
    };
    const run = () => {
      raf = 0;
      const next = measure();
      const el = toolbarElRef.current;
      if (el && next) {
        el.style.left = `${next.left}px`;
        el.style.top = `${next.top}px`;
        el.dataset.lpVerticalToolbarSide = next.side;
      }
      setPos((prev) =>
        prev && next && Math.abs(prev.left - next.left) < 0.5 && Math.abs(prev.top - next.top) < 0.5 && prev.side === next.side
          ? prev
          : next,
      );
      // Keep sampling every frame only while geometry is animating.
      if (isGestureActive() || isZoomAnimating()) schedule();
    };
    function schedule() {
      if (!raf) raf = requestAnimationFrame(run);
    }
    scheduleRef.current = schedule;
    run();

    const mo = new MutationObserver(schedule);
    if (root) {
      mo.observe(root, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['style', 'class'],
      });
      ro.observe(root);
      root.addEventListener('scroll', schedule, { passive: true });
    }
    const inspectorEl = document.querySelector('[data-lp-inspector-shell]') as HTMLElement | null;
    if (inspectorEl) ro.observe(inspectorEl);
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    window.addEventListener('transitionend', schedule, true);
    window.addEventListener('lp-heading-box-resize-end', schedule);
    window.addEventListener('lp-canvas-zoom-change', schedule);
    window.addEventListener('lp-free-drag-frame', schedule);
    window.addEventListener('pointerdown', schedule, true);
    window.addEventListener('pointerup', schedule, true);
    window.addEventListener('pointercancel', schedule, true);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      scheduleRef.current = () => {};
      ro.disconnect();
      mo.disconnect();
      root?.removeEventListener('scroll', schedule);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('transitionend', schedule, true);
      window.removeEventListener('lp-heading-box-resize-end', schedule);
      window.removeEventListener('lp-canvas-zoom-change', schedule);
      window.removeEventListener('lp-free-drag-frame', schedule);
      window.removeEventListener('pointerdown', schedule, true);
      window.removeEventListener('pointerup', schedule, true);
      window.removeEventListener('pointercancel', schedule, true);
    };
  }, [enabled, displayKey, canvasRootRef]);

  // A different hover anchor for the same key (remount) must re-measure.
  useLayoutEffect(() => {
    scheduleRef.current();
  }, [hover]);

  // Hover tracking is document-level and resolved lazily: the canvas scrollport can
  // mount after this component's first effect, which left the old element-bound
  // listener permanently detached (hover never produced a toolbar).
  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      if (toolbarHover || primaryRef.current || isGestureActive()) return;
      const from = e.target as HTMLElement | null;
      if (from?.closest?.(TOOLBAR_SEL)) return;
      // Pointer travelling from the target to its toolbar crosses the GAP strip: treat the bar's
      // rect grown by the gap as part of the bar, so hover does not flip to another target.
      const bar = toolbarElRef.current;
      if (bar && hoverRef.current) {
        const br = bar.getBoundingClientRect();
        // The bar is docked at the right edge, away from its target: the corridor is the
        // box spanning the hovered anchor and the bar.
        const ar = hoverRef.current.anchor.getBoundingClientRect();
        const l = Math.min(ar.left, br.left) - GAP - 2;
        const r = Math.max(ar.right, br.right) + GAP + 2;
        const t = Math.min(ar.top, br.top) - GAP - 2;
        const b = Math.max(ar.bottom, br.bottom) + GAP + 2;
        if (e.clientX >= l && e.clientX <= r && e.clientY >= t && e.clientY <= b) return;
      }
      const root = canvasRootRef.current;
      if (!root || !from || !root.contains(from)) {
        if (hoverRef.current) setHover(null);
        return;
      }
      if (hoverRafRef.current) cancelAnimationFrame(hoverRafRef.current);
      hoverRafRef.current = requestAnimationFrame(() => {
        hoverRafRef.current = null;
        if (primaryRef.current) return;
        const hit = resolveHit(from);
        if (!hit) {
          setHover(null);
          return;
        }
        setHover((prev) =>
          prev && prev.anchor === hit.anchor && targetsEqual(prev.target, hit.target) ? prev : hit,
        );
      });
    };
    const onWindowLeave = (e: PointerEvent) => {
      if (!e.relatedTarget && !primaryRef.current) setHover(null);
    };
    document.addEventListener('pointermove', onMove, { passive: true, capture: true });
    document.documentElement.addEventListener('pointerleave', onWindowLeave);
    return () => {
      document.removeEventListener('pointermove', onMove, true);
      document.documentElement.removeEventListener('pointerleave', onWindowLeave);
      if (hoverRafRef.current) cancelAnimationFrame(hoverRafRef.current);
    };
  }, [enabled, canvasRootRef, toolbarHover]);

  if (!enabled || typeof document === 'undefined' || !displayTarget || !pos) {
    return null;
  }

  const locked = sectionLocked?.(displayTarget.blockId) ?? false;
  // Pure section chrome: HTML5 block reorder on Move.
  // Form uses free-drag (was wrongly lumped into isSection and never moved).
  // LeadForm section selected as 'section' moves like the form (free-drag), not HTML5 reorder.
  const isLeadFormSection =
    displayTarget.element === 'section' &&
    Boolean(
      document.querySelector(
        `[data-lp-block-id="${CSS.escape(displayTarget.blockId)}"][data-lp-block-type="LeadForm"]`,
      ),
    );
  const isSectionReorder = isSectionLevelElement(displayTarget.element) && !isLeadFormSection;
  const isForm = displayTarget.element === 'form' || isLeadFormSection;

  const run =
    (fn: () => void) =>
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (locked) return;
      cancelAllFreeDrags();
      fn();
    };

  const beginElementDrag = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (locked) return;
    // Do not call onSelect here — it can remount canvas chrome mid-gesture and
    // cancel the free-drag session. Target is already the displayTarget.
    const anchor =
      (!primaryTarget && hover?.anchor?.isConnected ? hover.anchor : null) ||
      findAnchorForTarget(displayTarget);
    if (!anchor) return;

    // Section-level only: HTML5 DnD reorder (form is free-drag below).
    if (isSectionReorder) return;

    // Row/column layout elements move between rows/columns (legacy elements keep free drag).
    const rowElement = sectionRowElementOf(anchor);
    if (rowElement) {
      beginSectionRowMove(e, rowElement);
      return;
    }

    // Exit inline edit so drag doesn't fight caret / contentEditable.
    const editing = document.querySelector(
      '[data-lp-inline-editing="1"]',
    ) as HTMLElement | null;
    if (editing) {
      try {
        editing.blur();
      } catch {
        /* ignore */
      }
    }

    const { blockId, element, field } = displayTarget;
    const itemId =
      typeof element === 'string' && element.startsWith('item:') ? element.slice(5) : null;

    // Prefer the most specific free-id FIRST.
    // Form: move the section shell (absolute free) so the whole LeadForm moves.
    // Fall back to ElementChrome `__element:form` if section API is missing.
    const freeIdCandidates = [
      field ? `${blockId}::${field}` : null,
      isForm ? blockId : null,
      isForm ? `${blockId}::__element:form` : null,
      `${blockId}::__element:${String(element)}`,
      itemId && !field ? `${blockId}::${itemId}` : null,
      !field && !isForm ? `${blockId}::${String(element)}` : null,
    ].filter(Boolean) as string[];

    for (const freeId of freeIdCandidates) {
      if (beginFreeDragByFreeId(freeId, e)) return;
      const byId = document.querySelector(
        `[data-lp-free-id="${CSS.escape(freeId)}"]`,
      ) as HTMLElement | null;
      if (byId && beginFreeDragFromShell(byId, e)) return;
    }

    // Fallback: nearest free shell under the anchor (text wrap → item → section).
    const shell =
      (field
        ? (anchor.closest(`[data-lp-free-id="${CSS.escape(`${blockId}::${field}`)}"]`) as
            | HTMLElement
            | null)
        : null) ||
      (isForm
        ? ((document.querySelector(
            `[data-lp-free-id="${CSS.escape(`${blockId}::__element:form`)}"]`,
          ) as HTMLElement | null) ||
            (document.querySelector(
              `[data-lp-free-id="${CSS.escape(blockId)}"]`,
            ) as HTMLElement | null))
        : null) ||
      (anchor.closest('[data-lp-free-id]') as HTMLElement | null) ||
      (anchor.querySelector('[data-lp-free-id]') as HTMLElement | null) ||
      (anchor.closest('[data-lp-section-chrome]') as HTMLElement | null) ||
      anchor;
    if (beginFreeDragFromShell(shell, e)) return;

    // Last resort: on-canvas free-drag handle (item chrome).
    const handle =
      (shell.querySelector('[data-lp-free-drag-handle]') as HTMLElement | null) ||
      (anchor.querySelector('[data-lp-free-drag-handle]') as HTMLElement | null);
    if (handle) {
      handle.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          clientX: e.clientX,
          clientY: e.clientY,
          button: 0,
          pointerId: e.pointerId,
          pointerType: e.pointerType,
        }),
      );
    }
  };

  const toolbar = (
    <div
      ref={toolbarElRef}
      data-lp-element-vertical-toolbar="1"
      data-lp-floating-toolbar="1"
      data-lp-vertical-toolbar-side={pos.side}
      data-lp-toolbar-for={displayTarget.blockId}
      className="pointer-events-auto fixed z-[50] flex flex-col [@media(max-height:500px)]:flex-row rounded-md border border-orange-400/80 bg-[#F97316] shadow-lg"
      style={{ left: pos.left, top: pos.top, width: typeof window !== 'undefined' && window.innerHeight < 500 ? BAR_H : TOOLBAR_W }}
      onPointerEnter={() => setToolbarHover(true)}
      onPointerLeave={(e) => {
        setToolbarHover(false);
        // Leaving the bar to somewhere other than the canvas ends a hover-only session.
        const to = e.relatedTarget as Node | null;
        if (!primaryRef.current && !(to && canvasRootRef.current?.contains(to))) setHover(null);
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        title="Di chuyển"
        aria-label="Di chuyển"
        disabled={locked}
        // Sections only: HTML5 block reorder. Form/items/elements use free-drag.
        draggable={isSectionReorder}
        data-lp-vertical-tool="move"
        data-lp-free-drag-handle={!isSectionReorder ? '1' : undefined}
        data-lp-section-drag-handle={isSectionReorder ? '1' : undefined}
        className="flex h-11 w-full cursor-grab items-center justify-center border-b border-orange-500/40 text-sm text-white hover:bg-orange-600 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
        onPointerDown={(e) => {
          if (isSectionReorder) {
            e.stopPropagation();
            return;
          }
          beginElementDrag(e);
        }}
        onDragStart={(e) => {
          e.stopPropagation();
          if (!isSectionReorder) {
            e.preventDefault();
            return;
          }
          if (locked) {
            e.preventDefault();
            return;
          }
          onSelect(displayTarget);
          e.dataTransfer.setData(LP_BLOCK_MIME, displayTarget.blockId);
          e.dataTransfer.effectAllowed = 'move';
        }}
      >
        <CrossMoveIcon />
      </button>
      <button
        type="button"
        title="Lưu"
        aria-label="Lưu"
        disabled={locked}
        data-lp-vertical-tool="save"
        className="flex h-11 w-full items-center justify-center border-b border-orange-500/40 text-sm text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={run(() => onSave(displayTarget))}
      >
        💾
      </button>
      <button
        type="button"
        title="Nhân bản"
        aria-label="Nhân bản"
        disabled={locked}
        data-lp-vertical-tool="duplicate"
        className="flex h-11 w-full items-center justify-center border-b border-orange-500/40 text-sm text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={run(() => onDuplicate(displayTarget))}
      >
        ⧉
      </button>
      <button
        type="button"
        title="Xóa"
        aria-label="Xóa"
        disabled={locked}
        data-lp-vertical-tool="delete"
        className="flex h-11 w-full items-center justify-center text-sm text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={run(() => onDelete(displayTarget))}
      >
        🗑
      </button>
    </div>
  );

  return createPortal(toolbar, document.body);
}
