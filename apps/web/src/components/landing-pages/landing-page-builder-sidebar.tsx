'use client';

/**
 * Compact left sidebar for Landing Page Builder (additive UX).
 * Collapsed icon rail + overlay panels (Layers / Theme / Add elements + Section presets).
 * Only lists block types that already render + persist in the engine.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import type { LandingPageBlock, LandingPageBlockType, LandingPageSpec } from '@marketingspa/shared';
import { LANDING_PAGE_BLOCK_TYPES } from '@marketingspa/shared';
import type { LandingPageQuickThemeId } from '@marketingspa/shared';
import { LandingPageThemeSwitcher } from './landing-page-theme-switcher';
import {
  LandingPageTextPresetsPanel,
  type LandingPageListPreset,
  type LandingPageParagraphPreset,
  type LandingPageTitlePreset,
  type TextPresetTab,
} from './landing-page-title-presets';
import {
  LandingPageButtonPresetsPanel,
  type LandingPageButtonGroupPreset,
  type LandingPageButtonPreset,
  type ButtonPresetTab,
} from './landing-page-button-presets';
import {
  type LandingPageBoxPreset,
} from './landing-page-box-presets';
import type { LandingPageFormPreset } from './landing-page-form-presets';
import { LandingPageGraphicsLibraryPanel } from './landing-page-graphics-library';
import {
  beginSidebarPresetDrag,
  ignoreSidebarElementClick,
  type LpSidebarPresetPayload,
  LP_SIDEBAR_CLOSE_OVERLAY_EVENT,
  requestCloseSidebarOverlay,
} from './landing-page-sidebar-dnd';
import { RailIconHoverLabel } from './rail-icon-hover-label';
import { cn } from '@/lib/utils';
import { MAIN_SIDEBAR_WIDTH_EVENT } from '@/components/layout/main-sidebar-collapse';

type RailPanel = 'layers' | 'theme' | 'add' | 'text' | 'button' | 'graphics' | 'icon' | null;
type AddTab = 'elements' | 'presets';

/** Exact 17 live block types — order matches LANDING_PAGE_BLOCK_TYPES. */
export const LP_ADD_ELEMENT_CATALOG: Array<{
  type: LandingPageBlockType;
  label: string;
  icon: string;
  beta?: boolean;
}> = [
  { type: 'Header', label: 'Header', icon: '☰' },
  { type: 'Hero', label: 'Hero', icon: '▣' },
  { type: 'Benefits', label: 'Benefits', icon: '≡' },
  { type: 'Features', label: 'Features', icon: '✦' },
  { type: 'Product', label: 'Product', icon: '▣' },
  { type: 'Pricing', label: 'Pricing', icon: '₫' },
  { type: 'Testimonials', label: 'Testimonials', icon: '★' },
  { type: 'Gallery', label: 'Gallery', icon: '🖼' },
  { type: 'Video', label: 'Video', icon: '▶' },
  { type: 'Process', label: 'Process', icon: '↳' },
  { type: 'Speaker', label: 'Speaker', icon: '👤' },
  { type: 'Guarantee', label: 'Guarantee', icon: '✓' },
  { type: 'FAQ', label: 'FAQ', icon: '▤' },
  { type: 'LeadForm', label: 'Biểu mẫu', icon: '▭' },
  { type: 'CTA', label: 'CTA', icon: '⏺' },
  { type: 'Footer', label: 'Footer', icon: '▁' },
  { type: 'Countdown', label: 'Countdown', icon: '⏱' },
];

const ALLOWED = new Set<string>(LANDING_PAGE_BLOCK_TYPES);
export const LP_ADD_ELEMENTS_LIVE = LP_ADD_ELEMENT_CATALOG.filter((row) => ALLOWED.has(row.type));

/**
 * Compact rail quick-insert (icon-only) — maps to existing live block types only.
 * Order: Hình ảnh → Tiêu đề → Đoạn văn → Nút bấm → Đồ họa → Biểu tượng → Video
 */
export const LP_RAIL_QUICK_INSERT: Array<{
  id: string;
  type: LandingPageBlockType;
  label: string;
}> = [
  { id: 'image', type: 'Gallery', label: 'Hình ảnh' },
  { id: 'heading', type: 'Hero', label: 'Tiêu đề' },
  { id: 'paragraph', type: 'Benefits', label: 'Đoạn văn' },
  { id: 'button', type: 'CTA', label: 'Nút bấm' },
  { id: 'graphics', type: 'Product', label: 'Đồ họa' },
  { id: 'icon', type: 'Features', label: 'Biểu tượng' },
  { id: 'video', type: 'Video', label: 'Video' },
].filter((row) => ALLOWED.has(row.type)) as Array<{
  id: string;
  type: LandingPageBlockType;
  label: string;
}>;

/** Section presets — compositions of existing block types only (no new types). */
export const LP_SECTION_PRESETS: Array<{
  id: string;
  label: string;
  description: string;
  types: LandingPageBlockType[];
}> = [
  {
    id: 'hero-cta',
    label: 'Hero + CTA',
    description: 'Mở đầu + nút hành động',
    types: ['Hero', 'CTA'],
  },
  {
    id: 'hero-benefits-cta',
    label: 'Hero + Benefits + CTA',
    description: 'Hero, lợi ích, kêu gọi',
    types: ['Hero', 'Benefits', 'CTA'],
  },
  {
    id: 'benefits-features',
    label: 'Benefits + Features',
    description: 'Lợi ích và tính năng',
    types: ['Benefits', 'Features'],
  },
  {
    id: 'pricing-testimonials',
    label: 'Pricing + Testimonials',
    description: 'Bảng giá + review',
    types: ['Pricing', 'Testimonials'],
  },
  {
    id: 'faq-leadform',
    label: 'FAQ + LeadForm',
    description: 'Hỏi đáp + form đăng ký',
    types: ['FAQ', 'LeadForm'],
  },
  {
    id: 'product-pricing-cta',
    label: 'Product + Pricing + CTA',
    description: 'Sản phẩm, giá, CTA',
    types: ['Product', 'Pricing', 'CTA'],
  },
  {
    id: 'video-cta',
    label: 'Video + CTA',
    description: 'Video thuyết phục + nút',
    types: ['Video', 'CTA'],
  },
  {
    id: 'countdown-leadform',
    label: 'Countdown + LeadForm',
    description: 'Urgency + form',
    types: ['Countdown', 'LeadForm'],
  },
  {
    id: 'social-proof-cta',
    label: 'Testimonials + Guarantee + CTA',
    description: 'Niềm tin + cam kết + CTA',
    types: ['Testimonials', 'Guarantee', 'CTA'],
  },
  {
    id: 'conversion-core',
    label: 'Funnel chuyển đổi',
    description: 'Hero → Benefits → Pricing → FAQ → Form → CTA',
    types: ['Hero', 'Benefits', 'Pricing', 'FAQ', 'LeadForm', 'CTA'],
  },
].map((p) => ({
  ...p,
  types: p.types.filter((t) => ALLOWED.has(t)),
})) as Array<{
  id: string;
  label: string;
  description: string;
  types: LandingPageBlockType[];
}>;

const LP_TOOLBAR_STORAGE_KEY = 'mkspa.lpBuilderToolbar.v1';
const TOOLBAR_MAX_HEIGHT = 400;
const TOOLBAR_MAX_WIDTH = 400;
/** Snap gap when user drops near the website sidebar edge. */
const GAP_SNAP_NEAR = 20;
const GAP_SNAP_CLOSE = 8;
const GAP_SNAP_FAR = 16;
type ToolbarOrientation = 'vertical' | 'horizontal';

type StoredToolbarState = {
  /** @deprecated absolute left — migrated to gapX */
  x?: number;
  y: number;
  /** Horizontal gap from website sidebar right edge: toolbarLeft = sidebarRight + gapX */
  gapX?: number;
  orientation: ToolbarOrientation;
  collapsed: boolean;
};

function readStoredToolbarState(): Partial<StoredToolbarState> | null {
  try {
    const raw = localStorage.getItem(LP_TOOLBAR_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<StoredToolbarState>;
  } catch {
    return null;
  }
}

/** Parse --app-sidebar-width from AppShell (target width; changes instantly on toggle). */
function readAppSidebarWidthPx(): number | null {
  if (typeof window === 'undefined') return null;
  const shell = document.querySelector('[data-main-sidebar-collapsed]');
  const raw = (
    shell instanceof HTMLElement
      ? getComputedStyle(shell).getPropertyValue('--app-sidebar-width')
      : getComputedStyle(document.documentElement).getPropertyValue('--app-sidebar-width')
  ).trim();
  if (!raw) return null;
  if (raw.endsWith('rem')) {
    const rem = parseFloat(raw) || 16;
    return rem * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);
  }
  if (raw.endsWith('px')) return parseFloat(raw) || null;
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

/**
 * Right edge (px) of the main app/website sidebar.
 * - live: getBoundingClientRect (tracks CSS width transition)
 * - target: --app-sidebar-width (instant end value on collapse/expand)
 * Never hardcodes separate open/closed toolbar left values.
 */
function getWebsiteSidebarRight(mode: 'live' | 'target' = 'live'): number {
  if (typeof window === 'undefined') return 256;
  if (mode === 'target') {
    const w = readAppSidebarWidthPx();
    if (w != null && w > 0) return w; // aside is lg:left-0 → right === width
  }
  const el = document.querySelector('[data-testid="main-app-sidebar"]');
  if (el instanceof HTMLElement) {
    const r = el.getBoundingClientRect();
    if (r.width > 0) return r.right;
  }
  const w = readAppSidebarWidthPx();
  if (w != null && w > 0) return w;
  return 256;
}

function snapGapToSidebarEdge(gapX: number): number {
  if (gapX < 0) return gapX;
  if (gapX <= GAP_SNAP_NEAR) {
    return gapX <= (GAP_SNAP_CLOSE + GAP_SNAP_FAR) / 2 ? GAP_SNAP_CLOSE : GAP_SNAP_FAR;
  }
  return gapX;
}

function measureDefaultToolbarPosition(): { x: number; y: number; gapX: number } {
  if (typeof window === 'undefined') return { x: 280, y: 108, gapX: 8 };
  const sidebarRight = getWebsiteSidebarRight('target');
  const gapX = GAP_SNAP_CLOSE;
  const layout = document.querySelector('[data-lp-builder-layout]');
  const y =
    layout instanceof HTMLElement
      ? Math.round(layout.getBoundingClientRect().top + 8)
      : 108;
  return { x: Math.round(sidebarRight + gapX), y, gapX };
}

function getToolbarTopMin(): number {
  if (typeof window === 'undefined') return 56;
  const root = document.querySelector('[data-lp-builder-root]');
  if (root instanceof HTMLElement) {
    const v = getComputedStyle(root).getPropertyValue('--builder-top-offset').trim();
    if (v.endsWith('rem')) {
      const rem = parseFloat(v) || 6.75;
      return rem * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);
    }
  }
  return 108;
}

function clampToolbarPosition(x: number, y: number, w: number, h: number) {
  const pad = 8;
  const topMin = getToolbarTopMin();
  const maxX = Math.max(pad, window.innerWidth - w - pad);
  const maxY = Math.max(topMin, window.innerHeight - h - pad);
  return {
    x: Math.min(Math.max(pad, x), maxX),
    y: Math.min(Math.max(topMin, y), maxY),
  };
}

/** Apply formula toolbarLeft = websiteSidebarRight + savedGapX, then clamp in viewport. */
function positionFromGap(
  gapX: number,
  y: number,
  w: number,
  h: number,
  mode: 'live' | 'target' = 'live',
) {
  return clampToolbarPosition(getWebsiteSidebarRight(mode) + gapX, y, w, h);
}

type Props = {
  blocks: LandingPageBlock[];
  selectedId: string | null;
  onSelectBlock: (id: string) => void;
  onReorderBlocks: (fromIndex: number, toIndex: number) => void;
  onDupBlock: (id: string) => void;
  onRemoveBlock: (id: string) => void;
  onAddBlock: (type: LandingPageBlockType) => void;
  onAddBlocks: (types: LandingPageBlockType[]) => void;
  themeSpec: LandingPageSpec;
  onThemeChange: (next: LandingPageSpec) => void;
  aiSuggestedTheme?: LandingPageQuickThemeId | null;
  /** External open request (e.g. AI menu → Section presets). */
  openRequest?: { panel: 'add'; tab: AddTab; nonce: number } | null;
  /** Rail "Hình ảnh" opens Quản lý Media instead of only inserting Gallery. */
  onOpenMediaLibrary?: () => void;
  /** Rail "Tiêu đề" inserts a styled title block from preset panel. */
  onInsertTitlePreset?: (preset: LandingPageTitlePreset) => void;
  onInsertParagraphPreset?: (preset: LandingPageParagraphPreset) => void;
  onInsertListPreset?: (preset: LandingPageListPreset) => void;
  onInsertButtonPreset?: (preset: LandingPageButtonPreset) => void;
  onInsertButtonGroupPreset?: (preset: LandingPageButtonGroupPreset) => void;
  onInsertBoxPreset?: (preset: LandingPageBoxPreset) => void;
  onInsertFormPreset?: (preset: LandingPageFormPreset) => void;
  /** Optional AI menu rendered on the left LP rail. */
  aiMenu?: ReactNode;
};

export function LandingPageBuilderSidebar({
  blocks,
  selectedId,
  onSelectBlock,
  onReorderBlocks,
  onDupBlock,
  onRemoveBlock,
  onAddBlock,
  onAddBlocks,
  themeSpec,
  onThemeChange,
  aiSuggestedTheme,
  openRequest,
  onOpenMediaLibrary,
  onInsertTitlePreset,
  onInsertParagraphPreset,
  onInsertListPreset,
  onInsertButtonPreset,
  onInsertButtonGroupPreset,
  onInsertBoxPreset,
  onInsertFormPreset,
  aiMenu,
}: Props) {
  const [panel, setPanel] = useState<RailPanel>(null);
  const [addTab, setAddTab] = useState<AddTab>('elements');
  const [textTab, setTextTab] = useState<TextPresetTab>('title');
  const [buttonTab, setButtonTab] = useState<ButtonPresetTab>('buttons');
  const [desktopFloating, setDesktopFloating] = useState(false);
  const [portalMounted, setPortalMounted] = useState(false);
  const [orientation, setOrientation] = useState<ToolbarOrientation>('vertical');
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ x: 280, y: 108 });
  /** Gap from website sidebar right edge — preserved across collapse/expand. */
  const [savedGapX, setSavedGapX] = useState(GAP_SNAP_CLOSE);
  const [isToolbarDragging, setIsToolbarDragging] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const dragHandleRef = useRef<HTMLDivElement | null>(null);
  const toolbarPosRef = useRef(toolbarPos);
  const gapXRef = useRef(GAP_SNAP_CLOSE);
  const toolbarDragRef = useRef<{
    pointerId: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const detachToolbarDragRef = useRef<(() => void) | null>(null);
  const dragIndex = useRef<number | null>(null);
  const lastOpenNonce = useRef(0);
  const toolbarInitRef = useRef(false);

  toolbarPosRef.current = toolbarPos;
  gapXRef.current = savedGapX;

  const applyPositionFromGap = useCallback(
    (
      gapX: number,
      y: number,
      opts?: { mode?: 'live' | 'target'; animate?: boolean },
    ) => {
      const el = toolbarRef.current;
      const mode = opts?.mode ?? 'live';
      const animate = opts?.animate ?? false;
      const next = positionFromGap(
        gapX,
        y,
        el?.offsetWidth || 48,
        el?.offsetHeight || 48,
        mode,
      );
      toolbarPosRef.current = next;
      setToolbarPos(next);
      if (el && !toolbarDragRef.current) {
        el.style.transition = animate
          ? 'left 200ms ease-out'
          : 'none';
        el.style.left = `${next.x}px`;
        el.style.top = `${next.y}px`;
      }
      return next;
    },
    [],
  );

  useEffect(() => setPortalMounted(true), []);

  useEffect(() => {
    if (!desktopFloating || !portalMounted || !toolbarInitRef.current) return;
    applyPositionFromGap(gapXRef.current, toolbarPosRef.current.y, { mode: 'target' });
  }, [desktopFloating, portalMounted, applyPositionFromGap]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setDesktopFloating(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!desktopFloating || toolbarInitRef.current) return;
    toolbarInitRef.current = true;
    const stored = readStoredToolbarState();
    const def = measureDefaultToolbarPosition();
    const y = typeof stored?.y === 'number' && Number.isFinite(stored.y) ? stored.y : def.y;
    let gapX = def.gapX;
    if (typeof stored?.gapX === 'number' && Number.isFinite(stored.gapX)) {
      gapX = stored.gapX;
    } else if (typeof stored?.x === 'number' && Number.isFinite(stored.x)) {
      gapX = stored.x - getWebsiteSidebarRight('live');
    }
    gapXRef.current = gapX;
    setSavedGapX(gapX);
    applyPositionFromGap(gapX, y, { mode: 'target' });
    if (stored?.orientation === 'horizontal' || stored?.orientation === 'vertical') {
      setOrientation(stored.orientation);
    }
    if (typeof stored?.collapsed === 'boolean') {
      setRailCollapsed(stored.collapsed);
    }
  }, [desktopFloating, applyPositionFromGap]);

  useEffect(() => {
    if (!desktopFloating || !toolbarInitRef.current) return;
    try {
      localStorage.setItem(
        LP_TOOLBAR_STORAGE_KEY,
        JSON.stringify({
          x: toolbarPos.x,
          y: toolbarPos.y,
          gapX: savedGapX,
          orientation,
          collapsed: railCollapsed,
        } satisfies StoredToolbarState),
      );
    } catch {
      /* ignore */
    }
  }, [desktopFloating, toolbarPos, savedGapX, orientation, railCollapsed]);

  const endToolbarDrag = useCallback(
    (pointerId?: number) => {
      const drag = toolbarDragRef.current;
      if (!drag) {
        detachToolbarDragRef.current?.();
        detachToolbarDragRef.current = null;
        setIsToolbarDragging(false);
        return;
      }
      if (pointerId != null && drag.pointerId !== pointerId) return;
      toolbarDragRef.current = null;
      detachToolbarDragRef.current?.();
      detachToolbarDragRef.current = null;
      const handle = dragHandleRef.current;
      if (handle && pointerId != null) {
        try {
          if (handle.hasPointerCapture?.(pointerId)) {
            handle.releasePointerCapture(pointerId);
          }
        } catch {
          /* already released */
        }
      }
      const abs = toolbarPosRef.current;
      const el = toolbarRef.current;
      const gapX = snapGapToSidebarEdge(abs.x - getWebsiteSidebarRight('live'));
      gapXRef.current = gapX;
      setSavedGapX(gapX);
      const next = positionFromGap(
        gapX,
        abs.y,
        el?.offsetWidth || 48,
        el?.offsetHeight || 48,
        'live',
      );
      toolbarPosRef.current = next;
      setToolbarPos(next);
      if (el) {
        el.style.transition = 'left 200ms ease-out, top 200ms ease-out';
        el.style.left = `${next.x}px`;
        el.style.top = `${next.y}px`;
      }
      setIsToolbarDragging(false);
    },
    [],
  );

  useEffect(() => {
    return () => {
      detachToolbarDragRef.current?.();
      detachToolbarDragRef.current = null;
      toolbarDragRef.current = null;
    };
  }, []);

  const onToolbarDragPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!desktopFloating) return;
      if (e.button !== 0) return;
      const panel = toolbarRef.current;
      const handle = e.currentTarget;
      if (!panel) return;

      e.preventDefault();
      e.stopPropagation();

      const rect = panel.getBoundingClientRect();
      const start = clampToolbarPosition(rect.left, rect.top, rect.width, rect.height);
      toolbarPosRef.current = start;
      setToolbarPos(start);
      setIsToolbarDragging(true);
      panel.style.transition = 'none';
      panel.style.left = `${start.x}px`;
      panel.style.top = `${start.y}px`;

      toolbarDragRef.current = {
        pointerId: e.pointerId,
        offsetX: e.clientX - start.x,
        offsetY: e.clientY - start.y,
      };
      dragHandleRef.current = handle;

      try {
        handle.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }

      const onMove = (ev: PointerEvent) => {
        const drag = toolbarDragRef.current;
        if (!drag || ev.pointerId !== drag.pointerId) return;
        if (ev.pointerType === 'mouse' && ev.buttons === 0) {
          endToolbarDrag(ev.pointerId);
          return;
        }
        const el = toolbarRef.current;
        const next = clampToolbarPosition(
          ev.clientX - drag.offsetX,
          ev.clientY - drag.offsetY,
          el?.offsetWidth || 48,
          el?.offsetHeight || 48,
        );
        toolbarPosRef.current = next;
        if (el) {
          el.style.left = `${next.x}px`;
          el.style.top = `${next.y}px`;
        }
      };

      const onUp = (ev: PointerEvent) => {
        if (toolbarDragRef.current?.pointerId !== ev.pointerId) return;
        endToolbarDrag(ev.pointerId);
      };

      const onLostCapture = (ev: Event) => {
        const pe = ev as PointerEvent;
        if (toolbarDragRef.current?.pointerId !== pe.pointerId) return;
        endToolbarDrag(pe.pointerId);
      };

      detachToolbarDragRef.current?.();
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp, true);
      window.addEventListener('pointercancel', onUp, true);
      handle.addEventListener('lostpointercapture', onLostCapture);
      detachToolbarDragRef.current = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp, true);
        window.removeEventListener('pointercancel', onUp, true);
        handle.removeEventListener('lostpointercapture', onLostCapture);
      };
    },
    [desktopFloating, endToolbarDrag],
  );

  /** Keep toolbarLeft = websiteSidebarRight + savedGapX when website sidebar width changes. */
  useEffect(() => {
    if (!desktopFloating) return;

    let rafId = 0;
    let rafUntil = 0;

    const syncLive = () => {
      if (toolbarDragRef.current) return;
      applyPositionFromGap(gapXRef.current, toolbarPosRef.current.y, {
        mode: 'live',
        animate: false,
      });
    };

    const syncTargetAnimated = (sidebarRight?: number) => {
      if (toolbarDragRef.current) return;
      if (typeof sidebarRight === 'number' && Number.isFinite(sidebarRight)) {
        const el = toolbarRef.current;
        const next = clampToolbarPosition(
          sidebarRight + gapXRef.current,
          toolbarPosRef.current.y,
          el?.offsetWidth || 48,
          el?.offsetHeight || 48,
        );
        toolbarPosRef.current = next;
        setToolbarPos(next);
        if (el) {
          el.style.transition = 'left 200ms ease-out';
          el.style.left = `${next.x}px`;
          el.style.top = `${next.y}px`;
        }
      } else {
        applyPositionFromGap(gapXRef.current, toolbarPosRef.current.y, {
          mode: 'target',
          animate: true,
        });
      }
      // Track live edge during AppShell's 200ms width transition.
      rafUntil = performance.now() + 220;
      const tick = () => {
        syncLive();
        if (performance.now() < rafUntil) {
          rafId = requestAnimationFrame(tick);
        }
      };
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(tick);
    };

    const onWidthEvent = (ev: Event) => {
      const detail = (ev as CustomEvent<{ sidebarRight?: number; widthPx?: number }>).detail;
      const right =
        typeof detail?.sidebarRight === 'number'
          ? detail.sidebarRight
          : typeof detail?.widthPx === 'number'
            ? detail.widthPx
            : undefined;
      syncTargetAnimated(right);
    };

    const aside = document.querySelector('[data-testid="main-app-sidebar"]');
    const shell = document.querySelector('[data-main-sidebar-collapsed]');
    const ro = new ResizeObserver(() => syncLive());
    if (aside instanceof HTMLElement) ro.observe(aside);

    const mo = new MutationObserver(() => syncTargetAnimated());
    if (shell instanceof HTMLElement) {
      mo.observe(shell, {
        attributes: true,
        attributeFilter: ['data-main-sidebar-collapsed', 'style'],
      });
    }
    if (aside instanceof HTMLElement) {
      mo.observe(aside, {
        attributes: true,
        attributeFilter: ['data-collapsed', 'style', 'class'],
      });
    }

    window.addEventListener(MAIN_SIDEBAR_WIDTH_EVENT, onWidthEvent as EventListener);
    window.addEventListener('resize', syncLive);
    syncLive();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener(MAIN_SIDEBAR_WIDTH_EVENT, onWidthEvent as EventListener);
      window.removeEventListener('resize', syncLive);
    };
  }, [desktopFloating, applyPositionFromGap]);

  useEffect(() => {
    if (!openRequest) return;
    if (openRequest.nonce === lastOpenNonce.current) return;
    lastOpenNonce.current = openRequest.nonce;
    setPanel(openRequest.panel);
    setAddTab(openRequest.tab);
  }, [openRequest]);

  function toggle(next: RailPanel) {
    setPanel((cur) => (cur === next ? null : next));
  }

  function close() {
    setPanel(null);
  }

  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    };
    const onPointer = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        close();
      }
    };
    // Drag-drop insert ends while the overlay still covers the canvas — close so
    // the newly selected element receives select/move/resize/edit like existing ones.
    const onInsertClose = () => close();
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onPointer, true);
    document.addEventListener(LP_SIDEBAR_CLOSE_OVERLAY_EVENT, onInsertClose);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onPointer, true);
      document.removeEventListener(LP_SIDEBAR_CLOSE_OVERLAY_EVENT, onInsertClose);
    };
  }, [panel]);

  const isVertical = orientation === 'vertical';
  const overlayAnchorClass =
    orientation === 'horizontal' ? 'left-0 top-full mt-2' : 'left-full top-0 ml-2';

  const toolbarShell = (
    <div
      ref={rootRef}
      className={cn(
        'relative z-30 min-w-0 overflow-visible pointer-events-auto',
        // Below the fixed topbar+action-bar (real height ~7rem, see
        // --builder-top-offset) — top-16 (4rem) used to sit UNDER the action bar
        // (z-45), making the rail unclickable/hidden on mobile.
        !desktopFloating && 'max-md:fixed max-md:left-3 max-md:top-[7.5rem] max-md:z-[46]',
      )}
      data-lp-left-sidebar
      data-lp-sidebar-fixed="1"
      data-lp-sidebar-compact="1"
      data-lp-toolbar-float={desktopFloating ? '1' : '0'}
      data-lp-toolbar-orient={orientation}
      data-lp-toolbar-collapsed={railCollapsed ? '1' : '0'}
      data-lp-toolbar-height="content"
      data-lp-sidebar-panel={panel || ''}
      data-lp-add-count={LP_ADD_ELEMENTS_LIVE.length}
      data-lp-rail-quick-count={LP_RAIL_QUICK_INSERT.length}
    >
      <nav
        data-lp-sidebar-rail
        data-lp-sidebar-rail-scroll="0"
        className={cn(
          'flex items-center overflow-visible rounded-xl border border-zinc-200/80 bg-white shadow-md',
          railCollapsed
            ? isVertical
              ? 'h-10 w-10 flex-col justify-center gap-0.5 py-0.5'
              : 'h-10 w-[4.5rem] flex-row justify-center gap-0.5 px-0.5'
            : isVertical
              ? 'h-auto w-14 flex-col gap-0.5 py-1 sm:w-16'
              : 'h-auto w-auto max-w-none flex-row gap-0.5 px-1 py-1',
        )}
        aria-label="Thanh công cụ Landing Page"
      >
        <div
          className={cn(
            'flex shrink-0 items-center justify-center gap-0.5',
            isVertical ? 'flex-col' : 'flex-row',
            !railCollapsed && isVertical && 'border-b border-zinc-100 pb-0.5',
            !railCollapsed && !isVertical && 'border-r border-zinc-100 pr-0.5',
          )}
          data-lp-toolbar-controls
        >
          {desktopFloating ? (
            <div
              ref={dragHandleRef}
              data-lp-toolbar-drag-handle
              role="button"
              tabIndex={0}
              title="Kéo toolbar"
              onPointerDown={onToolbarDragPointerDown}
              className="flex h-6 w-6 shrink-0 cursor-grab items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 active:cursor-grabbing"
            >
              <DragHandleIcon />
            </div>
          ) : null}
          {!railCollapsed ? (
            <button
              type="button"
              data-lp-toolbar-orient
              title={isVertical ? 'Chế độ ngang' : 'Chế độ dọc'}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold text-zinc-500 hover:bg-zinc-100"
              onClick={() => setOrientation((o) => (o === 'vertical' ? 'horizontal' : 'vertical'))}
            >
              {isVertical ? '↔' : '↕'}
            </button>
          ) : null}
          <button
            type="button"
            data-lp-toolbar-collapse
            data-lp-left-sidebar-collapse={!railCollapsed ? '1' : undefined}
            data-lp-left-sidebar-expand={railCollapsed ? '1' : undefined}
            title={railCollapsed ? 'Mở toolbar' : 'Thu gọn toolbar'}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-sm font-semibold text-zinc-600 hover:bg-zinc-100"
            onClick={() => {
              setPanel(null);
              setRailCollapsed((v) => !v);
            }}
          >
            {railCollapsed ? '→' : '←'}
          </button>
        </div>

        {!railCollapsed ? (
          <div
            className={cn(
              'flex items-center overflow-visible',
              isVertical ? 'w-full flex-col gap-0.5' : 'flex-row gap-0.5',
            )}
            data-lp-toolbar-icons-scroll
            data-lp-toolbar-no-scroll="1"
          >
        <RailIcon
          label="Danh sách section"
          active={panel === 'layers'}
          onClick={() => toggle('layers')}
          dataAttr="layers"
          compact
        >
          <GripIcon />
        </RailIcon>
        <RailIcon
          label="Quick Theme"
          active={panel === 'theme'}
          onClick={() => toggle('theme')}
          dataAttr="theme"
          compact
        >
          <PaletteIcon />
        </RailIcon>

        {aiMenu ? (
          <div
            className={cn(
              'flex shrink-0 items-center justify-center',
              isVertical ? 'w-full py-0.5' : 'px-0.5',
            )}
            data-lp-sidebar-ai
          >
            {aiMenu}
          </div>
        ) : null}

        <div
          className={cn(
            'shrink-0 bg-zinc-200',
            isVertical ? 'my-0.5 h-px w-7' : 'mx-0.5 h-7 w-px',
          )}
          aria-hidden
          data-lp-rail-divider
        />

        <div
          className={cn(
            'flex items-center',
            isVertical ? 'w-full flex-col gap-0.5' : 'flex-row gap-0.5',
          )}
          data-lp-rail-quick-insert
          data-lp-rail-quick-order="image,heading,paragraph,button,graphics,icon,video"
        >
          {LP_RAIL_QUICK_INSERT.map((item) => (
            <RailIcon
              key={item.id}
              label={item.label}
              dataAttr={`quick-${item.id}`}
              compact
              draggablePayload={item.id==='video'?{kind:'block-type',type:item.type}:item.id==='button'?{kind:'button-library-open'}:{kind:'add-picker-open',picker:item.id==='heading'||item.id==='paragraph'?'text':item.id==='image'?'media':item.id==='graphics'?'graphics':'icon',...(item.id==='heading'||item.id==='paragraph'?{initialTab:item.id==='heading'?'title':'paragraph'}:{})}}

              active={
                item.id === 'heading' || item.id === 'paragraph'
                  ? panel === 'text' &&
                    ((item.id === 'heading' && textTab === 'title') ||
                      (item.id === 'paragraph' && (textTab === 'paragraph' || textTab === 'list')))
                  : item.id === 'button'
                    ? panel === 'button'
                    : item.id === 'graphics'
                      ? panel === 'graphics'
                      : item.id === 'icon'
                        ? panel === 'icon'
                        : false
              }
              onClick={() => {
                if (item.id === 'image' && onOpenMediaLibrary) {
                  onOpenMediaLibrary();
                  return;
                }
                if (item.id === 'heading' && onInsertTitlePreset) {
                  setTextTab('title');
                  toggle('text');
                  return;
                }
                if (item.id === 'paragraph' && onInsertParagraphPreset) {
                  setTextTab('paragraph');
                  setPanel('text');
                  return;
                }
                if (item.id === 'button' && onInsertButtonPreset) {
                  setButtonTab('buttons');
                  toggle('button');
                  return;
                }
                if (item.id === 'graphics' && onInsertBoxPreset) {
                  toggle('graphics');
                  return;
                }
                if (item.id === 'icon' && onInsertBoxPreset) {
                  toggle('icon');
                  return;
                }
                onAddBlock(item.type);
              }}
            >
              <QuickInsertIcon id={item.id} />
            </RailIcon>
          ))}
        </div>

        <div
          className={cn(
            'shrink-0 bg-zinc-200',
            isVertical ? 'my-0.5 h-px w-7' : 'mx-0.5 h-7 w-px',
          )}
          aria-hidden
        />

        <RailIcon
          label="Thư viện block"
          active={panel === 'add'}
          onClick={() => {
            setAddTab('elements');
            toggle('add');
          }}
          dataAttr="add"
          primary
          compact
        >
          <PlusIcon />
        </RailIcon>
          </div>
        ) : null}
      </nav>

      {panel === 'layers' ? (
        <OverlayPanel
          title="Sections"
          onClose={close}
          widthClass="w-[min(360px,calc(100vw-4.5rem))]"
          dataAttr="layers"
          anchorClass={overlayAnchorClass}
        >
          <ul className="max-h-[min(70vh,520px)] space-y-1 overflow-y-auto pr-1" data-lp-block-list>
            {blocks.map((b, index) => (
              <li
                key={b.id}
                draggable
                onDragStart={() => {
                  dragIndex.current = index;
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex.current == null || dragIndex.current === index) return;
                  onReorderBlocks(dragIndex.current, index);
                  dragIndex.current = null;
                }}
                className={cn(
                  'flex cursor-grab items-center gap-1 rounded-md px-2 py-1.5 text-sm text-zinc-800',
                  selectedId === b.id ? 'bg-orange-50 ring-1 ring-[#F97316]/40' : 'hover:bg-zinc-100',
                )}
                onClick={() => onSelectBlock(b.id)}
              >
                <span className="flex-1 truncate">
                  {b.type}
                  {!b.enabled ? ' (off)' : ''}
                </span>
                <button
                  type="button"
                  className="text-[11px] text-zinc-500 hover:text-zinc-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDupBlock(b.id);
                  }}
                >
                  Dup
                </button>
                <button
                  type="button"
                  className="text-[11px] text-red-500 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveBlock(b.id);
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </OverlayPanel>
      ) : null}

      {panel === 'theme' ? (
        <OverlayPanel
          title="Quick Theme"
          onClose={close}
          widthClass="w-[min(380px,calc(100vw-4.5rem))]"
          dataAttr="theme"
          anchorClass={overlayAnchorClass}
        >
          <div className="max-h-[min(70vh,560px)] overflow-y-auto pr-1 [&_label]:text-zinc-700 [&_button]:border-zinc-200">
            <LandingPageThemeSwitcher
              spec={themeSpec}
              aiSuggested={aiSuggestedTheme}
              onChange={onThemeChange}
            />
          </div>
        </OverlayPanel>
      ) : null}

      {panel === 'add' ? (
        <OverlayPanel
          title="Thêm phần tử"
          onClose={close}
          widthClass="w-[min(400px,calc(100vw-4.5rem))]"
          dataAttr="add"
          anchorClass={overlayAnchorClass}
        >
          <div className="mb-2 flex gap-1 rounded-lg bg-zinc-100 p-0.5" data-lp-add-tabs>
            <button
              type="button"
              data-lp-add-tab="elements"
              className={cn(
                'flex-1 rounded-md px-2 py-1.5 text-xs font-semibold',
                addTab === 'elements' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500',
              )}
              onClick={() => setAddTab('elements')}
            >
              Phần tử ({LP_ADD_ELEMENTS_LIVE.length})
            </button>
            <button
              type="button"
              data-lp-add-tab="presets"
              className={cn(
                'flex-1 rounded-md px-2 py-1.5 text-xs font-semibold',
                addTab === 'presets' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500',
              )}
              onClick={() => setAddTab('presets')}
            >
              Section mẫu
            </button>
          </div>

          {addTab === 'elements' ? (
            <div
              data-lp-add-elements-panel
              className="grid max-h-[min(70vh,560px)] grid-cols-2 gap-1.5 overflow-y-auto pr-1 max-md:max-h-[calc(100vh-8rem)]"
            >
              {LP_ADD_ELEMENTS_LIVE.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  data-lp-add-element={item.type}
                  draggable
                  onDragStart={e=>beginSidebarPresetDrag(e,item.type==='LeadForm'?{kind:'form-library-open'}:{kind:'block-type',type:item.type},item.label)}
                  className="flex h-11 items-center gap-2 rounded-md px-2.5 text-left text-[13px] text-zinc-800 transition hover:bg-zinc-100"
                  onClick={ignoreSidebarElementClick}
                  onDoubleClick={ignoreSidebarElementClick}
                >
                  <span
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-50 text-sm text-zinc-600 ring-1 ring-zinc-200"
                    aria-hidden
                  >
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div
              data-lp-section-presets-panel
              className="flex max-h-[min(70vh,560px)] flex-col gap-1.5 overflow-y-auto pr-1 max-md:max-h-[calc(100vh-8rem)]"
            >
              {LP_SECTION_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  data-lp-section-preset={preset.id}
                  data-lp-sidebar-draggable="section-preset"
                  draggable
                  className="cursor-grab rounded-md px-2.5 py-2 text-left transition hover:bg-zinc-100 active:cursor-grabbing max-md:cursor-pointer max-md:active:cursor-pointer"
                  onDragStart={(e) => {
                    // Mobile/touch: keep click-only — cancel HTML5 drag on coarse pointers.
                    if (
                      typeof window !== 'undefined' &&
                      window.matchMedia('(max-width: 767px), (pointer: coarse)').matches
                    ) {
                      e.preventDefault();
                      return;
                    }
                    (e.currentTarget as HTMLButtonElement).dataset.lpDidDrag = '1';
                    beginSidebarPresetDrag(
                      e,
                      {
                        kind: 'section-preset',
                        presetId: preset.id,
                        types: preset.types,
                      },
                      preset.label,
                      { subtitle: preset.types.join(' · ') },
                    );
                  }}
                  onClick={ignoreSidebarElementClick}
                  onDoubleClick={ignoreSidebarElementClick}
                >
                  <div className="text-[13px] font-semibold text-zinc-900">{preset.label}</div>
                  <div className="mt-0.5 text-[11px] text-zinc-500">{preset.description}</div>
                  <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                    {preset.types.join(' · ')}
                  </div>
                </button>
              ))}
            </div>
          )}
          <p className="mt-2 text-[10px] leading-snug text-zinc-400">
            Kéo ô thành phần vào canvas rồi chọn mẫu tại vị trí thả.
          </p>
        </OverlayPanel>
      ) : null}

      {panel === 'text' && onInsertTitlePreset ? (
        <LandingPageTextPresetsPanel
          onClose={close}
          initialTab={textTab}
          onTabChange={setTextTab}
          onInsertTitle={(preset) => {
            onInsertTitlePreset(preset);
            requestCloseSidebarOverlay();
          }}
          onInsertParagraph={(preset) => {
            onInsertParagraphPreset?.(preset);
            requestCloseSidebarOverlay();
          }}
          onInsertList={(preset) => {
            onInsertListPreset?.(preset);
            requestCloseSidebarOverlay();
          }}
        />
      ) : null}

      {panel === 'button' && onInsertButtonPreset ? (
        <LandingPageButtonPresetsPanel
          onClose={close}
          initialTab={buttonTab}
          onTabChange={setButtonTab}
          onInsertButton={(preset) => {
            onInsertButtonPreset(preset);
            requestCloseSidebarOverlay();
          }}
          onInsertGroup={(preset) => {
            onInsertButtonGroupPreset?.(preset);
            requestCloseSidebarOverlay();
          }}
        />
      ) : null}

      {panel === 'graphics' && onInsertBoxPreset ? (
        <LandingPageGraphicsLibraryPanel
          onClose={close}
          onInsertBox={(preset) => {
            onInsertBoxPreset(preset);
            requestCloseSidebarOverlay();
          }}
          onInsertForm={(preset) => {
            onInsertFormPreset?.(preset);
            requestCloseSidebarOverlay();
          }}
          onInsertBlockType={(type) => {
            onAddBlock(type);
            requestCloseSidebarOverlay();
          }}
          onOpenMediaLibrary={onOpenMediaLibrary}
        />
      ) : null}

      {panel === 'icon' && onInsertBoxPreset ? (
        <LandingPageGraphicsLibraryPanel
          onClose={close}
          initialCategory="graphics"
          iconsOnly
          panelTitle="Biểu tượng"
          onInsertBox={(preset) => {
            onInsertBoxPreset(preset);
            requestCloseSidebarOverlay();
          }}
          onInsertForm={(preset) => {
            onInsertFormPreset?.(preset);
            requestCloseSidebarOverlay();
          }}
          onInsertBlockType={(type) => {
            onAddBlock(type);
            requestCloseSidebarOverlay();
          }}
          onOpenMediaLibrary={onOpenMediaLibrary}
        />
      ) : null}
    </div>
  );

  if (desktopFloating && portalMounted) {
    return createPortal(
      <div
        ref={toolbarRef}
        style={{
          position: 'fixed',
          left: toolbarPos.x,
          top: toolbarPos.y,
          zIndex: 55,
          // Portal wrapper does not eat canvas clicks outside the rail/panel.
          pointerEvents: 'none',
          // Drag: none. Edge-sync: none (tracks live sidebar rect). Snap after drag: set inline 200ms.
          transition: isToolbarDragging ? 'none' : undefined,
        }}
        data-lp-left-sidebar-slot
        data-lp-left-sidebar-collapsed={railCollapsed ? '1' : '0'}
        data-lp-toolbar-sidebar-edge-sync="1"
        data-lp-toolbar-gap-x={String(Math.round(savedGapX))}
      >
        {toolbarShell}
      </div>,
      document.body,
    );
  }

  return (
    <div
      className="relative z-30 min-w-0 w-12 sm:w-14"
      data-lp-left-sidebar-slot
      data-lp-left-sidebar-collapsed={railCollapsed ? '1' : '0'}
    >
      {toolbarShell}
    </div>
  );
}

function OverlayPanel({
  title,
  onClose,
  children,
  widthClass,
  dataAttr,
  anchorClass = 'left-full top-0 ml-2',
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  widthClass: string;
  dataAttr: string;
  anchorClass?: string;
}) {
  return (
    <div
      data-lp-sidebar-overlay={dataAttr}
      className={cn(
        'absolute z-40 rounded-xl border border-zinc-200 bg-white p-3 shadow-xl',
        anchorClass,
        // Same below-action-bar offset + higher z-index as the rail (see there) so
        // the panel header/close button aren't hidden behind it on mobile; capped
        // height + own scroll so tall panels (Layers, Add elements) never run off
        // the bottom of the viewport with no way to reach their lower content.
        'max-md:fixed max-md:left-3 max-md:right-3 max-md:top-[7rem] max-md:z-[46] max-md:ml-0 max-md:w-auto max-md:max-h-[calc(100dvh-8rem)] max-md:overflow-y-auto',
        widthClass,
      )}
      role="dialog"
      aria-label={title}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-zinc-900">{title}</div>
        <button
          type="button"
          data-lp-sidebar-close
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
          onClick={onClose}
          title="Đóng"
        >
          ✕
        </button>
      </div>
      {children}
    </div>
  );
}

function RailIcon({
  label,
  active,
  onClick,
  children,
  primary,
  compact,
  dataAttr,
  draggableType,
  draggablePayload,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  primary?: boolean;
  compact?: boolean;
  dataAttr: string;
  /** When set, rail icon can be dragged onto canvas as that block type. */
  draggableType?: LandingPageBlockType;
  draggablePayload?: LpSidebarPresetPayload;
}) {
  return (
    <RailIconHoverLabel label={label}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={active ? true : false}
        data-lp-rail-icon={dataAttr}
        data-lp-rail-active={active ? '1' : '0'}
        data-lp-sidebar-draggable={draggablePayload ? 'picker' : draggableType ? 'block-type' : undefined}
        draggable={Boolean(draggableType || draggablePayload)}
        onDragStart={
          draggableType || draggablePayload
            ? (e) =>
                beginSidebarPresetDrag(
                  e,
                  draggablePayload || { kind: 'block-type', type: draggableType! },
                  label,
                )
            : undefined
        }
        onClick={draggablePayload || draggableType ? ignoreSidebarElementClick : onClick}
        onDoubleClick={draggablePayload || draggableType ? ignoreSidebarElementClick : undefined}
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center rounded-lg transition',
          compact ? 'h-9 w-9' : 'h-10 w-10',
          draggableType || draggablePayload ? 'cursor-grab active:cursor-grabbing' : null,
          primary
            ? active
              ? 'bg-[#F97316] text-white shadow-sm'
              : 'bg-[#F97316] text-white hover:bg-[#ea6c0c]'
            : active
              ? 'bg-orange-50 text-[#F97316] ring-1 ring-[#F97316]/35'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
        )}
      >
        {children}
      </button>
    </RailIconHoverLabel>
  );
}

function DragHandleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  );
}

function GripIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="9" cy="7" r="1.5" />
      <circle cx="15" cy="7" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="17" r="1.5" />
      <circle cx="15" cy="17" r="1.5" />
    </svg>
  );
}
function QuickInsertIcon({ id }: { id: string }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    'aria-hidden': true as const,
  };
  switch (id) {
    case 'image':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="8.5" cy="10" r="1.5" />
          <path d="m21 15-5-5-4 4-2-2-5 5" />
        </svg>
      );
    case 'heading':
      return (
        <svg {...common}>
          <path d="M6 5v14M18 5v14M6 12h12" />
        </svg>
      );
    case 'paragraph':
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h12M4 17h14" />
        </svg>
      );
    case 'button':
      return (
        <svg {...common}>
          <rect x="3" y="8" width="14" height="8" rx="2" />
          <path d="m15 14 5 5M15 14l3-1" />
        </svg>
      );
    case 'graphics':
    case 'box':
      return (
        <svg {...common}>
          <path d="M12 3.5 14.2 9H20l-4.5 3.4 1.7 5.6L12 14.8 6.8 18l1.7-5.6L4 9h5.8L12 3.5Z" />
          <rect x="4" y="4" width="7" height="7" rx="1.5" opacity="0.35" />
        </svg>
      );
    case 'icon':
      return (
        <svg {...common}>
          <path d="m12 3 2.2 6.6H21l-5.4 4 2.1 6.4L12 16.8 6.3 20l2.1-6.4L3 9.6h6.8L12 3Z" />
        </svg>
      );
    case 'video':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m10 9 6 3-6 3V9Z" fill="currentColor" stroke="none" />
        </svg>
      );
    default:
      return <PlusIcon />;
  }
}
function PaletteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="14" cy="14" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
